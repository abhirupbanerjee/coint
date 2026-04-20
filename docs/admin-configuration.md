# Admin Configuration

Who can sign in to `/admin`, and how.

## Authentication method

**Google OAuth only.** There is no email/password login. The login page at [/admin/login](../src/app/(admin)/admin/login/page.tsx) renders a single "Continue with Google" button.

Auth is wired up in [lib/auth.ts](../lib/auth.ts) using NextAuth v4 with a single `GoogleProvider`. On successful Google sign-in, the `signIn` callback checks the returned email against the `ADMIN_EMAILS` allowlist. Emails not in the list are rejected with "Access denied".

## Environment variables

```bash
# Comma-separated allowlist of Google account emails permitted to reach /admin.
# Case-insensitive. Whitespace around each entry is trimmed.
ADMIN_EMAILS=richard@example.com,editor@example.com

# Google OAuth 2.0 credentials (Web application type).
# Authorized redirect URIs must include:
#   https://yourdomain.com/api/auth/callback/google
#   http://localhost:3000/api/auth/callback/google   (for local dev)
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...

# NextAuth JWT signing key. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=...

# Public base URL used by NextAuth for callbacks and by the app for OG/metadata.
# Must be reachable over HTTPS in production.
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

No seed script, no `ADMIN_PASSWORD`, no local user database for admins. Sessions are JWT (30-day max age, see [lib/auth.ts](../lib/auth.ts)).

## Adding or removing an admin

1. Edit `ADMIN_EMAILS` in `.env` on the host.
2. Restart the app: `docker compose restart app`.

Changes take effect on the next sign-in.

## Troubleshooting

**"Access denied. Your Google account is not authorised."** The Google email returned by OAuth is not in `ADMIN_EMAILS`. Confirm the email matches exactly (case-insensitive) and restart the app after editing `.env`.

**Redirect loop or "Configuration" error.** Usually `NEXTAUTH_URL` does not match the URL the browser is using, or the Google Cloud Console authorized redirect URIs do not include `<NEXTAUTH_URL>/api/auth/callback/google`.

**Sign-in succeeds but admin pages 401 or bounce to login.** Check `NEXTAUTH_SECRET` is set and identical across restarts — a rotated secret invalidates existing sessions.
