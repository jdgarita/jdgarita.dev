# Plan: retire the legacy `image/android.ico` favicon

**Branch:** `chore/still-favicon`  
**Goal:** the three Still pages use a proper favicon set; delete the legacy file.

## Current state
- `image/android.ico` is referenced only by `<link rel="shortcut icon">` in:
  - `still/index.html:46` (path `../image/android.ico`)
  - `still/privacy-policy/index.html:23` (path `../../image/android.ico`)
  - `still/terms-and-conditions/index.html:23` (same)
- Root and `frnk/` use the JD brand set: `favicon.svg`, `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png`, `favicon.ico`.

## Decision first
- **Option A (recommended for cleanup):** point the Still pages at the JD brand set. Zero new assets; consistent with the domain.
- **Option B:** give Still its own app-icon favicon. Needs a new SVG + PNG/ICO rasters under `still/`; do this later as a product change, not in the cleanup.

## Steps (Option A)
1. `git checkout -b chore/still-favicon main`
2. In `still/index.html`, replace line 46 with (paths relative to `still/`):
   ```html
   <link rel="icon" href="../image/favicon.svg" type="image/svg+xml" />
   <link rel="icon" href="../image/favicon-32.png" sizes="32x32" type="image/png" />
   <link rel="icon" href="../image/favicon-16.png" sizes="16x16" type="image/png" />
   <link rel="apple-touch-icon" href="../image/apple-touch-icon.png" />
   <link rel="shortcut icon" href="../image/favicon.ico" />
   ```
3. Same block in the two legal pages with `../../image/` paths.
4. `git rm image/android.ico`
5. Docs: in `CLAUDE.md` Favicon bullet, delete the sentence "`image/android.ico` is the legacy favicon, now referenced only by the `still/` mini-site." Update the `image/` list in `ARCHITECTURE.md` if it enumerates files.
6. Commit: `chore(still): use brand favicon set, drop legacy android.ico`

## Verification
- `grep -rn "android.ico" index.html frnk still css js` returns nothing.
- Serve locally, open `/still/`, `/still/privacy-policy/`, `/still/terms-and-conditions/`: tab icon shows the JD mark in light and dark; Network shows no 404 for any icon.
- Still pages remain free of shared JS/CSS (this change touches `<head>` links only).
