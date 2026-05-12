import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import authReducer from "./slices/authSlice";
import { persistMiddleware } from "./persistMiddleware";
import { injectStore } from "./api"; // ✅ Broken circle

export const store = configureStore({
  reducer: { 
    cart: cartReducer,
    product:productReducer,
    auth: authReducer
  },
  middleware: (gDM) => gDM().concat(persistMiddleware),
});

// ✅ Inject store into API instance
injectStore(store);

// ✅ Correctly export these types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
