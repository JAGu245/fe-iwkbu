// src/app/api/auth/login/route.ts
import { query } from "@/lib/db";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Call the Go Backend
    const backendRes = await fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.text();
      return NextResponse.json(
        { message: errorData || "Login gagal di backend" },
        { status: backendRes.status }
      );
    }

    const { token, user } = await backendRes.json();

    const serializedCookie = serialize("sessionToken", token, {
      httpOnly: false,
      secure: false, // Set to false to allow login via IP (HTTP)
      sameSite: "strict",
      path: "/",
    });

    const serializedUserCookie = serialize("userName", user.username, {
      httpOnly: false,
      secure: false, // Set to false to allow login via IP (HTTP)
      sameSite: "strict",
      path: "/",
    });

    const serializedRoleCookie = serialize("userRole", user.role, {
      httpOnly: false, // Accessible by client-side JS for sidebar logic
      secure: false, // Set to false to allow login via IP (HTTP)
      sameSite: "strict",
      path: "/",
    });

    const serializedFullNameCookie = serialize("fullName", user.fullname || user.username, {
      httpOnly: false,
      secure: false, // Set to false to allow login via IP (HTTP)
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ message: "Login berhasil", user }, {
      status: 200,
      headers: [
        ["Set-Cookie", serializedCookie],
        ["Set-Cookie", serializedUserCookie],
        ["Set-Cookie", serializedRoleCookie],
        ["Set-Cookie", serializedFullNameCookie],
      ],
    });
  } catch (e: any) {
    return NextResponse.json({ message: "Kesalahan server frontend: " + e.message }, { status: 500 });
  }
}
