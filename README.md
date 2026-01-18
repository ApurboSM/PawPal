# PawPal 🐾

PawPal is a pet adoption & care platform where users can:
- Browse and adopt pets
- Explore pet care resources
- Book appointments
- Manage emergency contacts & pet medical records
- Chat with other pet owners (WebSocket)

## Tech Stack
- **Frontend**: React + Vite + Tailwind + TanStack Query
- **Backend**: Node.js + Express + Passport sessions + WebSocket (`/ws`)
- **Database**: Neon Postgres (via Drizzle ORM) + Prisma (used by `/api/auth/*`)

## Repo Structure
- `apps/web`: Frontend app (Vite)
- `apps/api`: Backend API (Express)
- `packages/shared`: Shared schema/types (`@pawpal/shared/schema`)

## Prerequisites
- Node.js (recommended: 20+)
- npm
- A Neon Postgres database (or run without DB for local dev – API will fall back to in‑memory storage)

## Environment Variables (separated)

### Backend (`apps/api/.env`)
Create `apps/api/.env` (copy keys from `apps/api/env.example`):
- **`PORT`**: API port (default 5000)
- **`DATABASE_URL`**: Neon Postgres connection string (keep secret, never commit)
- **`SESSION_SECRET`**: Session cookie secret
- **`JWT_SECRET`**: JWT secret (used by some auth routes)

### Frontend (`apps/web/.env`)
Create `apps/web/.env` (copy from `apps/web/env.example`):
- **Only `VITE_*` variables go here.**

In development, the web app uses a Vite proxy so the UI can call:
- `GET/POST /api/...` (proxied to `http://localhost:5000`)
- `ws://.../ws` (proxied to the API WebSocket)

## Install (separate node_modules)
This repo is set up for separate installs per app:

```bash
npm run install:all
```

## Run (Dev)

```bash
npm run dev
```

Then open:
- Web: `http://localhost:5173`
- API: `http://localhost:5000`

## Build + Start (Production)

```bash
npm run build
npm run start
```

## Database Notes
- The backend reads **`DATABASE_URL`** from `apps/api/.env`.
- If `DATABASE_URL` is not set, the API falls back to in‑memory storage for local development.
- To push schema changes using Drizzle:

```bash
npm run db:push
```

## Security
- Do **not** commit `.env` files or database URLs.
- Use `env.example` files as templates.

