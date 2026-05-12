import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { ENDPOINTS } from "../../config/endpoints";

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
  productImages?: {
    id: number;
    imageId: string;
    _media?: {
      productImages?: {
        id: number;
        relativeUri?: string;
        _full_url: string;
      }[];
    };
  }[];
  categoryId?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
  };
  productVariants?: {
    id: number;
    size: string;
    color: string;
    stock: number;
    price: string | number;
    sku: string;
  }[];
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
    const offset = (page - 1) * limit;
    const res = await api.get(`${ENDPOINTS.PRODUCTS}?&offset=${offset}&limit=${limit}&filters=&populate=productImages&populateMedia[0]=productImages.productImages&populate[1]=productVariants&populate[2]=categoryId`);
    return { records: res.data.data.records, page };
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
        const { records, page } = action.payload;
        
        if (records.length === 0) {
          state.hasMore = false;
        } else {
          if (page === 1) {
            state.items = records;
            state.hasMore = true;
          } else {
            const newItems = records.filter(
              (newRec: Product) => !state.items.some((existingRec) => existingRec.id === newRec.id)
            );
            state.items = [...state.items, ...newItems];
          }
          state.page = page + 1;
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
