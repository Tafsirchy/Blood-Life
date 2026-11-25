# 🔐 BLOOD&LIFE — Authentication & Authorization Security Audit Report

**Audit Date:** 2026-11-25  
**Scope:** End-to-end Authentication, Session Management, Authorization, Input/Injection Defense, Rate Limiting, Infrastructure Headers, Secrets Hygiene, and Dependencies.  
**Dependency Scan (`npm audit`):** `0 vulnerabilities` found across all installed packages.  
**Git History Scan:** Only `.env.example` committed; `.env` / `.env.local` properly ignored in `.gitignore` and absent from git history.

---

## 1. Phase 0 — System Recon & Auth Architecture

### 1.1 Technology Stack & Auth Strategy
* **Framework:** Next.js 16.4.6 (App Router + Turbopack) on React 19.3.0 & TypeScript 5
* **Database:** MongoDB via Mongoose 9.12.2 (`src/lib/db.ts`)
* **Auth Mechanism:** Custom JWT sessions (`jose` 6.2.18, `HS256`) stored in `httpOnly` cookie `blood_lagbe_session` (7-day expiry) with DB-backed `tokenVersion` revocation (`getValidatedSession`)
* **Password Hashing:** `bcryptjs` (cost factor 12)
* **OTP / Recovery Tokens:** Node `crypto.randomInt` (6-digit email OTP, 15m expiry) & `crypto.randomBytes(32)` (password reset token, 30m expiry), SHA-256 hashed in MongoDB
* **Validation & Middleware:** `zod` schemas + `src/middleware.ts` (security headers, 2MB payload limit, CSRF Origin guard, `/dashboard` JWT + email-verification + role guard)
* **Rate Limiting:** `src/lib/security/rateLimiter.ts` (in-memory bucket; Upstash Redis env vars declared but previously unwired)
* **OAuth:** Not present (email + password only)

### 1.2 Auth-Related File Inventory
* **Session & JWT:** `src/lib/auth/jwt.ts`, `src/lib/auth/session.ts`, `src/middleware.ts`, `src/lib/env.ts`
* **Auth API Routes:** `src/app/api/auth/register/route.ts`, `verify-email/route.ts`, `resend-verification/route.ts`, `login/route.ts`, `logout/route.ts`, `me/route.ts`, `forgot-password/route.ts`, `reset-password/route.ts`, `change-password/route.ts`
* **Protected/Role-Gated APIs:** `users/profile/route.ts`, `admin/users/route.ts`, `admin/users/[id]/route.ts`, `admin/logs/route.ts`, `requests/*`, `donors/*`, `donations/*`, `fraud/*`, `hospitals/inventory/*`, `notifications/*`, `cron/*`
* **Models:** `src/models/User.ts` (`select: false` on password, OTP & reset tokens), `AuditLog.ts`, `DonorRegistration.ts`
* **Client Auth Pages:** `src/app/auth/login/page.tsx`, `register/page.tsx`, `verify-email/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `src/app/dashboard/layout.tsx`, `src/components/layout/Navbar.tsx`

### 1.3 Auth Lifecycle Flow Diagram
```text
[Client /register] ──POST──▶ /api/auth/register (Zod + RateLimit + bcrypt(12) + crypto OTP)
                                │ (no cookie issued; isEmailVerified=false)
                                ▼
[Client /verify-email] ─POST─▶ /api/auth/verify-email (RateLimit + SHA-256 OTP match + 15m TTL)
                                │ (sets isEmailVerified=true, clears OTP, signs HS256 JWT)
                                ▼
                         httpOnly Cookie: blood_lagbe_session (7d)
                                │
[Client /login] ───────POST──▶ /api/auth/login (IP+Account RateLimit + bcrypt + JWT)
                                │
                                ▼
[Protected Route] ──▶ middleware.ts (CSP/HSTS/CSRF + JWT verify + role check for /dashboard)
                        │
                        ▼
                     API Route Handler ──▶ getValidatedSession() (checks DB status & tokenVersion)
                                │
[Password Reset/Change] ───────┴──▶ Increments User.tokenVersion (revokes old JWTs)
[Logout] ────────────POST──▶ /api/auth/logout (clears cookie; needs tokenVersion revocation)
```

---

## 2. What Is Already Done Well
* `bcryptjs` cost factor **12** used consistently (`register`, `reset-password`, `change-password`, `admin/users`).
* Sensitive fields (`password`, `emailVerificationToken`, `emailVerificationExpires`, `resetPasswordToken`, `resetPasswordExpires`) marked `select: false` in `UserSchema`.
* `jose` `jwtVerify` restricts allowed algorithms strictly to `["HS256"]` (prevents `alg: none` and RS256/HS256 algorithm confusion).
* JWT stored in `httpOnly` cookie (not `localStorage`), preventing XSS token theft.
* Production fails closed when `AUTH_SECRET` is missing or `< 32` chars (`src/lib/auth/jwt.ts`).
* Cryptographic `crypto.randomInt` / `crypto.randomBytes(32)` + SHA-256 DB hashing + short TTLs (15m OTP, 30m reset) + single-use clearing on OTP and password reset.
* `NEXT_PUBLIC_APP_URL` used for password reset and verification URLs instead of trusting `Host` header (no Host Header Injection).
* Zero `npm audit` vulnerabilities and zero `.env` / secret commits in git history.

---

## 3. Security Findings Table (Sorted by Severity)

| ID | Severity | Category | File:Line | Description | Exploit Scenario | Fix | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **High** | Session Revocation | `src/app/api/auth/logout/route.ts:4-12` | `POST /api/auth/logout` clears the browser cookie but does **not** increment `user.tokenVersion` server-side (nor match `secure`/`sameSite` cookie attributes). | An attacker or shared browser tab holding a copied `blood_lagbe_session` cookie retains API access for up to 7 days even after the victim clicks "Logout". | Validate current session in `logout`, increment `tokenVersion` on the `User` record to revoke all active JWTs server-side, match cookie flags, and add `Cache-Control: no-store`. | Fixed |
| **SEC-02** | **High** | Auth & Account Claim | `src/app/api/auth/register/route.ts:61-69`, `src/app/api/auth/verify-email/route.ts:53-70` | Passwordless donor records (`DonorRegistration` / `CommunityDonorSubmission`) can have their password overwritten and `isEmailVerified` set to `false` by an unauthenticated caller in `/register` before OTP proof; `verify-email` also omits `status !== "Blocked"` check before issuing JWT. | Attacker enters a passwordless donor's email on `/register` to lock/overwrite their pending credential, or a `Blocked` account completes OTP verification and receives an active JWT. | Reject `Blocked` accounts in both `register` and `verify-email`; block synthetic `@bloodlife.local` claims; enforce `status !== "Blocked"` before signing JWT in `verify-email`. | Fixed |
| **SEC-03** | **High** | Rate Limiter Persistence | `src/lib/security/rateLimiter.ts:1-86` | `rateLimiter.ts` claims to use Upstash Redis if configured, yet only uses an in-memory `Map` (`UPSTASH_REDIS_REST_URL`/`TOKEN` are never read). | Across serverless cold starts, multiple instances, or process restarts, login/OTP/password-reset brute-force counters reset completely. | Implemented Upstash Redis REST pipeline (`INCR` + `EXPIRE NX` + `PTTL`) in `checkRateLimit` with automatic in-memory fallback. *(Set `UPSTASH_REDIS_REST_URL`/`TOKEN` in production env.)* | Fixed (Env Needed in Prod) |
| **SEC-04** | **High** | Open Redirect | `src/app/auth/login/page.tsx:55-56` | `from.startsWith("/")` accepts protocol-relative URLs like `//attacker.com` or `/\attacker.com`. | Attacker sends `https://site.com/auth/login?from=//evil.com`; after login, victim is redirected to `https://evil.com` (phishing). | Added `sanitizeRedirectPath()` enforcing strict single-leading-slash relative path (`!startsWith("//") && !startsWith("/\\")`). | Fixed |
| **SEC-05** | **High** | Secrets in Logs | `src/app/api/auth/register/route.ts:115-123`, `src/app/api/auth/resend-verification/route.ts:69-77` | Plaintext 6-digit OTP verification codes and full 1-click verification URLs are logged unconditionally via `console.log`, even in production. | Anyone with access to production logs (hosting dashboard/log drain) can harvest live OTP codes and hijack newly registered or unverified accounts. | Restricted OTP debug output strictly to `NODE_ENV !== "production" && !RESEND_API_KEY`; removed token/URL stdout logging. | Fixed |
| **SEC-06** | **High** | CSRF Defense | `src/middleware.ts:38-62` | CSRF check only triggers `if (origin && host)`. Requests omitting `Origin` (or differing `x-forwarded-host`) bypass the origin check entirely. | Cross-site state-changing request from environments/proxies stripping `Origin` (with valid `Referer` from evil domain) is not blocked by middleware. | Added `Sec-Fetch-Site: cross-site` block, `Origin` allowlist check, and `Referer` fallback origin validation against `host`, `x-forwarded-host`, and `NEXT_PUBLIC_APP_URL`. | Fixed |
| **SEC-07** | **High** | Password Policy & DoS | `register/route.ts`, `reset-password/route.ts`, `change-password/route.ts`, `admin/users/route.ts`, `login/route.ts` | Password schemas lack a max length (`.max(72)`), risking bcrypt 72-byte silent truncation and CPU DoS on multi-MB payloads; common breached/trivial passwords are accepted. | Attacker submits huge passwords (`100KB+`) to spike bcrypt CPU time or registers with `"password123"` / `"12345678a"`. | Added shared `strongPasswordSchema` (8..72 chars + common weak password blocklist) across registration/reset/change/admin routes and `.max(128)` on login. | Fixed |
| **SEC-08** | **High** | Session Revocation Bypass | `src/app/api/requests/[id]/route.ts:46,86` | `GET /api/requests/[id]` uses stateless `getServerSession()` instead of `getValidatedSession()`. | A `Blocked` user or user whose password was reset (`tokenVersion` incremented) can still fetch unmasked `requesterPhone` and `requesterEmail` until JWT expires. | Switched `GET /api/requests/[id]` to `getValidatedSession()` so blocked/revoked tokens cannot view unmasked contact details. | Fixed |
| **SEC-09** | **Medium** | Fail-Open Validation | `src/lib/auth/session.ts:56-59` | `getValidatedSession()` catches DB errors and falls back to `return session` (fail-open). | During a transient DB outage or forced timeout, revoked or blocked JWTs are accepted by protected endpoints. | Changed catch block to fail closed (`return null;`). | Fixed |
| **SEC-10** | **Medium** | Enumeration & Rate Limits | `resend-verification/route.ts`, `reset-password/route.ts`, `change-password/route.ts`, `forgot-password/route.ts`, `login/route.ts` | (a) `resend-verification` returns `isEmailDelivered` only when unverified user exists; (b) `login` checks `status === "Blocked"` before `bcrypt.compare`; (c) `reset-password` & `change-password` lack rate limits; (d) `forgot-password` lacks per-email rate limit. | Attacker probes email existence/blocked status via response fields/status/timing, or brute-forces `currentPassword` / reset tokens, or email-bombs a target from rotating IPs. | Unified `resend-verification` response; added constant-time dummy `bcrypt.compare` before status checks in `login`; added IP/account rate limits to `reset-password`, `change-password`, and per-email limit on `forgot-password`. | Fixed |
| **SEC-11** | **Medium** | Production Info Leak & CSP | `middleware.ts`, `next.config.ts`, `donors/search/route.ts`, `requests/search/route.ts`, `requests/[id]/extend/route.ts`, `cron/*.ts`, `health/route.ts` | (a) Several `500` responses expose raw `error.message`; (b) CSP includes `'unsafe-eval'` in `script-src` even in production; (c) `next.config.ts` does not disable `X-Powered-By` or browser source maps. | Internal DB errors leak topology in production; `'unsafe-eval'` weakens XSS defense-in-depth. | Suppressed raw error `details` in production, removed `'unsafe-eval'` from production CSP, added `frame-ancestors 'none'`, `COOP`, `X-DNS-Prefetch-Control`, `poweredByHeader: false`, and `productionBrowserSourceMaps: false`. | Fixed |
| **SEC-12** | **Medium** | Client PII Cache & Auth Caching | `login/page.tsx`, `verify-email/page.tsx`, `auth/me/route.ts`, `Navbar.tsx` | Cached `user` object (including `email`) persists in `localStorage` and auth API responses lack `Cache-Control: no-store`. | Post-XSS residual PII exposure or stale proxy caching of authenticated session identity. | Stripped `email` from `login`/`verify-email` responses & `localStorage` cache; added `Cache-Control: no-store, private` to all `/api/auth/*` endpoints. | Fixed |
| **SEC-13** | **Low** | Env Fallback & `.env.example` | `src/lib/env.ts`, `src/lib/auth/jwt.ts`, `.env.example:27` | `env.ts` & `jwt.ts` included static fallback literal for `AUTH_SECRET`, and `.env.example` contained numeric `CLOUDINARY_API_KEY="594847938798817"`. | Developers copy-pasting defaults could accidentally reuse predictable strings if `NODE_ENV` is misconfigured. | Replaced static fallback literal with ephemeral dev-only CSPRNG fallback (`crypto.getRandomValues`), unified `AUTH_SECRET \|\| JWT_SECRET`, and replaced numeric key in `.env.example` with placeholder. | Fixed |

---

## 4. Remediation & Verification Log

* **TypeScript Verification:** `tsc --noEmit` exited with code `0` (0 errors).
* **Code Re-Scan (`2026-11-25`):**
  * Hardcoded fallback secret strings (`development_secret_key...`): `0` occurrences remaining.
  * Unconditional OTP `console.log` statements: `0` occurrences remaining.
  * Unvalidated `getServerSession()` usage on sensitive endpoints: `0` remaining (`requests/[id]` migrated to `getValidatedSession()`; only `logout` and `me` use `getServerSession`, with `me` verifying DB `status` & `tokenVersion`).
* **Automated Live Security Regression Suite (`node scripts/security-verify.mjs http://localhost:3000`):** **19/19 checks passed**:
  * NoSQL operator injection (`$ne`) on `/api/auth/login` blocked (`400`).
  * Unauthenticated access to admin/profile/password/screening/delete endpoints blocked (`401`/`403`) & `/dashboard` redirected (`307`).
  * Cross-origin CSRF (`Origin`, `Referer`, and `Sec-Fetch-Site: cross-site`) blocked (`403`).
  * Tampered JWT rejected on `/api/auth/me`, `/api/admin/users`, and `/dashboard/admin` with `Cache-Control: no-store, private`.
  * Weak common password (`password123`), >72-char bcrypt-DoS password, and invalid/reused reset tokens rejected (`400`).
  * All 7 security headers verified & `X-Powered-By` disabled.
  * Per-email forgot-password brute-force/bombing blocked (`429`).
* **Manual Actions Required for Production Deployment:**
  1. **Configure Upstash Redis:** Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in hosting env vars so rate limiting persists across serverless instances.
  2. **Production Secrets & Domain:** Generate and set distinct strong (64-char random) `AUTH_SECRET` and `CRON_SECRET`, set verified `NEXT_PUBLIC_APP_URL` and custom domain `EMAIL_FROM`, and rotate any dev credentials before go-live.
  3. **Edge HTTPS / HSTS:** Ensure hosting (Vercel/Cloudflare) forces HTTPS redirects and sets `Strict-Transport-Security` at the edge.
