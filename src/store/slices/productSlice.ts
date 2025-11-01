// --- src/store/slices/productSlice.ts ---
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Product {
  featured: boolean;
  isVisible: boolean;
  id: number | string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  name: string;
  slug?: string;
  price: string | number;
  quantity: number;
  originalPrice?: string | number;
  discount?: string | number;
  description: string;
  stock?: number;
  shippingClass?: string;
  sku?: string;
  _media?: {
    images: {
      id: number;
      _full_url: string;
    }[];
  };
}

interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Async thunk for fetching products with pagination
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => {
    const res = await axios.get(`http://localhost:3000/api/product?&offset=0&limit=${limit}&filters=&populateMedia[0]=images`);
    console.log(res.data.data.records);
    return res.data.data.records; // should return array of products
  }
);

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length === 0) {
          state.hasMore = false;
        } else {
          state.items = [...state.items, ...action.payload];
          state.page += 1;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      });
  },
});

export const { resetProducts } = productSlice.actions;
export default productSlice.reducer;
