"""Generate 1200x630 social cards (og:image) for library articles.

Run from anywhere; paths are resolved from this file's location:

    python scripts/generate_og_images.py            # new or changed cards only
    python scripts/generate_og_images.py --all      # regenerate every card
    python scripts/generate_og_images.py 116-ai-product-goals   # just these

Reads _posts/*.md, writes img/cards/<slug>.png. Each card stores the title
and topic it was drawn from, so a card is redrawn when either changes.
Cards whose article no longer exists are listed, not deleted.

Needs: pip install pillow pyyaml
Font: the first .ttf/.otf in scripts/fonts/, or a path in CARD_FONT.
"""
import glob
import os
import re
import sys

import yaml
from PIL import Image, ImageDraw, ImageFont
from PIL.PngImagePlugin import PngInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "_posts")
CARDS = os.path.join(ROOT, "img", "cards")
LOGO = os.path.join(ROOT, "img", "BayInfoLogow.png")

W, H = 1200, 630
MARGIN = 80
BG, FG, MUTED, RULE = (51, 51, 51), (238, 238, 238), (170, 170, 170), (85, 85, 85)
KEY = "bayis-card"  # PNG text chunk holding "title|topic"


def find_font():
    if os.environ.get("CARD_FONT"):
        return os.environ["CARD_FONT"]
    found = sorted(glob.glob(os.path.join(ROOT, "scripts", "fonts", "*.[ot]tf")))
    if not found:
        sys.exit("No font: put a .ttf or .otf in scripts/fonts/ or set CARD_FONT")
    return found[0]


FONT = find_font()


def wrap(draw, text, font, width):
    lines, line = [], ""
    for word in text.split():
        trial = (line + " " + word).strip()
        if draw.textlength(trial, font=font) <= width:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def fit_title(draw, title, width, height):
    """Largest size at which the wrapped title fits the box."""
    for size in range(72, 30, -2):
        font = ImageFont.truetype(FONT, size)
        lines = wrap(draw, title, font, width)
        if len(lines) * size * 1.18 <= height:
            return font, lines
    return font, lines


def draw_card(fm, path, key):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((260, 60))
    img.paste(logo, (MARGIN, MARGIN - 10), logo)

    label = ImageFont.truetype(FONT, 24)
    topic = (fm.get("topic") or "Technical article").upper()
    d.text((MARGIN, 190), topic, font=label, fill=MUTED)

    y = 235
    font, lines = fit_title(d, fm["title"], W - 2 * MARGIN, H - 120 - y)
    for line in lines:
        d.text((MARGIN, y), line, font=font, fill=FG)
        y += int(font.size * 1.18)

    d.line((MARGIN, H - 95, W - MARGIN, H - 95), fill=RULE, width=1)
    d.text((MARGIN, H - 75), "bayis.co.uk/library", font=label, fill=MUTED)

    meta = PngInfo()
    meta.add_text(KEY, key)
    img.save(path, optimize=True, pnginfo=meta)


def stored_key(path):
    try:
        with Image.open(path) as im:
            return im.text.get(KEY)
    except (OSError, AttributeError):
        return None


def read_posts():
    """Yield (slug, front matter) for every article in _posts/."""
    for fn in sorted(os.listdir(POSTS)):
        if not fn.endswith(".md"):
            continue
        text = open(os.path.join(POSTS, fn), encoding="utf-8").read()
        m = re.match(r"^---\n(.*?)\n---", text, re.S)
        if not m:
            print(f"  skipped {fn}: no front matter (must start with --- on line 1)")
            continue
        fm = yaml.safe_load(m.group(1)) or {}
        if fm.get("layout") != "article" or not fm.get("title"):
            continue  # redirect stubs and the like
        yield re.sub(r"^\d{4}-\d{2}-\d{2}-", "", fn)[:-3], fm


def main(args):
    force = "--all" in args
    only = {a for a in args if not a.startswith("--")}
    os.makedirs(CARDS, exist_ok=True)

    slugs, made = set(), 0
    for slug, fm in read_posts():
        slugs.add(slug)
        if only and slug not in only:
            continue
        path = os.path.join(CARDS, slug + ".png")
        key = f"{fm['title']}|{fm.get('topic', '')}"
        if force or only or stored_key(path) != key:
            draw_card(fm, path, key)
            print(f"  wrote img/cards/{slug}.png")
            made += 1

    for path in sorted(glob.glob(os.path.join(CARDS, "*.png"))):
        slug = os.path.basename(path)[:-4]
        if slug not in slugs:
            print(f"  orphan img/cards/{slug}.png (no matching article)")

    print(f"{made} card(s) written, {len(slugs)} articles")


if __name__ == "__main__":
    main(sys.argv[1:])
