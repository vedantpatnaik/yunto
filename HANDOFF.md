# Yunto — overnight handoff

Everything below was done while you slept. Read the **Decisions needed** section first — a
few things need your call before they can go further.

---

## The big unblock: Figma

Your paid seat restored API access. The influencer page had been permanently rate-limited
(HTTP 429) for weeks, which is why that app was never built.

**All 470MB of design data is now cached to disk** at `.figma-cache/` (gitignored):

| File | Size | Contents |
|---|---|---|
| `influencer.json` | 59MB | page `0:1` — 456 frames |
| `agency.json` | 43MB | page `0:4` |
| `admin.json` | 368MB | page `0:3` |

This matters because the cache is now **independent of the API quota**. Even if the limit
comes back, the designs are local and buildable.

`tools/figma_extract.py` turns any frame into an implementation spec (absolute coordinates,
fills, gradients, radii, and full text properties). All 281 influencer screens are already
extracted to `.figma-cache/specs/influencer/`.

### One finding that changes the plan

The Figma file has **three design generations stacked on top of each other**. Frame height
is the reliable marker:

| Height | Count | What it is |
|---|---|---|
| 875 | 85 | **Latest.** Final visual language. |
| 946 | 75 | Legacy. Superseded. |
| 1031+ | 76 | Tall unclipped scroll versions of screens above |
| 876–1030 | 27 | Recent concepts, mostly already promoted into the 875 set |
| 812 | 10 | Oldest onboarding |
| 678–874 | 8 | Component extracts — *not* screens |

You asked for all 281. Built literally, that produces **the same screen two or three times in
conflicting styles**, plus 8 screens that are really just UI fragments.

So I'm building **every distinct screen and state across all 11 flows**, using the newest
frame for each — full coverage, no duplicated work. Each flow is curated by an agent that
reads the actual specs and records what it superseded and why, so nothing is silently
dropped. Full inventory: `.figma-cache/influencer-screens.md`.

---

## React Native app (new)

You chose a React Native rewrite, so `mobile/` is a fresh **Expo + expo-router + TypeScript**
app. It **compiles clean and bundles** (2.5MB iOS bundle) — verified, not assumed.

```
mobile/
  app/_layout.tsx      fonts, react-query, auth gate
  app/login.tsx        working sign-in against the live API
  app/index.tsx        home shell on live data
  app/(app)/…          generated screens, one file per route
  src/theme.ts         Figma tokens, shared with web
  src/ui/Frame.tsx     Screen / Abs / Txt / Ring primitives
  src/api/client.ts    fetch + Keychain token storage
  src/api/hooks.ts     mirrors web/src/api/hooks.ts exactly
```

**Why `expo-router`:** routing is file-based, so each of hundreds of screens is its own file
with no shared router to edit. Agents can generate them fully in parallel with zero merge
conflicts.

**Why absolute positioning:** every Figma frame is a 375pt canvas of absolutely positioned
nodes. `<Screen>` scales that canvas to the device, so screens use **raw Figma coordinates**.
This is what makes pixel-exact generation mechanical instead of 281 hand-tuned flexbox
rewrites.

### iOS without Xcode

You have a paid Apple Developer account, and **EAS builds in the cloud** — so the missing
Xcode and Android SDK on this Mac stop being blockers. `mobile/eas.json` is configured.

```bash
cd mobile
npx eas login
npx eas build --profile preview --platform android   # installable APK
npx eas build --profile preview --platform ios       # TestFlight-ready
```

The first iOS build will ask to sign in to Apple and will generate signing credentials for
you. **I could not do this step** — it needs your Apple credentials and an interactive login.

---

## Backend hardening

The API was 510 lines of generic CRUD with no authorization. Now added:

- **RBAC** (`src/middleware/rbac.ts`) — role checks on write operations. The demo admin keeps
  full access; verified so the live demo cannot break.
- **Real validation** (`src/lib/schemas.ts`) — per-resource Zod schemas replacing
  `passthrough()`, checked against the payloads the 46 wired screens actually send.
- **S3 uploads** (`src/lib/s3.ts`, `src/routes/uploads.routes.ts`) — presigned PUT/GET plus an
  `Attachment` model. Degrades to a clean 501 when unconfigured, so the server still boots.
- **Notifications** (`src/routes/notifications.routes.ts`) — the bell icon now has a backend.
- **Schema additions** — `SubscriptionPlan`, `Attachment`, `Notification`,
  `Creator.discountPct`, `Agency.website`, `User.dateOfBirth/address`. All additive; nothing
  renamed or dropped.

These close the two gaps flagged earlier: the `-45% OFF` badge and the hardcoded
subscription tiers now have real columns behind them.

---

## AWS (account `082988010852`, ap-south-1)

`deploy/aws-env.sh` pins this repo to the Yunto account and **hard-refuses to run against the
TYCHR account** (`977237815409`) that is the machine default. Provisioned:

- **S3** `yunto-uploads-082988010852` — private, AES256-encrypted, versioned, CORS for direct
  presigned uploads.
- **IAM role** `yunto-app` attached to the EC2 instance — scoped to *only* that bucket. No AWS
  keys on the server.
- **RDS Postgres 16** `yunto-db` — db.t4g.micro, encrypted, **7-day automated backups**, not
  publicly accessible, reachable only from the app security group.

### Why RDS matters

Production Postgres is currently **a Docker volume on a single EC2 box with no backups**. If
that instance is terminated, every row is gone. RDS fixes that.

**I have not cut over** — that would mean migrating the live database while you were asleep
with no one to verify it. The infrastructure is ready; the switch is a one-line `DATABASE_URL`
change plus a `pg_dump | psql`. Say the word and it takes minutes.

---

## Current state (verified, not assumed)

| Surface | Screens | Status |
|---|---|---|
| Admin web | 71 routes | live on production — **71/71 render, 0 errors** |
| Influencer app (11 flows) | 78 | **140 native routes render, 0 problems** |
| Agency app (8 flows) | 65 | same gate |

`145 routes · 0 broken links · 0 URL collisions · tsc clean`

Three gates run over the native apps, all in `mobile/`:

- `npm run typecheck` — compiles
- `npm run check-links` — every `router.push` target resolves; flags two files
  claiming one URL (route groups are stripped from URLs, so the two apps can
  collide silently)
- `npm run render-check` — exports via react-native-web and loads every route in
  a phone viewport, failing on runtime errors, blank output, or a silent bounce
  to `/login`
- `node scripts/data-audit.mjs` — loads every screen twice, once with the API
  blocked, and flags any screen that is byte-identical both ways, because
  nothing on it can be live

## Earlier verification notes

- **71/71 admin routes** still render after the RBAC and validation changes — 0 JS
  errors, 0 failed API calls, 0 blank pages.
- **RBAC proven with a real employee account**, not just the SUPER_ADMIN that bypasses every
  check: `rohan@yunto.com` (SALES_EMPLOYEE) can apply for leave (201) and create leads (201),
  is correctly denied invoice writes (403), and still reads invoices (200).
- **Every generated native screen renders** — `npm run render-check` in `mobile/` exports the
  app via react-native-web and loads each route in a phone viewport, failing on runtime
  errors, blank output, or a silent bounce to `/login`.
- **Backups verified end to end**: the systemd service runs, dumps, uploads to S3, exits clean.

Three bugs were caught this way that type-checking could not have found:

1. The server **crashed at boot** — the uploads work added `@aws-sdk/client-s3` to
   `package.json` without installing it. `tsc` was clean.
2. RBAC gave `leaves` write access to managers only, but both apply-leave screens POST as the
   employee — every non-admin would have hit **403** applying for leave.
3. `crudRouter` hardcoded `orderBy: { createdAt: "desc" }`, and `Attendance` has no
   `createdAt`. Exposing it would have thrown on the first request.

## Decisions needed

1. **Cut over to RDS?** Recommended — the current setup has no backups. Needs ~5 minutes of
   downtime.
2. **EAS build** — needs your Apple login (interactive, I cannot do it).
3. **Scope confirmation** — confirm you're happy with "every distinct screen, newest
   generation" rather than literally building all 281 including duplicates.
4. **Domain + HTTPS** — the app is HTTP-only on a bare IP. Real users need TLS; I'd put
   CloudFront or an ALB in front and point a domain at it.

## Still open

- **Agency mobile app** — 79 screens exist as web; not yet ported to React Native.
- **Admin panel** — still a web app (this is correct; admin is a desktop tool).
- **Integrations** — stubbed per your answer. Instagram Graph API approval takes weeks;
  start that process early if you need it.
- **`socyio.com/yunto`** — still live on Hostinger, production `.htaccess` still modified
  (backup at `.htaccess.bak-preyunto`).
- **⚠️ Rotate the AWS key** you pasted in chat — it has `AdministratorAccess` and is now in a
  transcript on disk.
