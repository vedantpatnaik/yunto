# Yunto MVP - Architecture & Design Spec

## Context

Yunto is an operating system for influencer marketing agencies. The Figma design contains ~792 screens across 3 portals (Admin Dashboard, Agency Employee, Influencer). This spec covers the **P0 MVP**: Auth, Dashboard, Leads, Campaigns, and Creators — Admin Dashboard portal only.

**Why now:** Starting from scratch with no existing code. Goal is to build a scalable SaaS platform that supports 30,000+ creators and 5,000+ agencies without requiring a stack rewrite.

**Deployment strategy:** Local Docker Compose on the developer's laptop first. Migrate to AWS (ECS, RDS, S3) when credits are available — zero code changes required, only env var swaps.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui | Fast build, full design control, lightweight |
| Backend | Node.js + Express + TypeScript | Decoupled from frontend, scales independently |
| ORM | Prisma | Type-safe queries, migration management |
| Database | PostgreSQL 15 | Robust relational DB for complex agency data |
| Cache/Realtime | Redis 7 | Socket.io adapter, rate limiting, session cache |
| Real-time | Socket.io | Bidirectional — needed for chat in P2 |
| Auth | JWT (RS256) + bcrypt + OTP | Dual method: email/password + phone OTP |
| Data Tables | TanStack Table v8 | Headless, server-side pagination |
| Charts | Recharts | React-native charting |
| State | TanStack Query (server) + Zustand (client) | Minimal boilerplate, clear separation |
| Forms | React Hook Form + Zod resolvers | Performant forms with shared validation |
| File Storage | Local filesystem (dev) / S3 (prod) | Abstracted behind a storage service |
| Monorepo | Turborepo + npm workspaces | Shared types/validation across packages |
| Testing | Vitest (unit) + Playwright (e2e) | Fast, modern test tooling |

---

## Project Structure

```
yunto/
├── package.json                  # Workspace root
├── turbo.json                    # Build orchestration
├── tsconfig.base.json            # Shared TS config
├── docker-compose.yml            # PostgreSQL + Redis + MinIO (local S3)
├── .env.example
├── packages/
│   ├── shared/                   # @yunto/shared
│   │   └── src/
│   │       ├── types/            # Auth, Lead, Campaign, Creator, Dashboard DTOs
│   │       ├── constants/        # Roles, permissions, lead stages
│   │       └── validation/       # Zod schemas (used by both frontend + backend)
│   │
│   ├── backend/                  # @yunto/backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── index.ts          # Express + Socket.io bootstrap
│   │       ├── config/           # env, database, redis, storage
│   │       ├── middleware/       # auth, rbac, tenant, validate, rate-limit, error-handler
│   │       ├── modules/
│   │       │   ├── auth/         # routes, controller, service, otp.service
│   │       │   ├── dashboard/    # routes, controller, service
│   │       │   ├── leads/        # routes, controller, service
│   │       │   ├── campaigns/    # routes, controller, service
│   │       │   ├── creators/     # routes, controller, service, share-link.service
│   │       │   └── upload/       # routes, service (abstracts local fs vs S3)
│   │       ├── socket/           # Socket.io server, auth, event handlers
│   │       └── utils/            # jwt, hash, pagination, logger
│   │
│   └── frontend/                 # @yunto/frontend
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── components.json       # shadcn/ui config
│       └── src/
│           ├── api/              # Axios client + per-module API functions
│           ├── hooks/            # TanStack Query hooks per module
│           ├── stores/           # Zustand: auth.store, ui.store
│           ├── components/
│           │   ├── ui/           # shadcn/ui primitives
│           │   ├── layout/       # AppShell, Sidebar, TopBar
│           │   ├── data-table/   # Generic DataTable wrapper
│           │   └── shared/       # StatusBadge, StatCard, EmptyState, etc.
│           ├── features/
│           │   ├── auth/         # LoginPage, OtpVerifyPage + components
│           │   ├── dashboard/    # DashboardPage + widget components
│           │   ├── leads/        # LeadsPage, LeadDetailPage, CreateLeadPage + components
│           │   ├── campaigns/    # CampaignsPage, CampaignDetailPage + components
│           │   └── creators/     # CreatorsPage, CreatorDetailPage + components
│           └── lib/              # utils (cn, formatCurrency), constants
```

---

## Database Schema

### Core Entities

**Agency** — the tenant. All data is scoped by `agencyId`.
- `id`, `name`, `code` (unique shareable code like "55678"), `logo`, `email`, `phone`, `address`

**User** — agency team members (Super Admin, Sales, Ops, Managers).
- `id`, `agencyId` (FK), `email`, `phone`, `passwordHash`, `name`, `avatar`, `role` (enum), `department`, `isActive`
- Unique constraint on `(agencyId, email)`
- Indexes: `agencyId`, `(agencyId, role)`, `(agencyId, department)`

**RefreshToken** — JWT refresh token storage for secure token rotation.
- `id`, `userId` (FK), `token` (unique), `expiresAt`

**OtpCode** — phone OTP verification codes.
- `id`, `phone`, `code`, `expiresAt`, `verified`

### Leads

**Lead** — brand deal opportunity in the pipeline.
- `id`, `agencyId` (FK), `brandName`, `contactName`, `contactEmail`, `contactPhone`
- `dealType` (PAID/BARTER), `status` (NEW/CONTACTED/CONNECTED/CONVERTED)
- `budget` (Decimal), `currency` (default INR), `timeline`, `startDate`, `endDate`
- `campaignDetails` (text), `notes` (text), `source`
- `assignedToId` (FK to User), `createdById` (FK to User)
- Indexes: `(agencyId, status)`, `(agencyId, dealType)`, `(agencyId, assignedToId)`, `(agencyId, createdAt)`, `brandName`

**LeadStatusHistory** — audit trail of status transitions.
- `id`, `leadId` (FK), `fromStatus`, `toStatus`, `changedById`, `note`, `createdAt`

**LeadCreator** — creators attached to a lead.
- `id`, `leadId` (FK), `creatorId` (FK)
- Unique constraint on `(leadId, creatorId)`

### Campaigns

**Campaign** — active brand collaboration.
- `id`, `agencyId`, `leadId` (FK, optional, unique — one campaign per converted lead)
- `brandName`, `dealType`, `budget`, `currency`, `status` (DRAFT/ACTIVE/COMPLETED/CANCELLED)
- `description`, `deliverables`, `startDate`, `endDate`, `completionPct` (0-100)
- Indexes: `(agencyId, status)`, `(agencyId, createdAt)`, `(agencyId, dealType)`

**CampaignMember** — agency team members assigned to campaign.
- `id`, `campaignId` (FK), `userId` (FK), `role` (lead/support)
- Unique constraint on `(campaignId, userId)`

**CampaignCreator** — creators working on a campaign.
- `id`, `campaignId` (FK), `creatorId` (FK)
- `status` (ASSIGNED/IN_PROGRESS/CONTENT_SUBMITTED/COMPLETED)
- `deliverables`, `rating` (1-5), `ratingNotes`, `fee` (Decimal)
- Unique constraint on `(campaignId, creatorId)`

### Creators

**Creator** — global entity (not per-agency). A creator may work with many agencies.
- `id`, `name`, `handle`, `email`, `phone`, `bio`, `avatar`, `city`
- `niche` (string array — e.g. ["Fashion", "Tech"]), `isBlacklisted`, `blacklistReason`
- `avgRating` (Decimal, denormalized), `totalCampaigns` (Int, denormalized)
- Indexes: `name`, `isBlacklisted`, `niche` (GIN index via raw SQL), `createdAt`

**CreatorPlatform** — per-platform stats for a creator.
- `id`, `creatorId` (FK), `platform` (INSTAGRAM/YOUTUBE/TWITTER/LINKEDIN/TIKTOK/OTHER)
- `handle`, `url`, `followers`, `engagementRate`, `avgViews`, `lastSynced`
- Unique constraint on `(creatorId, platform)`

**AgencyCreator** — junction: which agency "owns" or has worked with which creator.
- `id`, `agencyId` (FK), `creatorId` (FK), `isMyCreator` (boolean), `assignedToUserId`
- Unique constraint on `(agencyId, creatorId)`
- Index: `(agencyId, isMyCreator)`

### Supporting

**ShareLink** — shareable creator list for brands.
- `id`, `agencyId`, `leadId` (FK, optional), `slug` (unique), `creatorIds` (string array), `expiresAt`, `viewCount`

**Target** — revenue/performance targets per employee per month.
- `id`, `agencyId` (FK), `userId` (FK), `month`, `year`, `amount`, `achieved`, `department`
- Unique constraint on `(agencyId, userId, month, year)`

### Key Schema Decisions

1. **Creators are global, not per-agency.** The `AgencyCreator` junction table tracks which agencies work with which creators. A creator like "Bhuvan Bam" exists once, claimed by many agencies. Essential for the "All Creators" marketplace and 30K+ scale.

2. **Composite indexes on `agencyId`** on every tenant-scoped table. Every query filters by tenant first.

3. **Denormalized counters** (`totalCampaigns`, `avgRating` on Creator) avoid expensive aggregation at read time.

4. **LeadStatusHistory** for full audit trail of lead pipeline progression.

---

## API Design

### Auth
```
POST   /api/auth/login              # { email, password, agencyCode } -> tokens + user
POST   /api/auth/otp/send           # { phone } -> sends OTP via MSG91
POST   /api/auth/otp/verify         # { phone, code } -> tokens + user
POST   /api/auth/refresh            # { refreshToken } -> new token pair
POST   /api/auth/logout             # invalidate refresh token
GET    /api/auth/me                 # current user + agency
```

### Dashboard
```
GET    /api/dashboard/overview       # team glance, campaign progress, conversion, response time, avg ticket
GET    /api/dashboard/top-creators   # ?period=daily|weekly|monthly
GET    /api/dashboard/leads-overview # counts per status
GET    /api/dashboard/revenue        # this month, last month, total
GET    /api/dashboard/targets        # per-team + per-employee
POST   /api/dashboard/targets        # create target
PUT    /api/dashboard/targets/:id    # update target
```

### Leads
```
GET    /api/leads                    # ?status&dealType&assignedTo&page&limit&search&sortBy&sortOrder
GET    /api/leads/:id
POST   /api/leads                    # create (paid or barter)
PATCH  /api/leads/:id                # update fields
PATCH  /api/leads/:id/status         # { status, note } with history tracking
DELETE /api/leads/:id
GET    /api/leads/:id/creators       # attached creators
POST   /api/leads/:id/creators       # { creatorIds }
DELETE /api/leads/:id/creators/:creatorId
POST   /api/leads/:id/share-link     # generate shareable link
GET    /api/leads/export             # ?format=csv -> file download
```

### Campaigns
```
GET    /api/campaigns                # ?status&dealType&page&limit&search
GET    /api/campaigns/:id
POST   /api/campaigns                # create (often from converted lead)
PATCH  /api/campaigns/:id
GET    /api/campaigns/:id/creators
POST   /api/campaigns/:id/creators   # { creatorIds }
PATCH  /api/campaigns/:id/creators/:creatorId  # update status, add rating
DELETE /api/campaigns/:id/creators/:creatorId
PATCH  /api/campaigns/:id/complete   # mark complete, trigger rating flow
```

### Creators
```
GET    /api/creators                 # ?myCreators&platform&niche&minFollowers&page&limit&search
GET    /api/creators/:id
POST   /api/creators                 # add to database
PATCH  /api/creators/:id
PATCH  /api/creators/:id/blacklist   # { isBlacklisted, reason }
GET    /api/creators/recommended     # query-based: top-rated creators matching current campaign niches (AI discovery deferred to P3)
POST   /api/creators/share-link      # { creatorIds } -> shareable link
```

### Public (unauthenticated)
```
GET    /api/public/share/:slug       # view shared creator list
```

### Upload
```
POST   /api/upload                   # multipart upload (local dev) or presigned URL (S3 prod)
```

### Standard Response Envelope
```json
{
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 342, "totalPages": 18 }
}
```

All list endpoints support: `page`, `limit` (max 100), `search`, `sortBy`, `sortOrder`, plus module-specific filters.

---

## Auth Flow

### JWT Strategy
- **Access Token:** 15-min expiry, RS256 signed. Payload: `{ userId, agencyId, role }`. Stored in memory (Zustand) — never localStorage.
- **Refresh Token:** 7-day expiry, opaque string in `RefreshToken` table. Stored in httpOnly cookie (preferred) or localStorage as fallback.
- Axios interceptor: on 401, call `/api/auth/refresh`, retry original request.

### Email/Password Flow
1. User enters email + password + agency code
2. Server looks up User by `(agencyId, email)`, verifies bcrypt hash
3. Returns `{ accessToken, refreshToken, user }`

### Phone OTP Flow
1. `POST /api/auth/otp/send` with `{ phone }`
2. Server generates 6-digit code, saves to `OtpCode` (5-min expiry), sends via MSG91
3. `POST /api/auth/otp/verify` with `{ phone, code }`
4. Server verifies, finds User by phone, returns tokens

### RBAC

```
SUPER_ADMIN  -> all permissions (wildcard)
SALES_MANAGER -> leads:read, leads:write, campaigns:read, creators:read, dashboard:read, dashboard:targets
SALES_EMPLOYEE -> leads:read, leads:write, campaigns:read, creators:read, dashboard:read
OPS_MANAGER -> campaigns:read, campaigns:write, creators:read, creators:write, dashboard:read, dashboard:targets
OPS_EMPLOYEE -> campaigns:read, campaigns:write, creators:read, dashboard:read
```

Middleware: `rbac('leads:write')` checks the user's role against the permission map.

### Tenant Isolation
- Auth middleware extracts `agencyId` from JWT, attaches to `req.agencyId`
- Every Prisma query in service layer includes `where: { agencyId }`
- Prisma middleware as safety net: warns/errors if `agencyId` missing on tenant-scoped queries

---

## Real-time (Socket.io)

### Server Setup
- Socket.io attached to the Express HTTP server
- Auth middleware: verify JWT from `socket.handshake.auth.token`
- On connect: join `agency:{agencyId}` room + `user:{userId}` room

### Events (MVP)
| Event | Direction | Room | Trigger |
|-------|-----------|------|---------|
| `lead:created` | server->client | `agency:{id}` | New lead created |
| `lead:statusChanged` | server->client | `agency:{id}` | Lead moves through pipeline |
| `campaign:updated` | server->client | `agency:{id}` | Campaign status/progress change |
| `notification` | server->client | `user:{id}` | Direct notification to a user |

### Frontend Integration
- `useSocket` hook connects on auth, listens for events, invalidates relevant TanStack Query caches
- No manual refetching — Socket events trigger cache invalidation, TanStack Query handles the refetch

### Scaling
- Redis adapter (`@socket.io/redis-adapter`) for multi-instance support
- Works locally with single Redis container, scales to ElastiCache on AWS

---

## File Storage (Abstracted)

### Storage Service Interface
```typescript
interface StorageService {
  upload(file: Buffer, path: string): Promise<string>  // returns public URL
  getUrl(path: string): string
  delete(path: string): Promise<void>
}
```

### Local Development
- `LocalStorageService`: saves files to `./uploads/` directory
- Express serves `/uploads/*` as static files
- Docker volume for persistence

### Production (AWS)
- `S3StorageService`: presigned URL upload, S3 + CloudFront URLs
- Swap via env var: `STORAGE_PROVIDER=local|s3`

### File Organization
```
uploads/ (or S3 bucket)
├── agencies/{agencyId}/logo.{ext}
├── users/{userId}/avatar.{ext}
├── creators/{creatorId}/avatar.{ext}
└── exports/{agencyId}/{timestamp}-leads.csv
```

---

## Frontend Architecture

### Routing (React Router v6)
```
/login                    -> LoginPage
/otp-verify               -> OtpVerifyPage
/share/:slug              -> PublicSharePage (unauthenticated)
/                         -> redirect to /dashboard
/dashboard                -> DashboardPage
/leads                    -> LeadsPage (pipeline view)
/leads/new                -> CreateLeadPage
/leads/:id                -> LeadDetailPage
/campaigns                -> CampaignsPage
/campaigns/:id            -> CampaignDetailPage
/creators                 -> CreatorsPage
/creators/:id             -> CreatorDetailPage
```

All routes except login/otp/share are wrapped in `AuthGuard` + `AppShell`.

### Layout: AppShell
- **Sidebar** (256px expanded / 64px collapsed): nav links, agency logo, user menu
- **TopBar**: global search, notification bell (Socket.io count), user avatar dropdown
- **Content area**: `<Outlet />` renders the active page
- **Responsive**: sidebar becomes drawer on mobile (<768px)

### State Management
1. **Server state:** TanStack Query — all API data. Custom hooks: `useLeads()`, `useLead(id)`, `useCampaigns()`, etc.
2. **Auth state:** Zustand `auth.store` — `user`, `accessToken`, `refreshToken`, `agency`. Persisted to localStorage.
3. **UI state:** Zustand `ui.store` — sidebar collapsed, active modals, toast queue. Not persisted.

### API Client
- Axios instance with base URL pointing to Express backend
- Request interceptor: attach `Authorization: Bearer {accessToken}`
- Response interceptor: on 401, call refresh endpoint, retry failed request
- On refresh failure: clear auth store, redirect to `/login`

### Reusable DataTable
- Wraps TanStack Table with server-side pagination, sorting, filtering
- Built-in toolbar: search, filter dropdowns, column visibility, export button
- Used across Leads, Campaigns, Creators lists

---

## Local Deployment (Docker Compose)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: yunto
      POSTGRES_USER: yunto
      POSTGRES_PASSWORD: yunto_dev
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:  # S3-compatible local storage (optional, can use local fs instead)
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes: [minio_data:/data]

volumes:
  postgres_data:
  minio_data:
```

**Dev workflow:**
1. `docker compose up -d` — starts PostgreSQL + Redis + MinIO
2. `cd packages/backend && npx prisma migrate dev` — runs migrations
3. `npm run dev` (turbo) — starts both Vite dev server (port 5173) and Express (port 3001)
4. Vite proxies `/api` and `/socket.io` to Express backend

**Migration to AWS:** Change env vars:
- `DATABASE_URL` -> RDS connection string
- `REDIS_URL` -> ElastiCache endpoint
- `STORAGE_PROVIDER=s3` + S3 bucket config
- Deploy frontend to S3+CloudFront, backend to ECS
- Zero code changes.

---

## AWS Architecture (Future)

```
Route 53 -> CloudFront -> S3 (frontend static)
                       -> ALB -> ECS Fargate (backend + socket.io)
                                    -> RDS PostgreSQL (Multi-AZ)
                                    -> ElastiCache Redis
                                    -> S3 (assets bucket)
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Monorepo scaffold (turbo, workspaces, tsconfig, docker-compose)
- Prisma schema + initial migration + seed data
- Express server with middleware chain (auth, rbac, tenant, validate, error-handler)
- Vite + React + Tailwind + shadcn/ui scaffold
- Auth module: login, OTP, JWT, refresh, RBAC
- AppShell layout: sidebar, topbar, routing

### Phase 2: Leads (Week 2)
- Leads CRUD API with pagination, filtering, search
- Lead pipeline UI (kanban columns with drag-and-drop)
- Create lead form (paid + barter flows)
- Lead detail page
- Lead status transitions with audit history
- Attach creators to leads

### Phase 3: Campaigns (Week 3)
- Campaign CRUD API
- Campaign list page with filters
- Campaign detail page
- Assign creators to campaigns
- Creator status tracking within campaign
- Campaign completion + creator rating (3-step flow)

### Phase 4: Creators (Week 3-4)
- Creator CRUD API with complex filters
- Creator list (My Creators / All Creators tabs)
- Creator detail page (profile, platforms, campaign history)
- Creator filters (platform, niche, followers, engagement)
- Shareable creator links (public page for brands)
- Blacklist toggle

### Phase 5: Dashboard + Real-time + Polish (Week 4)
- Dashboard aggregation queries (all 9 widgets)
- Set targets feature
- Socket.io setup for real-time updates
- File upload integration (local fs)
- CSV export for leads
- Responsive layouts
- Error states, loading states, empty states

---

## Key Libraries

| Concern | Package |
|---------|---------|
| Monorepo | turborepo + npm workspaces |
| Backend | express, cors, helmet, compression |
| ORM | @prisma/client, prisma |
| Validation | zod (shared frontend + backend) |
| Auth | jsonwebtoken, bcryptjs |
| SMS/OTP | msg91-api (or HTTP to MSG91) |
| Rate limiting | express-rate-limit + rate-limit-redis |
| Logging | pino + pino-http |
| Real-time | socket.io, @socket.io/redis-adapter |
| Cache | ioredis |
| Frontend | react 18, react-dom, react-router-dom v6 |
| Build | vite |
| CSS | tailwindcss, tailwind-merge, clsx |
| Components | shadcn/ui (Radix primitives) |
| Data tables | @tanstack/react-table v8 |
| Charts | recharts |
| Server state | @tanstack/react-query v5 |
| Client state | zustand |
| HTTP | axios |
| Forms | react-hook-form + @hookform/resolvers (zod) |
| Date | date-fns |
| Icons | lucide-react |
| DnD (Kanban) | @dnd-kit/core, @dnd-kit/sortable |
| CSV export | csv-stringify (backend) |
| Testing | vitest (unit), playwright (e2e) |

---

## Verification

### After Foundation (Phase 1)
- `docker compose up -d` starts all services
- `npm run dev` starts frontend + backend
- Navigate to `http://localhost:5173/login`
- Login with seeded Super Admin account
- Verify AppShell renders (sidebar, topbar, empty dashboard)
- Verify JWT refresh flow works (wait 15 min or manually expire token)

### After Each Module
- CRUD operations work via UI
- Pagination, search, filters return correct results
- Role-based access: sales employee cannot access admin-only endpoints (returns 403)
- Socket.io: open two browser tabs, create a lead in one, see it appear in the other
- Data integrity: tenant isolation — Agency A cannot see Agency B's data

### Full MVP
- End-to-end flow: Login -> Create Lead (Paid) -> Move through pipeline -> Convert to Campaign -> Assign Creators -> Complete Campaign -> Rate Creators -> See Dashboard update
- Export leads as CSV
- Share creator list via public link
- All 9 dashboard widgets show correct data
- Mobile responsive at 390px width
