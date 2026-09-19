# Plan: robots.txt, sitemap.xml, canonical links, 404 page

**Branch:** `seo/robots-sitemap`  
**Goal:** close the crawlability gaps that AGENTS.md's SEO priority calls out. All additive, no runtime JS.

## Current state
- No `robots.txt`, no `sitemap.xml`, no `404.html`.
- `<link rel="canonical">` exists on the three `still/` pages but **not** on `index.html` or `frnk/index.html`.
- Public routes (5): `/`, `/frnk/`, `/still/`, `/still/privacy-policy/`, `/still/terms-and-conditions/`.
- Last content change per page (git): root 2026-09-12, frnk 2026-05-22, still landing 2026-05-26, legal pages 2026-05-22.

## Steps
1. `git checkout -b seo/robots-sitemap main`
2. Add `robots.txt` at the root:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://jdgarita.dev/sitemap.xml
   ```
   (No disallows needed: `site/`, `build/`, `node_modules/` are not in the repo, so Pages never serves them.)
3. Add `sitemap.xml` at the root with the five URLs, absolute, trailing slashes, `lastmod` from the dates above. Root `priority` 1.0, `frnk`/`still` 0.7, legal pages 0.3. Omit `changefreq` (ignored by Google).
4. Add `<link rel="canonical" href="https://jdgarita.dev/" />` to `index.html` `<head>` next to the OG block, and `https://jdgarita.dev/frnk/` in `frnk/index.html`. Confirm `og:url` on both matches the canonical.
5. Add a minimal `404.html` at the root (GitHub Pages serves it automatically). Reuse the root shell: same `<head>` no-FOUC script, `css/custom.css`, a single `.section` with a heading and a `.btn-primary` link home. Route the two strings through i18n (`notfound.title`, `notfound.cta`) in both JSON files and `FALLBACK` in `js/custom.js`. Add `<meta name="robots" content="noindex">`.
6. Docs: add to the `AGENTS.md` validation checklist: "If a page is added, removed, or its content changes materially, update its `<lastmod>` in `sitemap.xml`." Add `robots.txt`, `sitemap.xml`, `404.html` to the `ARCHITECTURE.md` tree and routing table.
7. Commit in two steps: `seo: add robots.txt, sitemap.xml, canonical links` then `feat: add 404 page`.

## Verification
- `python3 -c "import xml.dom.minidom as m; m.parse('sitemap.xml'); print('ok')"`
- `curl -s localhost:8000/robots.txt` and `/sitemap.xml` return the files with 200.
- Open `/does-not-exist` locally (http.server returns its own 404, so check `404.html` directly) in both themes and languages.
- EN/ES key parity script from `AGENTS.md` passes.
- Lighthouse SEO on `/` stays 100; "Document has a valid canonical" audit passes on `/` and `/frnk/`.

## After merge (owner)
- Submit `https://jdgarita.dev/sitemap.xml` in Google Search Console.
