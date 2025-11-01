// --- src/store/persistMiddleware.ts ---
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Middleware } from "@reduxjs/toolkit";

export const persistMiddleware: Middleware =
  (store) => (next) => async (action) => {
    const result = next(action);
    const state = store.getState();
    await AsyncStorage.setItem("CART_STATE", JSON.stringify(state.cart));
    return result;
  };
