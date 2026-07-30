# tools/

Offline tooling for turning the cached Figma design file into implementation specs.

Python 3, stdlib only. No dependencies, no network calls — everything reads the
JSON already sitting in `.figma-cache/`. **Nothing here ever hits the Figma API**,
so the quota stays intact.

| File | What it does |
|---|---|
| `figma_extract.py` | Cached Figma JSON → compact per-screen specs |
| `figma_inventory.py` | Extracted specs → `.figma-cache/influencer-screens.md` build plan |

---

## The cache

`.figma-cache/` holds raw `GET /v1/files/:key` responses. Shape:

```
{"document": {"children": [ {type: CANVAS, id, name, children: [...frames...]}, ... ]}}
```

One CANVAS per Figma page. The mobile screens are the page's top-level frames.

| App | File | Page id | Screens |
|---|---|---|---|
| `influencer` | `influencer.json` (59 MB) | `0:1` | 281 |
| `agency` | `agency.json` (43 MB) | `0:4` | — |
| `admin` | `admin.json` (368 MB) | `0:3` | — |

A "screen" is a top-level `FRAME` that is `--width` wide (default 375) and at
least `--min-height` tall (default 600). That filter reproduces the 281 entries
in `.figma-cache/influencer-index.json` exactly, in the same order. Loosen it
with `--width` / `--min-height` for desktop pages (e.g. admin at `--width 1440`).

---

## figma_extract.py

### List the screens

```bash
python3 tools/figma_extract.py --index
python3 tools/figma_extract.py --app agency --index
```

Prints `[{id, name, w, h}, ...]` — same format as `influencer-index.json`.

### One screen

By frame id, exact name, or substring (substring falls back only if nothing else
matches; duplicates emit the first and list the others on stderr):

```bash
python3 tools/figma_extract.py --screen 603:8809
python3 tools/figma_extract.py --screen "leads - details"
python3 tools/figma_extract.py --screen 7321:2901 -o home.json
```

### Every screen

```bash
python3 tools/figma_extract.py --all .figma-cache/specs/influencer
```

Writes `<slug>__<id>.json` per screen (`:` → `-` in the id) plus `_manifest.json`
listing `{id, name, w, h, nodes, file}`. Each spec is built and flushed one at a
time, so peak memory is the source JSON plus a single screen — not all 281.

Currently ~24 MB across 281 files, ~3.5 s to regenerate.

### Options

| Flag | Default | Notes |
|---|---|---|
| `--app {influencer,agency,admin}` | `influencer` | Picks cache file + page id |
| `--file PATH` | — | Override the cache path |
| `--page ID` | — | Override the CANVAS page id |
| `--width N` | `375` | Screen width filter |
| `--min-height N` | `600` | Screen height filter |
| `--max-depth N` | unlimited | Stop recursing; truncated nodes get `truncatedChildren` |
| `-o PATH` | stdout | Only with `--screen` |

`--max-depth 3` is handy for getting a quick structural overview of a dense
screen without reading 600 nodes.

---

## Spec format

```jsonc
{
  "id": "603:8809",
  "name": "leads",
  "width": 375, "height": 946,
  "background": [{"color": "#ffffff"}],
  "root": { /* the frame itself: fills, cornerRadius, clipsContent, layout */ },
  "nodeCount": 90,
  "children": [ /* recursive */ ]
}
```

Per node:

| Key | Meaning |
|---|---|
| `id`, `type`, `name` | Figma node identity (`FRAME`, `TEXT`, `VECTOR`, `RECTANGLE`, `ELLIPSE`, `GROUP`, `INSTANCE`, …) |
| `x`, `y`, `w`, `h` | **Relative to the screen frame's origin.** Drop straight into an absolutely-positioned 375-wide container. |
| `opacity`, `rotation` | Omitted when 1 / 0 |
| `cornerRadius` | Number, or `[tl, tr, br, bl]` when corners differ |
| `fills` | See below. Frames fall back to `background` when `fills` is empty. |
| `stroke` | `{paints, weight, align?, weights?}` |
| `effects` | Visible shadows and blurs: `{type, radius, color?, offset?, spread?}` |
| `layout` | Auto-layout: `{mode: HORIZONTAL\|VERTICAL, gap?, padding?, justify?, align?, wrap?}` |
| `clipsContent` | Present only when true → `overflow: hidden` |
| `component` | Component name, for `INSTANCE` nodes |
| `children` | Recursive; omitted when empty |

Fills are one of:

```jsonc
{"color": "#ff5533"}                                  // SOLID (+"aa" suffix when alpha < 1)
{"color": "#ff5533", "opacity": 0.6}                  // paint-level opacity
{"type": "GRADIENT_LINEAR", "stops": [{"color": "#fff0", "pos": 0}, ...],
 "handles": [[0.5, 0], [0.5, 1], [0, 0]]}             // also GRADIENT_RADIAL / ANGULAR / DIAMOND
{"type": "IMAGE", "imageRef": "62cc72…", "scaleMode": "FILL"}
```

`TEXT` nodes additionally carry `characters`, `fontFamily`, `fontWeight`,
`fontSize`, `lineHeight` (px), `letterSpacing`, `textAlign`, `textAlignVertical`,
`textCase`, `textDecoration` and `color`. Mixed-style strings (one bold word in a
sentence) get `styleRuns: [{start, end, style}]` with character offsets into
`characters`.

### What is dropped

- Nodes with `visible: false`, and their whole subtree.
- Vector path geometry — icons keep their box and fill, not their outlines.
- Prototype `interactions`, layout grids, export settings, bound variables.
- Fully transparent zero-radius shadows.

### Gotchas

- `IMAGE` fills reference bitmaps that are **not** in the cache. Fetching them
  needs `GET /v1/files/:key/images`. Most are the mesh-gradient backdrop and are
  better replaced with CSS gradients anyway.
- Sizes are rounded to 2 dp, so they can differ from `influencer-index.json` by
  a sub-pixel (e.g. `1304.88` vs `1305`).
- Frames `7321:2275` and `7321:2277` are flattened image exports with zero live
  layers. Skip them.

---

## figma_inventory.py

```bash
python3 tools/figma_extract.py --all .figma-cache/specs/influencer   # first
python3 tools/figma_inventory.py                                     # then
```

Writes `.figma-cache/influencer-screens.md`: the 281 screens grouped into 11
functional flows, with frame id, pixel size, node count and a description, plus a
design-generation guide (frame height identifies the generation — 875 is the
latest) and a suggested build order.

Screen names in Figma are mostly unusable (`Frame`, `v2`, `final3.1`, `p`), so
the script keys hand-written flow assignments and descriptions off frame id in
its `OV` table. Everything else falls back to a name-pattern rule plus a
description auto-derived from the screen's own text layers. When a screen lands
in the wrong flow, add a line to `OV` and re-run — nothing else needs touching.
