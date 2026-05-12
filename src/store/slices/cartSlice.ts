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
  variantDetails?: any;
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
    updateCartVariant: (state, action: PayloadAction<{ oldId: string | number; newVariant: any }>) => {
      const { oldId, newVariant } = action.payload;
      const existingItemIndex = state.items.findIndex(i => i.id === oldId);
      if (existingItemIndex === -1) return;
      
      const itemToUpdate = state.items[existingItemIndex];
      const baseProductId = String(oldId).split('-')[0];
      const newId = `${baseProductId}-${newVariant.id}`;
      
      if (newId === oldId) return;

      const targetItemIndex = state.items.findIndex(i => i.id === newId);
      
      if (targetItemIndex !== -1) {
        state.items[targetItemIndex].quantity += itemToUpdate.quantity;
        state.items.splice(existingItemIndex, 1);
      } else {
        itemToUpdate.id = newId;
        itemToUpdate.price = newVariant.price;
        itemToUpdate.sku = newVariant.sku;
        itemToUpdate.variantDetails = newVariant;
      }
    },
  },
});

export const { addToCart, removeFromCart, decreaseQuantity, clearCart, updateCartVariant } =
  cartSlice.actions;

export default cartSlice.reducer;
