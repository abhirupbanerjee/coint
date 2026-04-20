# Google OAuth Environment Variables — Azure VM Validation

**Purpose:** Verify that the Next.js app will correctly read Google OAuth environment variables from the `.env` file on the Azure VM.

---

## How Environment Variables Are Read

### Local Development (`npm run dev`)
- Next.js loads from `.env.local` (via next dev)
- Environment variables are available to server-side code via `process.env`
- Frontend code can access `NEXT_PUBLIC_*` variables

### Docker Container (Azure VM)
- `docker-compose.yml` includes `env_file: .env` (line 30 of `app` service)
- When the container starts, Docker reads the VM's `.env` file and injects all variables into the container's environment
- The Node.js process inside sees all variables via `process.env`

---

## Verification Checklist

### ✅ Docker Compose Configuration
```yaml
app:
  image: ghcr.io/richardramdial/cointelligence:latest
  env_file: .env          # ← Reads .env from host VM (current working directory)
  environment:
    HOSTNAME: "0.0.0.0"   # Additional env vars
```

**Result:** `docker-compose.yml` correctly specifies `env_file: .env`, which tells Docker to load all variables from the `.env` file in the same directory where `docker compose up -d` is run (the VM home directory or cointelligence project root).

### ✅ NextAuth Route Access
File: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || '',      // ✓ Will read from .env
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '', // ✓ Will read from .env
  }),
],
secret: process.env.NEXTAUTH_SECRET,                   // ✓ Will read from .env
```

**Result:** The NextAuth route reads all OAuth variables via `process.env`, which are injected by Docker from the `.env` file.

### ✅ Custom Auth Callback
File: `src/app/api/auth/callback/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  // Uses getPayload(), which reads DATABASE_URI and PAYLOAD_SECRET from process.env
  // ✓ Both variables come from .env via Docker
}
```

**Result:** Payload reads database credentials from `process.env`, which are provided by the `.env` file through Docker's `env_file` setting.

### ✅ Frontend Access to Public Variables
File: `src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  openGraph: {
    url: process.env.NEXT_PUBLIC_SITE_URL, // ✓ Available in metadata generation
  },
}
```

**Result:** `NEXT_PUBLIC_*` variables are embedded at build time and also available at runtime via `process.env` in server components.

---

## Required `.env` Variables on Azure VM

The following variables **must** be present in `~/.env` on the Azure VM for Google OAuth to work:

```bash
# ======== REQUIRED FOR GOOGLE OAUTH ========
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# ======== ALSO REQUIRED FOR APP TO RUN ========
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
PAYLOAD_SECRET=your-payload-secret
POSTGRES_USER=cointelligence
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=cointelligence
DATABASE_URI=postgresql://cointelligence:password@db:5432/cointelligence
PAYLOAD_PUBLIC_UPLOAD_DIR=/app/media
ACME_EMAIL=your-email@example.com
```

---

## Troubleshooting

### Issue: "GOOGLE_CLIENT_ID is undefined"
**Cause:** The variable is not in `.env` on the VM, or `docker compose up -d` was run from the wrong directory.

**Solution:**
```bash
# Verify .env exists in current directory
ls -la ~/.env

# Verify .env contains GOOGLE_CLIENT_ID
grep GOOGLE_CLIENT_ID ~/.env

# Restart containers to reload .env
docker compose restart app
```

### Issue: "Environment variable not available in container"
**Cause:** The variable name is misspelled in `.env`, or the container was started before `.env` was created.

**Solution:**
```bash
# Check what variables are loaded in the running container
docker compose exec app env | grep GOOGLE

# If missing, stop and restart
docker compose down
docker compose up -d

# Verify in the container
docker compose exec app env | grep NEXTAUTH
```

### Issue: "NEXTAUTH_URL mismatch"
**Cause:** The `NEXTAUTH_URL` in `.env` doesn't match the actual domain or Traefik routing rule.

**Solution:**
- Ensure `NEXTAUTH_URL` is the exact domain (e.g., `https://cointelligence.example.com`)
- Ensure DNS A record points to the VM
- Ensure Traefik is routing correctly: `docker compose logs traefik | grep cointelligence`

---

## How to Test OAuth on the VM

### 1. SSH into the VM
```bash
ssh azureuser@<VM_IP>
cd ~/cointelligence
```

### 2. Verify `.env` is present and complete
```bash
cat .env | grep -E "GOOGLE|NEXTAUTH"
```

### 3. Check that containers are running
```bash
docker compose ps
```

Output should show `app`, `db`, and `traefik` all with status `Up`.

### 4. Test OAuth endpoint
```bash
# Inside the container, verify the OAuth route can load
docker compose exec app curl -s http://localhost:3000/api/auth/signin | head -20

# Should return HTML (the sign-in page), not an error
```

### 5. Test via browser
```bash
# From your local machine
curl -I https://yourdomain.com/admin/login

# Should return HTTP 200 (OK), not 400 or 500
```

### 6. Tail the app logs while attempting to sign in
```bash
docker compose logs -f app | grep -i "auth\|nextauth\|google"
```

### 7. Full sign-in test
- Navigate to `https://yourdomain.com/admin`
- Click "Sign in with Google"
- You should be redirected to Google's login
- After successful Google login, you should be redirected to the admin dashboard

---

## Summary

✅ **Docker Compose is configured correctly to read `.env`**  
✅ **NextAuth and Payload are configured to read from `process.env`**  
✅ **Environment variables will be available in the container**

**The only requirement is that Richard creates a valid `.env` file on the Azure VM with all required variables before running `docker compose up -d`.**

See the README.md section "Set up Google OAuth" for step-by-step instructions.
