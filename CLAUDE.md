# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CaffeineOperator (Terminal Coffee) — a full-stack coffee ordering platform. Users order via CLI or SSH TUI, shops manage orders via web dashboard. Payments via Razorpay, notifications via Telegram.

**Production domain**: caffeineoperator.online

## Monorepo Structure

Four independent npm projects, no shared workspace:

- **backend/** — Node.js/Express REST API (port 5000), ES modules, no build step
- **cli/** — Commander.js CLI tool (`coffee` command), ES modules
- **ssh-server/** — SSH-based TUI (ssh2, port 2222), ES modules
- **web/** — Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 (port 3001)

Each has its own `package.json`. Run `npm install` in each directory independently.

## Common Commands

### Backend
```bash
cd backend && npm run dev    # Node --watch on port 5000
cd backend && npm start      # Production
```

### CLI
```bash
cd cli && npm install && npm link   # Install globally as `coffee`
coffee login --username <name>      # Test CLI
```

### SSH Server
```bash
cd ssh-server && npm run dev      # Node --watch on port 2222
cd ssh-server && npm run keygen   # Generate SSH host key
```

### Web
```bash
cd web && npm run dev     # Dev server on port 3001
cd web && npm run build   # Production build
cd web && npm run lint    # ESLint
```

### Docker (full stack)
```bash
docker compose up -d              # Start all services
docker compose up --build         # Rebuild and start
./scripts/deploy.sh [service]     # Deploy with git pull + rebuild
```

## Architecture

### Authentication
Stateless UUID tokens (`crypto.randomUUID()`). Token stored in `User.token` field. CLI saves token to `~/.coffee-config.json`. Three auth middleware: `auth.js` (user), `shopAuth.js`, `adminAuth.js` — all use Bearer token header.

### Payment Flow
Order created (`pending_payment`) → Razorpay payment link generated → user pays → Razorpay webhook (`/webhook/razorpay`, HMAC-SHA256 verified) updates status to `paid` → Telegram notification to shop → shop accepts/rejects via Telegram bot callback (`/webhook/telegram`).

### Geolocation
MongoDB 2dsphere indexes on Shop model. Users have GeoJSON Point locations. SSH server detects location from client IP. Fallback coordinates: Bangalore (12.9716, 77.5946).

### Nginx Routing
`/api/*` proxied to backend:5000 (prefix stripped), `/*` to web:3001.

### Web App Sections
- `/` — Landing page (marketing)
- `/dashboard/*` — Shop owner dashboard (login, orders, menu, stats, settings)
- `/admin/*` — Admin dashboard (users, orders, shops, payments)
- `/onboard/*` — Shop onboarding flow

## Important Notes

- **No test suite exists** — no automated tests in any subproject.
- **Next.js 16 has breaking changes** — read `web/node_modules/next/dist/docs/` before modifying web code. Do not assume Next.js conventions from earlier versions.
- Backend and SSH server are plain JavaScript with ES modules (`"type": "module"`). Web is TypeScript.
- The CLI `--json` flag outputs machine-readable JSON and suppresses the ASCII banner.
- Shop menus are customizable per-shop (not just the hardcoded defaults in `backend/config/menu.js`).
