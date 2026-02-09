export const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
