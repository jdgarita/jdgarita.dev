# CONVENTIONS.md

Coding rules for `jdgarita.dev`. These apply to every agent and human contributor.
See `ARCHITECTURE.md` for where things live and `CLAUDE.md` for detailed i18n, theming,
favicon, and sub-page mechanics.

## 1. UI / UX guidelines

- **Clean and minimal.** Generous whitespace, one accent color, restrained motion. If a
  change adds visual noise, it is probably wrong.
- **Content first.** The site exists to communicate who the owner is and what they have
  built. Decoration never competes with copy.
- **Responsive by default.** Mobile-first CSS; existing breakpoints are `640px`, `768px`,
  and `1024px` (`min-width`). Do not introduce new breakpoints without need. Layouts must
  hold from 360 px to 1440 px with no horizontal scroll.
- **Both themes, both languages.** Every visual change is verified in light and dark, in
  English and Spanish. Spanish copy runs ~20 % longer; buttons and chips must not clip.
- **Motion is optional.** Every transition respects `@media (prefers-reduced-motion: reduce)`.
  Keep durations on the `--t-*` tokens; no animation longer than ~300 ms for UI feedback.
- **Professional tone.** Copy is direct, specific, and factual. No hype, no filler, no
  fabricated metrics.

## 2. Component standards

There is no component framework. "Components" are **markup patterns + CSS classes** in
`css/custom.css`, and **behaviors** in `js/custom.js`.

- **Reuse before creating.** Check for an existing class (`.btn`, `.btn-primary`,
  `.btn-ghost`, `.icon-btn`, `.chip`, `.project-card`, `.feature-card`, `.timeline-card`,
  `.section`, `.section-alt`, `.container`, `.store-btn`, …) before adding a new one.
- **One class, one responsibility.** Prefer small composable classes over large
  page-specific selectors. Avoid deep descendant selectors and ID selectors for styling.
- **Naming.** Lowercase, hyphen-separated, semantic (`.project-card`, not `.box2`).
  Modifiers are suffixed (`.btn-primary`, `.btn-ghost`); states use attributes or
  `.is-*` classes (`.is-open`).
- **Separate logic from presentation.**
  - HTML carries structure and semantics only.
  - CSS carries all visual rules, driven by tokens.
  - JS toggles state (attributes, classes, `localStorage`) and never writes inline styles
    or hard-coded copy. Visual response to state lives in CSS selectors
    (`[data-theme="dark"]`, `.is-open`, `[aria-expanded="true"]`).
- **Semantic HTML first.** `<header>`, `<nav>`, `<main>`, `<section aria-labelledby>`,
  `<footer>`, `<button>` for actions, `<a>` for navigation. Never a clickable `<div>`.
- **Accessibility is part of the component.** Icon-only buttons carry a translated
  `aria-label` via `data-i18n-attr`.
  Disclosure toggles expose `aria-expanded`. Focus styles use the shared
  `:focus-visible` ring and are never removed.
- **Copy goes through i18n.** Any new visible string needs a `data-i18n` key defined in
  `i18n/en.json`, `i18n/es.json`, and the `FALLBACK` dictionary in `js/custom.js`.
  The `still/` mini-site keeps its own inline dictionary; follow its local pattern there.

## 3. Styling rules

- **Tokens, not literals.** Colors, font sizes, spacing, radii, shadows, and durations
  come from the custom properties on `:root`. A raw hex code or pixel value inside a rule
  is a smell; add or reuse a token instead.
- **Dark theme via token overrides only.** Redefine tokens under `:root[data-theme="dark"]`.
  Never write component-level dark-mode rules.
- **No inline `style` attributes** in root or `frnk/` pages. The one sanctioned exception
  is an inline SVG whose geometry must travel with the markup. `still/` owns its own
  sheet and may use scoped inline styles for the phone mock-ups, but new work there should
  still prefer classes.
- **No CSS frameworks or preprocessors.** No Tailwind, Bootstrap, Sass, or PostCSS.
- **File ownership.** Root + `frnk/` styles live only in `css/custom.css`.
  `still/` styles live only in `still/landing.css` and `still/still.css`.
  Do not create additional stylesheets.
- **Keep the cascade shallow.** Specificity should rarely exceed a single class plus a
  state selector. Avoid `!important`.

## 4. JavaScript rules

- **One file.** All root/frnk behavior lives inside the IIFE in `js/custom.js`.
  No new script files, no ES modules, no bundlers.
- **ES5-compatible syntax** to match the existing file: `var`, `function` expressions,
  string concatenation. No arrow functions, `const`/`let`, template literals, or
  optional chaining unless the whole file is deliberately migrated in one reviewed change.
- **No TypeScript and no transpilation.** The repo has no build step; what you write is
  what ships. Compensate with small functions, clear names, and defensive checks.
- **Progressive enhancement.** The page must be readable and navigable with JS disabled.
  JS enhances (theme, language, mobile nav, analytics); it never gates content.
- **Guard external SDKs.** Any third-party global is checked with
  `typeof x !== 'undefined'` before use so ad blockers and `file://` previews don't throw.
- **No new external dependencies** (CDN scripts, analytics vendors, fonts) without owner
  approval. Each one is a render-blocking or privacy cost.
- **Analytics events** use the existing `logEvent` helper and the established event
  names (`pageview`, `select_content`, `file_download`, `store_click`, `theme_toggle`,
  `lang_toggle`, `mobile_nav_toggle`). A new event or property must also be added to
  `EVENTS` in `worker.js` (with a test), or the Worker drops it. Do not log personal data.

## 5. Asset management

- **Images**
  - Raster photos/illustrations ship as **WebP with a PNG/JPEG fallback** via `<picture>`.
    Target ≤ 60 KB for content images; the avatar is ~36 KB WebP / ~44 KB PNG.
  - Every `<img>` declares `width` and `height` (prevents layout shift), meaningful
    `alt`, and `loading="lazy" decoding="async"` unless it is above the fold.
  - Icons and logos that can be vector **are** vector: inline SVG or `image/*.svg`.
  - Social cards are exactly 1200×630 JPEG, ≤ 80 KB, referenced by absolute URL.
  - Favicons are generated from `image/favicon.svg`; never hand-edit the raster
    fallbacks.
  - Keep existing basenames (`jd-avatar.webp`, `og-image.jpg`, …). The host is
    case-sensitive and pages reference these paths exactly.
- **Fonts.** Google Fonts with `preconnect` + `display=swap`, limited to the weights
  actually used. No icon fonts: icons are inline SVG (see CLAUDE.md → Icons).
- **Bundle size.** There is no bundle, so the budget is the raw file: keep
  `css/custom.css` under ~30 KB and `js/custom.js` under ~40 KB uncompressed.
  Remove dead rules and dead code when you touch a file.
- **Documents.** `resume/jd.pdf` stays under ~100 KB; compress before committing.
- **Nothing binary that isn't served.** Do not commit design sources, screenshots, or
  build output. `node_modules/` and Kobweb artifacts are legacy and must not grow.

## 6. SEO and social metadata

- One `<h1>` per page; headings descend without skipping levels.
- Each page has a unique `<title>` and `meta name="description"`.
- Open Graph and Twitter meta values are **hard-coded English** in the `<head>` (scrapers
  don't run JS). When `meta.title` / `meta.description` change in the JSON, update the
  matching `content` attributes too.
- `og:image` / `twitter:image` are absolute `https://jdgarita.dev/...` URLs.
- Clean URLs only (`/still/privacy-policy/`), never `.html` in links.

## 7. Content rules

- Experience content mirrors `resume/jd.pdf`. Update the JSON when the PDF changes;
  never introduce placeholders.
- No fabricated statistics, testimonials, ratings, or user counts anywhere.
- Legal pages: bump the `Effective date` in both the `<head>` comment and the body when
  content changes.

## 8. Commit and PR hygiene

- Conventional-style subjects scoped to the area: `feat(projects): …`, `fix(i18n): …`,
  `style(css): …`, `docs: …`, `content(still): …`.
- One logical change per commit; commit often.
- PR description states intent, lists touched files, and includes before/after
  screenshots for any visual change (light + dark).
- Never merge, push to `main`, or tag without explicit owner approval — that is a
  production deploy.
