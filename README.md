# TaskFlow — Full-Stack Task Management System

A secure, production-ready task management system built with Next.js + Express.js.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma ORM |
| Auth | JWT (HttpOnly cookies) + Refresh token rotation |
| Drag & Drop | @dnd-kit |

---

## Project Structure

```
taskflow/
├── backend/               # Express.js API
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── routes/        # Route definitions
│   │   └── utils/         # Prisma client, JWT helpers
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── tsconfig.json
│
├── frontend/              # Next.js app
│   ├── app/               # App Router pages
│   │   ├── login/
│   │   ├── register/
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/            # Reusable components
│   │   ├── tasks/         # Task-specific components
│   │   └── layout/        # Navbar etc.
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # API client, auth context, utils
│   ├── types/             # TypeScript types
│   └── .env.example
│
├── PLAN.md                # Phase 1 architecture doc
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm 9+

### 1. Clone & install

```bash
git clone <your-repo-url>
cd taskflow
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — generate secrets with: openssl rand -base64 64

npm install

# Generate Prisma client and push schema to SQLite
npx prisma generate
npx prisma db push

# Start dev server (port 4000)
npm run dev
```

### 3. Frontend setup

```bash
cd ../frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000

npm install
npm run dev   # starts on port 3000
```

Open [http://localhost:3000](http://localhost:3000) — register an account and start adding tasks.

---

## API Reference

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account (name, email, password) |
| POST | `/auth/login` | Sign in, issues HttpOnly cookies |
| POST | `/auth/refresh` | Rotate refresh token silently |
| POST | `/auth/logout` | Revoke refresh token, clear cookies |
| GET | `/auth/me` | Get current user (requires auth) |

### Task Endpoints (all require auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List user's tasks (ordered) |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task (owner-only) |
| DELETE | `/tasks/:id` | Delete task (owner-only) |
| PUT | `/tasks/reorder` | Bulk reorder (novelty feature) |

---

## Security Architecture

- **JWT in HttpOnly cookies** — tokens are never accessible from JavaScript, eliminating XSS token theft
- **Refresh token rotation** — each refresh issues a new token pair; old tokens are invalidated
- **bcrypt (cost 12)** — password hashing with strong work factor
- **Rate limiting** — 5 req/min on auth endpoints, 60 req/min on task endpoints
- **Zod validation** — all input validated and sanitized server-side
- **Row-level authorization** — every task query includes `userId` check
- **Helmet** — security headers including HSTS, CSP, X-Frame-Options
- **CORS** — strict origin allowlist
- **No stack trace leaks** — production error handler strips internal details
- **Constant-time responses** — login returns same timing for invalid email vs invalid password
- **Content-Security-Policy** — set in both Next.js config and Express Helmet

---

## Deployment

### Backend → Render (or Railway)

1. Create a new Web Service pointing to `/backend`
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npm start`
4. Set environment variables (from `.env.example`) — use PostgreSQL URL for `DATABASE_URL`

### Frontend → Vercel

1. Import repository, set root to `/frontend`
2. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
3. Deploy

### Environment Variables

**Backend** (required in production):
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<64-char random string>
JWT_REFRESH_SECRET=<64-char random string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
PORT=4000
```

**Frontend**:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## Novelty Feature — Drag-and-Drop Reordering

Tasks can be reordered within the dashboard via drag-and-drop using `@dnd-kit`. Order is persisted per-user server-side via the `PUT /tasks/reorder` bulk-update endpoint with a Prisma transaction. Keyboard drag-and-drop is also supported for accessibility.

---

## Commit History Guide

Follow conventional commits:
```
feat: add refresh token rotation
fix: prevent task order drift on concurrent updates
security: add rate limiting to auth endpoints
chore: add prisma migration for task ordering
```
