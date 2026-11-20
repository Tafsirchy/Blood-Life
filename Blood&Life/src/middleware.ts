import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionJWT } from "@/lib/auth/jwt";

export const SESSION_COOKIE_NAME = "blood_lagbe_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security Headers applied to every response
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

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
