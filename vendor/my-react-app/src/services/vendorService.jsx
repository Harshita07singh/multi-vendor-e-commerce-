// Vendor API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/auth/vendor";

// Derive the base origin for non-vendor endpoints (e.g. /api/flash-sales)
// This properly extracts http://localhost:3000 from http://localhost:3000/api/auth/vendor
const getAPIOrigin = () => {
  try {
    const url = new URL(API_BASE_URL);
    return url.origin; // Returns http://localhost:3000
  } catch (error) {
    // Fallback for relative URLs
    return API_BASE_URL.replace(/\/api\/auth\/vendor.*$/, "") || "";
  }
};

const API_ORIGIN = getAPIOrigin();

console.log("API_BASE_URL:", API_BASE_URL);
console.log("API_ORIGIN:", API_ORIGIN);

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Save a vendor step
export const saveVendorStep = async (step, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-step`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      credentials: "include",
      body: JSON.stringify({
        step,
        data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save vendor step");
    }

    return result;
  } catch (error) {
    console.error("Error saving vendor step:", error);
    throw error;
  }
};

// Get vendor profile (creates one if it doesn't exist for new users)
export const getMyVendor = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      credentials: "include",
    });

    const result = await response.json();

    // Handle 401 - User not authenticated
    if (response.status === 401) {
      console.log("User not authenticated");
      return null;
    }

    // If vendor not found (404), return null instead of throwing error
    // This allows new users to start the onboarding process
    if (response.status === 404) {
      console.log("No vendor profile found, user needs to start onboarding");
      return null;
    }

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch vendor profile");
    }

    return result;
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    // Return null instead of throwing for network errors
    // This prevents the app from crashing on minor network issues
    return null;
  }
};

// Submit vendor for approval
export const submitVendor = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to submit vendor application");
    }

    return result;
  } catch (error) {
    console.error("Error submitting vendor:", error);
    throw error;
  }
};

// ─── Flash Sale API (Vendor) ───────────────────────────────────
export const flashSaleAPI = {
  // VENDOR endpoints
  getOpenSales: async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/flash-sales/open`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch open sales");
      }
      return data;
    } catch (error) {
      console.error("Error fetching open sales:", error);
      throw error;
    }
  },

  joinSale: async (id) => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/flash-sales/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to join sale");
      }
      return data;
    } catch (error) {
      console.error("Error joining sale:", error);
      throw error;
    }
  },

  addProduct: async (id, body) => {
    try {
      const response = await fetch(
        `${API_ORIGIN}/api/flash-sales/${id}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          credentials: "include",
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add product to sale");
      }
      return data;
    } catch (error) {
      console.error("Error adding product to sale:", error);
      throw error;
    }
  },

  removeProduct: async (saleId, productEntryId) => {
    try {
      const response = await fetch(
        `${API_ORIGIN}/api/flash-sales/${saleId}/products/${productEntryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove product from sale");
      }
      return data;
    } catch (error) {
      console.error("Error removing product from sale:", error);
      throw error;
    }
  },

  getMyProductsInSale: async (id) => {
    try {
      const response = await fetch(
        `${API_ORIGIN}/api/flash-sales/${id}/my-products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch my products in sale");
      }
      return data;
    } catch (error) {
      console.error("Error fetching my products in sale:", error);
      throw error;
    }
  },

  getLiveSales: async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/flash-sales/live`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch live sales");
      }
      return data;
    } catch (error) {
      console.error("Error fetching live sales:", error);
      throw error;
    }
  },
};

// ─── Vendor Product API ───────────────────────────────
export const vendorProductAPI = {
  getMyProducts: async (params = {}) => {
    try {
      const q = new URLSearchParams({ limit: 100, ...params }).toString();
      const response = await fetch(`${API_BASE_URL}/my-products?${q}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch my products");
      }
      return data;
    } catch (error) {
      console.error("Error fetching my products:", error);
      throw error;
    }
  },
};
