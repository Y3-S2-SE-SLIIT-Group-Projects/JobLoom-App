const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

/**
 * Standardizes a path to a full URL for images and documents.
 * Handles both absolute URLs and relative paths from the backend.
 * @param {string} path - The path from the database
 * @returns {string} - The full URL to the resource or an empty string
 */
export const getImageUrl = path => {
  if (!path) return '';

  // If it's already a full URL or blob, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }

  // Normalize Windows-style backslashes to forward slashes for URLs
  let normalized = path.replace(/\\/g, '/');

  // Handle slashes to prevent double slashes
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const sub = normalized.startsWith('/') ? normalized.substring(1) : normalized;

  // Construct the full URL
  return `${base}/${sub}`;
};
