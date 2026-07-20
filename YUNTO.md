# Yunto — Product & Architecture Document

> Multi-portal SaaS operating system for influencer marketing agencies.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users & Portals](#2-target-users--portals)
3. [Feature Scope](#3-feature-scope)
4. [Delivery Phases](#4-delivery-phases)
5. [Monorepo Structure](#5-monorepo-structure)
6. [Tech Stack](#6-tech-stack)
7. [Database Schema](#7-database-schema)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [API Design](#9-api-design)
10. [Frontend Architecture](#10-frontend-architecture)
11. [State Management](#11-state-management)
12. [Shared Package](#12-shared-package)
13. [Infrastructure & Local Dev](#13-infrastructure--local-dev)

---

## 1. Product Overview

Yunto is a **multi-tenant SaaS platform** that gives influencer marketing agencies a single operating system for their entire business — from chasing brand deals to paying creators and analyzing campaign performance.

**Core value proposition:**
- Replace the spreadsheet-and-WhatsApp workflow most agencies run on today
- Give every role (owner, sales, ops, creator) a purpose-built interface
- Scale to 5,000+ agencies and 30,000+ creators on a single shared PostgreSQL database, with row-level tenant isolation via `agencyId`

---

## 2. Target Users & Portals

| Portal | Primary Users | Scale Target |
|--------|--------------|--------------|
| **Admin Dashboard** | Agency owner, Super Admin | ~447 screens |
| **Employee Portal** | Sales & Ops team members | ~198 screens |
| **Influencer Portal** | Creators & influencers | ~147 screens |

### Role Hierarchy

```
SUPER_ADMIN
├── SALES_MANAGER
│   └── SALES_EMPLOYEE
└── OPS_MANAGER
    └── OPS_EMPLOYEE
```

---

## 3. Feature Scope

### Admin Dashboard Modules

| Module | Description |
|--------|-------------|
| **Auth & Onboarding** | Email/password + Phone OTP login, agency code scoping |
| **Dashboard** | Revenue metrics, targets, pipeline summary, team overview |
| **Leads** | Brand deal pipeline (NEW → CONTACTED → CONNECTED → CONVERTED) |
| **Campaigns** | Active campaign tracking, creator assignment, deliverable status |
| **Creator Database** | Global creator profiles, platform stats, blacklist management |
| **Messaging** | Real-time Socket.io chat rooms between team and creators |
| **Payments & Invoices** | Financial ops — creator fees, brand invoicing |
| **Team & People** | Attendance, leaves, targets, department management |
| **Content Calendar** | Deadline tracking, content submission workflow |
| **AI Content** | AI-assisted caption and brief generation |
| **Settings** | Agency profile, integrations, billing |

### Employee Portal
Role-scoped subset of the Admin Dashboard — Sales employees see only leads, Ops employees see only campaigns.

### Influencer Portal
Dedicated web/mobile experience for creators — see assigned campaigns, submit content, receive payments.

---

## 4. Delivery Phases

| Phase | Dates | Scope |
|-------|-------|-------|
| **Phase 1** | Apr 8 – May 17 | Auth, Dashboard, Leads, Campaigns, Creator DB (Admin MVP) |
| **Phase 2** | May 18 – Jun 7 | Full Admin Dashboard (all modules) |
| **Phase 3** | Jun 8 – Jun 21 | Employee Portal |
| **Phase 4** | Jun 22 – Jul 5 | Influencer Portal |
| **Phase 5** | Jul 6 – Jul 15 | Infrastructure hardening, v1.0 release |

---

## 5. Monorepo Structure

```
yunto/
├── package.json              # npm workspaces root
├── turbo.json                # Turborepo pipeline config
├── tsconfig.base.json        # Shared TypeScript base
├── docker-compose.yml        # PostgreSQL 15 + Redis 7
├── .env.example
│
├── packages/
│   ├── shared/               # @yunto/shared
│   │   └── src/
│   │       ├── types/        # Shared TypeScript interfaces & DTOs
│   │       ├── constants/    # Role enum & permission matrix
│   │       └── validation/   # Zod schemas (auth, etc.)
│   │
│   ├── backend/              # @yunto/backend — Express API
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── index.ts      # Express + Socket.io bootstrap
│   │       ├── middleware/   # auth, rbac, tenant, validate, error
│   │       ├── modules/
│   │       │   └── auth/     # routes, controller, service
│   │       └── utils/        # jwt, hash, logger, pagination
│   │
│   └── frontend/             # @yunto/frontend — React SPA
│       └── src/
│           ├── App.tsx        # Router + providers
│           ├── api/           # Axios client with auto-refresh
│           ├── features/
│           │   └── auth/      # Login, OTP pages & forms
│           ├── components/    # AppShell, Sidebar, TopBar
│           └── stores/        # Zustand: auth.store, ui.store
```

---

## 6. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 18, Vite, TypeScript 5.7 | Client-side SPA |
| **Styling** | Tailwind CSS 3, shadcn/ui (Radix UI) | Component library |
| **Routing** | React Router v6 | Nested routes + guards |
| **Forms** | React Hook Form + Zod resolvers | Controlled with shared schemas |
| **Client state** | Zustand | Minimal store for auth & UI |
| **Server state** | TanStack Query v5 | Cache, background sync |
| **HTTP client** | Axios | Interceptors for token refresh |
| **Backend** | Express.js, TypeScript 5.7 | RESTful API |
| **Real-time** | Socket.io + ioredis adapter | Chat, live notifications |
| **ORM** | Prisma 6.4 | Type-safe PostgreSQL access |
| **Database** | PostgreSQL 15 | Multi-tenant, `agencyId` isolation |
| **Cache** | Redis 7 | Session cache, Socket.io adapter |
| **Auth** | JWT RS256, bcryptjs, OTP | Asymmetric key pair |
| **Validation** | Zod | Shared between frontend & backend |
| **Logging** | Pino | Structured JSON logs |
| **Testing** | Vitest | Unit & integration |
| **Monorepo** | Turborepo 2.4, npm workspaces | Shared deps & build pipeline |
| **Storage** | Local (dev) / S3 (prod) | Abstracted behind storage service |

---

## 7. Database Schema

Multi-tenant design — every entity (except `Creator`) carries `agencyId` for row-level isolation.

### Entity Relationship Overview

```
Agency
 └── User (employees)
      └── RefreshToken
      └── OtpCode
      └── Target (monthly revenue targets)

Lead (brand deal opportunity)
 ├── LeadStatusHistory (audit trail)
 └── LeadCreator (attached creators)
      └── Creator
           └── CreatorPlatform (IG, YT, etc.)

Campaign (converted from Lead 1:1)
 ├── CampaignMember (team members)
 └── CampaignCreator (creators + deliverables)

AgencyCreator (agency ↔ creator relationship)
ShareLink (shareable creator lists for brands)
```

### Key Models

#### Agency
```
id, name, code (unique, e.g. "DEMO01"), logo, email, phone, address
```

#### User
```
id, agencyId, email, phone, passwordHash, name, avatar
role: SUPER_ADMIN | SALES_MANAGER | SALES_EMPLOYEE | OPS_MANAGER | OPS_EMPLOYEE
department, isActive, lastLoginAt
UNIQUE (agencyId, email)
```

#### Lead
```
id, agencyId, brandName, contactName, contactEmail, contactPhone
status: NEW | CONTACTED | CONNECTED | CONVERTED
dealType: PAID | BARTER
budget (Decimal), currency (default INR)
timeline, startDate, endDate, campaignDetails, notes, source
assignedToId (FK → User), createdById (FK → User), convertedAt
```

#### Campaign
```
id, agencyId, leadId (unique FK), brandName, dealType, budget, currency
status: DRAFT | ACTIVE | COMPLETED | CANCELLED
description, deliverables, startDate, endDate, completionPct (0–100)
```

#### CampaignCreator
```
id, campaignId, creatorId
status: ASSIGNED | IN_PROGRESS | CONTENT_SUBMITTED | COMPLETED
deliverables, rating (1–5), ratingNotes, fee (Decimal), completedAt
```

#### Creator (global, not per-agency)
```
id, name, handle, email, phone, bio, avatar, city
niche (string[]), isBlacklisted, blacklistReason, blacklistedAt
avgRating (Decimal), totalCampaigns
```

#### CreatorPlatform
```
id, creatorId
platform: INSTAGRAM | YOUTUBE | TWITTER | LINKEDIN | TIKTOK | OTHER
handle, url, followers, engagementRate, avgViews, lastSynced
```

#### AgencyCreator
```
id, agencyId, creatorId, isMyCreator (agency-owned vs marketplace)
UNIQUE (agencyId, creatorId)
```

#### ShareLink
```
id, agencyId, leadId, slug (unique), creatorIds (array)
expiresAt, viewCount
```

#### Target
```
id, agencyId, userId, month, year, amount, achieved, department
UNIQUE (agencyId, userId, month, year)
```

---

## 8. Authentication & Authorization

### JWT Configuration

| Token | Algorithm | Expiry | Payload |
|-------|-----------|--------|---------|
| Access | RS256 | 15 min | `{ userId, agencyId, role }` |
| Refresh | RS256 | 7 days | `{ userId, agencyId, role }` |

Refresh tokens are stored in the `RefreshToken` table. On 401, the Axios interceptor automatically calls `/api/auth/refresh` and retries the original request. On persistent failure, auth state is cleared and the user is redirected to login.

### RBAC Permission Matrix

| Permission | SUPER_ADMIN | SALES_MANAGER | SALES_EMPLOYEE | OPS_MANAGER | OPS_EMPLOYEE |
|-----------|:-----------:|:-------------:|:--------------:|:-----------:|:------------:|
| `leads:read` | ✓ | ✓ | ✓ | | |
| `leads:write` | ✓ | ✓ | ✓ | | |
| `leads:delete` | ✓ | ✓ | | | |
| `campaigns:read` | ✓ | | | ✓ | ✓ |
| `campaigns:write` | ✓ | | | ✓ | ✓ |
| `creators:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `creators:write` | ✓ | | | ✓ | |
| `creators:blacklist` | ✓ | | | ✓ | |
| `dashboard:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `dashboard:targets` | ✓ | ✓ | | ✓ | |
| `team:read` | ✓ | ✓ | | ✓ | |
| `team:write` | ✓ | | | | |
| `settings:read` | ✓ | | | | |
| `settings:write` | ✓ | | | | |

### Login Methods
1. **Email + Password + Agency Code** — Primary for all employees
2. **Phone OTP** — Secondary / 2FA via MSG91

---

## 9. API Design

### Base URL
```
http://localhost:3001/api
```

### Middleware Stack (ordered)
```
Helmet → CORS → Compression → Pino HTTP
→ Auth (verify JWT) → Tenant (inject agencyId)
→ RBAC (check permission) → Validate (Zod schema)
→ Route Handler → Error Handler
```

### Auth Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Email + password + agency code |
| POST | `/auth/otp/send` | No | Trigger OTP to phone |
| POST | `/auth/otp/verify` | No | Verify OTP, return tokens |
| POST | `/auth/refresh` | No | Exchange refresh token |
| POST | `/auth/logout` | Yes | Revoke refresh token |
| GET | `/auth/me` | Yes | Authenticated user profile |

### Standard Response Envelope

**Success (auth):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "admin@demoagency.com",
    "name": "Demo Admin",
    "role": "SUPER_ADMIN",
    "agency": {
      "id": "uuid",
      "name": "Demo Agency",
      "code": "DEMO01"
    }
  }
}
```

**Error:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

---

## 10. Frontend Architecture

### Route Tree

```
/login                      Public — LoginForm (email/password) or OtpForm (phone)
/otp-verify                 Public — OTP code entry

/ (AuthGuard)
└── / (AppShell)
    ├── /dashboard           Home metrics
    ├── /leads               Lead pipeline table
    ├── /campaigns           Campaign tracker
    └── /creators            Creator database
```

`AuthGuard` checks Zustand `isAuthenticated`. Unauthenticated users are redirected to `/login`. After login, users are redirected to `/dashboard`.

### Component Hierarchy

```
App
├── Router
│   ├── LoginPage
│   │   ├── LoginForm (email + password + agency code)
│   │   └── OtpForm (phone number)
│   └── AuthGuard
│       └── AppShell
│           ├── Sidebar (navigation links)
│           ├── TopBar (user avatar, agency name, logout)
│           └── <Outlet /> (page content)
```

### Key Files

| File | Purpose |
|------|---------|
| [App.tsx](packages/frontend/src/App.tsx) | Router, QueryClient, providers |
| [api/client.ts](packages/frontend/src/api/client.ts) | Axios instance + interceptors |
| [stores/auth.store.ts](packages/frontend/src/stores/auth.store.ts) | Auth state + persistence |
| [features/auth/](packages/frontend/src/features/auth/) | Login & OTP pages |
| [components/AppShell.tsx](packages/frontend/src/components/AppShell.tsx) | Layout shell |

---

## 11. State Management

### Zustand — Auth Store

```ts
{
  user: UserDTO | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setAuth(user, accessToken, refreshToken): void   // login
  setTokens(accessToken, refreshToken): void        // token refresh
  logout(): void                                    // clear all
}
```

Persisted to `localStorage` via `zustand/middleware/persist` (stores `user` + `refreshToken`).

### TanStack Query — Server State

- `staleTime: 30s` — data stays fresh for 30 seconds before background refetch
- `retry: 1` — single retry on network failure
- Used for all API data: leads, campaigns, creators, dashboard metrics

### Axios Client

- **Request interceptor:** Attaches `Authorization: Bearer <accessToken>`
- **Response interceptor (401):** Calls `/auth/refresh`, updates tokens in store, retries original request. If refresh also fails, calls `logout()` and redirects to `/login`.

---

## 12. Shared Package (`@yunto/shared`)

Used by both backend and frontend — zero duplication.

### Exports

**Types**
```ts
LoginRequest, OtpSendRequest, OtpVerifyRequest, RefreshRequest
AuthResponse, UserDTO, AgencyDTO, TokenPayload
```

**Constants**
```ts
Role: SUPER_ADMIN | SALES_MANAGER | SALES_EMPLOYEE | OPS_MANAGER | OPS_EMPLOYEE
ROLE_PERMISSIONS: Record<Role, string[]>
```

**Zod Schemas**
```ts
loginSchema         // email, password, agencyCode
otpSendSchema       // phone
otpVerifySchema     // phone + code
refreshSchema       // refreshToken
```

---

## 13. Infrastructure & Local Dev

### Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | postgres:15 | 5432 | Primary database |
| `redis` | redis:7 | 6379 | Cache + Socket.io adapter |

Both services have health checks and named volumes for persistence.

### Environment Variables

```bash
DATABASE_URL=postgresql://yunto:yunto_dev@localhost:5432/yunto
REDIS_URL=redis://localhost:6379

JWT_PRIVATE_KEY=<RSA private key>
JWT_PUBLIC_KEY=<RSA public key>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

MSG91_AUTH_KEY=           # empty in dev, OTP uses console log
MSG91_TEMPLATE_ID=

STORAGE_PROVIDER=local    # or s3
UPLOAD_DIR=./uploads

PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL + Redis
docker compose up -d

# 3. Run migrations and seed demo data
npm run db:migrate
npm run db:seed

# 4. Start all dev servers (Turborepo parallel)
npm run dev
```

Servers:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Prisma Studio: `npm run db:studio`

### Demo Credentials (after seed)

| Role | Email | Password | Agency Code |
|------|-------|----------|-------------|
| Super Admin | admin@demoagency.com | password123 | DEMO01 |
| Sales Manager | sales@demoagency.com | password123 | DEMO01 |
| Ops Employee | ops@demoagency.com | password123 | DEMO01 |

### Turborepo Pipeline

```json
{
  "pipeline": {
    "build":  { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev":    { "cache": false, "persistent": true },
    "lint":   {},
    "test":   { "dependsOn": ["^build"] }
  }
}
```

`@yunto/shared` builds first (tsc), then `@yunto/backend` and `@yunto/frontend` in parallel.

---

*Last updated: June 2026 — Phase 1 MVP complete, Phase 2 in progress.*
