import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
export const getProducts = createAsyncThunk(
  "products/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${BASE_URL}/api/products?${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState: { products: [], total: 0, status: "idle", error: null },
  reducers: {
    resetProducts: (state) => {
      state.products = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload.products;
        state.total = action.payload.total;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetProducts } = productSlice.actions;
export default productSlice.reducer;
