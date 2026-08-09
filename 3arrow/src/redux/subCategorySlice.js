import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
export const getSubCategories = createAsyncThunk(
  "subCategories/getAll",
  async (categoryId, { rejectWithValue }) => {
    try {
      const url = categoryId
        ? `${BASE_URL}/api/subcategories?category=${categoryId}`
        : `${BASE_URL}/api/subcategories`;
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const subCategorySlice = createSlice({
  name: "subCategories",
  initialState: { subCategories: [], status: "idle", error: null },
  reducers: {
    resetSubCategories: (state) => {
      state.subCategories = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getSubCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subCategories = action.payload;
      })
      .addCase(getSubCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetSubCategories } = subCategorySlice.actions;
export default subCategorySlice.reducer;
