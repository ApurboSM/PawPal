# PawPal

**PawPal** is a pet adoption and care platform that helps people find companions, learn how to care for them, and stay organized—from browsing adoptable pets to booking visits and keeping health records in one place.

Built by [S. M. Apurbo](https://smapurbo.com).

---

## What you can do

- **Adopt** — Browse pets, view profiles, and submit adoption applications
- **Learn** — Explore articles and resources on pet care and wellness
- **Plan** — Schedule meet-and-greet and vet appointments
- **Stay prepared** — Store emergency contacts and pet medical records
- **Connect** — Real-time chat with other pet owners

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Web** | React, Vite, Tailwind CSS, TanStack Query |
| **API** | Node.js, Express, Passport sessions, WebSocket |
| **Data** | Neon Postgres, Drizzle ORM, Prisma (auth routes) |

**Monorepo layout:** `apps/web` (frontend), `apps/api` (backend), `packages/shared` (shared types and schema).

---

## Development

### Prerequisites

- Node.js 20+
- npm
- Neon Postgres (optional for local dev—the API can use in-memory storage without `DATABASE_URL`)

### Environment

Copy the example env files and fill in secrets locally—never commit `.env` files.

| App | File | Notes |
|-----|------|--------|
| API | `apps/api/.env` | `PORT`, `DATABASE_URL`, `SESSION_SECRET`, `JWT_SECRET` — see `apps/api/env.example` |
| Web | `apps/web/.env` | Only `VITE_*` variables — see `apps/web/env.example` |

In development, Vite proxies `/api` and `/ws` to the API on port 5000.

### Commands

```bash
# Install dependencies (web + api)
npm run install:all

# Run web + API in dev mode
npm run dev
```

- Web: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:5000](http://localhost:5000)

```bash
# Production build and start
npm run build
npm run start

# Push Drizzle schema (requires DATABASE_URL in apps/api/.env)
npm run db:push

# Seed sample data (pets, records, appointments, resources, etc.)
npm run seed
```

---

## Security

Do not commit `.env` files, database URLs, or other secrets. Use the `env.example` files as templates only.

---

## License

**All rights reserved.**

Copyright © 2026 [S. M. Apurbo](https://smapurbo.com).

This repository and its contents are proprietary. You may not copy, modify, distribute, sublicense, or use any part of this project without prior written permission from the copyright holder.
