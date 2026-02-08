
'use client';

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function ConditionalAdScript() {
    const pathname = usePathname();

    // Do NOT load ad scripts on studio pages
    if (pathname?.startsWith('/studio')) {
        return null;
    }

    return (
        <Script
            src="https://pl28677497.effectivegatecpm.com/96/f8/e8/96f8e83dbaf40b8de1eb784259f818ba.js"
            strategy="afterInteractive"
        />
    );
}
