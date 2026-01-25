"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Default timeout is 15 minutes
const IDLE_TIMEOUT = 15 * 60 * 1000;

export default function IdleTimer() {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed during idle timeout:", error);
            // Fallback redirect
            router.push("/login");
        }
    };

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(logout, IDLE_TIMEOUT);
    };

    useEffect(() => {
        // --- SESSION GUARD: Force logout if tab was closed/reopened ---
        const activeTab = sessionStorage.getItem("activeSession");
        const hasToken = Cookies.get("sessionToken");

        if (hasToken && !activeTab) {
            console.log("Tab baru/Browser restart terdeteksi. Logout otomatis...");
            logout();
            return;
        }

        if (hasToken) {
            sessionStorage.setItem("activeSession", "true");
        }
        // -------------------------------------------------------------

        const events = [
            "mousemove",
            "keydown",
            "mousedown",
            "touchstart",
            "scroll",
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Initialize timer
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, []);

    return null; // This component doesn't render anything
}
