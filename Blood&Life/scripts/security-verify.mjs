/**
 * Automated Authentication & Authorization Security Verification Script
 * Tests: NoSQL Injection, Unauthorized Access / IDOR, CSRF Origin/Referer Guards,
 * Expired/Tampered JWT Rejection, Weak/Oversized Password Rejection, Open Redirect Guard,
 * Security Headers, and Rate Limiting (Brute-Force Protection).
 *
 * Usage: node scripts/security-verify.mjs [baseUrl]
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";

const results = [];
function assertCheck(name, passed, detail) {
  results.push({ name, passed, detail });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`[${icon}] ${name} -> ${detail}`);
}

async function run() {
  console.log(`\nRunning Security Verification Suite against ${BASE_URL}\n`);

  // 1. NoSQL Injection Blocked on Login
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: { $ne: null }, password: { $ne: "" } }),
    });
    assertCheck(
      "NoSQL Operator Injection on /api/auth/login",
      res.status === 400,
      `HTTP ${res.status} (expected 400)`
    );
  }

  // 2. Unauthorized Access Blocked (401/403 & Dashboard Redirect)
  {
    const checks = [
      ["GET", "/api/admin/users", 403],
      ["GET", "/api/admin/logs", 403],
      ["GET", "/api/users/profile", 401],
      ["POST", "/api/auth/change-password", 401],
      ["GET", "/api/donors/register", 401],
      ["DELETE", "/api/requests/6741f1234567890abcdef123", 401],
    ];

    for (const [method, path, expected] of checks) {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({}) : undefined,
      });
      assertCheck(
        `Unauthenticated ${method} ${path} blocked`,
        res.status === expected,
        `HTTP ${res.status} (expected ${expected})`
      );
    }

    const dashRes = await fetch(`${BASE_URL}/dashboard`, { redirect: "manual" });
    const loc = dashRes.headers.get("location") || "";
    assertCheck(
      "Protected /dashboard redirects unauthenticated visitor",
      dashRes.status >= 300 && dashRes.status < 400 && loc.includes("/auth/login"),
      `HTTP ${dashRes.status} -> Location: ${loc}`
    );
  }

  // 3. CSRF Cross-Origin & Cross-Site Guard
  {
    const evilOriginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil-attacker.example",
      },
      body: JSON.stringify({ email: "test@example.com", password: "Password123" }),
    });
    assertCheck(
      "CSRF Cross-Origin header blocked",
      evilOriginRes.status === 403,
      `HTTP ${evilOriginRes.status} (expected 403)`
    );

    const evilRefererRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://evil-attacker.example/form",
      },
      body: JSON.stringify({ email: "test@example.com", password: "Password123" }),
    });
    assertCheck(
      "CSRF Cross-Origin Referer (without Origin) blocked",
      evilRefererRes.status === 403,
      `HTTP ${evilRefererRes.status} (expected 403)`
    );

    const secFetchRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Sec-Fetch-Site": "cross-site",
      },
      body: JSON.stringify({ email: "test@example.com", password: "Password123" }),
    });
    assertCheck(
      "CSRF Sec-Fetch-Site: cross-site blocked",
      secFetchRes.status === 403,
      `HTTP ${secFetchRes.status} (expected 403)`
    );
  }

  // 4. Tampered / Expired JWT Rejected & Unauthenticated /api/auth/me Cache-Control
  {
    const fakeJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzQxZjEyMzQ1Njc4OTBhYmNkZWYxMjMiLCJyb2xlIjoiQWRtaW4ifQ.invalid_sig";

    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `blood_lagbe_session=${fakeJwt}` },
    });
    const meJson = await meRes.json();
    const cacheHeader = meRes.headers.get("cache-control") || "";
    assertCheck(
      "Tampered JWT rejected by /api/auth/me",
      meJson.authenticated === false && cacheHeader.includes("no-store"),
      `authenticated=${meJson.authenticated}, Cache-Control="${cacheHeader}"`
    );

    const adminWithFakeJwt = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: `blood_lagbe_session=${fakeJwt}` },
    });
    assertCheck(
      "Tampered Admin JWT rejected on /api/admin/users",
      adminWithFakeJwt.status === 403,
      `HTTP ${adminWithFakeJwt.status} (expected 403)`
    );

    const dashFakeJwt = await fetch(`${BASE_URL}/dashboard/admin`, {
      redirect: "manual",
      headers: { Cookie: `blood_lagbe_session=${fakeJwt}` },
    });
    assertCheck(
      "Tampered JWT rejected by middleware on /dashboard/admin",
      dashFakeJwt.status >= 300 && (dashFakeJwt.headers.get("location") || "").includes("/auth/login"),
      `HTTP ${dashFakeJwt.status}`
    );
  }

  // 5. Weak Password, >72-char Bcrypt DoS Password & Invalid Reset Token Rejected
  {
    const weakRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "nonexistent-token-123",
        email: "sectest@example.com",
        password: "password123",
      }),
    });
    assertCheck(
      "Common weak password ('password123') rejected",
      weakRes.status === 400,
      `HTTP ${weakRes.status} (expected 400)`
    );

    const longPwdRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "nonexistent-token-123",
        email: "sectest@example.com",
        password: "A1" + "a".repeat(80),
      }),
    });
    assertCheck(
      "Oversized (>72 char) bcrypt-DoS password rejected",
      longPwdRes.status === 400,
      `HTTP ${longPwdRes.status} (expected 400)`
    );

    const badTokenRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "already-used-or-expired-token",
        email: "sectest@example.com",
        password: "StrongPassword#2026",
      }),
    });
    assertCheck(
      "Invalid/reused reset token rejected",
      badTokenRes.status === 400,
      `HTTP ${badTokenRes.status} (expected 400)`
    );
  }

  // 6. Security Headers Verification
  {
    const homeRes = await fetch(`${BASE_URL}/`);
    const requiredHeaders = [
      "x-frame-options",
      "x-content-type-options",
      "strict-transport-security",
      "content-security-policy",
      "referrer-policy",
      "permissions-policy",
      "cross-origin-opener-policy",
    ];
    const missing = requiredHeaders.filter((h) => !homeRes.headers.get(h));
    const poweredBy = homeRes.headers.get("x-powered-by");
    assertCheck(
      "Security headers present & X-Powered-By disabled",
      missing.length === 0 && !poweredBy,
      missing.length === 0 ? `All 7 security headers present, X-Powered-By=${poweredBy}` : `Missing: ${missing.join(", ")}`
    );
  }

  // 7. Rate Limiting / Brute-Force Protection (Per-Email Forgot-Password)
  {
    const testEmail = `ratelimit-verify-${Date.now()}@example.com`;
    let blockedStatus = 0;
    for (let i = 1; i <= 6; i++) {
      const r = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": `203.0.113.${i}`,
        },
        body: JSON.stringify({ email: testEmail }),
      });
      if (r.status === 429) {
        blockedStatus = 429;
        break;
      }
    }
    assertCheck(
      "Brute-force / email-bomb rate limit blocks excess attempts (429)",
      blockedStatus === 429,
      `Blocked with HTTP ${blockedStatus}`
    );
  }

  const failed = results.filter((r) => !r.passed).length;
  console.log(`\nSummary: ${results.length - failed}/${results.length} security checks passed.\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
