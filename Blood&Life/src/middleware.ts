import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionJWT } from "@/lib/auth/jwt";

export const SESSION_COOKIE_NAME = "blood_lagbe_session";

function getAllowedHosts(request: NextRequest): Set<string> {
  const hosts = new Set<string>();
  const hostHeader = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  if (hostHeader) hosts.add(hostHeader.toLowerCase());
  if (forwardedHost) hosts.add(forwardedHost.toLowerCase());
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      hosts.add(new URL(process.env.NEXT_PUBLIC_APP_URL).host.toLowerCase());
    } catch {
      // ignore invalid URL env
    }
  }
  return hosts;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProd = process.env.NODE_ENV === "production";
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  // Security Headers applied to every response
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';`
  );

  // Payload Size Limiter (2MB threshold to prevent memory exhaustion / DoS)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
    return new NextResponse(
      JSON.stringify({ error: "Payload too large: maximum request body is 2MB" }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  // Cross-Origin Mutation Guard (CSRF Defense-in-depth on state-changing API endpoints)
  if (
    pathname.startsWith("/api/") &&
    ["POST", "PATCH", "DELETE", "PUT"].includes(request.method) &&
    !pathname.startsWith("/api/cron/")
  ) {
    const allowedHosts = getAllowedHosts(request);
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const fetchSite = request.headers.get("sec-fetch-site");

    if (fetchSite && fetchSite === "cross-site") {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden: Cross-site mutation blocked" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (origin) {
      try {
        const originHost = new URL(origin).host.toLowerCase();
        if (!allowedHosts.has(originHost)) {
          return new NextResponse(
            JSON.stringify({ error: "Forbidden: Cross-origin request blocked" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Invalid request origin" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (referer) {
      try {
        const refererHost = new URL(referer).host.toLowerCase();
        if (!allowedHosts.has(refererHost)) {
          return new NextResponse(
            JSON.stringify({ error: "Forbidden: Cross-origin referer blocked" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Invalid request referer" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // Protected Dashboard Routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifySessionJWT(token);
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Email Verification Guard for Dashboard Access
    if (session.isEmailVerified === false) {
      const verifyUrl = new URL("/auth/verify-email", request.url);
      verifyUrl.searchParams.set("email", session.email);
      return NextResponse.redirect(verifyUrl);
    }

    // Role-Based Guards
    if (pathname.startsWith("/dashboard/admin") && session.role !== "Admin") {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    }

    if (
      pathname.startsWith("/dashboard/volunteer") &&
      session.role !== "Volunteer" &&
      session.role !== "Admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
