# ATRMS Frontend

Admin and dashboard UI for ATRMS. Built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **TanStack Query**, **TanStack Table**, **Axios**, **React Hook Form** + **Zod**, and **shadcn/ui** (Radix + Tailwind v4).

## Prerequisites

- **Node.js 24** (matches [`.github/workflows/frontend-ci.yml`](.github/workflows/frontend-ci.yml))
- **npm**
- **ATRMS API** running locally on **`http://127.0.0.1:8080`** (default upstream for dev)

## Install

```bash
npm ci
```

## Environment

Copy the template and adjust only if your backend host or port differs:

```bash
cp .env.local.template .env.local
```

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Browser / client Axios | Direct upstream URL used by the browser. Default `http://127.0.0.1:8080/api/v1` (requires backend CORS). |
| `API_BASE_URL` | Server Components, Server Actions, RSC prefetch | Direct upstream URL. Default `http://127.0.0.1:8080/api/v1`. |
| `NEXT_PUBLIC_APP_NAME` | UI branding | Default `ATRMS`. |

**How it fits together**

- The browser calls the backend directly using **`NEXT_PUBLIC_API_BASE_URL`**.
- Server-side code uses **`API_BASE_URL`** for direct calls (see [`lib/config/env.ts`](lib/config/env.ts), [`lib/api/client.ts`](lib/api/client.ts)).
- The client Axios instance attaches a **`Authorization: Bearer`** header from the session (HttpOnly cookies stay on the Next.js origin). The backend must allow CORS from the frontend origin and permit the `Authorization` header; credential cookies are not sent cross-origin.

Authoritative defaults: [`.env.local.template`](.env.local.template).

## Local development

1. Start the backend API on port **8080**.
2. Ensure `.env.local` exists (from the template above).
3. Run the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Turbopack is enabled via `next dev --turbopack`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run format` | Prettier on `**/*.{ts,tsx}` |

CI runs lint, typecheck, test, and build on pull requests and pushes to `main`.

## Project layout

- **`app/`** — App Router routes only (thin pages; layouts under `(auth)` and `(dashboard)`).
- **`features/`** — Domain modules (`api/`, `usecases/`, `ui/`, `schemas.ts`, …).
- **`components/`** — Shared UI (`ui/`, `layout/`, `shared/`, `data-table/`).
- **`lib/`** — API client, env, query keys, utilities.

**Conventions, stack versions, and agent/skill workflow:** see [`AGENTS.md`](AGENTS.md). Cursor rules under [`.cursor/rules/`](.cursor/rules/) expand routing and list-page patterns.

## UI components

shadcn/ui primitives live in `components/ui/`. Add registry components with the CLI when needed:

```bash
npx shadcn@latest add button
```

Import with the `@/` alias, e.g. `import { Button } from "@/components/ui/button"`.
