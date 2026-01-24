// src/lib/rekap-cache.ts

interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export function getCachedData(key: string) {
    const entry = cache[key];
    if (entry && (Date.now() - entry.timestamp < CACHE_TTL)) {
        return entry.data;
    }
    return null;
}

export function setCachedData(key: string, data: any) {
    cache[key] = {
        data,
        timestamp: Date.now()
    };
}
