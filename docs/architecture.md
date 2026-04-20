# Cointelligence — Architecture Document

**Version:** 2.0  
**Date:** 2026-04-20  
**Status:** Updated to current implementation

---

## 1. Architecture Overview

Cointelligence is a single Next.js 16 application with:
- Public editorial site
- Custom admin dashboard
- PostgreSQL 16 persistence through Drizzle ORM

Payload CMS has been removed.

```
┌─────────────────────────────────────────────────────────┐
│                      Azure VM                           │
│                                                         │
│  ┌──────────┐    ┌─────────────────────────────────┐   │
│  │  Traefik │    │            app container         │   │
│  │  :80/443 │───▶│  Next.js 16 (frontend + admin)  │   │
│  │  (TLS)   │    │  Node.js 20, port 3000          │   │
│  └──────────┘    │  Drizzle + NextAuth + TipTap    │   │
│                  │  /app/media ──▶ media_data vol   │   │
│                  └───────────────┬──────────────────┘   │
│                                  │ DATABASE_URI          │
│                  ┌───────────────▼──────────────────┐   │
│                  │          db container            │   │
│                  │         PostgreSQL 16            │   │
│                  │ /var/lib/postgresql/data         │   │
│                  │       ──▶ postgres_data vol      │   │
│                  └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Application Layer

### 2.1 Route and Module Layout

Current high-level structure:

```
src/
├── app/
│   ├── (frontend)/                      # Public routes
│   │   ├── page.tsx                     # /
│   │   ├── articles/page.tsx            # /articles
│   │   ├── articles/[slug]/page.tsx     # /articles/[slug]
│   │   ├── about/page.tsx               # /about
│   │   ├── work/page.tsx                # /work
│   │   ├── connect/page.tsx             # /connect
│   │   └── co-intelligence/page.tsx     # /co-intelligence
│   ├── (admin)/admin/
│   │   ├── login/page.tsx               # /admin/login
│   │   └── (dashboard)/*                # /admin/* content management UI
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── admin/articles/*
│   │   ├── admin/globals
│   │   ├── admin/media
│   │   ├── admin/submissions
│   │   ├── contact
│   │   ├── likes/[slug]
│   │   └── media-serve/[...path]
│   └── middleware.ts
├── components/
│   ├── admin/TipTapEditor.tsx
│   └── ...
└── lib/
    ├── db.ts
    ├── schema.ts
    └── auth.ts
```

Note: `src/app/(payload)/admin/importMap.ts` remains as a no-op artifact and is not part of the active architecture.

### 2.2 Request Routing

```
Incoming request
       │
       ▼
 Traefik (TLS + host routing)
       │
       ▼
 Next.js router (port 3000)
       │
       ├─▶ /admin/*             → Custom admin UI
       ├─▶ /api/admin/*         → Admin APIs (session required)
       ├─▶ /api/auth/*          → NextAuth handlers
       ├─▶ /api/contact         → Public submission endpoint
       ├─▶ /api/likes/[slug]    → Public likes endpoint
       ├─▶ /media/*             → Rewrite to /api/media-serve/[...path]
       └─▶ Public pages         → Server-rendered routes
```

---

## 3. Rendering and Frontend Runtime

### 3.1 Rendering Strategy (Current)

Public content routes currently use dynamic rendering (`export const dynamic = 'force-dynamic'`) and read directly from PostgreSQL through Drizzle in server components.

This applies to:
- `/`
- `/articles`
- `/articles/[slug]`
- `/about`
- `/work`
- `/connect`
- `/co-intelligence`
- `sitemap.xml`

### 3.2 Metadata and Sharing

- Article pages generate Open Graph and Twitter metadata dynamically.
- Article pages include JSON-LD structured data (`@type: Article`).
- Stored Twitter placeholders are transformed into blockquotes at render time, and `platform.twitter.com/widgets.js` is loaded client-side to hydrate embeds.

---

## 4. Data Layer

### 4.1 Database Access

- Driver: `postgres` package
- ORM: Drizzle ORM
- Connection: `DATABASE_URI`
- Client init: `lib/db.ts` with `prepare: false`

### 4.2 Relational Model

Defined in `lib/schema.ts`:
- `articles`
- `site_settings`
- `home_page`
- `about_page`
- `work_page`
- `co_intelligence_page`
- `contact_submissions`
- `media`

### 4.3 Content Editing Model

- Article and page content is edited through custom `/admin` routes.
- Rich text editing is provided by TipTap (`components/admin/TipTapEditor.tsx`).
- HTML is sanitized server-side (`sanitize-html`) in admin write endpoints before persistence.
- Reading time is computed on article create/update in admin APIs.

### 4.4 Schema Management

Schema updates are applied with Drizzle Kit commands:
- `npm run db:push`
- `npm run db:studio`

No Payload migration system is part of the current stack.

---

## 5. Authentication and Authorization

### 5.1 Auth Stack

- NextAuth v4 (`next-auth`)
- Google OAuth provider
- JWT session strategy

### 5.2 Admin Access Control

- Allowed admins are configured through `ADMIN_EMAILS` (comma-separated).
- `signIn` callback validates OAuth email against this allowlist.
- Middleware guards `/admin/*` (except `/admin/login`) and redirects unauthenticated users to login.
- Admin API routes enforce auth via `getServerSession(authOptions)` and reject unauthorized requests with `401`.

### 5.3 Public vs Protected Surface

- Public: site pages, `/api/contact`, `/api/likes/[slug]`, `/media/*`
- Protected: `/admin/*` dashboards and `/api/admin/*`

---

## 6. Media Architecture

### 6.1 Upload and Metadata

- Upload endpoint: `POST /api/admin/media` (admin only)
- Files are written to `MEDIA_DIR` (default `/app/media`)
- File metadata is stored in `media` table

### 6.2 Serving

- Public URLs use `/media/<filename>`
- `next.config.ts` rewrites `/media/:path*` to `/api/media-serve/:path*`
- `api/media-serve` reads files from disk and sets content type/cache headers

### 6.3 Persistence

In Docker Compose, `/app/media` is backed by named volume `media_data`, preserving uploads across container restarts/redeploys.

---

## 7. Infrastructure and Deployment

### 7.1 Container Topology

`docker-compose.yml` defines:
- `traefik` (public ingress)
- `app` (Next.js runtime)
- `db` (PostgreSQL 16)

Networks:
- `web`: Traefik ↔ app
- `internal`: app ↔ db

Volumes:
- `postgres_data`
- `media_data`

### 7.2 TLS and Reverse Proxy

Traefik v3 terminates TLS using Cloudflare Origin certificate files mounted from:
- `traefik/certs/origin.crt`
- `traefik/certs/origin.key`

HTTP requests are redirected to HTTPS via `entryPoints.web` configuration.

### 7.3 App Build/Runtime

Dockerfile uses multi-stage build:
1. Build stage installs dependencies and runs `npm run build`.
2. Runtime stage runs `node .next/standalone/server.js` with `dumb-init`.

---

## 8. CI/CD Status

Current workflow: `.github/workflows/deploy.yml`
- Trigger: push to `main` or manual dispatch
- Deployment: SSH to VM, `git pull`, `docker compose pull`, `docker compose up -d`

Important drift:
- Workflow currently runs `docker compose exec -T app npm run payload migrate`.
- This command is a legacy Payload step and should be replaced with a Drizzle-based step (for example `npm run db:push`) or removed if schema is managed separately.

---

## 9. Security Posture (Current)

Implemented controls:
- Admin route/session enforcement via middleware + server-side session checks
- Admin email allowlist for OAuth sign-in
- Server-side HTML sanitization for rich content
- Media filename normalization and basic path-safety checks in media serving

Known gaps to evaluate later:
- No rate limiting on public submission/likes endpoints
- No CSRF hardening beyond default protections and same-site cookies
- No dedicated audit/event log for admin actions

---

## 10. Key Architectural Decisions

| Decision | Current Choice | Rationale |
|---|---|---|
| CMS approach | Custom admin + Drizzle | Full control, reduced external CMS complexity |
| Auth | NextAuth Google OAuth + allowlist | Simple admin access control with minimal credential surface |
| Data access | Server components + Drizzle queries | Direct typed access without separate API layer for reads |
| Rich text | TipTap + sanitized HTML storage | Flexible editing with controlled output |
| Media | Local volume-backed filesystem | Simple operational model for current scale |
| Deployment | Docker Compose on Azure VM | Low operational overhead for current phase |

---

## 11. Post-POC Recommendations

- Replace local media storage with object storage + CDN (Azure Blob + CDN)
- Add backup/restore automation for PostgreSQL and media volumes
- Add rate limiting to `/api/contact` and `/api/likes/[slug]`
- Remove stale Payload references from workflow/docs completely
- Add health checks and deployment gating for safer rollouts
