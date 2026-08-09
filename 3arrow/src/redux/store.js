// import { configureStore } from "@reduxjs/toolkit";
// import cartReducer from "./cartSlice";
// import wishlistReducer from "./wishlistSlice";
// import categoryReducer from "./categorySlice";
// import subCategoryReducer from "./subCategorySlice";
// import productReducer from "./productSlice";
// import authReducer from "./authSlice";

// export const store = configureStore({
//   reducer: {
//     cart: cartReducer,
//     wishlist: wishlistReducer,
//     categories: categoryReducer,
//     subCategories: subCategoryReducer,
//     products: productReducer,
//     auth: authReducer,
//   },
// });

// export default store;
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import categoryReducer from "./categorySlice";
import subCategoryReducer from "./subCategorySlice";
import productReducer from "./productSlice";
import authReducer from "./authSlice";
import locationReducer from "./Locationslice";
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "wishlist", "auth"],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  wishlist: wishlistReducer,
  categories: categoryReducer,
  subCategories: subCategoryReducer,
  products: productReducer,
  auth: authReducer,
  location: locationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
