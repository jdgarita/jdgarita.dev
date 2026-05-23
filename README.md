# jdgarita.dev

Personal landing page for **Juan Diego Garita** — Senior Android / Kotlin Multiplatform engineer.  
Live at <https://jdgarita.dev>.

## What it is

A single-page static site, hand-written in vanilla HTML, CSS, and JavaScript. No build step, no package manager, no framework, no tests, no CI. You edit the source files directly.

Features:

- **Light / dark theme** toggle, persisted in `localStorage`, with a no-FOUC inline script.
- **English / Spanish** toggle, all user-visible copy routed through `i18n/en.json` and `i18n/es.json`.
- **Mobile-first layout** built on CSS custom properties — tweak a token, the whole site updates.
- **Projects** section with real store links (Google Play live, App Store coming soon).

## Repo layout

```
index.html            single-page site, semantic landmarks, data-i18n attributes
css/custom.css        token-driven stylesheet
css/font-awesome.min.css + fonts/fontawesome-*   FontAwesome 4.7.0 icons
js/custom.js          theme toggle, language toggle, i18n loader, mobile nav
i18n/en.json          English copy
i18n/es.json          Spanish copy
image/jd.JPG          profile photo
image/android.ico     favicon
resume/jd.pdf         downloadable resume
frnk/                 sub-page for the frnk project (shares root CSS/JS/i18n)
still/                standalone legal mini-site for the Still app (own CSS, no JS/i18n)
CLAUDE.md             notes for Claude Code sessions in this repo
```

Everything else in the working tree (`site/`, `build/`, `.gradle/`, `kotlin-js-store/`, `node_modules/`) is untracked leftover from an abandoned Kotlin/JS rewrite — ignore it.

## Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` with `file://` also works — `js/custom.js` carries an embedded fallback dictionary for when `fetch('i18n/*.json')` is blocked by the browser's file-URL policy.

## Editing content

All strings live in `i18n/en.json` and `i18n/es.json`, keyed by flat dot-paths (e.g. `hero.title`, `experience.role1.bullet1`). Change both files together — keys must stay in sync.

Elements reference keys via:

```html
<span data-i18n="some.key"></span>
<button data-i18n-attr="aria-label:a11y.menuToggle"></button>
```

When you add a new key, also mirror it in the `FALLBACK.en` / `FALLBACK.es` objects inside `js/custom.js` so `file://` previews keep working.

## Stack

- HTML + CSS + vanilla JS (no framework)
- FontAwesome 4.7.0 (vendored) for icons
- Google Fonts: Inter (UI) + JetBrains Mono (mono accents)
- Inline SVG for the Google Play logo (FA4 doesn't ship one)

## License

Personal site — content © Juan Diego Garita. Code is free to reuse as inspiration.
