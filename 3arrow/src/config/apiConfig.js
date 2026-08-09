/**
 * Centralized API Configuration for 3arrow Customer App
 *
 * This file manages all API URLs and ensures consistent configuration
 * across the application.
 *
 * Environment Variables:
 * - VITE_API_BASE_URL: Base URL for API endpoints (includes /api)
 * - VITE_API_BASE_URL_UB: Base server URL (no /api path)
 * - VITE_UPLOADS_URL: Base URL for uploads and media (no /api path)
 */

/**
 * Get API base URL for API calls
 * In development: Uses proxy to http://localhost:3000/api
 * In production: Uses full URL from VITE_API_BASE_URL
 */
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
};

/**
 * Get server base URL (without /api prefix)
 * Used for non-API requests and constructing media URLs
 */
export const getServerBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
};
export const getServerBase = () => {
  return import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
};

/**
 * Get uploads base URL for media and images
 * Should NOT include /api path
 */
export const getUploadsBaseUrl = () => {
  return import.meta.env.VITE_UPLOADS_URL || "http://localhost:3000";
};

/**
 * Build full image/media URL
 * @param {string} imagePath - Image path from API (e.g., '/uploads/images/product.jpg')
 * @returns {string} Full URL to the image
 */
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
 * Build full API URL for fetch requests
 * @param {string} path - API path (e.g., '/cart/add', 'products')
 * @returns {string} Full URL for the API endpoint
 */
export const buildApiUrl = (path) => {
  const apiBase = getApiBaseUrl();

  // If path already has /api prefix, use it as-is
  if (path.startsWith("/api")) {
    return apiBase.replace("/api", "") + path;
  }

  // If path starts with /, append to base
  if (path.startsWith("/")) {
    return apiBase + path;
  }

  // Otherwise, add / prefix
  return apiBase + "/" + path;
};

/**
 * API Configuration object with endpoint definitions
 */
export const API_CONFIG = {
  API_BASE: getApiBaseUrl(),
  SERVER_BASE: getServerBaseUrl(),
  UPLOADS_BASE: getUploadsBaseUrl(),

  // API Endpoints
  endpoints: {
    // Auth
    login: "/auth/login",
    logout: "/auth/logout",
    signup: "/auth/signup",
    updateProfile: "/auth/update-profile",

    // Products
    products: "/products",
    getProduct: (id) => `/products/${id}`,
    searchProducts: "/products/search",

    // Cart
    cart: "/cart",
    addToCart: "/cart/add",
    removeFromCart: "/cart/remove",

    // Orders
    orders: "/orders",
    createOrder: "/orders",
    cancelOrder: (id) => `/orders/${id}/cancel`,

    // Reviews
    reviews: "/reviews",
    createReview: (productId) => `/reviews/${productId}`,
    updateReview: (id) => `/reviews/${id}`,
    deleteReview: (id) => `/reviews/${id}`,
    getReviews: (productId) => `/reviews/${productId}`,
    markHelpful: (reviewId) => `/reviews/${reviewId}/helpful`,

    // Hero Banners
    heroBanners: "/hero-banners",

    // Categories
    categories: "/categories",
    getCategory: (id) => `/categories/${id}`,

    // Wishlist
    wishlist: "/wishlist",
    addToWishlist: "/wishlist/add",
    removeFromWishlist: "/wishlist/remove",
  },
};

export default API_CONFIG;
