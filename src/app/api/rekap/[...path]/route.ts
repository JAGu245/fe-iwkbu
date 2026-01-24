import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCachedData, setCachedData } from "@/lib/rekap-cache";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const fullPath = path.join("/");

        // Check shared cache
        const cached = getCachedData(fullPath);
        if (cached) {
            return NextResponse.json(cached);
        }

        const cookieStore = await cookies();
        const token = cookieStore.get("sessionToken")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const backendRes = await fetch(`http://127.0.0.1:8080/${fullPath}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.text();
            return NextResponse.json(
                { message: errorData || "Gagal mengambil data rekap" },
                { status: backendRes.status }
            );
        }

        const result = await backendRes.json();

        // Save to cache
        setCachedData(fullPath, result);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Kesalahan server proxy: " + error.message },
            { status: 500 }
        );
    }
}
