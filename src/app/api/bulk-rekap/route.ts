import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple in-memory cache with TTL
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

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

        // Check cache first for all endpoints
        // For simplicity in this iteration, we fetch everything in parallel
        // and let the Go backend handle individual sheet fetches.

        const fetchPromises = endpoints.map(async (endpoint: string) => {
            // Basic cache check
            if (cache[endpoint] && (Date.now() - cache[endpoint].timestamp < CACHE_TTL)) {
                console.log(`[Bulk-Rekap] Cache hit for endpoint: ${endpoint}`);
                return { endpoint, data: cache[endpoint].data };
            }

            console.log(`[Bulk-Rekap] Fetching data for endpoint: ${endpoint}`);
            try {
                const backendRes = await fetch(`http://127.0.0.1:8080/${endpoint}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!backendRes.ok) {
                    console.error(`[Bulk-Rekap] Failed to fetch ${endpoint}: ${backendRes.status} ${backendRes.statusText}`);
                    const errorText = await backendRes.text(); // Get more details from the backend
                    return { endpoint, error: `Failed to fetch: ${backendRes.statusText} - ${errorText}` };
                }

                const result = await backendRes.json();
                const data = result.data || [];

                // Save to cache
                cache[endpoint] = { data, timestamp: Date.now() };

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
