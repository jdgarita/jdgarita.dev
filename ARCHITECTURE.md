# ARCHITECTURE.md

System map for `jdgarita.dev`. For editing rules see `CONVENTIONS.md`; for agent operating
instructions see `AGENTS.md`; for exhaustive per-file guidance see `CLAUDE.md`.

## Tech stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | **None.** Hand-written HTML5. | No Astro, Next.js, React, or Kotlin/JS. A Kobweb rewrite was attempted and abandoned; its leftovers (`site/`, `build/`, `.gradle/`, `kotlin-js-store/`) are git-ignored. |
| Styling | **Vanilla CSS with custom properties** (`css/custom.css`) | Design tokens on `:root` (light) and `:root[data-theme="dark"]` (dark). No Tailwind, Sass, or PostCSS. |
| Scripting | **Vanilla JavaScript, ES5 syntax** (`js/custom.js`) | Single IIFE, `'use strict'`, `var` only, no modules, no TypeScript, no bundler. |
| Icons | Inline SVG sprite per page: Lucide (ISC) UI icons + Simple Icons (CC0) brand marks | No icon library, no icon font; `.icon` uses `currentColor`. See CLAUDE.md → Icons. |
| Fonts | Google Fonts: Inter + JetBrains Mono | Loaded with `preconnect` and `display=swap`. |
| i18n | Flat JSON dictionaries (`i18n/en.json`, `i18n/es.json`) | Applied at runtime via `data-i18n` / `data-i18n-attr`; embedded fallback copy in `js/custom.js`. |
| Analytics | First-party beacon (`POST /e`) relayed server-side to **PostHog** by `worker.js` | frnk project on PostHog Cloud US, `site = jdgarita.dev`. No third-party script, no cookie. See CLAUDE.md → Analytics. |
| Hosting | **Cloudflare Workers Static Assets** (Worker `jdgarita-dev`), serving the repo root of `main` | Config in `wrangler.jsonc`; `.assetsignore` keeps non-page files private; custom domain `jdgarita.dev` on the Worker. |
| CI | GitHub Actions running Claude Code on PRs and `@claude` mentions; Cloudflare Workers Builds deploys `main` and previews branches | No lint or build jobs. Worker tests run locally (`scripts/worker.test.mjs`). |
| Package manager | **None** | No `package.json`, lockfile, or Gradle files at the root. |

## Deployment model

```
feature branch ──PR──▶ main ──Cloudflare Workers Builds──▶ https://jdgarita.dev
      └──────────── Workers preview URL (per branch, beacons not relayed)
```

Workers Static Assets serves the repository root of `main` as-is, minus `.assetsignore`.
There is no build artifact and no `dist/`. `worker.js` runs only for `POST /e`. A merge to
`main` **is** the production release.

## Routing

Routing is the filesystem. Each directory with an `index.html` is a clean URL:

| URL | File | Pattern |
| --- | --- | --- |
| `/` | `index.html` | Root single-page site |
| `/frnk/` | `frnk/index.html` | Shared-shell sub-page |
| `/still/` | `still/index.html` | Standalone marketing landing |
| `/still/privacy-policy/` | `still/privacy-policy/index.html` | Standalone legal doc |
| `/still/terms-and-conditions/` | `still/terms-and-conditions/index.html` | Standalone legal doc |

Any other path serves `404.html` (`not_found_handling: "404-page"` in `wrangler.jsonc`; it uses
root-absolute asset URLs, is `noindex`, and flags its page views `not_found`). `POST /e` is the
analytics beacon (`worker.js`). Crawlers are pointed at `sitemap.xml` by `robots.txt`.

Adding a page means adding a directory with an `index.html` (and a `<url>` entry in `sitemap.xml`). There is no client-side
router; in-page navigation on the root uses `#hero`, `#about`, `#apps`, `#open-source`,
`#experience`, `#skills`, `#contact` anchors.

### Two sub-page patterns

**Shared shell** (`frnk/`): reuses `../css/custom.css`, `../js/custom.js`, and the root i18n
dictionary. Sets `<html data-i18n-base="../">` so the loader resolves `../i18n/*.json`.
Use this for project pages that should feel like part of the main site.

**Standalone** (`still/`): deliberately decoupled. Own stylesheets (`still/landing.css`,
`still/still.css`), own inline EN/ES dictionary, own theme toggle, no shared JS (the landing
carries its own inline copy of the analytics beacon; the legal docs have none). Use this for app mini-sites whose branding must evolve independently of the portfolio.

## Project structure

```
.
├── index.html                 Root page: Hero → About → Experience → Projects → Skills → Contact
├── css/
│   └── custom.css             All root + frnk styles; tokens on :root / :root[data-theme="dark"]
├── js/
│   └── custom.js              Theme toggle, lang toggle, i18n loader, mobile nav, analytics
├── i18n/
│   ├── en.json                All user-visible copy (root + frnk), flat dot-path keys
│   └── es.json                Spanish mirror; keys must match en.json exactly
├── image/                     Avatar (webp+png), favicons (svg source + raster fallbacks),
│                              OG cards (1200×630 jpg), project logos
├── resume/jd.pdf              Downloadable résumé; source of truth for Experience content
├── frnk/index.html            Shared-shell sub-page for the frnk app
├── still/
│   ├── index.html             Standalone landing page (bilingual, inline dictionary)
│   ├── landing.css            Landing tokens ("Culinary Arc" palette)
│   ├── still.css              Legal-doc styles
│   ├── privacy-policy/index.html
│   └── terms-and-conditions/index.html
├── 404.html                   Not-found page (shared shell, root-absolute paths, noindex)
├── robots.txt                 Allows all crawlers; points to sitemap.xml
├── sitemap.xml                The five public URLs with <lastmod>
├── worker.js                  Cloudflare Worker: POST /e only (analytics beacon → PostHog)
├── wrangler.jsonc             Worker config (static assets, run_worker_first, 404-page)
├── .assetsignore · _headers   Non-public paths · noindex for *.workers.dev
├── scripts/worker.test.mjs    Worker tests (Node built-in runner)
├── .github/workflows/         Claude Code review + mention automation
├── CLAUDE.md                  Detailed editing guide
├── AGENTS.md · ARCHITECTURE.md · CONVENTIONS.md
└── README.md
```

### Where things live

| Looking for… | Go to |
| --- | --- |
| Page structure / landmarks | `index.html` (root), `frnk/index.html`, `still/**/index.html` |
| Reusable UI "components" | CSS classes in `css/custom.css` (`.btn`, `.chip`, `.project-card`, `.section`, `.timeline`, …). There is no component runtime; reuse is by class name and markup pattern. |
| User-visible copy | `i18n/en.json` + `i18n/es.json` (root, frnk) · inline `<script>` dictionary in `still/index.html` (Still landing) · inline prose in `still/*/index.html` (legal docs) |
| Design tokens (color, type, spacing, radius, motion) | `:root` block at the top of `css/custom.css`; dark overrides under `:root[data-theme="dark"]` |
| Theme / language state | `localStorage.theme` and `localStorage.lang`, reflected on `<html data-theme>` / `<html lang>`; no-FOUC inline script in each page `<head>` |
| Static assets | `image/`, `resume/` |
| Portfolio entries | Apps (`#apps`) and Open Source (`#open-source`) section markup in `index.html` + `apps.*`, `openSource.*`, and `projects.*` keys in i18n. There are no Markdown/MDX content files or a blog. |
| SEO / social meta | Hard-coded in each page `<head>` (OG/Twitter must be static because scrapers don't run JS) |
| Analytics events | `logEvent` helper inside the IIFE in `js/custom.js` (beacon to `/e`); the allowlist of events/properties is `EVENTS` in `worker.js` |

## Runtime flow (root page)

1. Inline `<head>` script reads `localStorage.theme` / `localStorage.lang` (or OS/browser
   defaults) and sets `data-theme` and `lang` on `<html>` before first paint.
2. `css/custom.css` applies tokens for the resolved theme.
3. `js/custom.js` runs after parse: fetches `i18n/<lang>.json` (falls back to the embedded
   `FALLBACK` dictionary), walks `[data-i18n]` / `[data-i18n-attr]` nodes, wires the toggles
   and mobile nav, and sends a `pageview` beacon to `/e`.
4. Toggling theme or language updates `<html>` attributes and `localStorage`, then
   re-applies the dictionary in place. No page reload.

## Known debt

- `node_modules/` (leftover from the abandoned Firebase experiment) was tracked in git
  until September 2026 and is now untracked and git-ignored. It may still exist on local
  checkouts; it is not served or referenced by any page. Do not re-add it.
- The Kobweb leftovers (`site/` and friends) are git-ignored but may still exist on local
  checkouts. Never treat them as the project.
