#!/usr/bin/env python3
"""
Group the extracted influencer screens into functional flows and write the
human-readable build plan at .figma-cache/influencer-screens.md.

Run figma_extract.py --all first; this reads the specs it wrote.

    python3 tools/figma_extract.py --all .figma-cache/specs/influencer
    python3 tools/figma_inventory.py

Screen names in the Figma file are largely useless ("Frame", "v2", "final3.1"),
so the OV table below carries hand-curated flow + description overrides keyed by
frame id. Anything not in OV falls back to a name-pattern rule plus a description
auto-derived from the screen's own text layers. Edit OV when a screen is
mislabelled; the rest regenerates itself.
"""
import json, os, re, collections

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(REPO, ".figma-cache", "specs", "influencer")
OUT = os.path.join(REPO, ".figma-cache", "influencer-screens.md")
M = json.load(open(os.path.join(D, "_manifest.json")))

# ---- explicit flow + label overrides for screens whose Figma name is useless
OV = {
 # onboarding / auth
 "18:119":   ("onboarding", "Splash / Get Started - 'Your Gateway to Influencer Success'"),
 "18:668":   ("onboarding", "Join path chooser - Agency Managed vs Solo-Influencer"),
 "8249:2326":("onboarding", "Join path chooser (latest) - Agency Managed vs Solo"),
 "765:10495":("onboarding", "Legacy step frame (blank shell)"),
 "765:10550":("onboarding", "Profile setup - Step 1 of 4, basic details (agency-managed)"),
 "765:10920":("onboarding", "Verify profile - Step 2 of 4, niches + landing-page link"),
 "765:11064":("onboarding", "Phone number - Step 3 of 4"),
 "765:11122":("onboarding", "OTP entry + success - Step 4 of 4"),
 "770:11170":("onboarding", "Blank shell (background only)"),
 "770:11193":("onboarding", "Blank shell (background only)"),
 "7483:43389":("onboarding","Value prop carousel - 'Everything creators need. One workspace.'"),
 "7485:43519":("onboarding","Agency code entry + Agency/Creator toggle"),
 "7485:43606":("onboarding","Profile setup - name, bio, niches, creator type"),
 "7487:43798":("onboarding","Link-in-bio verification - 'Your creator profile is almost ready'"),
 "7489:44001":("onboarding","Phone number entry (OTP send)"),
 "7498:44097":("onboarding","Socyio welcome / login entry - 'Your creator world, organized'"),

 # home dashboard explorations
 "7020:18088":("home","Dashboard concept v1 - overview + lead matrix"),
 "7020:17962":("home","Dashboard concept v8 - 'Hello, Sophia' summary tiles"),
 "7028:18314":("home","Dashboard concept v5 - pipeline + goal progress"),
 "7061:7724": ("home","Dashboard concept v2 - lowercase editorial style"),
 "7061:8060": ("home","Dashboard concept v6 - goal progress bar"),
 "7061:8245": ("home","Dashboard concept v21 - active-leads card stack"),
 "7061:11387":("home","Dashboard concept v2b - stat strip variant"),
 "7095:14174":("home","Dashboard concept v9 - 'Good morning' + pipeline"),
 "7096:14387":("home","Dashboard concept v0 - PRIORITY NOW banner"),
 "7131:18951":("home","Dashboard concept v0 (duplicate of 7096:14387)"),
 "7101:14648":("home","Dashboard concept v00 - revenue goal + active campaigns"),
 "7104:14854":("home","Dashboard concept 'Background' - Creator Pulse layout"),
 "7137:19197":("home","Dashboard final1 - overview + lead matrix"),
 "7137:19839":("home","Dashboard final2 - PRIORITY NOW"),
 "7137:20393":("home","Dashboard final2.1"),
 "7137:21050":("home","Dashboard final2.2"),
 "7138:21355":("home","Dashboard final4 - '12 leads are waiting'"),
 "7141:21897":("home","Dashboard final3"),
 "7141:22662":("home","Dashboard final3.1"),
 "7141:22973":("home","Dashboard final3.2"),
 "7156:2887": ("home","Dashboard v1 (revision)"),
 "7156:3391": ("home","Dashboard final4.1"),
 "7163:4232": ("home","Dashboard final5 - lead matrix first"),
 "7178:4540": ("home","Dashboard final1 (revision)"),
 "7178:4841": ("home","Dashboard final2 (@handle header)"),
 "7184:6298": ("home","Dashboard final1.1"),
 "7185:6930": ("home","Dashboard final2 (revision)"),
 "7187:2275": ("home","Dashboard Final Version - candidate A"),
 "7185:7413": ("home","Dashboard Final Version - candidate B"),
 "7190:11226":("home","Dashboard Final Version - candidate C"),
 "7321:2275": ("home","EMPTY - image-only export frame, skip"),
 "7321:2277": ("home","EMPTY - image-only export frame, skip"),
 "7321:2276": ("home","Home screen 1 - full page incl. bottom tab bar"),
 "7321:2280": ("home","Home scroll container (no tab bar)"),
 "7321:2901": ("home","*** BUILD THIS - Home prototype, 375x875 viewport"),
 "7421:35412":("home","Home prototype (state 2)"),
 "7421:35823":("home","Home prototype (state 3)"),
 "8249:2425": ("home","Home prototype (tall scroll)"),
 "7333:12139":("home","Home scroll container (375x1927)"),
 "7348:18113":("home","Home + set-revenue-target modal"),
 "5297:26104":("home","Home + set-target popup (legacy 946 design)"),
 "6073:11865":("home","Home (legacy) - tab bar Home/Leads/Planner/Reminder"),
 "1984:7038": ("home","Home (legacy) - today's overview"),
 "3680:3413": ("home","Home (legacy) with tab bar"),
 "4484:33394":("home","Home (legacy) - overview + lead matrix"),
 "7031:20376":("home","Home (legacy, tall scroll)"),
 "7069:12464":("home","Home (legacy) duplicate of 6073:11865"),
 "3680:3891": ("campaigns","Campaign brief chat - #Baseskincare"),
 "3680:7616": ("campaigns","Campaign brief chat - #General"),

 # leads
 "1524:4941":("leads","Leads contact list (from profile)"),
 "7078:13404":("leads","Leads list concept - status counters + budget cards"),
 "7192:11560":("leads","Leads list concept - compact cards"),
 "7415:34833":("leads","Leads list - 'Action needed' banner + unattended nudge"),
 "7112:17367":("leads","Lead detail concept - Sephora, pipeline progress bar"),
 "7112:17695":("leads","Lead detail - Lead Info tab"),
 "7112:17844":("leads","Lead detail - Notes & Activity tab"),
 "7193:11875":("leads","Lead detail - Lead Info tab (Zostel)"),
 "7197:12217":("leads","Lead detail - Notes & Activity tab (Zostel)"),
 "7383:34605":("leads","*** BUILD THIS - Leads list, 375x875"),
 "7421:36305":("leads","Leads list - Unattended filter"),
 "7432:36906":("leads","Leads list - New filter"),
 "7432:37553":("leads","Leads list - Contacted filter"),
 "7432:37887":("leads","Leads list - Won filter"),
 "7358:27046":("leads","Lead History"),
 "659:2761": ("leads","Leads list + notes drawer (legacy)"),
 "787:4123": ("leads","Leads list + Generate Content entry (legacy v2)"),
 "785:4271": ("leads","Leads list + Generate Content entry (legacy v2)"),

 # planner / calendar
 "7119:17954":("planner","Planner concept - Day/Week/Month switcher"),
 "7121:18200":("planner","Planner day timeline - 'Best time 6PM'"),
 "7126:18669":("planner","Planner day timeline (variant)"),
 "7092:13977":("planner","Planner day view + AI morning suggestion"),
 "7066:12106":("planner","Today + upcoming timeline (lowercase concept)"),
 "7287:3994": ("planner","Planner setup chooser - Automatic vs Manual"),
 "7287:4022": ("planner","Planner setup chooser (variant)"),
 "729:3530":  ("planner","Planner onboarding - setup chooser (legacy)"),
 "7348:20778":("planner","Month grid component frame (June 2025)"),
 "7358:22590":("planner","Collab-day picker - save state"),
 "7358:22922":("planner","Content delivery day picker"),
 "719:11542": ("planner","Collab-day calendar + menu (legacy)"),
 "729:3762":  ("planner","Collab Day calendar (legacy)"),
 "719:12067": ("planner","Calendar with Reel chips (legacy)"),

 # content studio
 "7348:20427":("content","Content editor - AI caption assist"),
 "7358:23402":("content","Content editor 2 - AI caption assist"),
 "7242:20026":("content","Edit content - platform, format, hook, caption"),
 "7333:12731":("content","All Ideas list (compact)"),
 "7358:23922":("content","Content itinerary - 'Let AI set date'"),
 "7358:25812":("content","Set content date"),
 "7358:23487":("content","Plan Generator - time range, focus, frequency"),
 "7358:23673":("content","Select date for generated content"),
 "7358:25339":("content","AI prompt bar + prompt history"),
 "720:12674": ("content","Generate content plan (legacy)"),

 # reminders
 "7067:12218":("reminders","Reminders - 'what's on your plate' concept"),

 # profile
 "7075:13106":("profile","Profile concept - PROFILE SPACE, levels"),
 "7079:13656":("profile","Profile concept - Level 4 Creator, XP"),
 "7287:4206": ("profile","Profile hub - level, managed-by, section links"),
 "7358:26807":("profile","Profile hub (scroll container)"),
 "7279:26861":("profile","Profile hub - creator profile"),
 "7160:4094": ("profile","Profile hub - creator profile (duplicate)"),
 "7358:26594":("profile","*** BUILD THIS - Profile hub w/ Logout, 375x875"),
 "7502:44174":("profile","Profile hub - self-managed variant"),
 "288:2250":  ("profile","Levels / Growth Path (legacy)"),
 "7358:26946":("profile","Levels / Growth Path"),
 "7311:2284": ("profile","Bank details - saved/verified state"),
 "7302:2841": ("profile","Commercials - platform rates summary"),
 "7295:4477": ("profile","Edit profile - variation layout"),
 "686:6856":  ("profile","Edit profile - section tabs (legacy)"),
 "689:6949":  ("profile","Landing page overview (legacy)"),
 "692:7089":  ("profile","Landing page - templates/themes (legacy)"),
 "705:7411":  ("profile","Edit profile - Basics (legacy)"),
 "705:7621":  ("profile","Edit profile - Address (legacy)"),
 "705:7868":  ("profile","Edit profile - Measurements (legacy)"),
 "705:8085":  ("profile","Edit profile - Commercials (legacy)"),
 "973:2751":  ("profile","Edit profile - Bank Details (legacy)"),
 "1975:5737": ("profile","Edit profile - Barter Commercials (legacy)"),
 "705:8563":  ("profile","Edit profile (tall, legacy)"),
 "705:9000":  ("profile","Edit profile (legacy)"),
 "705:9144":  ("profile","Edit profile (legacy)"),
 "705:9337":  ("profile","Edit profile (legacy)"),

 # invoicing
 "6097:12177":("payments","Invoice builder (legacy)"),

 # services
 "1887:3863":("services","Videographer picker + shoot type (legacy)"),
 "1887:3974":("services","Order details - editor booking (legacy)"),
 "1887:4246":("services","Order details - cancel state (legacy)"),
 "6214:14365":("services","Videographers list (legacy)"),
 "6214:15390":("services","Editors list (legacy)"),
 "5974:56458":("services","Videographers list (legacy dup)"),
 "5974:56572":("services","Editors list (legacy dup)"),
 "6005:1945": ("services","Videographer detail (legacy)"),
 "6426:15292":("campaigns","Creator request card - Arjun Singh, accepted"),
 "6426:15425":("campaigns","Campaign stats + active campaigns (legacy)"),
 "7333:12558":("services","Editors list"),
 "7348:19819":("services","Editors list (variant)"),
 "7348:20427x":("content","unused"),
 "7200:13305":("services","Videographers list - category chips"),
 "7207:14353":("services","Videographer detail - top rated"),
 "7214:15057":("services","Editor detail"),
 "8084:3597": ("campaigns","Campaign cards component frame"),
 "7333:17370":("campaigns","Campaign brief message (scroll container)"),

 # utility
 "6499:22308":("utility","Open planner on desktop - QR handoff"),
 "6503:22406":("utility","Web planner connected state"),
 "7383:31085":("utility","Log out confirmation"),
}

# ---- name-pattern rules, first match wins
RULES = [
 ("onboarding", r"^(onboarding|setup)$"),
 ("leads",      r"lead"),
 ("planner",    r"(calendar|planner|collab day|self selected|automatic selection|content delivery|save$|brand collb|shift content|add to calendar|caendar|^main$|^p$)"),
 ("content",    r"(ai content|generate content|content|notes|editor 2|plan generator|select date|itenary)"),
 ("reminders",  r"reminder"),
 ("services",   r"(videographer|editor|booking)"),
 ("campaigns",  r"(campaign|request|chat|message|container)"),
 ("payments",   r"(invoice|bank|your details|history)"),
 ("profile",    r"(profile|personal information|landing page|level|language|address|measurement|commercial|basics|agency setting|log out)"),
 ("home",       r"(homescreen|home|screen 1|final|frame|background|^v\d)"),
 ("utility",    r"(scan web|notification|menu)"),
]

FLOWS = [
 ("onboarding", "Onboarding & Account Setup",
  "Splash, join-path (agency-managed vs solo), agency code, phone/OTP, profile setup, link-in-bio verification."),
 ("home", "Home / Dashboard",
  "The creator's landing tab: greeting, priority-lead banner, today's summary tiles, lead matrix, revenue goal. "
  "Heavily explored - 40+ iterations. Build the 375x875 prototype, treat the rest as reference."),
 ("leads", "Leads (pipeline)",
  "Lead list with Unattended/New/Contacted/Won filters, lead detail (Lead Info + Notes & Activity tabs), "
  "follow-up scheduling, mark converted / mark closed, lead history."),
 ("planner", "Planner & Calendar",
  "Month/week/day calendar, collab-day preselection, content delivery dates, planner auto/manual setup, "
  "platform filters (All/Instagram/YouTube/Brand), shift-content actions."),
 ("content", "Content Studio (AI)",
  "AI idea generation, plan generator (time range / focus / frequency), content itinerary, "
  "caption editor with rewrite + hooks, set-content-date, all-ideas list."),
 ("reminders", "Reminders & Tasks",
  "Reminder list (Today / Schedule / All), create reminder with title, details, priority and date presets."),
 ("services", "Creator Services (Videographers & Editors)",
  "Browse videographers/editors by category and city, profile detail with expertise, past clients and ratings, "
  "booking confirmation with date/time slots and project type."),
 ("campaigns", "Campaigns & Collaboration",
  "Active campaigns (Live / Pending Delivery / Shortlisted), all requests (Accepted / Pending / History), "
  "campaign brief chat with key message, target audience and guidelines."),
 ("profile", "Profile & Settings",
  "Profile hub (followers, growth, managed-by, level), personal information sub-forms (Basics, Language, Address, "
  "Measurements, Commercials, Barter Commercials, Bank Details), landing-page editor + themes, levels, agency settings."),
 ("payments", "Invoicing & Payments",
  "Invoice hub (Create / History / Your Details), invoice builder, campaign selection, GST/business registration, "
  "recent invoices with Paid / Pending / Overdue."),
 ("utility", "Utility & System",
  "Notifications centre, desktop hand-off via QR, log-out confirmation."),
]

def flow_of(item):
    if item["id"] in OV:
        return OV[item["id"]][0]
    n = (item["name"] or "").strip().lower()
    for f, pat in RULES:
        if re.search(pat, n):
            return f
    return "utility"

# chrome / noise that appears on many screens and says nothing about the screen
NOISE = re.compile(
    r"^(ugc creation|brand collab|\d{1,4}|[+\-₹%.,:/ ]*|"
    r"(su|mo|tu|we|th|fr|sa|sun|mon|tue|wed|thu|fri|sat)|"
    r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*( \d{4})?|"
    r"\d{1,2}:\d{2}( ?[ap]m)?|am|pm|home|leads|planner|reminder|\d+ ?[a-z]{3})$", re.I)

# screens worth starting from, per flow
BUILD = {
 "7498:44097", "7321:2901", "7383:34605", "7333:12998", "7358:26594", "7358:27695",
 "7358:25977", "7358:23487", "7358:26244", "7348:19700", "7333:16160", "7358:29665",
}

def texts(n, out):
    if n.get("type") == "TEXT":
        c = re.sub(r"\s+", " ", (n.get("characters") or "")).strip()
        if c:
            out.append(c)
    for k in n.get("children") or []:
        texts(k, out)

def autolabel(item):
    spec = json.load(open(os.path.join(D, item["file"])))
    raw = []
    for c in spec["children"]:
        texts(c, raw)
    keep, seen = [], set()
    for t in raw:
        low = t.lower()
        if low in seen or NOISE.match(t) or len(t) < 3:
            continue
        seen.add(low)
        keep.append(t if len(t) <= 34 else t[:33].rstrip() + "…")
        if len(keep) == 5:
            break
    return " · ".join(keep)

def label_of(item):
    lab = OV[item["id"]][1] if item["id"] in OV else autolabel(item)
    if item["id"] in BUILD and "***" not in lab:
        lab = "*** BUILD THIS - " + lab
    return lab.replace("|", "\\|")

buckets = collections.OrderedDict((k, []) for k, _, _ in FLOWS)
for it in M:
    buckets[flow_of(it)].append(it)

out = []
w = out.append
w("# Yunto Influencer App - Screen Inventory & Build Plan\n")
w("Generated by `tools/figma_extract.py` from `.figma-cache/influencer.json` "
  "(Figma page `0:1`, *Influencer ui*).\n")
w("- **281 screens**, all 375 px wide. Per-screen specs: "
  "`.figma-cache/specs/influencer/<slug>__<id>.json` (index: `_manifest.json`).\n")
w("- Re-extract one screen at any time: `python3 tools/figma_extract.py --screen <id>`.\n")

w("\n## How to read this\n")
w("The file contains several design generations layered on top of each other. Frame **height is the "
  "reliable generation marker**:\n")
BANDS = [
 ("875", lambda h: h == 875,
  "**Latest.** The `7333:*` / `7348:*` / `7358:*` / `74xx:*` / `75xx:*` block. Final visual language, "
  "most complete flows. **Build from these.**"),
 ("812", lambda h: h == 812,
  "Oldest onboarding and services screens."),
 ("678-874", lambda h: 678 <= h < 875 and h != 812,
  "Short frames - component / section extracts (month grid, campaign cards, bank details panel), not "
  "full screens."),
 ("876-1030", lambda h: 876 <= h <= 1030 and h != 946,
  "Recent concepts (planner, reminders, campaigns, leads). Mostly already promoted into the 875 set."),
 ("946", lambda h: h == 946,
  "Legacy generation. Carries stray `UGC Creation` / `Brand Collab` text bleeding in from a neighbouring "
  "frame - ignore those two labels. Reference only."),
 ("1031+", lambda h: h > 1030,
  "Tall scroll containers and dashboard explorations - the whole page, unclipped by a viewport."),
]
w("| Height | Screens | Generation |")
w("|---|---|---|")
tot = 0
for lbl, test, note in BANDS:
    c = sum(1 for x in M if test(x["h"]))
    tot += c
    w("| %s | %d | %s |" % (lbl, c, note))
assert tot == len(M), (tot, len(M))
w("| **All** | **%d** | |" % tot)
w("")
w("Screens marked `***` are the recommended starting point for each flow.\n")

w("\n## Flow summary\n")
w("| # | Flow | Screens |")
w("|---|---|---|")
for i, (k, title, _) in enumerate(FLOWS, 1):
    w("| %d | [%s](#%d-%s) | %d |" % (i, title, i, re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-"), len(buckets[k])))
w("| | **Total** | **%d** |" % len(M))

for i, (k, title, desc) in enumerate(FLOWS, 1):
    items = buckets[k]
    w("\n---\n")
    w("## %d. %s\n" % (i, title))
    w("%s\n" % desc)
    w("*%d screens*\n" % len(items))
    w("| Frame id | Figma name | Size | Nodes | What it is |")
    w("|---|---|---|---|---|")
    items = sorted(items, key=lambda x: (x["h"] != 875, x["id"]))
    for it in items:
        w("| `%s` | %s | %d x %d | %d | %s |"
          % (it["id"], (it["name"] or "").strip() or "-", it["w"], it["h"], it["nodes"],
             label_of(it) or ""))

w("\n---\n")
w("## Suggested build order\n")
w("1. **Onboarding** - self-contained, unblocks auth against the existing `/api/auth` endpoints.\n")
w("2. **Home / Dashboard** (`7321:2901`) - establishes the design system: colours, League Spartan type scale, "
  "card radii, the mesh-gradient background and the Home/Leads/Planner/Reminder tab bar reused everywhere.\n")
w("3. **Leads** (`7383:34605` -> `7333:12998` detail) - the core value loop and the biggest existing backend surface.\n")
w("4. **Profile & Settings** (`7358:26594` + the eight `personal information` sub-forms) - straight CRUD forms.\n")
w("5. **Planner & Calendar**, then **Content Studio** - these share the month-grid and platform-chip components.\n")
w("6. **Reminders**, **Campaigns**, **Services**, **Invoicing** - independent, parallelisable.\n")

w("\n## Notes for implementation\n")
w("- Every spec's `children` coordinates are **relative to the screen frame origin**, so `x`/`y`/`w`/`h` map "
  "straight onto an absolutely-positioned 375-wide container.\n")
w("- `layout` on a node means Figma auto-layout: `mode` HORIZONTAL/VERTICAL -> flex-direction, plus `gap`, "
  "`padding`, `justify`, `align`. Prefer these over absolute positioning where present.\n")
w("- Type is **League Spartan** throughout; `fontWeight`, `fontSize`, `lineHeight` and `letterSpacing` are "
  "emitted per TEXT node, with `styleRuns` for mixed-style strings.\n")
w("- `IMAGE` fills carry only an `imageRef`. Those bitmaps are not in the cache - they need a separate "
  "`GET /v1/files/:key/images` call, or substitution with CSS gradients (most are the mesh-gradient backdrop).\n")
w("- Two frames (`7321:2275`, `7321:2277`) are flattened image exports with no live layers - skip them.\n")

open(OUT, "w").write("\n".join(out) + "\n")
print("wrote %s" % OUT, {k: len(v) for k, v in buckets.items()})
