"""Regenerate the Still landing's desktop store QR codes (still/img/qr-app-store.svg, qr-google-play.svg).

Ported from faint.coffee's landing/scripts/make_qr.py (same drawing, same check).

The codes are static assets, committed beside the badges: nothing generates them at page load.
Each encodes the store's own campaign link (the same shapes the landing's inline beacon builds), so a scan is
attributed in App Store Connect (App Analytics → Campaigns, `ct=web-qr`) and in Play Console
(acquisition, `utm_medium=qr`) — PostHog never sees a scan. See CLAUDE.md "Still web funnel".

    uv run --with segno python3 scripts/make_qr.py            # from the repo root
    uv run --with segno --with zxing-cpp --with pillow --with numpy python3 scripts/make_qr.py --check

segno only computes the module matrix; the SVG is drawn here, in the "connected rounded" style
(no square corners anywhere):

- A module rounds a corner only where both of its neighbours on that corner are light, so runs
  of modules join into pills and bars and a lone module is a dot.
- The three finder patterns are a rounded ring around a rounded 3×3 core.

The codes have no background and no quiet zone of their own: ink modules drawn edge to edge.
still/landing.css always sets them on a white tile whose padding is the quiet zone, so they read
the same in the light and dark themes.

--check rasterises each written SVG with rsvg-convert (`brew install librsvg`) onto --bg with a
4-module margin, and decodes it back with ZXing (zxing-cpp, the decoder family most Android
scanners build on), failing if the text is not the URL it should carry — so the check reads the
rounded shapes as they ship, not segno's square modules. (OpenCV's QRCodeDetector is not used:
it rejects rounded finder patterns that phone cameras read.)
"""

import io
import subprocess
import sys
from pathlib import Path

import segno

OUT = Path(__file__).resolve().parent.parent / "still" / "img"

URLS = {
    "app-store": "https://apps.apple.com/app/apple-store/id6819700105?pt=129331442&ct=web-qr&mt=8",
    "google-play": (
        "https://play.google.com/store/apps/details?id=dev.jdgarita.freshtrack"
        "&referrer=utm_source%3Djdgarita.dev%26utm_medium%3Dqr"
    ),
}

# Module ink and the background it is checked against — landing.css's --ink on the white tile.
INK, BACKGROUND = "#141414", "#FFFFFF"

# Finder geometry, in modules: the 7×7 ring's outer and inner corner radii, and the 3×3 core's.
FINDER_OUTER_R, FINDER_INNER_R, FINDER_CORE_R = 2.2, 1.3, 1.0
# A module's corner radius where it rounds (0.5 = a lone module is a full dot).
MODULE_R = 0.5


def fmt(value):
    """Shortest form of a coordinate: 3 decimals at most, no trailing or leading zero (.5, -.5)."""
    text = f"{value:.3f}".rstrip("0").rstrip(".")
    return text.replace("0.", ".", 1) if text.lstrip("-").startswith("0.") else text


def rounded_rect(x, y, w, h, tl, tr, br, bl):
    """A clockwise rect path with a radius per corner (0 = square), in relative commands, which
    keep the hundreds of module paths short."""

    def arc(r, dx, dy):
        return f"a{fmt(r)} {fmt(r)} 0 0 1 {fmt(dx)} {fmt(dy)}" if r else ""

    def line(cmd, d):
        return f"{cmd}{fmt(d)}" if d else ""

    return (
        f"M{fmt(x + tl)} {fmt(y)}"
        + line("h", w - tl - tr) + arc(tr, tr, tr)
        + line("v", h - tr - br) + arc(br, -br, br)
        + line("h", -(w - br - bl)) + arc(bl, -bl, -bl)
        + line("v", -(h - bl - tl)) + arc(tl, tl, -tl)
        + "z"
    )


def hole(x, y, w, h, r):
    """A counter-clockwise rounded rect, so nonzero fill cuts it out of the shape around it."""
    return (
        f"M{fmt(x + r)} {fmt(y)}"
        f"A{fmt(r)} {fmt(r)} 0 0 0 {fmt(x)} {fmt(y + r)}"
        f"V{fmt(y + h - r)}A{fmt(r)} {fmt(r)} 0 0 0 {fmt(x + r)} {fmt(y + h)}"
        f"H{fmt(x + w - r)}A{fmt(r)} {fmt(r)} 0 0 0 {fmt(x + w)} {fmt(y + h - r)}"
        f"V{fmt(y + r)}A{fmt(r)} {fmt(r)} 0 0 0 {fmt(x + w - r)} {fmt(y)}Z"
    )


def svg_for(qr):
    matrix = [[bool(v) for v in row] for row in qr.matrix]
    n = len(matrix)
    finders = [(0, 0), (n - 7, 0), (0, n - 7)]

    def in_finder(x, y):
        return any(fx <= x < fx + 7 and fy <= y < fy + 7 for fx, fy in finders)

    def dark(x, y):
        return 0 <= x < n and 0 <= y < n and matrix[y][x] and not in_finder(x, y)

    parts = []
    for y in range(n):
        for x in range(n):
            if not dark(x, y):
                continue
            up, down, left, right = dark(x, y - 1), dark(x, y + 1), dark(x - 1, y), dark(x + 1, y)
            r = MODULE_R
            parts.append(rounded_rect(
                x, y, 1, 1,
                0 if (up or left) else r,
                0 if (up or right) else r,
                0 if (down or right) else r,
                0 if (down or left) else r,
            ))
    for fx, fy in finders:
        o, i, c = FINDER_OUTER_R, FINDER_INNER_R, FINDER_CORE_R
        parts.append(rounded_rect(fx, fy, 7, 7, o, o, o, o) + hole(fx + 1, fy + 1, 5, 5, i))
        parts.append(rounded_rect(fx + 2, fy + 2, 3, 3, c, c, c, c))

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}">'
        f'<path fill="{INK}" d="{"".join(parts)}"/></svg>\n'
    )


def check(svg, url, name, modules):
    import numpy as np
    import zxingcpp
    from PIL import Image

    scale = 12
    png = subprocess.run(
        ["rsvg-convert", "-w", str(modules * scale), "-b", BACKGROUND, str(svg)],
        check=True, capture_output=True,
    ).stdout
    code = Image.open(io.BytesIO(png)).convert("L")
    # The 4-module quiet zone the page provides, in the background's own grey.
    page = Image.new("L", (code.width + 8 * scale, code.height + 8 * scale),
                     Image.new("RGB", (1, 1), BACKGROUND).convert("L").getpixel((0, 0)))
    page.paste(code, (4 * scale, 4 * scale))
    decoded = [result.text for result in zxingcpp.read_barcodes(np.asarray(page))]
    if decoded != [url]:
        sys.exit(f"{name}: decoded {decoded!r}, expected {url!r}")
    print(f"{name}: decodes OK")


def main():
    for store, url in URLS.items():
        # Error correction M: the most reliably scanned form at this size.
        qr = segno.make(url, error="m", micro=False)
        name = f"qr-{store}.svg"
        svg = OUT / name
        svg.write_text(svg_for(qr))
        modules = qr.symbol_size(scale=1, border=0)[0]
        print(f"{name}: version {qr.version}, {modules} modules")
        if "--check" in sys.argv:
            check(svg, url, name, modules)


if __name__ == "__main__":
    main()
