<div align="center">

# Yunto

**The Operating System for Influencer Marketing Agencies**

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#license)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)

A multi-portal SaaS platform that streamlines agency operations — from lead management and campaign tracking to creator databases, financial ops, and team governance.

> **Internal repository** — access restricted to Yunto employees and authorized contractors only.

[Figma Designs](https://www.figma.com/design/KC4ItIHV2hSpevWxXCHMG4) &bull; [Linear Project](https://linear.app/yunto/project/yunto-33c165e2) &bull; [Feature Documentation](./FEATURE_DOC.md)

</div>

---

## Overview

Yunto provides three interconnected portals serving different user roles within an influencer marketing agency:

| Portal | Users | Screens | Modules |
|--------|-------|---------|---------|
| **Admin Dashboard** | Agency owners / Super Admins | ~447 | A1-A18 |
| **Employee Portal** | Sales, Operations, Managers | ~198 | B1-B11 |
| **Influencer Portal** | Creators / Influencers | ~147 | C1-C12 |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn/ui, Zustand, React Router |
| **Backend** | Express.js, Prisma ORM, Socket.io |
| **Database** | PostgreSQL 15, Redis 7 |
| **Auth** | JWT RS256 with access/refresh token rotation, 5 RBAC roles |
| **Infra** | Docker Compose, Turborepo monorepo |
| **Design** | Figma (~792 screens across 3 pages) |

## Architecture

```
yunto/
├── packages/
│   ├── shared/          # Zod schemas, TypeScript types, constants
│   ├── backend/         # Express API server
│   └── frontend/        # React SPA (Vite)
├── prisma/              # Database schema and migrations
├── docker/              # Docker Compose configs
├── turbo.json           # Turborepo pipeline config
└── package.json         # Root workspace config
```

### Multi-Tenancy

Shared database with `agencyId` column isolation. Each agency's data is scoped via middleware-level tenant guards.

### Authentication

- JWT RS256 with asymmetric key pairs
- Access token (15min) + Refresh token (7d) rotation
- 5 RBAC roles: Super Admin, Admin, Manager, Sales, Operations

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- pnpm >= 8

### Setup

```bash
# Clone the repository
git clone https://github.com/vedantpatnaik/yunto.git
cd yunto

# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env

# Run database migrations
pnpm --filter backend prisma migrate dev

# Seed sample data
pnpm --filter backend db:seed

# Start development servers
pnpm dev
```

### Development Commands

```bash
pnpm dev              # Start all packages in dev mode
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm typecheck        # Type-check all packages
pnpm test             # Run all tests
```

## Roadmap

**Timeline:** April 8 — July 15, 2026

| Phase | Milestone | Target |
|-------|-----------|--------|
| 1 — Admin MVP | v0.1.0-alpha → v0.5.0-beta | Apr 8 — May 17 |
| 2 — Admin Full | v0.6.0-alpha → v0.9.0-beta | May 18 — Jun 7 |
| 3 — Employee Portal | v0.10.0-alpha → v0.10.0-beta | Jun 8 — Jun 21 |
| 4 — Influencer Portal | v0.11.0-alpha → v0.11.0-beta | Jun 22 — Jul 5 |
| 5 — Infrastructure & Release | v0.12.0-alpha → v1.0.0 | Jul 6 — Jul 15 |

See the full roadmap on [Linear](https://linear.app/yunto/project/yunto-33c165e2).

## Key Features

### Admin Dashboard (A1-A18)
- **Leads Pipeline** — create, track, filter, export leads with status history
- **Campaign Management** — CRUD campaigns, assign creators, track deliverables
- **Creator Database** — profiles, platform stats, my/all toggle, shareable links
- **Financial Ops** — invoices, payments (paid/barter/received), revenue analytics
- **Team Management** — people directory, attendance, leave, roles & permissions
- **Communication** — real-time messaging (Socket.io), polls, reminders
- **Content Calendar** — schedule creator content with brand-wise filtering

### Employee Portal (B1-B11)
- Role-scoped home screens and navigation
- Filtered views of leads, campaigns, and creators
- Personal tools: payments, targets, profile, reminders

### Influencer Portal (C1-C12)
- Onboarding flow and personalized home screen
- Leads management and content planner
- AI-assisted content generation
- Profile levels and earnings dashboard

## Scale Target

- 5,000+ agencies
- 30,000+ creators
- Multi-tenant shared database architecture

## Contributing

This is an internal project. See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

All contributors must be authorized Yunto team members.

## Security

See [SECURITY.md](./SECURITY.md) for reporting security vulnerabilities.

## License

This is proprietary software. All rights reserved. Unauthorized copying, distribution, or use is strictly prohibited. See [LICENSE](./LICENSE) for details.

---

<div align="center">
&copy; 2026 Yunto. All rights reserved.
</div>
