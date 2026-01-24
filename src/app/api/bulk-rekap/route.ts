import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCachedData, setCachedData } from "@/lib/rekap-cache";

export async function POST(request: Request) {
    try {
        const { endpoints } = await request.json();

        if (!Array.isArray(endpoints)) {
            return NextResponse.json({ message: "Endpoints must be an array" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get("sessionToken")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const fetchPromises = endpoints.map(async (endpoint: string) => {
            // Check shared cache
            const cached = getCachedData(endpoint);
            if (cached) {
                console.log(`[Bulk-Rekap] Cache hit: ${endpoint}`);
                return { endpoint, data: cached };
            }

            console.log(`[Bulk-Rekap] Fetching: ${endpoint}`);
            try {
                const backendRes = await fetch(`http://127.0.0.1:8080/${endpoint}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!backendRes.ok) {
                    return { endpoint, error: `Failed: ${backendRes.statusText}` };
                }

                const result = await backendRes.json();
                const data = result.data || [];

                setCachedData(endpoint, data);

                return { endpoint, data };
            } catch (err: any) {
                return { endpoint, error: err.message };
            }
        });

        const results = await Promise.all(fetchPromises);

        return NextResponse.json({ results });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Bulk Fetch Error: " + error.message },
            { status: 500 }
        );
    }
}
