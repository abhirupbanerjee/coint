# Cointelligence

Cointelligence is an editorial and thought-leadership platform for Richard Ramdial.

It runs as a single Next.js 16 app with:
- Public website routes (`/`, `/articles`, `/about`, `/work`, `/connect`, `/co-intelligence`)
- A custom admin dashboard (`/admin`) for content operations
- PostgreSQL 16 + Drizzle ORM for data
- Traefik + Docker Compose for production routing and TLS

## Architecture Update (Important)

Payload CMS has been removed.

The project now uses:
- Drizzle ORM schema and SQL tables in [`lib/schema.ts`](lib/schema.ts)
- Custom admin APIs in `src/app/api/admin/*`
- Custom admin UI in `src/app/(admin)/admin/*`
- TipTap-based rich text editing in [`src/components/admin/TipTapEditor.tsx`](src/components/admin/TipTapEditor.tsx)

## Technology Stack

- Frontend: Next.js 16.2.4 (App Router), React 19
- Admin Auth: NextAuth (Google OAuth) restricted by `ADMIN_EMAILS`
- Database: PostgreSQL 16
- ORM: Drizzle ORM + Drizzle Kit
- Rich Text Editor: TipTap
- Styling: Tailwind CSS v4
- Reverse Proxy: Traefik v3
- Deployment: Docker + Docker Compose on Azure VM

## Content Model

Main tables are defined in [`lib/schema.ts`](lib/schema.ts):
- `articles`
- `site_settings`
- `home_page`
- `about_page`
- `work_page`
- `co_intelligence_page`
- `contact_submissions`
- `media`

## Local Development

### Prerequisites

- Node.js 20+
- Docker (recommended for local PostgreSQL)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy env file:
   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` for local development:
   - Set `NEXTAUTH_URL=http://localhost:3000`
   - Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - Set `DATABASE_URI=postgresql://cointelligence:local-password@localhost:5432/cointelligence`
   - Set Google OAuth and `ADMIN_EMAILS`

4. Start PostgreSQL locally:
   ```bash
   docker run --name cointelligence-db \
     -e POSTGRES_USER=cointelligence \
     -e POSTGRES_PASSWORD=local-password \
     -e POSTGRES_DB=cointelligence \
     -p 5432:5432 -d postgres:16
   ```

5. Push schema:
   ```bash
   npm run db:push
   ```

6. Start dev server:
   ```bash
   npm run dev
   ```

### Local URLs

- Site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`
- Admin dashboard: `http://localhost:3000/admin`

## Environment Variables

See [`.env.example`](.env.example) for the full template.

Core variables:
- `DATABASE_URI`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_SITE_URL`
- `SITE_HOST`
- `MEDIA_DIR` (optional, defaults to `/app/media`)

## Admin and Editing

- Admin routes are protected in [`src/middleware.ts`](src/middleware.ts)
- Auth configuration is in [`lib/auth.ts`](lib/auth.ts)
- Article and page HTML is sanitized server-side before save
- TipTap editor supports:
  - Headings, lists, quotes, links
  - Images
  - YouTube embeds
  - Twitter/X embed placeholders

## Media Storage

- Upload API: `POST /api/admin/media`
- Files are written to `MEDIA_DIR` (default `/app/media`)
- In production, Docker Compose mounts `/app/media` to `media_data` volume
- Public media is served from `/media/*` via rewrite to `api/media-serve`

## Deployment (Azure VM + Docker Compose)

1. Clone repository:
   ```bash
   git clone https://github.com/abhirupbanerjee/coint.git
   cd coint
   ```

2. Create `.env` from `.env.example` and fill production values.

3. Configure Cloudflare Origin CA certificates:
   - `traefik/certs/origin.crt`
   - `traefik/certs/origin.key`

4. Start services:
   ```bash
   docker compose pull
   docker compose up -d
   ```

5. Initialize/update schema:
   ```bash
   docker compose exec app npm run db:push
   ```

## Verification Checklist

- Admin login works with an email listed in `ADMIN_EMAILS`
- Creating/updating an article from `/admin/articles` works
- Media upload in `/admin/media` works
- Article renders correctly at `/articles/[slug]`
- Containers healthy: `docker compose ps`

## Notes

- `.env` must never be committed.
- Some files in `docs/` are historical and may still reference Payload CMS; current implementation is Drizzle + custom admin.

## License

MIT
