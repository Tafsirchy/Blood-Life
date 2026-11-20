# BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)
### National Emergency Blood Dispatch Network • জাতীয় জরুরী রক্তদান নেটওয়ার্ক

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6_Turbopack-black?style=flat&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Mongoose_9-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38BDF8?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

BLOOD&LIFE is a non-profit, life-saving digital blood logistics network built specifically for Bangladesh. It connects patients in critical need with compatible, voluntary, and biologically ready blood donors in real-time, eliminating middlemen and broker exploitation in hospital emergency wards.

---

## 🌟 Core Pillars & Capabilities

1. **Emergency SOS Transfusion Dispatch:**
   * Patients and hospital relatives broadcast emergency transfusion requests specifying blood group, bags needed, hospital location, and scheduled surgery deadline.
   * Automated urgency scoring (`critical` < 2 hrs, `urgent` < 6 hrs, `standard` < 24 hrs) with auto-expiration cron cleanup.

2. **Volunteer Medical Triage & Verification:**
   * Trained volunteer coordinators review hospital prescriptions and bed tickets before granting the **Verified Genuine** badge.
   * Fraudulent or broker requests are rejected with audit logging.

3. **Donor Privacy Shield & Masked Phone Contacts:**
   * Donor contact numbers are masked by default (`0171•• •••234`).
   * Contact disclosure requires authenticated login, enforces strict anti-scraping rate limits (3 views/hour for users, 25 for coordinators), and logs an immutable record in the `AuditLog` collection.
   * Donors receive an instant in-app security notification whenever their phone number is revealed.

4. **Biological 90-Day Cooldown Dial:**
   * Donors track their physiological recovery dial following blood donation.
   * System prevents donors from pledging blood during their 90-day medical interval.
   * An automated cron job (`/api/cron/cooldown-check`) activates donors upon completing day 90 and sends celebratory email and in-app notifications.

5. **Multi-Channel Real-Time Alert Engine:**
   * **In-App Notification Hub:** Real-time unread counter, localized bilingual alerts, and optimistic read updates.
   * **Web Push (VAPID):** Instant browser push notifications sent directly to matching donors within the same district and blood group.
   * **Telegram Emergency Dispatch:** Real-time alerts formatted and broadcast to volunteer Telegram community groups.
   * **Transactional Email (Resend):** UTF-8 responsive HTML templates with automatic plain-text fallbacks.

6. **Enterprise Authentication & Session Revocation:**
   * Stateless JWTs (`jose` HS256) stored in `httpOnly`, `sameSite: "lax"` secure cookies.
   * Global session revocation across all active devices via database-persisted `tokenVersion` increments upon password changes.
   * Timing-safe, enumeration-resistant password recovery with SHA-256 hashed single-use tokens.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)                  │
├──────────────────────────────┬──────────────────────────────┤
│ Frontend Cockpits & UI       │ Backend REST API Handlers    │
│ • Admin Command Center       │ • /api/auth/* (Auth & Reset) │
│ • Volunteer Triage Queue     │ • /api/requests/* (SOS)      │
│ • Requester SOS Cockpit      │ • /api/donors/* (Directory)  │
│ • Donor Health Dial          │ • /api/notifications/* (Bell)│
│ • Dual Search Feed & Filters │ • /api/cron/* (Automation)   │
├──────────────────────────────┴──────────────────────────────┤
│                      Security & Services                    │
│ • Jose JWT + Session Guard   • Resend Transactional Email   │
│ • Privacy Shield & RateLimit • Web-Push VAPID API           │
│ • MongoDB Atlas (Mongoose 9) • Telegram Volunteer Bot       │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Role Hierarchy & Access Matrix

| Role | Permissions |
| :--- | :--- |
| **Guest / Anonymous** | Browse active requests, search donor directory (masked phones), register as donor, initiate login. |
| **Donor** | View personal health dial, reveal contact numbers under rate limit, pledge to cases, update privacy toggles. |
| **Requester / Patient** | Post emergency SOS requests, manage active cases, track donor pledges, cancel requests. |
| **Volunteer** | Access volunteer triage desk, review prescription documents, approve (Verify) or reject cases. |
| **Admin** | Access Admin Command Center, manage user roles, suspend/activate accounts, broadcast alerts. |

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js:** v18.17.0 or later (v20+ recommended)
* **MongoDB Atlas:** Free M0 cluster or self-hosted MongoDB instance
* **Resend API Key:** For transactional emails ([resend.com](https://resend.com))

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and populate the required keys:

```bash
cp .env.example .env.local
```

```env
# MongoDB Atlas
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/blood-life?retryWrites=true&w=majority"

# Authentication Secrets (Generate 32+ characters)
AUTH_SECRET="your_secure_random_auth_secret_minimum_32_chars"
JWT_SECRET="your_secure_random_jwt_secret_minimum_32_chars"

# Public App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend Email API
RESEND_API_KEY="re_..."
EMAIL_FROM="BLOOD&LIFE Emergency <onboarding@resend.dev>"

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="B..."
VAPID_PRIVATE_KEY="..."
VAPID_EMAIL="mailto:contact@bloodandlife.org"

# Cron Secret
CRON_SECRET="your_secure_cron_dispatch_secret"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
# Or execute Next.js directly:
node ./node_modules/next/dist/bin/next dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> **Windows Path Workaround:** If working in a directory containing an ampersand (e.g. `D:\Blood&Life`), standard `npm run dev` may fail because `cmd.exe` interprets `&` as a command separator. Always run `node ./node_modules/next/dist/bin/next dev` directly.

---

## 🧪 Quality & Compilation Verification

Verify the entire codebase for TypeScript compiler safety:
```bash
node ./node_modules/typescript/bin/tsc --noEmit
# Expected output: Exit code 0 (Zero errors)
```

Test production build:
```bash
npm run build
```

---

## 🔒 Security Best Practices Implemented

* **Atomic Concurrency Control:** Blood pledges utilize MongoDB atomic `$inc` with optimistic locking conditions (`findOneAndUpdate`) to prevent race conditions during simultaneous pledges.
* **Timing-Safe Responses:** Forgot-password and resend-verification endpoints return identical generic responses regardless of whether the email exists in the database to prevent account enumeration.
* **Rate Limiting:** Sliding-window rate limiters protect registration (5/hr), login (10/15m), password resets (3/15m), and contact reveals (3/hr).
* **Automated DNS Fallback:** Internal database connection lifecycle invokes Google/Cloudflare public DNS servers (`8.8.8.8`, `1.1.1.1`) to resolve MongoDB Atlas SRV records reliably across all regional ISPs.

---

## 📄 License & Humanitarian Statement

This project is open-source under the **MIT License**. BLOOD&LIFE is strictly non-profit and dedicated to humanitarian health services. Commercialization of blood donations or charging fees to patients is strictly prohibited.
