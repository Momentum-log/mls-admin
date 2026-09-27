import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy handler for authentication and route protection.
 * Redirects unauthenticated requests from protected routes to login,
 * and authenticated users away from the login page.
 *
 * @param request - Incoming NextRequest object
 * @returns NextResponse redirect or next response
 */
export function proxy(request: NextRequest) {
  // Check for common auth cookie names
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  // If trying to access protected route without token, redirect to login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access login page WITH token, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
