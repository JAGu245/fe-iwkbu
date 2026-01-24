import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("sessionToken")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const backendRes = await fetch("http://localhost:8080/api/users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.text();
            return NextResponse.json(
                { message: errorData || "Gagal mengambil daftar user" },
                { status: backendRes.status }
            );
        }

        const result = await backendRes.json();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Kesalahan server: " + error.message },
            { status: 500 }
        );
    }
}
