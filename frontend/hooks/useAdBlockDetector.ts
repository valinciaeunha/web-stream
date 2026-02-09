"use client";

import { useEffect, useState } from "react";

export function useAdBlockDetector() {
    const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAdBlock = async () => {
            // 1. DOM Check: Create a bait element
            const bait = document.createElement("div");
            bait.className =
                "adsbox ad-banner ad-container doubleclick ad-placement carbon-ads";
            bait.style.position = "absolute";
            bait.style.left = "-9999px";
            bait.style.top = "-9999px";
            bait.style.width = "1px";
            bait.style.height = "1px";
            document.body.appendChild(bait);

            // Brief delay to allow extension to hide the element
            await new Promise((resolve) => setTimeout(resolve, 100));

            const isBlockedByDOM =
                !bait.offsetParent &&
                bait.offsetWidth === 0 &&
                bait.offsetHeight === 0;

            document.body.removeChild(bait);

            if (isBlockedByDOM) {
                if (isMounted) setIsAdBlockEnabled(true);
                if (isMounted) setLoading(false);
                return;
            }

            // 2. Network Check: Try to fetch a known ad script (bait)
            // Using the specific ad script from the project to ensure relevance
            try {
                const req = new Request(
                    "https://pl28677497.effectivegatecpm.com/96/f8/e8/96f8e83dbaf40b8de1eb784259f818ba.js",
                    {
                        method: "HEAD",
                        mode: "no-cors",
                    },
                );

                await fetch(req);
            } catch (e) {
                // Network error usually means it was blocked
                if (isMounted) setIsAdBlockEnabled(true);
            }

            // Secondary check for common ad domains if the specific one passes (or 200 OK fake)
            try {
                const reqGoogle = new Request(
                    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
                    { method: "HEAD", mode: "no-cors" }
                );
                await fetch(reqGoogle);
            } catch (e) {
                if (isMounted) setIsAdBlockEnabled(true);
            }

            if (isMounted) setLoading(false);
        };

        checkAdBlock();

        return () => {
            isMounted = false;
        };
    }, []);

    return { isAdBlockEnabled, loading };
}
