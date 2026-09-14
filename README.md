# Retzetar MVP

Retzetar helps people discover recipes, track pantry stock, save favorites, and turn a recipe's missing ingredients into a shopping cart.

## Architecture

This repository is an npm-workspaces monorepo:

- `apps/api` — NestJS 12 on Fastify, Better Auth cookie sessions, Zod request/config validation, Swagger, and Drizzle ORM on PostgreSQL.
- `apps/web` — React 19 and Vite, React Router, TanStack Query, Zustand workflow state, Better Auth client, and Tailwind CSS v4.

The API uses text IDs for Better Auth users and UUIDs for application entities. User-owned queries are guarded by a Better Auth session and scoped by user ID. Dashboard widgets are programmatic: the API validates stored widget types/settings against its registry, while Zustand holds only the editable layout draft before the authenticated API persists it. The web app renders only entries in its own component registry.

## Prerequisites

- Node.js 24.15+
- npm
- PostgreSQL

PostgreSQL is required at runtime. Docker is an optional way to run it on machines where Docker is installed, but Docker is unavailable in this environment. No Compose file is required for the MVP.

## Setup

1. Install dependencies from the repository root: `npm install`.
2. Copy `.env.example` to `apps/api/.env` and replace the development secret and database URL. A root `.env` also works for the API server, but Drizzle commands should use `apps/api/.env` or an exported `DATABASE_URL`.
3. Create the PostgreSQL database.
4. Apply the schema with `npm run db:push` for local development, or generate and apply migrations with `npm run db:generate` then `npm run db:migrate`.
5. Run `npm run db:seed` to add two development recipes and their canonical ingredients.
6. Run `npm run dev:api` and `npm run dev:web` in separate terminals.

The web app defaults to `http://localhost:3000` for the API. Put `VITE_API_URL` in `apps/web/.env` when the API uses a different origin.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLIENT_ORIGIN` | Yes | Exact browser origin allowed by CORS and Better Auth |
| `BETTER_AUTH_SECRET` | Yes | Authentication secret, at least 32 characters |
| `BETTER_AUTH_URL` | Yes | Public API origin used for authentication URLs and cookies |
| `PORT` | No | API port; defaults to `3000` |
| `VITE_API_URL` | No | Browser-visible API origin; defaults to `http://localhost:3000` |

## Commands

- `npm run dev:api` / `npm run dev:web` — start development servers
- `npm test` — API Jest and web Vitest suites (no PostgreSQL needed)
- `npm run build` — build both workspaces
- `npm run lint` — lint both workspaces
- `npm run format` — format source files
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:migrate` — apply generated migrations
- `npm run db:push` — push the schema in local development
- `npm run db:seed` — idempotently add development recipes and ingredients
- `npm run test:e2e --workspace=@retzetar/api` — Fastify health smoke test

Swagger UI is available at `http://localhost:3000/api/docs`; health is at `/api/health`; Better Auth is mounted below `/api/auth/*`.

## MVP scope

Included: email/password authentication, editable basic profile and dietary preferences, public recipe discovery/details, canonical ingredient lookup, pantry CRUD API (add/list/update/remove; add/remove UI), favorites, validated dashboard widgets, carts, and pantry-aware recipe-to-cart calculations.

Not included: recipe authoring, unit conversion, grocery-provider integrations, social login, email delivery, collaborative carts, or production deployment infrastructure.
