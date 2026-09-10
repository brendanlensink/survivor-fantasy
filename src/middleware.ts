import { NextRequest, NextResponse } from "next/server";

// NextAuth uses database sessions here, so the cookie is an opaque session
// id rather than a decodable JWT — middleware runs on the Edge runtime and
// can't reach Postgres to validate it. Presence-checking the cookie is
// enough to redirect the common signed-out case before any page (and its
// data fetching) runs; a stale/invalid cookie still falls through to
// RootLayout's authoritative `getServerSession` check.
const SESSION_COOKIE_NAMES = ["__Secure-next-auth.session-token", "next-auth.session-token"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
  if (hasSession || pathname === "/sign-in") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the NextAuth API routes (needed for the OAuth flow
  // itself), Next's own static/image assets, and public files.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)"],
};
