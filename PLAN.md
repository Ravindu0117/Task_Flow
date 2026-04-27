# TaskFlow – Phase 1: Architecture & Planning

## Backend Choice: Express.js

**Justification:**  
Express.js was chosen for its minimal footprint, explicit control over middleware, and suitability for a focused REST API with well-understood security surface. NestJS adds excellent structure for large teams but introduces abstraction overhead and a steeper setup cost for a project of this scope. Next.js API Routes were considered but co-locating the backend risks coupling deployment concerns and limits independent scaling. Express gives us full control over request lifecycle, middleware ordering (critical for rate limiting and auth), and is battle-tested for JWT-secured REST APIs.

**Better Tech (if scaling):** For a production multi-tenant system, NestJS + PostgreSQL + Redis (for refresh token blocklist and rate-limit state) would be the upgrade path. GraphQL (via Apollo) could replace REST if the frontend query complexity grows.

---

## Architecture Overview

```
┌──────────────────────────────────┐
│         Next.js Frontend          │  (Vercel / Static CDN)
│  Pages: /login /register /tasks   │
│  Auth: HttpOnly cookie + CSRF     │
└─────────────────┬────────────────┘
                  │ HTTPS
┌─────────────────▼────────────────┐
│        Express.js REST API        │  (Railway / Render)
│  /auth/register  /auth/login      │
│  /auth/refresh   /auth/logout     │
│  /tasks  (CRUD, user-scoped)      │
└─────────────────┬────────────────┘
                  │
┌─────────────────▼────────────────┐
│          SQLite (dev)             │
│       PostgreSQL (prod)           │
│    Prisma ORM – type-safe         │
└──────────────────────────────────┘
```

**Key decisions:**
- JWT stored in **HttpOnly, Secure, SameSite=Strict** cookies (not localStorage) to eliminate XSS token theft
- Short-lived access token (15 min) + refresh token (7 days) rotation
- Prisma ORM for type-safe queries and easy migration to PostgreSQL

---

## Security Considerations

| Layer | Risk | Mitigation |
|-------|------|-----------|
| Auth | Brute-force login | `express-rate-limit` per IP on `/auth/*` (5 req/min) |
| Auth | Weak passwords stored plain | `bcrypt` (cost 12) |
| Auth | XSS token theft | JWT in HttpOnly cookie, never `localStorage` |
| Auth | CSRF attacks | `csurf` middleware + `SameSite=Strict` cookie |
| API | Mass assignment | Explicit DTO validation via `zod` |
| API | SQL injection | Prisma parameterized queries only |
| API | Unauthorized task access | Row-level `userId` check on every task query |
| API | Stack trace leaks | Global error handler strips traces in production |
| Frontend | XSS | React escapes by default; no `dangerouslySetInnerHTML` |
| Frontend | CSP | `next.config.js` `headers()` with strict Content-Security-Policy |
| Transport | Data in transit | HTTPS enforced; HSTS header set |
| Secrets | Leaked credentials | `.env` in `.gitignore`; `.env.example` committed |

---

## Novelty Feature

**Priority Levels + Drag-and-Drop Reordering** — Tasks have `priority` (low/medium/high) with visual indicators and can be reordered within the dashboard via drag-and-drop (`@dnd-kit`). Order is persisted per-user server-side.
