/**
 * Centralized API Configuration
 *
 * This file manages all API URLs and ensures consistent configuration
 * across the vendor application.
 *
 * Environment Variables:
 * - VITE_API_BASE_URL: Base URL for vendor API (development uses relative path with proxy)
 * - VITE_API_BASE_URL_UB: Full URL for uploads and other services
 */

// Get API base URL - uses proxy in development, full URL in production
const getApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiBaseUrlUb = import.meta.env.VITE_API_BASE_URL_UB;

  // In development with proxy, VITE_API_BASE_URL is relative (e.g., /api/auth/vendor)
  if (apiBaseUrl && apiBaseUrl.startsWith("/")) {
    return apiBaseUrl;
  }

  // In production, VITE_API_BASE_URL is full URL
  if (apiBaseUrl) {
    return apiBaseUrl;
  }

  // Fallback based on environment
  if (import.meta.env.MODE === "production") {
    return "https://server.3arrow24x7.com/api/auth/vendor";
  }

  return "http://localhost:3000/api/auth/vendor";
};
export const getUploadsBaseUrl = () => {
  return import.meta.env.VITE_UPLOADS_URL || "http://localhost:3000";
};
// Get base URL for uploads and media
const getUploadBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
};

// API Configuration object
export const API_CONFIG = {
  // Vendor authentication endpoints
  VENDOR_API_BASE: getApiBaseUrl(),
  UPLOAD_BASE: getUploadBaseUrl(),

  // Full API endpoints
  endpoints: {
    // Vendor endpoints
    saveStep: "/save-step",
    vendorProfile: "/my-profile",
    submitVendor: "/submit",

    // Product endpoints
    products: "/api/products",
    getProduct: (id) => `/api/products/${id}`,

    // Category endpoints
    categories: "/api/categories",

    // Flash sale endpoints
    flashSales: "/api/flash-sales",
  },
};

/**
 * Build full API URL for fetch requests
 * @param {string} path - API path (e.g., '/save-step' or '/api/products')
 * @returns {string} Full URL for the API endpoint
 */
export const buildApiUrl = (path) => {
  const apiBase = API_CONFIG.VENDOR_API_BASE;

  // If path is relative and starts with /, don't add the vendor prefix again
  if (!path.startsWith("/api") && !path.startsWith("http")) {
    return apiBase + path;
  }

  // For paths that already have /api, use the base server URL
  if (path.startsWith("/api")) {
    return getUploadBaseUrl() + path;
  }

  return path;
};
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // If already a full URL, return as-is
  if (imagePath.startsWith("http")) return imagePath;

  // If path starts with /, use uploads base URL
  if (imagePath.startsWith("/")) {
    return getUploadsBaseUrl() + imagePath;
  }

  // Otherwise, prepend uploads base URL with /
  return getUploadsBaseUrl() + "/" + imagePath;
};
/**
 * Build media URL for image and video assets
 * @param {string} imagePath - Image path from API (e.g., '/uploads/images/product.jpg')
 * @returns {string} Full URL to the image
 */
export const buildMediaUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  return getUploadBaseUrl() + imagePath;
};

export default API_CONFIG;
