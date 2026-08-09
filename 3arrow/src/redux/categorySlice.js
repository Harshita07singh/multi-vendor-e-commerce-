import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const getCategories = createAsyncThunk(
  "categories/getCategories",
  async () => {
    const response = await api.get("/categories");
    return response;
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;
