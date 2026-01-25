// src/lib/rekap-cache.ts
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.data-cache');
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Ensure directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export function getCachedData(key: string) {
    const safeKey = key.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(CACHE_DIR, `${safeKey}.json`);

    if (fs.existsSync(filePath)) {
        try {
            const stats = fs.statSync(filePath);
            const isExpired = (Date.now() - stats.mtimeMs) > CACHE_TTL;

            if (!isExpired) {
                const content = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(content);
            } else {
                // Remove expired file
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error(`[Cache] Error reading ${key}:`, err);
        }
    }
    return null;
}

export function setCachedData(key: string, data: any) {
    const safeKey = key.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(CACHE_DIR, `${safeKey}.json`);

    try {
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
    } catch (err) {
        console.error(`[Cache] Error writing ${key}:`, err);
    }
}
