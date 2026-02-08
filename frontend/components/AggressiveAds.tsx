
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const ADS_URL = "https://www.effectivegatecpm.com/hjp0hms3z?key=bfa0fcba6c2ddee9d110e88593485c32";
const CLICK_THRESHOLD = 1; // Trigger on EVERY click

export default function AggressiveAds() {
    const clickCount = useRef(0);
    const pathname = usePathname();

    useEffect(() => {
        // Skip ads on Studio page
        if (pathname?.startsWith('/studio')) {
            return;
        }

        const handleClick = () => {
            clickCount.current++;

            // Trigger popup on every click
            if (clickCount.current % CLICK_THRESHOLD === 0) {
                console.log("Aggressive Ad Triggered!");
                window.open(ADS_URL, '_blank');
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [pathname]);

    return null; // Invisible component
}
