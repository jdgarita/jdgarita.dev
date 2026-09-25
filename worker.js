// The jdgarita.dev Worker script. It runs for one path only — `POST /e`, the site's first-party
// analytics beacon (sent by js/custom.js and by the Still landing's inline script) — because
// wrangler.jsonc routes nothing else to it (`assets.run_worker_first: ["/e"]`); every other
// request is served straight from the static assets. The fallthrough to env.ASSETS below is only
// a safety net.
//
// A beacon is validated here and relayed server-side to PostHog's capture API, so the pages load
// no third-party script and set no cookie, and the visitor's IP never reaches PostHog (the
// request PostHog sees is the Worker's). URLs are recorded without their query string. Same
// design as faint.coffee's landing Worker; see CLAUDE.md "Analytics".
// scripts/worker.test.mjs pins the behaviour.

// Every event the site sends, and the properties each may carry. A property is kept only if its
// validator accepts the value; an unknown event is refused.
const oneOf = (...values) => (value) => (values.includes(value) ? value : undefined);
const slug = (value) =>
  typeof value === 'string' && /^[a-z0-9_-]{1,64}$/.test(value) ? value : undefined;

const EVENTS = {
  pageview: { name: '$pageview', props: {} },
  file_download: {
    name: 'file_download',
    props: { file_name: oneOf('jd.pdf'), link_location: oneOf('nav', 'hero') },
  },
  select_content: {
    name: 'select_content',
    props: {
      content_type: oneOf('nav_section', 'contact_link', 'project_link', 'experience_app'),
      content_id: slug,
    },
  },
  store_click: {
    name: 'store_click',
    props: { platform: oneOf('ios', 'android'), placement: oneOf('hero', 'download') },
  },
  theme_toggle: { name: 'theme_toggle', props: { theme: oneOf('light', 'dark') } },
  lang_toggle: { name: 'lang_toggle', props: { language: oneOf('en', 'es') } },
  mobile_nav_toggle: { name: 'mobile_nav_toggle', props: { action: oneOf('open', 'close') } },
};
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const MAX_BODY_BYTES = 2048;
// Only the production site's beacons reach PostHog. Local runs (wrangler dev), Lighthouse, and
// workers.dev / preview URLs get the same answers but relay nothing, so test traffic never lands
// in PostHog. www.jdgarita.dev redirects to the apex before any page loads, so it is not listed.
const RELAY_HOSTS = new Set(['jdgarita.dev']);
const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|facebookexternalhit|embedly/i;

const status = (code) => new Response(null, { status: code });

// A bounded string or undefined, so a hand-made beacon cannot stuff PostHog with junk.
function str(value, max = 512) {
  return typeof value === 'string' && value.length > 0 ? value.slice(0, max) : undefined;
}

// Origin and path only: a query string can carry click ids and other values nobody agreed to
// collect (the UTM tags travel as their own properties).
function withoutQuery(value) {
  try {
    const url = new URL(value);
    return url.origin + url.pathname;
  } catch {
    return undefined;
  }
}

function hostOf(url) {
  try {
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
}

// Only a URL on this site is recorded as the page, whatever the beacon claims.
function pageUrl(value, requestUrl) {
  return hostOf(value) === new URL(requestUrl).hostname ? withoutQuery(value) : undefined;
}

// The beacon comes from our own pages. Browsers always send Origin on a POST (and
// Sec-Fetch-Site where supported), so this stops other sites from spending visitors' browsers
// on /e. A script can still forge both headers; nothing on a public, login-free endpoint can
// fully prevent that.
function isSameOrigin(request) {
  const site = request.headers.get('Sec-Fetch-Site');
  if (site && site !== 'same-origin') return false;
  return hostOf(request.headers.get('Origin')) === new URL(request.url).hostname;
}

// The body, decoded, or null when it is over MAX_BODY_BYTES — refused from Content-Length
// before anything is read when the header is there, and measured in bytes either way.
async function readBody(request) {
  const declared = Number(request.headers.get('Content-Length'));
  if (declared > MAX_BODY_BYTES) return null;
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES) return null;
  return new TextDecoder().decode(bytes);
}

async function relay(env, payload) {
  try {
    const response = await fetch(`${env.POSTHOG_HOST}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // Logged, not retried: Workers Logs (wrangler.jsonc `observability`) is where a rejected key
    // or a PostHog outage shows up instead of the data just going quiet.
    if (!response.ok) console.error(`PostHog capture failed: HTTP ${response.status} for ${payload.event}`);
  } catch (error) {
    console.error(`PostHog capture failed: ${error} for ${payload.event}`);
  }
}

async function handleBeacon(request, env, ctx) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (!isSameOrigin(request)) return status(403);
  if (BOT_UA.test(request.headers.get('User-Agent') || '')) return status(204);

  const raw = await readBody(request);
  if (raw === null) return status(413);
  let beacon;
  try {
    beacon = JSON.parse(raw);
  } catch {
    return status(400);
  }

  const spec = Object.hasOwn(EVENTS, beacon?.e) ? EVENTS[beacon.e] : undefined;
  const distinctId = str(beacon?.vid, 64);
  if (!spec || !distinctId) return status(400);

  const currentUrl = pageUrl(beacon.url, request.url);
  const referrer = withoutQuery(str(beacon.ref));
  const properties = {
    site: 'jdgarita.dev',
    // The host the beacon was sent to (jdgarita.dev in production). PostHog's test-account filter
    // and web analytics key off $host, so without it these events are hidden there.
    $host: new URL(request.url).hostname,
    $current_url: currentUrl,
    $pathname: currentUrl ? new URL(currentUrl).pathname : undefined,
    $referrer: referrer || '$direct',
    $referring_domain: hostOf(referrer) || '$direct',
    lang: beacon.lang === 'es' ? 'es' : 'en',
    country: request.cf?.country,
    $process_person_profile: false,
    $lib: 'jdgarita-site',
  };
  if (beacon.nf === true) properties.not_found = true;
  for (const key of UTM_KEYS) {
    const value = str(beacon[key], 128);
    if (value) properties[key] = value;
  }
  for (const [key, validate] of Object.entries(spec.props)) {
    const value = validate(beacon[key]);
    if (value !== undefined) properties[key] = value;
  }

  // Not production, or no key: accept and drop.
  if (env.POSTHOG_API_KEY && RELAY_HOSTS.has(new URL(request.url).hostname)) {
    ctx.waitUntil(
      relay(env, {
        api_key: env.POSTHOG_API_KEY,
        event: spec.name,
        distinct_id: distinctId,
        timestamp: new Date().toISOString(),
        properties,
      }),
    );
  }
  return status(204);
}

export default {
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname === '/e') return handleBeacon(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
