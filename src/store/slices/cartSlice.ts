// --- src/store/slices/cartSlice.ts ---
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

type CartState = {
  items: Product[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1; // ✅ increase quantity
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    decreaseQuantity: (state, action: PayloadAction<string | number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter((i) => i.id !== action.payload);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, decreaseQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
