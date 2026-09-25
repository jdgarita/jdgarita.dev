// Tests for worker.js, the /e analytics beacon — Node's built-in runner, no dependencies.
//
//     node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test scripts/worker.test.mjs
//
// fetch is replaced per test so nothing reaches PostHog; ctx.waitUntil collects the relay
// promise so a test can await it and inspect what would have been sent.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';

const SITE = 'https://jdgarita.dev';
const ENV = { POSTHOG_API_KEY: 'phc_test', POSTHOG_HOST: 'https://us.i.posthog.com' };
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';

let sent;
let errors;
let realFetch;
let realError;

beforeEach(() => {
  sent = [];
  errors = [];
  realFetch = globalThis.fetch;
  realError = console.error;
  globalThis.fetch = async (url, init) => {
    sent.push({ url, body: JSON.parse(init.body) });
    return new Response(null, { status: 200 });
  };
  console.error = (message) => errors.push(message);
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

function beacon(body, headers = {}, url = `${SITE}/e`) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return new Request(url, {
    method: 'POST',
    body: text,
    headers: { Origin: new URL(url).origin, 'Sec-Fetch-Site': 'same-origin', 'User-Agent': BROWSER_UA, ...headers },
  });
}

async function call(request, env = ENV) {
  const pending = [];
  const response = await worker.fetch(request, env, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  return response;
}

const VIEW = {
  e: 'pageview',
  vid: 'v1',
  url: `${SITE}/still/?utm_source=reddit&fbclid=secret123`,
  ref: 'https://www.reddit.com/r/Android/comments/abc/?share_id=xyz',
  lang: 'es',
  utm_source: 'reddit',
  utm_campaign: 'launch',
};

test('a page view is relayed to PostHog with query strings stripped', async () => {
  const response = await call(beacon(VIEW));
  assert.equal(response.status, 204);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, 'https://us.i.posthog.com/i/v0/e/');
  const { api_key, event, distinct_id, properties } = sent[0].body;
  assert.equal(api_key, 'phc_test');
  assert.equal(event, '$pageview');
  assert.equal(distinct_id, 'v1');
  assert.equal(properties.site, 'jdgarita.dev');
  assert.equal(properties.$current_url, `${SITE}/still/`);
  assert.equal(properties.$pathname, '/still/');
  assert.equal(properties.$referrer, 'https://www.reddit.com/r/Android/comments/abc/');
  assert.equal(properties.$referring_domain, 'www.reddit.com');
  assert.equal(properties.lang, 'es');
  assert.equal(properties.utm_source, 'reddit');
  assert.equal(properties.utm_campaign, 'launch');
  assert.equal(properties.$process_person_profile, false);
  assert.equal(properties.not_found, undefined);
});

test('no referrer reads as direct', async () => {
  await call(beacon({ ...VIEW, ref: '' }));
  assert.equal(sent[0].body.properties.$referrer, '$direct');
  assert.equal(sent[0].body.properties.$referring_domain, '$direct');
});

test('a 404 page view is flagged', async () => {
  await call(beacon({ ...VIEW, url: `${SITE}/missing`, nf: true }));
  assert.equal(sent[0].body.properties.not_found, true);
});

test('each event keeps only its allowlisted properties', async () => {
  await call(beacon({ e: 'select_content', vid: 'v1', url: SITE, content_type: 'project_link', content_id: 'google_play_faint', extra: 'x' }));
  await call(beacon({ e: 'file_download', vid: 'v1', url: SITE, file_name: 'jd.pdf', link_location: 'nav' }));
  await call(beacon({ e: 'store_click', vid: 'v1', url: `${SITE}/still/`, platform: 'android', placement: 'hero' }));
  await call(beacon({ e: 'theme_toggle', vid: 'v1', url: SITE, theme: 'dark', content_id: 'sneaky' }));
  const [select, download, store, theme] = sent.map((s) => s.body);
  assert.equal(select.event, 'select_content');
  assert.equal(select.properties.content_type, 'project_link');
  assert.equal(select.properties.content_id, 'google_play_faint');
  assert.equal(select.properties.extra, undefined);
  assert.equal(download.properties.file_name, 'jd.pdf');
  assert.equal(download.properties.link_location, 'nav');
  assert.equal(store.event, 'store_click');
  assert.equal(store.properties.platform, 'android');
  assert.equal(store.properties.placement, 'hero');
  assert.equal(theme.properties.theme, 'dark');
  assert.equal(theme.properties.content_id, undefined);
});

test('invalid property values are dropped, not relayed', async () => {
  await call(beacon({ e: 'select_content', vid: 'v1', url: SITE, content_type: 'evil', content_id: 'Has Spaces!' }));
  assert.equal(sent[0].body.properties.content_type, undefined);
  assert.equal(sent[0].body.properties.content_id, undefined);
});

test('a page URL on another host is not recorded', async () => {
  await call(beacon({ ...VIEW, url: 'https://evil.example/phish' }));
  assert.equal(sent[0].body.properties.$current_url, undefined);
  assert.equal(sent[0].body.properties.$pathname, undefined);
});

test('unknown events and missing ids are refused', async () => {
  assert.equal((await call(beacon({ ...VIEW, e: 'purchase' }))).status, 400);
  assert.equal((await call(beacon({ ...VIEW, e: 'toString' }))).status, 400);
  assert.equal((await call(beacon({ ...VIEW, vid: '' }))).status, 400);
  assert.equal((await call(beacon('not json'))).status, 400);
  assert.equal(sent.length, 0);
});

test('cross-origin beacons are refused', async () => {
  assert.equal((await call(beacon(VIEW, { Origin: 'https://evil.example' }))).status, 403);
  assert.equal((await call(beacon(VIEW, { 'Sec-Fetch-Site': 'cross-site' }))).status, 403);
  assert.equal(sent.length, 0);
});

test('only POST is accepted', async () => {
  const response = await call(new Request(`${SITE}/e`));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'POST');
});

test('oversized bodies are refused', async () => {
  const big = { ...VIEW, utm_term: 'x'.repeat(3000) };
  assert.equal((await call(beacon(big))).status, 413);
  assert.equal(sent.length, 0);
});

test('bots get a 204 and nothing is relayed', async () => {
  const response = await call(beacon(VIEW, { 'User-Agent': 'Googlebot/2.1' }));
  assert.equal(response.status, 204);
  assert.equal(sent.length, 0);
});

test('non-production hosts and a missing key accept but relay nothing', async () => {
  const preview = 'https://jdgarita-dev.example.workers.dev/e';
  assert.equal((await call(beacon({ ...VIEW, url: 'https://jdgarita-dev.example.workers.dev/' }, {}, preview))).status, 204);
  assert.equal((await call(beacon(VIEW), { POSTHOG_HOST: ENV.POSTHOG_HOST })).status, 204);
  assert.equal(sent.length, 0);
});

test('a failed capture is logged', async () => {
  globalThis.fetch = async () => new Response(null, { status: 401 });
  await call(beacon(VIEW));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /HTTP 401 for \$pageview/);
});

test('every other path is served from the static assets', async () => {
  const env = { ...ENV, ASSETS: { fetch: async () => new Response('asset') } };
  const response = await worker.fetch(new Request(`${SITE}/index.html`), env, {});
  assert.equal(await response.text(), 'asset');
});
