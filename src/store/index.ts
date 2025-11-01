// --- src/store/index.ts ---
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import { persistMiddleware } from "./persistMiddleware";

export const store = configureStore({
  reducer: { 
    cart: cartReducer,
    product:productReducer
  },
  middleware: (gDM) => gDM().concat(persistMiddleware),
});

// ✅ Correctly export these types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
