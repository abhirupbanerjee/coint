# Cointelligence

A personal editorial and thought-leadership platform for Richard Ramdial built with Next.js 16, Payload CMS 3, PostgreSQL, and Traefik, deployed on Azure VMs.

## Technology Stack

- **Frontend**: Next.js 16.2.4 with App Router
- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL 16
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Typography**: Fraunces (headings) + Inter (body)
- **Reverse Proxy**: Traefik v3 (TLS termination with Cloudflare Origin CA)
- **Containerization**: Docker + Docker Compose
- **Deployment**: Manual via GitHub Actions SSH
- **Auth**: Google OAuth + Payload CMS native authentication (email+password backup)

## Local Development

### Prerequisites

- Node.js 20.9.0 or later
- Docker and Docker Compose (optional)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```

3. **Start PostgreSQL (optional):**
   ```bash
   docker run --name cointelligence-db \
     -e POSTGRES_USER=cointelligence \
     -e POSTGRES_PASSWORD=local-password \
     -e POSTGRES_DB=cointelligence \
     -p 5432:5432 -d postgres:16
   ```

4. **Push schema to DB:**
   ```bash
   npm run db:push
   ```

5. **Configure admin users in `.env.local`:**
   ```bash
   ADMIN_EMAILS=your-email@example.com
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

6. **Start dev server:**
   ```bash
   npm run dev
   ```

## Azure VM Setup

### Prerequisites

- Azure account
- Domain name

### Steps

1. **Provision VM:**
   - OS: Ubuntu 22.04 LTS
   - Ports: 80, 443 open
   - Note the public IP

2. **Install Docker:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Set up SSH key:**
   ```bash
   # On local machine, generate if needed:
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""
   
   # Copy to VM:
   ssh-copy-id -i ~/.ssh/deploy_key azureuser@<VM_IP>
   ```

4. **Clone on VM:**
   ```bash
   cd ~
   git clone https://github.com/richardramdial/cointelligence.git
   cd cointelligence
   ```

5. **Create `.env` on VM (never committed):**
   ```bash
   cat > .env << 'EOF'
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   POSTGRES_USER=cointelligence
   POSTGRES_PASSWORD=your-strong-password
   POSTGRES_DB=cointelligence
   DATABASE_URI=postgresql://cointelligence:your-strong-password@db:5432/cointelligence
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ADMIN_EMAILS=richard@example.com
   SITE_HOST=yourdomain.com
   EOF
   ```

6. **Configure Cloudflare + Origin Certificate:**
   - Point domain DNS `A` record to VM IP and keep it proxied (orange cloud)
   - In Cloudflare SSL/TLS settings, set mode to **Full (Strict)**
   - Generate a Cloudflare Origin CA certificate for `yourdomain.com` and `*.yourdomain.com`
   - Save cert/key on the VM:
   ```bash
   mkdir -p ~/cointelligence/traefik/certs
   chmod 700 ~/cointelligence/traefik/certs
   # Paste certificate and key from Cloudflare dashboard:
   nano ~/cointelligence/traefik/certs/origin.crt
   nano ~/cointelligence/traefik/certs/origin.key
   chmod 600 ~/cointelligence/traefik/certs/origin.key
   chmod 644 ~/cointelligence/traefik/certs/origin.crt
   ```
   - Traefik mounts the entire `traefik/certs` directory as `/certs`, so both files must exist with those exact names.

7. **Start services:**
   ```bash
   docker compose pull
   docker compose up -d
   ```

8. **Initialize DB schema (first deploy only):**
   ```bash
   docker compose exec app npm run db:push
   ```

9. **Add GitHub Actions secrets:**
   - Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Add:
     - `SSH_PRIVATE_KEY`: Your deploy private key
     - `VM_HOST`: VM IP or hostname
     - `VM_USER`: SSH user (typically `azureuser`)

10. **Set up Google OAuth (on VM `.env`):**
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project (or use existing)
    - Enable **Google+ API**
    - Create **OAuth 2.0 credentials** (Web application type)
    - Add **Authorized redirect URIs**:
      - `https://yourdomain.com/api/auth/callback/google`
    - Copy **Client ID** and **Client Secret**
    - Add to `.env` on VM:
      ```
      GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
      GOOGLE_CLIENT_SECRET=your-client-secret
      NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
      NEXTAUTH_URL=https://yourdomain.com
      ```

## Deployment

### Via GitHub Actions

1. Go to repo → **Actions** → **Manual Deploy to Azure VM**
2. Click **Run workflow**
3. Workflow will pull latest code and Docker images, then redeploy and run migrations

### Via SSH

```bash
ssh -i ~/.ssh/deploy_key azureuser@<VM_IP>
cd ~/cointelligence
git pull origin main
docker compose pull
docker compose up -d
```

## Admin Panel

- Local: `http://localhost:3000/admin`
- Production: `https://yourdomain.com/admin`

## Verification

- [ ] Navigate to `https://<domain>/admin`
- [ ] Log in with Google (must be in `ADMIN_EMAILS`)
- [ ] Create a test article and publish it
- [ ] Verify it appears at `/articles/slug`
- [ ] Upload a test image to Media library, copy URL
- [ ] Restart: `docker compose restart app`
- [ ] Verify image persists (media volume working)
- [ ] Check all services: `docker compose ps`

## Key Notes

- **`.env` stays on VM only** — never in git
- **Secrets not in GitHub** — in `.env` on VM
- **Manual deployment** via workflow dispatch or SSH
- **Migrations run on startup** automatically
- **Traefik** uses Cloudflare Origin CA cert files at `traefik/certs/origin.crt` and `traefik/certs/origin.key`

## Documentation

- [Implementation Plan](docs/implementation-plan.md)
- [Design & Requirements](docs/design-and-requirements.md)
- [Architecture](docs/architecture.md)
- [Phase 1 Summary](docs/phase-1-summary.md)
- [Local Tests Summary](docs/local-tests-summary.md)

## License

MIT
