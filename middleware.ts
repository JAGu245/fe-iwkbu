import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("sessionToken")?.value;
  const { pathname } = request.nextUrl;

  // Jika tidak ada token dan pengguna mencoba mengakses halaman selain login,
  // alihkan ke halaman login.
  if (!sessionToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika ada token dan pengguna mencoba mengakses halaman login,
  // alihkan ke halaman utama.
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan path mana yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali untuk:
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
