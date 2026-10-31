import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("ss_session");
  const demoCookie = request.cookies.get("ss_demo");
  const { pathname, searchParams } = request.nextUrl;
  const isDemoQuery = searchParams.get("demo") === "1";
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

  // Routes allowed for unauthenticated demo access in mock mode
  const isDemoAllowedRoute =
    pathname.startsWith("/scan") ||
    pathname.startsWith("/analyses") ||
    pathname.startsWith("/verdicts");

  const isDemoActive =
    useMocks && isDemoAllowedRoute && (isDemoQuery || demoCookie?.value === "1");

  // Protect dashboard routes (landing page '/' and '/login' are public)
  const isDashboardRoute =
    pathname.startsWith("/repos") ||
    pathname.startsWith("/verdicts") ||
    pathname.startsWith("/scan") ||
    pathname.startsWith("/analyses") ||
    pathname.startsWith("/settings");

  if (isDashboardRoute && !sessionCookie) {
    if (isDemoActive) {
      const response = NextResponse.next();
      if (isDemoQuery && demoCookie?.value !== "1") {
        response.cookies.set("ss_demo", "1", {
          path: "/",
          sameSite: "lax",
          httpOnly: false,
          maxAge: 3600,
        });
      }
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated or on public route with demo=1 in mock mode, ensure ss_demo cookie is set
  if (useMocks && isDemoQuery && demoCookie?.value !== "1") {
    const response = NextResponse.next();
    response.cookies.set("ss_demo", "1", {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 3600,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/repos/:path*",
    "/verdicts/:path*",
    "/scan/:path*",
    "/analyses/:path*",
    "/settings/:path*",
  ],
};
