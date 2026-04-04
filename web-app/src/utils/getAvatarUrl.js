import { API_BASE_URL } from './apiBaseUrl.js';

export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;

    // If it's already a full URL, blob, or base64, return it as-is
    if (
        avatarPath.startsWith('http') ||
        avatarPath.startsWith('blob:') ||
        avatarPath.startsWith('data:')
    ) {
        return avatarPath;
    }

    const serverBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

    // 1. Convert Windows backslashes to forward slashes
    let cleanPath = avatarPath.replace(/\\/g, '/');

    // 2. Remove 'public/' prefix if the backend multer saved it that way
    if (cleanPath.startsWith('public/')) {
        cleanPath = cleanPath.replace('public/', '');
    }

    // 3. Ensure leading slash
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    // 4. Ensure it points to the avatars folder
    if (!cleanPath.startsWith('/avatars')) {
        cleanPath = `/avatars${cleanPath}`;
    }

    // If serverBase is empty (because API_BASE_URL is relative like '/api/v1/'),
    // and cleanPath starts with '/', just return cleanPath to use the current origin (and Vite proxy).
    if (!serverBase && cleanPath.startsWith('/')) {
        return cleanPath;
    }

    // Avoid double slashes
    const separator = serverBase.endsWith('/') && cleanPath.startsWith('/') ? '' : '';
    const cleanServerBase = serverBase.endsWith('/') ? serverBase.slice(0, -1) : serverBase;
    
    return `${cleanServerBase}${cleanPath}`;
};