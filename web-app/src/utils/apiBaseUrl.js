// This tells Vite: "If Vercel gives us a URL, use it. Otherwise, use localhost."
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : 'http://localhost:8000/api/v1';
