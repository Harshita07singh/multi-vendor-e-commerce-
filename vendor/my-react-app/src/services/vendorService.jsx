// Vendor API Service
const API_BASE_URL = "/api/vendors";

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

// Get vendor profile
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

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch vendor profile");
    }

    return result;
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    throw error;
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
