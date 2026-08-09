import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// ─── Token Helpers ────────────────────────────────────
const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";

const getRefreshToken = () => localStorage.getItem("refreshToken") || "";

const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("token", accessToken);
  }
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

// ─── Token Refresh ────────────────────────────────────
// Single in-flight refresh promise so parallel requests don't each try to refresh
let _refreshPromise = null;

const refreshAccessToken = async () => {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    // Refresh token is stored as an httpOnly cookie by the backend,
    // so we should NOT rely on localStorage/sessionStorage for it.
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Refresh failed");

    // Support both { accessToken } and { token } response shapes
    const newAccess = data.accessToken || data.token;
    // Refresh token remains in the cookie; update local access token only.
    setTokens(newAccess);
    return newAccess;
  })();

  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
};

// ─── Core Fetch Wrapper (with auto-retry after refresh) ───
export const apiCall = async (endpoint, options = {}, _retry = true) => {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: "include",
    ...options,
  });

  // ✅ If 401 and we haven't retried yet → try to refresh then replay the request
  if (res.status === 401 && _retry) {
    try {
      await refreshAccessToken();
      // Retry original request once with the new token
      return apiCall(endpoint, options, false);
    } catch {
      // Refresh also failed — clear tokens and redirect to login
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:logout"));
      throw new Error("Session expired. Please log in again.");
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `API Error: ${res.status}`);
  return data;
};

// ─── Convenience Methods ──────────────────────────────
const api = {
  get: (endpoint) => apiCall(endpoint),
  post: (endpoint, data) =>
    apiCall(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    apiCall(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint) => apiCall(endpoint, { method: "DELETE" }),
};

export default api;

// ─── Auth ─────────────────────────────────────────────
export const authAPI = {
  login: async (credentials) => {
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    // Persist tokens on login
    const access = data.accessToken || data.token;
    const refresh = data.refreshToken;
    setTokens(access, refresh);
    return data;
  },
  register: (data) =>
    apiCall("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  logout: () => {
    clearTokens();
    window.dispatchEvent(new CustomEvent("auth:logout"));
  },
};

// ─── Admin ────────────────────────────────────────────
export const adminAPI = {
  getAdmins: (page = 1, search = "") =>
    apiCall(`/admin/admins?page=${page}&search=${search}`),
  createAdmin: (data) =>
    apiCall("/admin/create-admin", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAdmin: (id, data) =>
    apiCall(`/admin/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteAdmin: (id) => apiCall(`/admin/admin/${id}`, { method: "DELETE" }),
};

// ─── Vendor ───────────────────────────────────────────
export const vendorAPI = {
  getMyVendor: () => apiCall("/auth/vendor/my-vendor"),
  getAllVendors: () => apiCall("/auth/vendor/admin/all"),
  getVendor: (id) => apiCall(`/auth/vendor/admin/${id}`),
  getVendorById: (id) => apiCall(`/auth/vendor/admin/${id}`),
  updateVendorStatus: (vendorId, data) =>
    apiCall("/auth/vendor/admin/update-status", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getMyProducts: () => apiCall("/auth/vendor/my-products"),
  getMyCategories: () => apiCall("/auth/vendor/my-categories"),
  getMySubCategories: () => apiCall("/auth/vendor/my-subcategories"),
};

// ─── Cart ─────────────────────────────────────────────
export const cartAPI = {
  getCart: () => apiCall("/cart"),
  addToCart: (productId, quantity = 1) =>
    apiCall("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateQuantity: (itemId, quantity) =>
    apiCall("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ itemId, quantity }),
    }),
  removeFromCart: (itemId) =>
    apiCall(`/cart/remove/${itemId}`, { method: "DELETE" }),
  clearCart: () => apiCall("/cart/clear", { method: "DELETE" }),
};

// ─── Wishlist ─────────────────────────────────────────
export const wishlistAPI = {
  getWishlist: () => {
    if (!getAccessToken()) return Promise.resolve({ success: false, data: [] });
    return apiCall("/wishlist");
  },
  addToWishlist: (productId) => {
    if (!getAccessToken())
      return Promise.resolve({ success: false, message: "Login required" });
    return apiCall("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  },
  removeFromWishlist: (productId) => {
    if (!getAccessToken())
      return Promise.resolve({ success: false, message: "Login required" });
    return apiCall(`/wishlist/remove/${productId}`, { method: "DELETE" });
  },
};

// ─── FormData-aware request (for file uploads) ────────
async function apiRequest(path, method = "GET", body = null, _retry = true) {
  const token = getAccessToken();
  const isFormData = body instanceof FormData;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  // ✅ Same refresh logic for file-upload requests
  if (res.status === 401 && _retry) {
    try {
      await refreshAccessToken();
      return apiRequest(path, method, body, false);
    } catch {
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:logout"));
      throw new Error("Session expired. Please log in again.");
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}

// ─── Flash Sale API ───────────────────────────────────
export const flashSaleAPI = {
  getAllSales: () => apiRequest("/flash-sales"),
  getSaleById: (id) => apiRequest(`/flash-sales/${id}`),
  createSale: (formData) => apiRequest("/flash-sales", "POST", formData),
  updateSale: (id, formData) =>
    apiRequest(`/flash-sales/${id}`, "PUT", formData),
  notifyVendors: (id) => apiRequest(`/flash-sales/${id}/notify`, "PATCH"),
  startSale: (id) => apiRequest(`/flash-sales/${id}/start`, "PATCH"),
  endSale: (id, cancel = false) =>
    apiRequest(`/flash-sales/${id}/end`, "PATCH", { cancel }),
  adminRemoveProduct: (saleId, productEntryId) =>
    apiRequest(`/flash-sales/${saleId}/products/${productEntryId}`, "DELETE"),
  getOpenSales: () => apiRequest("/flash-sales/open"),
  joinSale: (id) => apiRequest(`/flash-sales/${id}/join`, "POST"),
  addProduct: (id, body) =>
    apiRequest(`/flash-sales/${id}/products`, "POST", body),
  removeProduct: (saleId, productEntryId) =>
    apiRequest(`/flash-sales/${saleId}/products/${productEntryId}`, "DELETE"),
  getMyProductsInSale: (id) => apiRequest(`/flash-sales/${id}/my-products`),
  getLiveSales: () => apiRequest("/flash-sales/live"),
};

// ─── Vendor Product API ───────────────────────────────
export const vendorProductAPI = {
  getMyProducts: (params = {}) => {
    const q = new URLSearchParams({ limit: 100, ...params }).toString();
    return apiRequest(`/auth/vendor/my-products?${q}`);
  },
};

// ─── Banner API ───────────────────────────────────────
export const bannerAPI = {
  getBanners: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    // Use apiCall so banners also benefit from auto-refresh
    return apiCall(`/banners${query ? `?${query}` : ""}`);
  },

  createBanner: (formData) => apiRequest("/banners", "POST", formData),
  updateBanner: (id, formData) => apiRequest(`/banners/${id}`, "PUT", formData),

  toggleBanner: (id) => apiCall(`/banners/${id}/toggle`, { method: "PATCH" }),

  deleteBanner: (id) => apiCall(`/banners/${id}`, { method: "DELETE" }),
};
