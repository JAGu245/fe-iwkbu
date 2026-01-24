import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("sessionToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika tidak ada token dan pengguna mencoba mengakses halaman selain login,
  // alihkan ke halaman login.
  if (!sessionToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Jika ada token dan pengguna mencoba mengakses halaman login,
  // alihkan ke halaman utama (Dashboard).
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Proteksi Halaman Admin (User Management)
  if (pathname === "/user-management" && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
