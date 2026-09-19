# AGENTS.md

Operating instructions for AI coding agents working in the `jdgarita.dev` repository.
Read this first, then `ARCHITECTURE.md` (system map) and `CONVENTIONS.md` (coding rules).
`CLAUDE.md` holds the detailed, file-by-file editing guide and remains authoritative for
i18n, theming, sub-page, favicon, and analytics specifics.

## Scope

This repository is the personal portfolio and developer website of Juan Diego Garita,
live at <https://jdgarita.dev>. It is the owner's public digital identity: the first thing
a recruiter, collaborator, or app user sees. Treat every change as customer-facing.

It also hosts sub-sites for the owner's apps (`frnk/`, `still/`), including legal documents
that app stores link to. Breaking those URLs has real consequences.

## Core directive

Every change must preserve or improve, in this order:

1. **Performance** — Lighthouse Performance stays in the green. The site ships zero
   framework, zero bundler, and under ~60 KB of first-party CSS+JS. Do not add a build step,
   a JS framework, a CSS framework, or a CDN dependency without explicit owner approval.
2. **Accessibility** — semantic landmarks, translated `aria-label`s on icon-only buttons,
   visible `:focus-visible` rings, WCAG AA contrast in both themes, `prefers-reduced-motion`
   respected. Lighthouse Accessibility must not regress.
3. **SEO** — one `<h1>` per page, meaningful `<title>` and `meta description`, complete
   Open Graph / Twitter meta with absolute image URLs, descriptive `alt` text, clean URLs.

A change that improves one of these at the cost of another needs a stated trade-off and
owner sign-off.

## Commands

There is **no package manager, no dependency install, and no build step**. The source files
in the repo root are what GitHub Pages serves.

| Task | Command |
| --- | --- |
| Install dependencies | *None.* Do not add `package.json`, `pnpm`, `yarn`, or Gradle. |
| Local dev server | `python3 -m http.server 8000` from the repo root, then open <http://localhost:8000> |
| Production build | *None.* Merging to `main` deploys the raw files. |
| Validate i18n JSON | `python3 -c "import json; json.load(open('i18n/en.json')); json.load(open('i18n/es.json'))"` |
| Check EN/ES key parity | `python3 -c "import json; en=set(json.load(open('i18n/en.json'))); es=set(json.load(open('i18n/es.json'))); print('en-only', sorted(en-es)); print('es-only', sorted(es-en))"` |
| Lighthouse audit (optional) | Chrome DevTools → Lighthouse, or `npx lighthouse http://localhost:8000 --view` (uses the system `npx`, not a project dependency) |

Serve over HTTP rather than `file://` so `fetch('i18n/*.json')` works the way it does in
production. `file://` previews fall back to the embedded dictionary in `js/custom.js`.

Ignore these untracked or legacy directories entirely; they are not the project:
`site/`, `build/`, `.gradle/`, `kotlin-js-store/`, `node_modules/`. If a task mentions
Kotlin, Kobweb, Compose, or Firebase hosting, confirm with the owner before touching `site/`.

## Validation checklist before finishing

- [ ] Page loads at `http://localhost:8000` with no console errors.
- [ ] Both themes (light/dark) and both languages (EN/ES) render correctly.
- [ ] Layout holds at 360 px, 768 px, and 1280 px widths.
- [ ] Every new user-visible string has a key in `i18n/en.json`, `i18n/es.json`, **and**
      `FALLBACK.en` / `FALLBACK.es` inside `js/custom.js`.
- [ ] If `meta.title` / `meta.description` changed, the hard-coded OG/Twitter `content`
      attributes in the page `<head>` were updated to match.
- [ ] Keyboard navigation reaches every interactive element with a visible focus ring.
- [ ] No new external requests were introduced.

## Git rules

- `main` is the only long-lived branch and is PR-protected. Work on a short-lived branch
  (`fix/…`, `feat/…`, `docs/…`, `content/…`) and land it through a pull request.
- **Commit frequently** at logical checkpoints with intent-based messages
  (`feat(projects): …`, `fix(i18n): …`, `docs: …`). Small, reviewable commits over one
  large one.
- **Merging to `main` is a production deployment.** GitHub Pages publishes the merge
  commit within minutes. Never push to `main`, merge a PR, tag, or otherwise trigger a
  deploy without the owner's explicit approval in that turn.
- Never `git push --force`, rewrite shared history, or delete branches you did not create.
- Pull requests are reviewed automatically by the Claude Code GitHub Action
  (`.github/workflows/claude-code-review.yml`). Address its findings before requesting merge.

## Content integrity

- Experience, roles, and dates come from `resume/jd.pdf`. Do not invent or embellish.
- Marketing copy for `still/` and `frnk/` must stay honest: no fabricated user counts,
  ratings, savings figures, or testimonials.
- Legal pages under `still/` have an `Effective date`; bump it whenever their content changes.
- The contact email is `hello@jdgarita.dev`. Do not introduce other addresses.
