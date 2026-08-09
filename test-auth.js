// Simple test script to verify authentication
// Run this in browser console or as a test

async function testAuth() {
  console.log("Testing authentication...");

  // Test 1: Check if token exists
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  console.log("Token exists:", !!token);

  if (!token) {
    console.log("No token found. Please log in first.");
    return;
  }

  // Test 2: Test /api/auth/me endpoint
  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("Auth response:", response.status, data);

    if (response.ok) {
      console.log("✅ Authentication successful!");
      console.log("User:", data.user);
    } else {
      console.log("❌ Authentication failed:", data.message);
    }
  } catch (error) {
    console.log("❌ Network error:", error);
  }

  // Test 3: Test flash sale API
  try {
    const response = await fetch("/api/flash-sales", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("Flash sales response:", response.status, data);

    if (response.ok) {
      console.log("✅ Flash sales API working!");
    } else {
      console.log("❌ Flash sales API failed:", data.message);
    }
  } catch (error) {
    console.log("❌ Flash sales network error:", error);
  }
}

// Run the test
testAuth();
