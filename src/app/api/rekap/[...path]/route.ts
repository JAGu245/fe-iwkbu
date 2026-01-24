import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const fullPath = path.join("/");
        const cookieStore = await cookies();
        const token = cookieStore.get("sessionToken")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Forward the request to the Go backend using 127.0.0.1 for stability
        console.log(`[Proxy] Fetching single rekap: ${fullPath}`);
        const backendRes = await fetch(`http://127.0.0.1:8080/${fullPath}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!backendRes.ok) {
            console.error(`[Proxy] Failed to fetch ${fullPath}: ${backendRes.status}`);
            const errorData = await backendRes.text();
            return NextResponse.json(
                { message: errorData || "Gagal mengambil data rekap" },
                { status: backendRes.status }
            );
        }

        const result = await backendRes.json();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Kesalahan server proxy: " + error.message },
            { status: 500 }
        );
    }
}
