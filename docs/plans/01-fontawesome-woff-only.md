# Plan: drop legacy FontAwesome font formats

**Branch:** `chore/fa-woff-only`  
**Goal:** keep only the formats a supported browser will download; shrink the repo by ~900KB with zero runtime change.

## Current state
- `fonts/` holds six files: `eot` 164KB, `svg` 436KB, `ttf` 164KB, `otf` 132KB, `woff` 96KB, `woff2` 76KB.
- `css/font-awesome.min.css` has one `@font-face` listing eot, woff2, woff, ttf, svg in that order. Browsers stop at the first format they support, so every modern browser fetches only `woff2`.
- `FontAwesome.otf` is referenced by nothing (desktop install artifact).
- Nothing outside that CSS references `fonts/`.

## Steps
1. `git checkout -b chore/fa-woff-only main`
2. Edit the `@font-face` rule in `css/font-awesome.min.css`:
   - Remove the first `src:url('../fonts/fontawesome-webfont.eot?v=4.7.0');` line (IE9 hack).
   - Replace the second `src:` with only:
     `url('../fonts/fontawesome-webfont.woff2?v=4.7.0') format('woff2'),url('../fonts/fontawesome-webfont.woff?v=4.7.0') format('woff')`
   - Add `font-display:block;` (icon fonts should not swap to a fallback glyph; Lighthouse accepts `block`).
   - Keep the rule minified on one line to match the file.
3. `git rm fonts/fontawesome-webfont.eot fonts/fontawesome-webfont.svg fonts/fontawesome-webfont.ttf fonts/FontAwesome.otf`
4. Docs: update the `css/font-awesome.min.css + fonts/fontawesome-*` bullet in `CLAUDE.md` (say "woff2 + woff only") and the `fonts/` line in the `ARCHITECTURE.md` project tree.
5. Commit: `chore(fonts): keep only woff2/woff for FontAwesome`

## Verification
- `python3 -m http.server 8000`, open `/` and `/frnk/` in both themes; every icon (github, linkedin, apple, envelope, bars, moon/sun) renders.
- DevTools Network: exactly one FontAwesome font request, `woff2`, status 200, no 404s.
- `grep -rn "fontawesome-webfont\|FontAwesome.otf" css index.html frnk still` shows only the two remaining formats.
- Lighthouse on `/`: performance and "font-display" audit unchanged or better.

## Decision to confirm
- Keep `woff` as fallback (recommended, 96KB, covers Safari < 12) or go `woff2`-only.
