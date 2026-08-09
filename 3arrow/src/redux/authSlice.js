// redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ LocalStorage se token check karo
const token = localStorage.getItem("accessToken");

// ✅ /api/auth/me se user fetch karo
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return thunkAPI.rejectWithValue("No token");

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message);
      }

      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoggedIn: !!token,
    loading: false,
    error: null,
  },
  reducers: {
    // Login ke baad user set karo
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    // Logout
    logoutUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem("accessToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
        state.user = null;
      });
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
