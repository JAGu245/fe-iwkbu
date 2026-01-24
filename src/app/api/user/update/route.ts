import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const token = cookieStore.get("sessionToken")?.value;

        if (!token) {
            return NextResponse.json({ message: "Sesi tidak ditemukan" }, { status: 401 });
        }

        // Proxy request to Go Backend
        console.log("POST /api/user/update body:", body);
        const backendRes = await fetch("http://localhost:8080/api/user/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorText = await backendRes.text();
            return NextResponse.json(
                { message: errorText || "Gagal memperbarui profil" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: "Kesalahan server frontend: " + e.message }, { status: 500 });
    }
}
