import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Hapus cookie dengan mengatur maxAge ke -1
  const serializedCookie = serialize("sessionToken", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Langsung expired
    path: "/",
  });

  const serializedUserCookie = serialize("userName", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1,
    path: "/",
  });

  const serializedRoleCookie = serialize("userRole", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1,
    path: "/",
  });

  const serializedFullNameCookie = serialize("fullName", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1,
    path: "/",
  });

  return new Response(JSON.stringify({ message: "Logout berhasil" }), {
    status: 200,
    headers: [
      ["Set-Cookie", serializedCookie],
      ["Set-Cookie", serializedUserCookie],
      ["Set-Cookie", serializedRoleCookie],
      ["Set-Cookie", serializedFullNameCookie],
    ],
  });
}
