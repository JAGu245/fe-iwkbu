import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("sessionToken")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const backendRes = await fetch("http://localhost:8080/api/user/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.text();
            return NextResponse.json(
                { message: errorData || "Gagal menghapus user" },
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
