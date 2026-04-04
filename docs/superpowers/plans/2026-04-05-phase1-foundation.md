# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Yunto monorepo with Docker dev environment, database schema, Express backend with auth (email + OTP), RBAC, tenant isolation, and a React frontend with login flow and AppShell layout.

**Architecture:** Turborepo monorepo with 3 packages (shared, backend, frontend). Backend is Express + Prisma + Socket.io. Frontend is React + Vite + Tailwind + shadcn/ui. All services run locally via Docker Compose (PostgreSQL + Redis). Storage abstracted behind an interface (local filesystem for dev).

**Tech Stack:** TypeScript, React 18, Vite, Tailwind CSS, shadcn/ui, Express, Prisma, PostgreSQL, Redis, Socket.io, Zod, Zustand, TanStack Query, React Hook Form, JWT (RS256), bcryptjs

**Spec:** `docs/superpowers/specs/2026-04-05-yunto-mvp-design.md`

---

## File Structure

```
yunto/
├── package.json                        # npm workspaces root
├── turbo.json                          # Turborepo config
├── tsconfig.base.json                  # Shared TS config
├── docker-compose.yml                  # PostgreSQL + Redis
├── .env.example                        # Env template
├── .env                                # Local env (gitignored)
├── .gitignore
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                # Barrel export
│   │       ├── types/
│   │       │   ├── auth.ts             # LoginRequest, TokenPayload, Role, UserDTO
│   │       │   └── common.ts           # PaginatedResponse<T>, ApiError, ApiResponse
│   │       ├── constants/
│   │       │   └── roles.ts            # Role enum, ROLE_PERMISSIONS map
│   │       └── validation/
│   │           └── auth.schema.ts      # Zod: loginSchema, otpSendSchema, otpVerifySchema
│   │
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Full MVP schema
│   │   │   └── seed.ts                 # Seed: agency + super admin + sample users
│   │   └── src/
│   │       ├── index.ts                # Express + Socket.io bootstrap
│   │       ├── config/
│   │       │   ├── env.ts              # Zod-validated env vars
│   │       │   ├── database.ts         # Prisma client singleton
│   │       │   └── redis.ts            # ioredis client
│   │       ├── middleware/
│   │       │   ├── auth.ts             # JWT verification, attach user to req
│   │       │   ├── rbac.ts             # Permission check middleware
│   │       │   ├── tenant.ts           # Extract agencyId, inject into req
│   │       │   ├── validate.ts         # Zod schema validation middleware
│   │       │   └── error-handler.ts    # Global error handler
│   │       ├── modules/
│   │       │   └── auth/
│   │       │       ├── auth.routes.ts
│   │       │       ├── auth.controller.ts
│   │       │       └── auth.service.ts
│   │       ├── socket/
│   │       │   └── index.ts            # Socket.io setup (minimal for Phase 1)
│   │       └── utils/
│   │           ├── jwt.ts              # Sign/verify with RS256
│   │           ├── hash.ts             # bcrypt hash/compare
│   │           ├── pagination.ts       # parsePagination helper
│   │           └── logger.ts           # pino logger
│   │
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── components.json             # shadcn/ui config
│       ├── index.html
│       └── src/
│           ├── main.tsx                # React root
│           ├── App.tsx                 # Router + providers
│           ├── globals.css             # Tailwind directives + shadcn theme
│           ├── lib/
│           │   └── utils.ts            # cn() helper
│           ├── api/
│           │   ├── client.ts           # Axios instance + interceptors
│           │   └── auth.api.ts         # login, otpSend, otpVerify, refresh, me
│           ├── stores/
│           │   ├── auth.store.ts       # Zustand: user, tokens, agency
│           │   └── ui.store.ts         # Zustand: sidebar state
│           ├── hooks/
│           │   └── use-auth.ts         # TanStack Query: useMe, useLogin, useOtpSend, useOtpVerify
│           ├── components/
│           │   ├── ui/                 # shadcn/ui (auto-generated via CLI)
│           │   ├── layout/
│           │   │   ├── AppShell.tsx     # Sidebar + TopBar + Outlet
│           │   │   ├── Sidebar.tsx
│           │   │   ├── TopBar.tsx
│           │   │   └── AuthGuard.tsx   # Redirects to /login if not authed
│           │   └── shared/
│           │       └── Logo.tsx
│           └── features/
│               └── auth/
│                   ├── LoginPage.tsx
│                   ├── OtpVerifyPage.tsx
│                   └── components/
│                       ├── LoginForm.tsx
│                       └── OtpForm.tsx
```

---

### Task 1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/backend/package.json`
- Create: `packages/backend/tsconfig.json`
- Create: `packages/frontend/package.json`
- Create: `packages/frontend/tsconfig.json`
- Create: `packages/frontend/tsconfig.node.json`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/vedantpatnaik/yunto
git init
```

- [ ] **Step 2: Create root package.json with workspaces**

```json
{
  "name": "yunto",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "db:migrate": "cd packages/backend && npx prisma migrate dev",
    "db:seed": "cd packages/backend && npx prisma db seed",
    "db:studio": "cd packages/backend && npx prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {},
    "test": {}
  }
}
```

- [ ] **Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.env
*.log
.turbo/
uploads/
packages/backend/prisma/migrations/
!packages/backend/prisma/migrations/migration_lock.toml
```

Wait — we DO want migrations committed. Fix:

```
node_modules/
dist/
.env
*.log
.turbo/
uploads/
```

- [ ] **Step 6: Create .env.example**

```env
# Database
DATABASE_URL=postgresql://yunto:yunto_dev@localhost:5432/yunto

# Redis
REDIS_URL=redis://localhost:6379

# JWT (generate with: openssl genrsa 2048)
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP (MSG91 — leave empty to use console.log in dev)
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

- [ ] **Step 7: Create packages/shared/package.json**

```json
{
  "name": "@yunto/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.0"
  }
}
```

- [ ] **Step 8: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 9: Create packages/backend/package.json**

```json
{
  "name": "@yunto/backend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@prisma/client": "^6.4.0",
    "@yunto/shared": "*",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "helmet": "^8.0.0",
    "ioredis": "^5.4.0",
    "jsonwebtoken": "^9.0.2",
    "pino": "^9.0.0",
    "pino-http": "^10.0.0",
    "socket.io": "^4.8.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.0.0",
    "prisma": "^6.4.0",
    "tsx": "^4.19.0",
    "vitest": "^3.0.0"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 10: Create packages/backend/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "CommonJS",
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 11: Create packages/frontend/package.json**

```json
{
  "name": "@yunto/frontend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "tsc --noEmit",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@hookform/resolvers": "^4.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@tanstack/react-query": "^5.62.0",
    "@yunto/shared": "*",
    "axios": "^1.7.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.0",
    "react-router-dom": "^6.28.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 12: Create packages/frontend/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 13: Create packages/frontend/tsconfig.node.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 14: Install dependencies**

```bash
cd /Users/vedantpatnaik/yunto
npm install
```

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "chore: initialize monorepo with turbo, workspaces, and package configs"
```

---

### Task 2: Docker Compose + Environment

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: yunto
      POSTGRES_USER: yunto
      POSTGRES_PASSWORD: yunto_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U yunto"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

- [ ] **Step 2: Create .env from template**

```bash
cp .env.example .env
```

Then generate RSA keys for JWT:

```bash
openssl genrsa -out /tmp/jwt_private.pem 2048
openssl rsa -in /tmp/jwt_private.pem -pubout -out /tmp/jwt_public.pem
```

Update `.env` with the keys (replace newlines with `\n`):

```bash
PRIVATE_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' /tmp/jwt_private.pem)
PUBLIC_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' /tmp/jwt_public.pem)
sed -i '' "s|JWT_PRIVATE_KEY=.*|JWT_PRIVATE_KEY=\"$PRIVATE_KEY\"|" .env
sed -i '' "s|JWT_PUBLIC_KEY=.*|JWT_PUBLIC_KEY=\"$PUBLIC_KEY\"|" .env
rm /tmp/jwt_private.pem /tmp/jwt_public.pem
```

- [ ] **Step 3: Start Docker services**

```bash
docker compose up -d
```

Expected: PostgreSQL running on port 5432, Redis on 6379.

- [ ] **Step 4: Verify services**

```bash
docker compose ps
```

Expected: Both services show "healthy" status.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: add docker-compose for PostgreSQL and Redis"
```

---

### Task 3: Shared Package — Types, Constants, Validation

**Files:**
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/auth.ts`
- Create: `packages/shared/src/types/common.ts`
- Create: `packages/shared/src/constants/roles.ts`
- Create: `packages/shared/src/validation/auth.schema.ts`

- [ ] **Step 1: Create types/common.ts**

```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

- [ ] **Step 2: Create constants/roles.ts**

```typescript
export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  SALES_EMPLOYEE: "SALES_EMPLOYEE",
  OPS_MANAGER: "OPS_MANAGER",
  OPS_EMPLOYEE: "OPS_EMPLOYEE",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type Permission =
  | "leads:read"
  | "leads:write"
  | "leads:delete"
  | "campaigns:read"
  | "campaigns:write"
  | "creators:read"
  | "creators:write"
  | "creators:blacklist"
  | "dashboard:read"
  | "dashboard:targets"
  | "team:read"
  | "team:write"
  | "settings:read"
  | "settings:write"
  | "*";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ["*"],
  SALES_MANAGER: [
    "leads:read",
    "leads:write",
    "leads:delete",
    "campaigns:read",
    "creators:read",
    "dashboard:read",
    "dashboard:targets",
    "team:read",
  ],
  SALES_EMPLOYEE: [
    "leads:read",
    "leads:write",
    "campaigns:read",
    "creators:read",
    "dashboard:read",
  ],
  OPS_MANAGER: [
    "campaigns:read",
    "campaigns:write",
    "creators:read",
    "creators:write",
    "dashboard:read",
    "dashboard:targets",
    "team:read",
  ],
  OPS_EMPLOYEE: [
    "campaigns:read",
    "campaigns:write",
    "creators:read",
    "dashboard:read",
  ],
};
```

- [ ] **Step 3: Create types/auth.ts**

```typescript
import { Role } from "../constants/roles";

export interface LoginRequest {
  email: string;
  password: string;
  agencyCode: string;
}

export interface OtpSendRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface UserDTO {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  avatar: string | null;
  role: Role;
  department: string | null;
  agency: AgencyDTO;
}

export interface AgencyDTO {
  id: string;
  name: string;
  code: string;
  logo: string | null;
}

export interface TokenPayload {
  userId: string;
  agencyId: string;
  role: Role;
}
```

- [ ] **Step 4: Create validation/auth.schema.ts**

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agencyCode: z.string().min(1, "Agency code is required"),
});

export const otpSendSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
});

export const otpVerifySchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
```

- [ ] **Step 5: Create barrel export — packages/shared/src/index.ts**

```typescript
// Types
export * from "./types/common";
export * from "./types/auth";

// Constants
export * from "./constants/roles";

// Validation
export * from "./validation/auth.schema";
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /Users/vedantpatnaik/yunto/packages/shared
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/shared/
git commit -m "feat(shared): add auth types, role constants, and Zod validation schemas"
```

---

### Task 4: Prisma Schema + Migration + Seed

**Files:**
- Create: `packages/backend/prisma/schema.prisma`
- Create: `packages/backend/prisma/seed.ts`

- [ ] **Step 1: Create schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AGENCY & AUTH ──────────────────────────────────

model Agency {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique
  logo      String?
  email     String
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  leads     Lead[]
  campaigns Campaign[]
  creators  AgencyCreator[]
  targets   Target[]

  @@index([code])
}

enum Role {
  SUPER_ADMIN
  SALES_MANAGER
  SALES_EMPLOYEE
  OPS_MANAGER
  OPS_EMPLOYEE
}

model User {
  id           String    @id @default(cuid())
  agencyId     String
  agency       Agency    @relation(fields: [agencyId], references: [id])
  email        String
  phone        String?
  passwordHash String?
  name         String
  avatar       String?
  role         Role
  department   String?
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  refreshTokens RefreshToken[]
  assignedLeads Lead[]          @relation("AssignedTo")
  createdLeads  Lead[]          @relation("CreatedBy")
  campaignMemberships CampaignMember[]
  targets       Target[]

  @@unique([agencyId, email])
  @@index([agencyId])
  @@index([agencyId, role])
  @@index([agencyId, department])
  @@index([phone])
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}

model OtpCode {
  id        String   @id @default(cuid())
  phone     String
  code      String
  expiresAt DateTime
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([phone, code])
}

// ─── LEADS ──────────────────────────────────────────

enum LeadStatus {
  NEW
  CONTACTED
  CONNECTED
  CONVERTED
}

enum DealType {
  PAID
  BARTER
}

model Lead {
  id              String     @id @default(cuid())
  agencyId        String
  agency          Agency     @relation(fields: [agencyId], references: [id])
  brandName       String
  contactName     String?
  contactEmail    String?
  contactPhone    String?
  dealType        DealType
  status          LeadStatus @default(NEW)
  budget          Decimal?   @db.Decimal(12, 2)
  currency        String     @default("INR")
  timeline        String?
  startDate       DateTime?
  endDate         DateTime?
  campaignDetails String?    @db.Text
  notes           String?    @db.Text
  source          String?
  assignedToId    String?
  assignedTo      User?      @relation("AssignedTo", fields: [assignedToId], references: [id])
  createdById     String
  createdBy       User       @relation("CreatedBy", fields: [createdById], references: [id])
  convertedAt     DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  campaign         Campaign?
  attachedCreators LeadCreator[]
  shareLinks       ShareLink[]
  statusHistory    LeadStatusHistory[]

  @@index([agencyId, status])
  @@index([agencyId, dealType])
  @@index([agencyId, assignedToId])
  @@index([agencyId, createdAt])
  @@index([brandName])
}

model LeadStatusHistory {
  id          String      @id @default(cuid())
  leadId      String
  lead        Lead        @relation(fields: [leadId], references: [id], onDelete: Cascade)
  fromStatus  LeadStatus?
  toStatus    LeadStatus
  changedById String
  note        String?
  createdAt   DateTime    @default(now())

  @@index([leadId])
}

model LeadCreator {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  creatorId String
  creator   Creator  @relation(fields: [creatorId], references: [id])
  addedAt   DateTime @default(now())

  @@unique([leadId, creatorId])
  @@index([leadId])
  @@index([creatorId])
}

// ─── CAMPAIGNS ──────────────────────────────────────

enum CampaignStatus {
  DRAFT
  ACTIVE
  COMPLETED
  CANCELLED
}

model Campaign {
  id            String         @id @default(cuid())
  agencyId      String
  agency        Agency         @relation(fields: [agencyId], references: [id])
  leadId        String?        @unique
  lead          Lead?          @relation(fields: [leadId], references: [id])
  brandName     String
  dealType      DealType
  budget        Decimal?       @db.Decimal(12, 2)
  currency      String         @default("INR")
  status        CampaignStatus @default(DRAFT)
  description   String?        @db.Text
  deliverables  String?        @db.Text
  startDate     DateTime?
  endDate       DateTime?
  completionPct Int            @default(0)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  members  CampaignMember[]
  creators CampaignCreator[]

  @@index([agencyId, status])
  @@index([agencyId, createdAt])
  @@index([agencyId, dealType])
}

model CampaignMember {
  id         String   @id @default(cuid())
  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  role       String?
  addedAt    DateTime @default(now())

  @@unique([campaignId, userId])
  @@index([campaignId])
  @@index([userId])
}

enum CreatorCampaignStatus {
  ASSIGNED
  IN_PROGRESS
  CONTENT_SUBMITTED
  COMPLETED
}

model CampaignCreator {
  id           String                @id @default(cuid())
  campaignId   String
  campaign     Campaign              @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  creatorId    String
  creator      Creator               @relation(fields: [creatorId], references: [id])
  status       CreatorCampaignStatus @default(ASSIGNED)
  deliverables String?               @db.Text
  rating       Int?
  ratingNotes  String?
  fee          Decimal?              @db.Decimal(12, 2)
  completedAt  DateTime?
  createdAt    DateTime              @default(now())
  updatedAt    DateTime              @updatedAt

  @@unique([campaignId, creatorId])
  @@index([campaignId])
  @@index([creatorId])
}

// ─── CREATORS ───────────────────────────────────────

enum Platform {
  INSTAGRAM
  YOUTUBE
  TWITTER
  LINKEDIN
  TIKTOK
  OTHER
}

model Creator {
  id              String    @id @default(cuid())
  name            String
  handle          String?
  email           String?
  phone           String?
  bio             String?   @db.Text
  avatar          String?
  city            String?
  niche           String[]
  isBlacklisted   Boolean   @default(false)
  blacklistReason String?
  blacklistedAt   DateTime?
  avgRating       Decimal?  @db.Decimal(3, 2)
  totalCampaigns  Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  platforms           CreatorPlatform[]
  agencyLinks         AgencyCreator[]
  leadAttachments     LeadCreator[]
  campaignAssignments CampaignCreator[]

  @@index([name])
  @@index([isBlacklisted])
  @@index([createdAt])
}

model CreatorPlatform {
  id             String   @id @default(cuid())
  creatorId      String
  creator        Creator  @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  platform       Platform
  handle         String
  url            String?
  followers      Int      @default(0)
  engagementRate Decimal? @db.Decimal(5, 2)
  avgViews       Int?
  lastSynced     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([creatorId, platform])
  @@index([platform, followers])
  @@index([creatorId])
}

model AgencyCreator {
  id               String   @id @default(cuid())
  agencyId         String
  agency           Agency   @relation(fields: [agencyId], references: [id])
  creatorId        String
  creator          Creator  @relation(fields: [creatorId], references: [id])
  isMyCreator      Boolean  @default(false)
  assignedToUserId String?
  addedAt          DateTime @default(now())

  @@unique([agencyId, creatorId])
  @@index([agencyId, isMyCreator])
  @@index([creatorId])
}

// ─── SHAREABLE LINKS ────────────────────────────────

model ShareLink {
  id         String    @id @default(cuid())
  agencyId   String
  leadId     String?
  lead       Lead?     @relation(fields: [leadId], references: [id])
  slug       String    @unique
  creatorIds String[]
  expiresAt  DateTime?
  viewCount  Int       @default(0)
  createdAt  DateTime  @default(now())

  @@index([slug])
  @@index([agencyId])
}

// ─── TARGETS ────────────────────────────────────────

model Target {
  id         String   @id @default(cuid())
  agencyId   String
  agency     Agency   @relation(fields: [agencyId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  month      Int
  year       Int
  amount     Decimal  @db.Decimal(12, 2)
  achieved   Decimal  @default(0) @db.Decimal(12, 2)
  department String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([agencyId, userId, month, year])
  @@index([agencyId, month, year])
}
```

- [ ] **Step 2: Run initial migration**

```bash
cd /Users/vedantpatnaik/yunto/packages/backend
npx prisma migrate dev --name init
```

Expected: Migration created and applied. Prisma Client generated.

- [ ] **Step 3: Add GIN index for Creator.niche via raw SQL migration**

```bash
cd /Users/vedantpatnaik/yunto/packages/backend
npx prisma migrate dev --name add_niche_gin_index --create-only
```

Then edit the newly created migration SQL file to add:

```sql
CREATE INDEX idx_creator_niche ON "Creator" USING GIN ("niche");
```

Then apply:

```bash
npx prisma migrate dev
```

- [ ] **Step 4: Create seed.ts**

```typescript
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo agency
  const agency = await prisma.agency.upsert({
    where: { code: "DEMO01" },
    update: {},
    create: {
      name: "Demo Agency",
      code: "DEMO01",
      email: "admin@demoagency.com",
      phone: "+919876543210",
    },
  });

  // Create super admin
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: {
      agencyId_email: { agencyId: agency.id, email: "admin@demoagency.com" },
    },
    update: {},
    create: {
      agencyId: agency.id,
      email: "admin@demoagency.com",
      phone: "+919876543210",
      passwordHash,
      name: "Admin User",
      role: Role.SUPER_ADMIN,
      department: null,
    },
  });

  // Create sales manager
  await prisma.user.upsert({
    where: {
      agencyId_email: {
        agencyId: agency.id,
        email: "sales@demoagency.com",
      },
    },
    update: {},
    create: {
      agencyId: agency.id,
      email: "sales@demoagency.com",
      passwordHash,
      name: "Sales Manager",
      role: Role.SALES_MANAGER,
      department: "Sales",
    },
  });

  // Create ops employee
  await prisma.user.upsert({
    where: {
      agencyId_email: { agencyId: agency.id, email: "ops@demoagency.com" },
    },
    update: {},
    create: {
      agencyId: agency.id,
      email: "ops@demoagency.com",
      passwordHash,
      name: "Ops Employee",
      role: Role.OPS_EMPLOYEE,
      department: "Operations",
    },
  });

  console.log("Seed complete: agency=%s, code=%s", agency.name, agency.code);
  console.log("Login: admin@demoagency.com / password123 / DEMO01");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 5: Run seed**

```bash
cd /Users/vedantpatnaik/yunto/packages/backend
npx prisma db seed
```

Expected: "Seed complete: agency=Demo Agency, code=DEMO01"

- [ ] **Step 6: Verify with Prisma Studio**

```bash
npx prisma studio
```

Expected: Opens browser at localhost:5555. Verify Agency has 1 row, User has 3 rows.

- [ ] **Step 7: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/backend/prisma/
git commit -m "feat(backend): add Prisma schema with full MVP models and seed data"
```

---

### Task 5: Backend Config — Env, Database, Redis, Logger

**Files:**
- Create: `packages/backend/src/config/env.ts`
- Create: `packages/backend/src/config/database.ts`
- Create: `packages/backend/src/config/redis.ts`
- Create: `packages/backend/src/utils/logger.ts`

- [ ] **Step 1: Create config/env.ts**

```typescript
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env from repo root
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  MSG91_AUTH_KEY: z.string().default(""),
  MSG91_TEMPLATE_ID: z.string().default(""),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_DIR: z.string().default("./uploads"),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
```

Add `dotenv` dependency:

```bash
cd /Users/vedantpatnaik/yunto/packages/backend
npm install dotenv
```

- [ ] **Step 2: Create config/database.ts**

```typescript
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Create config/redis.ts**

```typescript
import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));
```

- [ ] **Step 4: Create utils/logger.ts**

```typescript
import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
```

Add `pino-pretty` as dev dependency:

```bash
cd /Users/vedantpatnaik/yunto/packages/backend
npm install -D pino-pretty
```

- [ ] **Step 5: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/backend/src/config/ packages/backend/src/utils/logger.ts packages/backend/package.json packages/backend/package-lock.json
git commit -m "feat(backend): add env config, Prisma client, Redis client, and logger"
```

---

### Task 6: Backend Utils — JWT, Hash, Pagination

**Files:**
- Create: `packages/backend/src/utils/jwt.ts`
- Create: `packages/backend/src/utils/hash.ts`
- Create: `packages/backend/src/utils/pagination.ts`

- [ ] **Step 1: Create utils/jwt.ts**

```typescript
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { TokenPayload } from "@yunto/shared";

const privateKey = env.JWT_PRIVATE_KEY.replace(/\\n/g, "\n");
const publicKey = env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  }) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  }) as { userId: string };
}
```

- [ ] **Step 2: Create utils/hash.ts**

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 3: Create utils/pagination.ts**

```typescript
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: {
  page?: string;
  limit?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/backend/src/utils/
git commit -m "feat(backend): add JWT, password hash, and pagination utilities"
```

---

### Task 7: Backend Middleware — Auth, RBAC, Tenant, Validate, Error Handler

**Files:**
- Create: `packages/backend/src/middleware/auth.ts`
- Create: `packages/backend/src/middleware/rbac.ts`
- Create: `packages/backend/src/middleware/tenant.ts`
- Create: `packages/backend/src/middleware/validate.ts`
- Create: `packages/backend/src/middleware/error-handler.ts`

- [ ] **Step 1: Create middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { TokenPayload } from "@yunto/shared";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      agencyId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "Missing token" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    req.agencyId = payload.agencyId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
  }
}
```

- [ ] **Step 2: Create middleware/rbac.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import { Permission, ROLE_PERMISSIONS } from "@yunto/shared";

export function rbac(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role];
    if (
      userPermissions.includes("*") ||
      requiredPermissions.every((p) => userPermissions.includes(p))
    ) {
      next();
      return;
    }

    res.status(403).json({
      error: "Forbidden",
      message: "Insufficient permissions",
    });
  };
}
```

- [ ] **Step 3: Create middleware/tenant.ts**

```typescript
import { Request, Response, NextFunction } from "express";

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.agencyId) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing agency context",
    });
    return;
  }
  req.agencyId = req.user.agencyId;
  next();
}
```

- [ ] **Step 4: Create middleware/validate.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation Error",
          message: error.errors.map((e) => e.message).join(", "),
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
}
```

- [ ] **Step 5: Create middleware/error-handler.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/backend/src/middleware/
git commit -m "feat(backend): add auth, RBAC, tenant, validation, and error handler middleware"
```

---

### Task 8: Auth Module — Service, Controller, Routes

**Files:**
- Create: `packages/backend/src/modules/auth/auth.service.ts`
- Create: `packages/backend/src/modules/auth/auth.controller.ts`
- Create: `packages/backend/src/modules/auth/auth.routes.ts`

- [ ] **Step 1: Create auth.service.ts**

```typescript
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { comparePassword } from "../../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { AppError } from "../../middleware/error-handler";
import { AuthResponse, TokenPayload, UserDTO } from "@yunto/shared";
import { User, Agency } from "@prisma/client";
import crypto from "crypto";

type UserWithAgency = User & { agency: Agency };

function toUserDTO(user: UserWithAgency): UserDTO {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    department: user.department,
    agency: {
      id: user.agency.id,
      name: user.agency.name,
      code: user.agency.code,
      logo: user.agency.logo,
    },
  };
}

function generateTokens(user: UserWithAgency): {
  accessToken: string;
  refreshToken: string;
} {
  const payload: TokenPayload = {
    userId: user.id,
    agencyId: user.agencyId,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ userId: user.id });
  return { accessToken, refreshToken };
}

export async function loginWithEmail(
  email: string,
  password: string,
  agencyCode: string
): Promise<AuthResponse> {
  const agency = await prisma.agency.findUnique({
    where: { code: agencyCode },
  });
  if (!agency) {
    throw new AppError(401, "Invalid agency code");
  }

  const user = await prisma.user.findUnique({
    where: { agencyId_email: { agencyId: agency.id, email } },
    include: { agency: true },
  });
  if (!user || !user.passwordHash) {
    throw new AppError(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new AppError(403, "Account is deactivated");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { accessToken, refreshToken, user: toUserDTO(user) };
}

export async function sendOtp(phone: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { phone } });
  if (!user) {
    throw new AppError(404, "No account found with this phone number");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await prisma.otpCode.create({
    data: { phone, code, expiresAt },
  });

  // In development, log OTP to console
  if (process.env.NODE_ENV === "development" || !process.env.MSG91_AUTH_KEY) {
    console.log(`[DEV OTP] Phone: ${phone}, Code: ${code}`);
    return;
  }

  // TODO: Production MSG91 integration (Phase 2+)
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<AuthResponse> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError(401, "Invalid or expired OTP");
  }

  // Mark OTP as used
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  const user = await prisma.user.findFirst({
    where: { phone },
    include: { agency: true },
  });
  if (!user) {
    throw new AppError(404, "No account found with this phone number");
  }
  if (!user.isActive) {
    throw new AppError(403, "Account is deactivated");
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { accessToken, refreshToken, user: toUserDTO(user) };
}

export async function refreshTokens(
  oldRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token expired or revoked");
  }

  // Rotate: delete old, create new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { agency: true },
  });
  if (!user || !user.isActive) {
    throw new AppError(401, "User not found or deactivated");
  }

  const tokens = generateTokens(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getMe(userId: string): Promise<UserDTO> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { agency: true },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return toUserDTO(user);
}
```

- [ ] **Step 2: Create auth.controller.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, agencyCode } = req.body;
    const result = await authService.loginWithEmail(
      email,
      password,
      agencyCode
    );
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function otpSend(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.sendOtp(req.body.phone);
    res.json({ data: { message: "OTP sent successfully" } });
  } catch (err) {
    next(err);
  }
}

export async function otpVerify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phone, code } = req.body;
    const result = await authService.verifyOtp(phone, code);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ data: { message: "Logged out successfully" } });
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}
```

- [ ] **Step 3: Create auth.routes.ts**

```typescript
import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import {
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  refreshSchema,
} from "@yunto/shared";
import * as authController from "./auth.controller";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/otp/send", validate(otpSendSchema), authController.otpSend);
router.post(
  "/otp/verify",
  validate(otpVerifySchema),
  authController.otpVerify
);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authController.logoutHandler);
router.get("/me", authMiddleware, authController.me);

export default router;
```

- [ ] **Step 4: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/backend/src/modules/auth/
git commit -m "feat(backend): add auth module with email login, OTP, JWT refresh, and RBAC"
```

---

### Task 9: Express Server Bootstrap + Socket.io Stub

**Files:**
- Create: `packages/backend/src/index.ts`
- Create: `packages/backend/src/socket/index.ts`

- [ ] **Step 1: Create socket/index.ts**

```typescript
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "../utils/logger";

export function setupSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Missing auth token"));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.agencyId = payload.agencyId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", (socket) => {
    const { agencyId, userId } = socket.data;
    socket.join(`agency:${agencyId}`);
    socket.join(`user:${userId}`);
    logger.debug({ userId, agencyId }, "Socket connected");

    socket.on("disconnect", () => {
      logger.debug({ userId }, "Socket disconnected");
    });
  });

  return io;
}
```

- [ ] **Step 2: Create src/index.ts**

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import { redis } from "./config/redis";
import { errorHandler } from "./middleware/error-handler";
import { setupSocket } from "./socket";

import authRoutes from "./modules/auth/auth.routes";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Socket.io
const io = setupSocket(httpServer);

// Start server
async function start() {
  await redis.connect();
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
    logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
  });
}

start().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});

export { app, io };
```

- [ ] **Step 3: Verify backend starts**

```bash
cd /Users/vedantpatnaik/yunto/packages/backend
npx tsx src/index.ts
```

Expected: "Server running on port 3001" in console. Kill with Ctrl+C.

- [ ] **Step 4: Test health endpoint**

In a separate terminal:

```bash
curl http://localhost:3001/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

- [ ] **Step 5: Test login endpoint**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demoagency.com","password":"password123","agencyCode":"DEMO01"}'
```

Expected: JSON with `accessToken`, `refreshToken`, and `user` object containing role `SUPER_ADMIN`.

- [ ] **Step 6: Test /me endpoint**

Use the accessToken from the previous response:

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

Expected: JSON with user details.

- [ ] **Step 7: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/backend/src/index.ts packages/backend/src/socket/
git commit -m "feat(backend): add Express server bootstrap with Socket.io and health check"
```

---

### Task 10: Frontend Scaffold — Vite, Tailwind, shadcn/ui

**Files:**
- Create: `packages/frontend/index.html`
- Create: `packages/frontend/vite.config.ts`
- Create: `packages/frontend/tailwind.config.ts`
- Create: `packages/frontend/postcss.config.js`
- Create: `packages/frontend/components.json`
- Create: `packages/frontend/src/main.tsx`
- Create: `packages/frontend/src/globals.css`
- Create: `packages/frontend/src/lib/utils.ts`

- [ ] **Step 1: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yunto</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3001",
        ws: true,
      },
    },
  },
});
```

- [ ] **Step 3: Create tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
```

- [ ] **Step 4: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create components.json (shadcn/ui config)**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 6: Create src/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 7: Create src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 8: Create src/main.tsx**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: Create src/App.tsx (placeholder)**

```tsx
export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Yunto</h1>
    </div>
  );
}
```

- [ ] **Step 10: Install shadcn/ui base components**

```bash
cd /Users/vedantpatnaik/yunto/packages/frontend
npx shadcn@latest add button input label card separator avatar dropdown-menu tooltip
```

- [ ] **Step 11: Verify frontend starts**

```bash
cd /Users/vedantpatnaik/yunto/packages/frontend
npx vite
```

Expected: Dev server on http://localhost:5173, shows "Yunto" heading.

- [ ] **Step 12: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/frontend/
git commit -m "feat(frontend): scaffold Vite + React + Tailwind + shadcn/ui"
```

---

### Task 11: Frontend — API Client + Auth Store

**Files:**
- Create: `packages/frontend/src/api/client.ts`
- Create: `packages/frontend/src/api/auth.api.ts`
- Create: `packages/frontend/src/stores/auth.store.ts`
- Create: `packages/frontend/src/stores/ui.store.ts`

- [ ] **Step 1: Create api/client.ts**

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Dynamically import auth store to avoid circular deps
let getAuthState: () => {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
};

export function initApiClient(store: typeof getAuthState) {
  getAuthState = store;
}

// Attach access token
api.interceptors.request.use((config) => {
  if (getAuthState) {
    const { accessToken } = getAuthState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Handle 401: try refresh, retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && getAuthState) {
      originalRequest._retry = true;
      const { refreshToken } = getAuthState();
      if (refreshToken) {
        try {
          const res = await axios.post("/api/auth/refresh", { refreshToken });
          const { accessToken: newAccess, refreshToken: newRefresh } =
            res.data.data;
          getAuthState().setTokens(newAccess, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          getAuthState().logout();
        }
      } else {
        getAuthState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 2: Create stores/auth.store.ts**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserDTO } from "@yunto/shared";

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDTO, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "yunto-auth",
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

- [ ] **Step 3: Create stores/ui.store.ts**

```typescript
import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
```

- [ ] **Step 4: Create api/auth.api.ts**

```typescript
import api from "./client";
import {
  AuthResponse,
  LoginRequest,
  OtpSendRequest,
  OtpVerifyRequest,
  UserDTO,
  ApiResponse,
} from "@yunto/shared";

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return res.data.data;
}

export async function otpSendApi(data: OtpSendRequest): Promise<void> {
  await api.post("/auth/otp/send", data);
}

export async function otpVerifyApi(
  data: OtpVerifyRequest
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>(
    "/auth/otp/verify",
    data
  );
  return res.data.data;
}

export async function getMeApi(): Promise<UserDTO> {
  const res = await api.get<ApiResponse<UserDTO>>("/auth/me");
  return res.data.data;
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/frontend/src/api/ packages/frontend/src/stores/
git commit -m "feat(frontend): add API client with token refresh, auth store, and UI store"
```

---

### Task 12: Frontend — Auth Pages (Login + OTP)

**Files:**
- Create: `packages/frontend/src/features/auth/LoginPage.tsx`
- Create: `packages/frontend/src/features/auth/OtpVerifyPage.tsx`
- Create: `packages/frontend/src/features/auth/components/LoginForm.tsx`
- Create: `packages/frontend/src/features/auth/components/OtpForm.tsx`
- Create: `packages/frontend/src/hooks/use-auth.ts`

- [ ] **Step 1: Create hooks/use-auth.ts**

```typescript
import { useMutation } from "@tanstack/react-query";
import { loginApi, otpSendApi, otpVerifyApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { LoginRequest, OtpVerifyRequest } from "@yunto/shared";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/dashboard");
    },
  });
}

export function useOtpSend() {
  return useMutation({
    mutationFn: (data: { phone: string }) => otpSendApi(data),
  });
}

export function useOtpVerify() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: OtpVerifyRequest) => otpVerifyApi(data),
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/dashboard");
    },
  });
}
```

- [ ] **Step 2: Create features/auth/components/LoginForm.tsx**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@yunto/shared";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSwitchToOtp }: { onSwitchToOtp: () => void }) {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginValues) => {
    login.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="agencyCode">Agency Code</Label>
        <Input
          id="agencyCode"
          placeholder="e.g. DEMO01"
          {...register("agencyCode")}
        />
        {errors.agencyCode && (
          <p className="text-sm text-destructive">{errors.agencyCode.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@agency.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {login.error && (
        <p className="text-sm text-destructive">
          {(login.error as any)?.response?.data?.message || "Login failed"}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in..." : "Sign In"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onSwitchToOtp}
      >
        Sign in with Phone OTP
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Create features/auth/components/OtpForm.tsx**

```tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSendSchema, otpVerifySchema } from "@yunto/shared";
import { useOtpSend, useOtpVerify } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

type SendValues = z.infer<typeof otpSendSchema>;
type VerifyValues = z.infer<typeof otpVerifySchema>;

export function OtpForm({ onSwitchToEmail }: { onSwitchToEmail: () => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const otpSend = useOtpSend();
  const otpVerify = useOtpVerify();

  const sendForm = useForm<SendValues>({
    resolver: zodResolver(otpSendSchema),
  });
  const verifyForm = useForm<VerifyValues>({
    resolver: zodResolver(otpVerifySchema),
  });

  const onSendSubmit = (data: SendValues) => {
    otpSend.mutate(data, {
      onSuccess: () => {
        setPhone(data.phone);
        setStep("code");
      },
    });
  };

  const onVerifySubmit = (data: VerifyValues) => {
    otpVerify.mutate({ phone, code: data.code });
  };

  if (step === "phone") {
    return (
      <form onSubmit={sendForm.handleSubmit(onSendSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+91 9876543210"
            {...sendForm.register("phone")}
          />
          {sendForm.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {sendForm.formState.errors.phone.message}
            </p>
          )}
        </div>

        {otpSend.error && (
          <p className="text-sm text-destructive">
            {(otpSend.error as any)?.response?.data?.message || "Failed to send OTP"}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={otpSend.isPending}>
          {otpSend.isPending ? "Sending..." : "Send OTP"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onSwitchToEmail}
        >
          Sign in with Email
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">OTP sent to {phone}</p>
      <div className="space-y-2">
        <Label htmlFor="code">Enter OTP</Label>
        <Input
          id="code"
          placeholder="123456"
          maxLength={6}
          {...verifyForm.register("code")}
        />
        {verifyForm.formState.errors.code && (
          <p className="text-sm text-destructive">
            {verifyForm.formState.errors.code.message}
          </p>
        )}
      </div>

      {otpVerify.error && (
        <p className="text-sm text-destructive">
          {(otpVerify.error as any)?.response?.data?.message || "Invalid OTP"}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={otpVerify.isPending}>
        {otpVerify.isPending ? "Verifying..." : "Verify OTP"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setStep("phone")}
      >
        Change phone number
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Create features/auth/LoginPage.tsx**

```tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./components/LoginForm";
import { OtpForm } from "./components/OtpForm";

export default function LoginPage() {
  const [method, setMethod] = useState<"email" | "otp">("email");

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Yunto</CardTitle>
          <CardDescription>
            {method === "email"
              ? "Sign in with your email and password"
              : "Sign in with your phone number"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {method === "email" ? (
            <LoginForm onSwitchToOtp={() => setMethod("otp")} />
          ) : (
            <OtpForm onSwitchToEmail={() => setMethod("email")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Create features/auth/OtpVerifyPage.tsx**

This page is a redirect target if we need a standalone OTP page. For now it redirects to login:

```tsx
import { Navigate } from "react-router-dom";

export default function OtpVerifyPage() {
  return <Navigate to="/login" replace />;
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/frontend/src/features/auth/ packages/frontend/src/hooks/
git commit -m "feat(frontend): add login page with email/password and phone OTP flows"
```

---

### Task 13: Frontend — AppShell Layout (Sidebar + TopBar + AuthGuard)

**Files:**
- Create: `packages/frontend/src/components/layout/AuthGuard.tsx`
- Create: `packages/frontend/src/components/layout/Sidebar.tsx`
- Create: `packages/frontend/src/components/layout/TopBar.tsx`
- Create: `packages/frontend/src/components/layout/AppShell.tsx`
- Create: `packages/frontend/src/components/shared/Logo.tsx`

- [ ] **Step 1: Create components/shared/Logo.tsx**

```tsx
export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
        Y
      </div>
      {!collapsed && <span className="font-bold text-lg">Yunto</span>}
    </div>
  );
}
```

- [ ] **Step 2: Create components/layout/AuthGuard.tsx**

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
```

- [ ] **Step 3: Create components/layout/Sidebar.tsx**

```tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/leads", icon: Users, label: "Leads" },
  { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
  { to: "/creators", icon: UserCircle, label: "Creators" },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        <Logo collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: Create components/layout/TopBar.tsx**

```tsx
import { Bell, Search, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="h-8 border-none bg-muted/50 focus-visible:ring-0"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm hidden sm:inline">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
              {user?.role} &middot; {user?.agency.name}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create components/layout/AppShell.tsx**

```tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/frontend/src/components/
git commit -m "feat(frontend): add AppShell layout with sidebar, topbar, and auth guard"
```

---

### Task 14: Frontend — Router + Providers + Wire Everything

**Files:**
- Modify: `packages/frontend/src/App.tsx`
- Modify: `packages/frontend/src/main.tsx`

- [ ] **Step 1: Update App.tsx with router and providers**

Replace the placeholder `App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/features/auth/LoginPage";
import { useAuthStore } from "@/stores/auth.store";
import { initApiClient } from "@/api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

// Placeholder pages for MVP modules (will be built in Phase 2-5)
function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {user?.name}! You are logged in as {user?.role} at{" "}
        {user?.agency.name}.
      </p>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">Coming in next phase.</p>
    </div>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/leads"
            element={<PlaceholderPage title="Leads" />}
          />
          <Route
            path="/campaigns"
            element={<PlaceholderPage title="Campaigns" />}
          />
          <Route
            path="/creators"
            element={<PlaceholderPage title="Creators" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    initApiClient(() => useAuthStore.getState());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Verify the full flow**

1. Start Docker services: `docker compose up -d`
2. Start backend: `cd packages/backend && npx tsx src/index.ts`
3. Start frontend: `cd packages/frontend && npx vite`
4. Open http://localhost:5173 — should redirect to /login
5. Enter: Agency Code = `DEMO01`, Email = `admin@demoagency.com`, Password = `password123`
6. Click "Sign In" — should redirect to /dashboard with welcome message
7. Verify sidebar shows Dashboard, Leads, Campaigns, Creators links
8. Verify topbar shows user name and agency
9. Click logout in dropdown — should redirect to /login

- [ ] **Step 3: Verify RBAC — test invalid credentials**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrong","agencyCode":"DEMO01"}'
```

Expected: 401 with "Invalid email or password".

- [ ] **Step 4: Verify OTP flow (dev mode)**

```bash
curl -X POST http://localhost:3001/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'
```

Expected: 200 with "OTP sent". Check backend console for `[DEV OTP] Phone: +919876543210, Code: XXXXXX`.

```bash
curl -X POST http://localhost:3001/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","code":"XXXXXX"}'
```

Expected: 200 with tokens and user.

- [ ] **Step 5: Set up turbo dev script**

Verify running from root:

```bash
cd /Users/vedantpatnaik/yunto
npm run dev
```

Expected: Both frontend (5173) and backend (3001) start. Frontend proxies API calls to backend.

- [ ] **Step 6: Commit**

```bash
cd /Users/vedantpatnaik/yunto
git add packages/frontend/src/App.tsx packages/frontend/src/main.tsx
git commit -m "feat(frontend): wire up router, providers, and full auth flow with AppShell"
```

---

## Verification Checklist

After all tasks are complete, verify the following end-to-end:

- [ ] `docker compose up -d` starts PostgreSQL and Redis without errors
- [ ] `npm run dev` from repo root starts both frontend and backend
- [ ] http://localhost:5173 redirects unauthenticated users to /login
- [ ] Email/password login works with seeded credentials (`admin@demoagency.com` / `password123` / `DEMO01`)
- [ ] Phone OTP flow works (code printed to backend console in dev mode)
- [ ] After login, AppShell renders with sidebar (Dashboard, Leads, Campaigns, Creators) and topbar (search, bell, user avatar)
- [ ] Sidebar collapses/expands
- [ ] Logout clears auth state and redirects to /login
- [ ] Invalid credentials return proper error messages in the UI
- [ ] Backend returns 401 for requests without a valid JWT
- [ ] Backend returns 403 when a sales employee tries an admin-only endpoint (test via curl)
- [ ] JWT refresh works: manually expire a token, verify the interceptor refreshes transparently
- [ ] Socket.io connects successfully after login (check backend logs for "Socket connected")
