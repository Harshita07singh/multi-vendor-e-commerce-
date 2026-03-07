// Vendor API Service
const API_BASE_URL = "/api/auth/vendor";

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
