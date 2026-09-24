# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A plain static personal site for `jdgarita.dev`, served by GitHub Pages directly from the repo root. `index.html` is the entry point; everything is hand-written vanilla HTML/CSS/JS. The only third-party CSS loaded is Google Fonts (Inter + JetBrains Mono). Icons are an inline SVG sprite (Lucide + Simple Icons); there is no icon library or icon font. There is no Bootstrap, no jQuery, no build step, no package manager, no tests, and no lint/test/build CI (the only Actions are the Claude Code review workflows listed below). Edits to the source files are the deliverable — open `index.html` in a browser to preview.

Agent-facing standards live alongside this file: `AGENTS.md` (priorities, commands, git rules), `ARCHITECTURE.md` (stack, routing, where things live), and `CONVENTIONS.md` (UI, styling, JS, asset, and commit rules).

Page sections, in order: Hero → About → Experience → Projects → Skills → Contact. Experience and Skills alternate on the `section-alt` background so the banding stays consistent.

## Branches

- `main` is the default branch and the only long-lived one. It is PR-protected — land changes via short-lived feature branches (e.g. `fix/…`, `docs/…`, `content/…`) merged through a PR, not by pushing directly to `main`. Merging to `main` is what deploys to GitHub Pages.

## Repo layout

Tracked, load-bearing:
- `index.html` — single-page site, all sections inline, semantic landmarks
- `frnk/index.html` — sub-page for the frnk project, reuses the root `css/` and `js/`
- `still/` — standalone mini-site for the **Still** app. `still/index.html` is the **marketing landing page** (own sheet `still/landing.css`, ported from the app's "Culinary Arc" design tokens); `still/privacy-policy/` + `still/terms-and-conditions/` are the legal docs (own sheet `still/still.css`), linked from the landing footer. Self-contained — **no** shared JS/i18n/analytics. See "Sub-pages" for why it deviates.
- `css/custom.css` — token-driven stylesheet (CSS custom properties)
- `js/custom.js` — theme toggle, language toggle, i18n loader, mobile nav
- `i18n/en.json`, `i18n/es.json` — all user-visible copy (root + sub-pages share one dictionary)
- `image/jd-avatar.webp` + `image/jd-avatar.png`, `image/frnk.webp` + `image/frnk.png` — illustrated profile avatar (800×800, **transparent background**, served via `<picture>` with WebP first and PNG fallback; the circle behind it is painted by CSS with `--accent-soft` so it follows the theme) and frnk logo (320×504, 2× its 160 px display width, same `<picture>` WebP-first pattern; sub-pages reference these via `../image/…`). The avatar source is the cartoon portrait; regenerate both files from it (and keep the same basenames) rather than swapping in a differently named file, since `index.html` references them exactly and GitHub Pages serves on a case-sensitive filesystem.
- **Favicon** — the JD brand-mark. `image/favicon.svg` is the source of truth (theme-aware via an embedded `prefers-color-scheme` rule: `#6E56CF` light / `#9F85FF` dark, with a `fill` presentation-attribute fallback so it never renders black) for modern browsers; `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png`, and `favicon.ico` are rasterized fallbacks generated from it. Every page (root, `frnk/`, `still/`, `404.html`) links the full set in `<head>`.
- **Social cards** — `image/og-image.jpg` (root) and `image/og-frnk.jpg` (frnk), both 1200×630, referenced by **absolute** URL from the Open Graph / Twitter meta. Regenerate them if the brand, name, or tagline changes (they don't auto-update from i18n).
- `resume/jd.pdf` — downloadable resume
- **SEO files** — `robots.txt` (allow all, points to the sitemap), `sitemap.xml` (the five public URLs; bump a page's `<lastmod>` when its content changes materially, add an entry for any new page), and `404.html` (served by GitHub Pages for any missing path at any depth, so it uses root-absolute `/css/…`, `/js/…` URLs and `data-i18n-base="/"`; `noindex`). Every public page has a `<link rel="canonical">` and a JSON-LD block (`Person` + `WebSite` on root, `SoftwareSourceCode` on frnk, `MobileApplication` on the Still landing). Like OG meta, JSON-LD is English-only and hard-coded; keep it in sync with the copy and never add ratings/review counts that aren't real.
- `.github/workflows/claude-code-review.yml`, `claude.yml` — GitHub Actions that run Claude Code on PRs (no app-side CI)

Untracked and **should be ignored** — leftovers from an abandoned Kobweb (Kotlin/JS) rewrite and an old Firebase experiment. Do not treat these as the project:
- `site/`, `build/`, `.gradle/`, `kotlin-js-store/`, `node_modules/`

If a task mentions Kotlin, Kobweb, Compose, or Firebase, confirm with the user before touching `site/` — it's stale and the likely intent is the static site at the repo root.

## Working on the site

- **Preview locally with HTTP** (recommended): `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`. This matches how GitHub Pages serves the site and lets `fetch('i18n/en.json')` succeed.
- **Preview via `file://`** also works — `js/custom.js` embeds a fallback dictionary for when `fetch` is blocked by the browser's file-URL policy.
- Styles belong in `css/custom.css`. Pages link it as `custom.css?v=YYYY-MM-DD` (root, `frnk/`, `404.html`); bump that date on all three when a CSS change must land together with an HTML change, otherwise returning visitors can pair new markup with a cached old stylesheet for up to 10 minutes (GitHub Pages cache TTL). The palette, spacing, and type scale are controlled by CSS custom properties on `:root` (light) and `:root[data-theme="dark"]` (dark). Change a token once and the whole site updates.
- Scripts belong in `js/custom.js`. No other JS files should exist.

## Editing content

Every user-visible string lives in `i18n/en.json` and `i18n/es.json`, keyed by flat dot-paths (e.g. `hero.title`, `experience.role1.bullet1`). To change something on the page:

1. Find the key in `i18n/en.json`, edit the English value.
2. Make the matching edit in `i18n/es.json` so both languages stay in sync.
3. Reload the browser — no build step.

Structural rules:
- Add a new translatable element by giving it `data-i18n="some.key"` in `index.html`, then define `some.key` in **both** JSON files.
- To translate an attribute (e.g. `aria-label`), use `data-i18n-attr="aria-label:a11y.foo"`. Multiple pairs are comma-separated.
- Keys **must** exist in both `en.json` and `es.json`. Missing keys silently fall through to whatever text is hard-coded in `index.html`.
- Never hard-code user-visible strings in `index.html` — always route through i18n.
- Whenever you add or rename a key, mirror the change in `FALLBACK.en` / `FALLBACK.es` inside `js/custom.js` — they are used as the dictionary when `fetch('i18n/*.json')` fails (e.g. `file://` previews).
- **Every `data-i18n` element carries its English value as static text** (e.g. `<p data-i18n="about.body">I'm a Google…</p>`). JS replaces it at runtime, but crawlers and link-preview bots that don't run JS read the static text. When you edit an English value in `en.json`, update the matching text in the HTML too (the fallback-text check in `AGENTS.md` flags drift). Keys whose value is intentionally `""` stay empty.
- **Open Graph / Twitter meta is an exception to the "route through i18n" rule.** Social scrapers don't run JS, so each `<meta property="og:…">` / `name="twitter:…">` carries a hard-coded English `content` value (with `data-i18n-attr` only to sync the live DOM). That means the canonical title/description strings are duplicated across the OG/Twitter block and the `<title>`/`description` tags. When you edit `meta.title` / `meta.description` / `frnk.meta.*` in the JSON, update the matching hard-coded `content` values in the page `<head>` too, or the link preview drifts from the page.

Experience content comes from `resume/jd.pdf`, newest first: `experience.role1` Experian (Senior Android Engineer, 2026 — Present), `role2` Swiftly (Senior Kotlin Multiplatform Engineer, 2022 — 2026), `role3` Mode (Senior Android Developer, 2021 — 2022), `role4` Trusona (Android Developer, 2017 — 2021). Update the JSON (and the static HTML fallback text) when the PDF changes, and don't introduce placeholders. A new job shifts every `roleN` down one slot.

## Sub-pages

There are **two** sub-page patterns. Pick the one that matches the page's purpose.

### Shared-shell pattern (e.g. `frnk/index.html`)

For project pages that should feel like part of the main site. They reuse the root `css/custom.css` and `js/custom.js` so a single dictionary, theme, and analytics setup serve every page.

- Reference assets with relative paths: `../css/custom.css`, `../js/custom.js`, `../image/favicon.svg`.
- Set `<html lang="…" data-i18n-base="../">` so `js/custom.js` resolves `fetch('../i18n/en.json')` instead of looking next to the sub-page.
- Mirror the no-FOUC inline theme/lang script from the root `index.html` `<head>` so first paint matches.
- Add new sub-page strings under a namespaced prefix in **both** `i18n/en.json` and `i18n/es.json` (e.g. `frnk.hero.title`), and mirror them in `FALLBACK.en` / `FALLBACK.es` inside `js/custom.js`.

### Standalone pattern (`still/`)

For content that should be **decoupled** from the main site — the **Still** app's mini-site: the marketing landing page (`still/index.html`) plus its legal docs (privacy policy, terms). These pages deliberately break the rules above, and that is intentional:

- **Own stylesheets**, not `css/custom.css`: `still/landing.css` for the landing page, `still/still.css` for the legal docs. The "styles belong in `css/custom.css`" rule does **not** apply here — the mini-site owns its look so the personal site's palette can change independently. `landing.css` carries its own copy of the app's design tokens (green brand + Culinary Arc palette, system fonts); the two sheets are independent and the legal pages reference `../still.css`.
- **i18n**: the **legal docs are English-only** (long-form prose inline, no i18n). The **landing page is bilingual EN/ES** but does **not** use the root site's `i18n/*.json` or `js/custom.js` — it carries its own self-contained EN/ES dictionary inside a small inline `<script>` at the bottom of `still/index.html`, with `data-i18n` / `data-i18n-attr` / `data-i18n-html` attributes on the marketing copy. The **phone mock-ups stay English** (illustrative product screenshots). When editing landing copy, update **both** the hard-coded English in the HTML (the no-JS fallback) **and** the matching EN+ES keys in that inline dictionary.
- **No analytics and no third-party JS.** The legal pages' only script is the one-line year stamp. The landing's only script is the same self-contained inline block (year stamp + EN/ES i18n + light/dark theme toggle, persisted to `localStorage` keys `still-lang` / `still-theme`); there are **no external/CDN dependencies**. The landing's **theme toggle** sets `data-theme` on `<html>` (a no-FOUC head script applies the stored/OS choice before paint); the **legal pages have no toggle and follow the OS** via `prefers-color-scheme`. The phone mock-ups are pure static HTML/CSS (inline SVG sprite — Lucide line icons + the app's food glyphs), so the page still renders with JS disabled (English, OS theme).
- **Clean URLs** come from directory + `index.html` (`still/privacy-policy/index.html` → `/still/privacy-policy`). The landing replaced the old bare legal hub at `/still/`; the root site's Projects "Still" card links here.
- **Store buttons**: Google Play is live (`dev.jdgarita.freshtrack`); the App Store button is a non-linking "Coming soon" state until iOS ships. Keep marketing claims honest — no fabricated user counts / savings / ratings.
- Contact / GDPR-controller email is `hello@jdgarita.dev`. Bump the `Effective date` in a legal page's `<head>` comment and body when its content changes.

## Theme & language toggles

- Theme (`light` / `dark`) is stored in `localStorage.theme` and reflected on `<html data-theme=…>`. An inline `<script>` in `index.html` `<head>` applies the stored theme before first paint to prevent FOUC. The button in the header toggles it.
- Language (`en` / `es`) is stored in `localStorage.lang` and reflected on `<html lang=…>`. First-visit default: browser language if it starts with `es`, otherwise English. The button in the header toggles it.

## Accessibility

- Keep semantic landmarks (`<header>`, `<main>`, `<nav>`, `<section aria-labelledby>`, `<footer>`).
- Every icon-only button must have an `aria-label` (use `data-i18n-attr` so it's translated).
- Use the existing `:focus-visible` ring — don't disable outlines.

## Analytics

Firebase Analytics (GA4 backend) is loaded via the **compat CDN** (v11.6.0) — two `<script defer>` tags in `index.html` before `custom.js`. Firebase project: **jdgarita-site** (Firebase Console: `console.firebase.google.com/project/jdgarita-site`).

- Initialization and the `logEvent` helper live in `js/custom.js` inside the IIFE, guarded by `typeof firebase !== 'undefined'` so the site degrades gracefully if the SDK is blocked (ad blockers, `file://`).
- Pageviews are tracked automatically on init.
- Custom events: `file_download` (resume), `select_content` (nav sections, contact links, store link), `theme_toggle`, `lang_toggle`, `mobile_nav_toggle`.
- The Firebase web API key is safe to commit — Firebase web keys identify the project and aren't secrets. The key (`Browser key (auto created by Firebase)`) is restricted by **API target** (which Google APIs it may call, e.g. `firebaseinstallations`), **not** by HTTP referrer/domain — so changing domains (e.g. → `jdgarita.dev`) does not break analytics.

## Icons

No icon library. Each page (`index.html`, `frnk/index.html`, `404.html`) has a hidden inline sprite, `<svg class="icon-sprite">`, as the first child of `<body>`, holding only the `<symbol>`s that page uses. Use an icon with:

```html
<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>              <!-- outline (Lucide) -->
<svg class="icon icon--fill" aria-hidden="true"><use href="#i-brand-apple"/></svg> <!-- filled brand (Simple Icons) -->
```

- `.icon` (in `css/custom.css`) is `1em` square and uses `currentColor`, so size and tint come from `font-size` / `color` on the icon or its parent.
- **UI and contact icons are [Lucide](https://lucide.dev)** (ISC): `i-menu`, `i-sun`, `i-moon`, `i-check`, `i-globe`, `i-mail`, `i-linkedin`, `i-github`. This is the same set the `still/` landing sprite uses.
- **Store-button brand marks are [Simple Icons](https://simpleicons.org)** (CC0), filled: `i-brand-apple`, `i-brand-google-play`, `i-brand-github`. Prefix brand symbols with `i-brand-`.
- **Adding an icon:** copy the inner `<path>`/`<circle>`/`<rect>` markup from the official package SVG (`cdn.jsdelivr.net/npm/lucide-static/icons/<name>.svg` or `cdn.jsdelivr.net/npm/simple-icons/icons/<name>.svg`) into a new `<symbol id="i-…" viewBox="0 0 24 24">`, only on pages that use it. Never hand-draw or guess path data. Icon-only buttons still need a translated `aria-label`; decorative icons keep `aria-hidden="true"`.
