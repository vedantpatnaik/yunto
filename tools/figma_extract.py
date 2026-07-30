#!/usr/bin/env python3
"""
figma_extract.py -- turn a cached Figma file-JSON into compact, per-screen
implementation specs.

The cache files (.figma-cache/*.json) are raw responses from
GET /v1/files/:key -- shape: {"document": {"children": [ ...CANVAS pages... ]}}.
Each CANVAS page holds the top-level frames; the mobile "screens" are the
frames that are phone-width.

This script never hits the network. It reads the cache only.

Usage
-----
  python3 tools/figma_extract.py --index
  python3 tools/figma_extract.py --screen 603:8809
  python3 tools/figma_extract.py --screen "leads - details"
  python3 tools/figma_extract.py --all .figma-cache/specs/influencer

See tools/README.md for the full option list.
"""

import argparse
import json
import os
import re
import sys

# --------------------------------------------------------------------------
# defaults -- the influencer app is the common case
# --------------------------------------------------------------------------
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(REPO, ".figma-cache")

PAGES = {  # friendly name -> (cache file, canvas page id)
    "influencer": ("influencer.json", "0:1"),
    "agency": ("agency.json", "0:4"),
    "admin": ("admin.json", "0:3"),
}

# a top-level frame counts as a screen when it is phone-width and tall enough
# to be a whole screen rather than a detached component/section.
SCREEN_WIDTH = 375
MIN_SCREEN_HEIGHT = 600

# node keys we never want in the output
CONTAINER_TYPES = {"FRAME", "GROUP", "INSTANCE", "COMPONENT", "COMPONENT_SET", "CANVAS"}


# --------------------------------------------------------------------------
# small helpers
# --------------------------------------------------------------------------
def r2(v):
    """Round a float to 2dp, collapsing to int when whole."""
    if v is None:
        return None
    v = round(float(v), 2)
    return int(v) if v == int(v) else v


def hexcolor(c):
    """Figma {r,g,b,a} 0..1 -> '#rrggbb' or '#rrggbbaa'."""
    if not c:
        return None
    to = lambda k: max(0, min(255, int(round(c.get(k, 0) * 255))))
    out = "#%02x%02x%02x" % (to("r"), to("g"), to("b"))
    a = c.get("a", 1)
    if a is not None and a < 0.999:
        out += "%02x" % max(0, min(255, int(round(a * 255))))
    return out


def paint(p):
    """One Figma paint -> compact dict (or None if it contributes nothing)."""
    if p.get("visible") is False:
        return None
    t = p.get("type")
    out = {"type": t}
    op = p.get("opacity")
    if op is not None and op < 0.999:
        out["opacity"] = r2(op)
    bm = p.get("blendMode")
    if bm and bm != "NORMAL":
        out["blendMode"] = bm

    if t == "SOLID":
        out = {"color": hexcolor(p.get("color"))}
        if op is not None and op < 0.999:
            out["opacity"] = r2(op)
        if bm and bm != "NORMAL":
            out["blendMode"] = bm
        return out

    if t and t.startswith("GRADIENT"):
        out["stops"] = [
            {"color": hexcolor(s.get("color")), "pos": r2(s.get("position"))}
            for s in p.get("gradientStops", [])
        ]
        out["handles"] = [
            [r2(h.get("x")), r2(h.get("y"))] for h in p.get("gradientHandlePositions", [])
        ]
        return out

    if t == "IMAGE":
        out["imageRef"] = p.get("imageRef")
        if p.get("scaleMode"):
            out["scaleMode"] = p["scaleMode"]
        return out

    return out


def paints(lst):
    if not lst:
        return None
    out = [q for q in (paint(p) for p in lst) if q]
    return out or None


def effects(lst):
    out = []
    for e in lst or []:
        if e.get("visible") is False:
            continue
        t = e.get("type")
        d = {"type": t, "radius": r2(e.get("radius"))}
        if "color" in e:
            d["color"] = hexcolor(e["color"])
        off = e.get("offset")
        if off and (off.get("x") or off.get("y")):
            d["offset"] = [r2(off.get("x")), r2(off.get("y"))]
        if e.get("spread"):
            d["spread"] = r2(e["spread"])
        # a fully transparent shadow is a no-op
        if d.get("color", "").endswith("00") and not d["radius"]:
            continue
        out.append(d)
    return out or None


def corner_radius(n):
    radii = n.get("rectangleCornerRadii")
    if radii and len(set(radii)) > 1:
        return [r2(x) for x in radii]
    cr = n.get("cornerRadius")
    if cr:
        return r2(cr)
    if radii and radii[0]:
        return r2(radii[0])
    return None


def stroke_spec(n):
    ps = paints(n.get("strokes"))
    if not ps:
        return None
    s = {"paints": ps, "weight": r2(n.get("strokeWeight")) or 1}
    if n.get("strokeAlign") and n["strokeAlign"] != "INSIDE":
        s["align"] = n["strokeAlign"]
    isw = n.get("individualStrokeWeights")
    if isw:
        s["weights"] = {k: r2(v) for k, v in isw.items() if v}
    return s


def layout_spec(n):
    """Auto-layout -- the part that actually tells you how to build the CSS."""
    mode = n.get("layoutMode")
    if not mode or mode == "NONE":
        return None
    out = {"mode": mode}
    for src, dst in (
        ("itemSpacing", "gap"),
        ("primaryAxisAlignItems", "justify"),
        ("counterAxisAlignItems", "align"),
        ("layoutWrap", "wrap"),
    ):
        v = n.get(src)
        if v and v != "NO_WRAP":
            out[dst] = r2(v) if isinstance(v, (int, float)) else v
    pad = {
        k[7:].lower(): r2(n[k])
        for k in ("paddingTop", "paddingRight", "paddingBottom", "paddingLeft")
        if n.get(k)
    }
    if pad:
        out["padding"] = pad
    return out


def text_style(st):
    """Figma text style block -> the props you need to write the CSS rule."""
    if not st:
        return {}
    out = {}
    for src, dst in (
        ("fontFamily", "fontFamily"),
        ("fontWeight", "fontWeight"),
        ("fontSize", "fontSize"),
        ("textAlignHorizontal", "textAlign"),
        ("textAlignVertical", "textAlignVertical"),
        ("textCase", "textCase"),
        ("textDecoration", "textDecoration"),
    ):
        v = st.get(src)
        if v is not None:
            out[dst] = r2(v) if isinstance(v, float) else v
    if st.get("lineHeightPx") is not None:
        out["lineHeight"] = r2(st["lineHeightPx"])
    if st.get("lineHeightUnit") and st["lineHeightUnit"] != "PIXELS":
        out["lineHeightUnit"] = st["lineHeightUnit"]
    ls = st.get("letterSpacing")
    if ls:
        out["letterSpacing"] = r2(ls)
    return out


def style_runs(node):
    """Mixed-style text (e.g. one bold word) -> [{start, end, style}, ...]."""
    table = node.get("styleOverrideTable") or {}
    if not table:
        return None
    ids = node.get("characterStyleOverrides") or []
    if not ids:
        return None
    runs, start, cur = [], 0, ids[0]
    for i, sid in enumerate(ids[1:], 1):
        if sid != cur:
            runs.append((start, i, cur))
            start, cur = i, sid
    runs.append((start, len(ids), cur))
    out = []
    for a, b, sid in runs:
        st = table.get(str(sid))
        if not st:
            continue
        s = text_style(st)
        if st.get("fills"):
            s["color"] = (paints(st["fills"]) or [{}])[0].get("color")
        if s:
            out.append({"start": a, "end": b, "style": s})
    return out or None


# --------------------------------------------------------------------------
# the walk
# --------------------------------------------------------------------------
def node_spec(n, ox, oy, components, depth, max_depth):
    """One node -> compact spec dict, or None if it should be dropped."""
    if n.get("visible") is False:
        return None

    box = n.get("absoluteBoundingBox") or {}
    out = {
        "id": n.get("id"),
        "type": n.get("type"),
        "name": n.get("name"),
        "x": r2((box.get("x") or 0) - ox),
        "y": r2((box.get("y") or 0) - oy),
        "w": r2(box.get("width")),
        "h": r2(box.get("height")),
    }

    op = n.get("opacity")
    if op is not None and op < 0.999:
        out["opacity"] = r2(op)
    if n.get("rotation"):
        out["rotation"] = r2(n["rotation"])

    cr = corner_radius(n)
    if cr is not None:
        out["cornerRadius"] = cr

    f = paints(n.get("fills"))
    if f:
        out["fills"] = f
    # frames carry their backdrop in `background` when `fills` is empty
    if not f and n.get("type") in CONTAINER_TYPES:
        bg = paints(n.get("background"))
        if bg:
            out["fills"] = bg

    s = stroke_spec(n)
    if s:
        out["stroke"] = s
    e = effects(n.get("effects"))
    if e:
        out["effects"] = e
    lay = layout_spec(n)
    if lay:
        out["layout"] = lay
    if n.get("clipsContent"):
        out["clipsContent"] = True

    if n.get("type") == "TEXT":
        out["characters"] = n.get("characters")
        out.update(text_style(n.get("style")))
        col = (paints(n.get("fills")) or [{}])[0].get("color")
        if col:
            out["color"] = col
        runs = style_runs(n)
        if runs:
            out["styleRuns"] = runs

    cid = n.get("componentId")
    if cid:
        comp = components.get(cid) or {}
        out["component"] = comp.get("name") or cid

    if max_depth is not None and depth >= max_depth:
        if n.get("children"):
            out["truncatedChildren"] = len(n["children"])
        return out

    kids = []
    for c in n.get("children") or []:
        cs = node_spec(c, ox, oy, components, depth + 1, max_depth)
        if cs:
            kids.append(cs)
    if kids:
        out["children"] = kids
    return out


def screen_spec(frame, components, max_depth=None):
    box = frame.get("absoluteBoundingBox") or {}
    ox, oy = box.get("x") or 0, box.get("y") or 0
    root = node_spec(frame, ox, oy, components, 0, max_depth) or {}
    children = root.pop("children", [])
    root.pop("x", None)
    root.pop("y", None)
    spec = {
        "id": frame.get("id"),
        "name": frame.get("name"),
        "width": r2(box.get("width")),
        "height": r2(box.get("height")),
        "background": root.get("fills"),
        "root": root,
        "children": children,
    }
    spec["nodeCount"] = count_nodes(children) + 1
    return spec


def count_nodes(kids):
    return sum(1 + count_nodes(k.get("children") or []) for k in kids)


# --------------------------------------------------------------------------
# loading / selection
# --------------------------------------------------------------------------
def load_page(path, page_id):
    with open(path, "r", encoding="utf-8") as fh:
        doc = json.load(fh)
    pages = doc.get("document", {}).get("children", [])
    for p in pages:
        if p.get("id") == page_id:
            return p, doc.get("components") or {}
    known = ", ".join("%s (%s)" % (p.get("id"), p.get("name")) for p in pages)
    raise SystemExit("page %s not found in %s. Pages: %s" % (page_id, path, known))


def is_screen(f, width, min_height):
    if f.get("type") != "FRAME":
        return False
    b = f.get("absoluteBoundingBox") or {}
    return round(b.get("width") or 0) == width and (b.get("height") or 0) >= min_height


def screens_of(page, width, min_height):
    return [f for f in page.get("children") or [] if is_screen(f, width, min_height)]


def slug(name):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (name or "unnamed").strip().lower())
    return s.strip("-") or "unnamed"


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------
def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Extract per-screen implementation specs from a cached Figma file."
    )
    ap.add_argument(
        "--app",
        choices=sorted(PAGES),
        default="influencer",
        help="which cached file/page to read (default: influencer)",
    )
    ap.add_argument("--file", help="override the cache JSON path")
    ap.add_argument("--page", help="override the CANVAS page id")
    ap.add_argument("--width", type=int, default=SCREEN_WIDTH, help="screen width filter")
    ap.add_argument(
        "--min-height", type=float, default=MIN_SCREEN_HEIGHT, help="min screen height"
    )
    ap.add_argument(
        "--max-depth", type=int, default=None, help="stop recursing below this depth"
    )
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--index", action="store_true", help="list every screen as JSON")
    g.add_argument("--screen", help="frame id (18:119) or frame name; emits one spec")
    g.add_argument("--all", metavar="OUTDIR", help="write one JSON per screen")
    ap.add_argument("-o", "--out", help="write --screen output here instead of stdout")
    args = ap.parse_args(argv)

    fname, pid = PAGES[args.app]
    path = args.file or os.path.join(CACHE, fname)
    page_id = args.page or pid

    page, components = load_page(path, page_id)
    frames = screens_of(page, args.width, args.min_height)

    if args.index:
        json.dump(
            [
                {
                    "id": f["id"],
                    "name": f.get("name"),
                    "w": r2(f["absoluteBoundingBox"]["width"]),
                    "h": r2(f["absoluteBoundingBox"]["height"]),
                }
                for f in frames
            ],
            sys.stdout,
            indent=1,
        )
        sys.stdout.write("\n")
        return 0

    if args.screen:
        want = args.screen
        hits = [f for f in frames if f["id"] == want]
        if not hits:
            hits = [f for f in frames if (f.get("name") or "").strip() == want.strip()]
        if not hits:
            low = want.strip().lower()
            hits = [f for f in frames if low in (f.get("name") or "").lower()]
        if not hits:
            raise SystemExit("no screen matching %r (try --index)" % want)
        if len(hits) > 1:
            sys.stderr.write(
                "note: %d screens match %r, emitting the first (%s). others: %s\n"
                % (len(hits), want, hits[0]["id"], ", ".join(h["id"] for h in hits[1:]))
            )
        spec = screen_spec(hits[0], components, args.max_depth)
        text = json.dumps(spec, indent=1)
        if args.out:
            with open(args.out, "w", encoding="utf-8") as fh:
                fh.write(text + "\n")
            sys.stderr.write("wrote %s\n" % args.out)
        else:
            sys.stdout.write(text + "\n")
        return 0

    # --all: build and flush one screen at a time so we never hold 281 in RAM
    outdir = args.all
    os.makedirs(outdir, exist_ok=True)
    manifest, seen = [], {}
    for f in frames:
        spec = screen_spec(f, components, args.max_depth)
        base = slug(spec["name"])
        seen[base] = seen.get(base, 0) + 1
        fn = "%s__%s.json" % (base, spec["id"].replace(":", "-"))
        with open(os.path.join(outdir, fn), "w", encoding="utf-8") as fh:
            json.dump(spec, fh, indent=1)
            fh.write("\n")
        manifest.append(
            {
                "id": spec["id"],
                "name": spec["name"],
                "w": spec["width"],
                "h": spec["height"],
                "nodes": spec["nodeCount"],
                "file": fn,
            }
        )
        del spec
    with open(os.path.join(outdir, "_manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=1)
        fh.write("\n")
    sys.stderr.write("wrote %d specs + _manifest.json to %s\n" % (len(manifest), outdir))
    return 0


if __name__ == "__main__":
    sys.exit(main())
