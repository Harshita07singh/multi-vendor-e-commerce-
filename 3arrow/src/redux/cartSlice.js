// import { createSlice } from "@reduxjs/toolkit";

// const loadFromLocalStorage = () => {
//   try {
//     const saved = localStorage.getItem("cartState");
//     if (saved) return JSON.parse(saved);
//   } catch (e) {
//     console.error("localStorage read error:", e);
//   }
//   return { cartItems: [], wishlistItems: [], totalQuantity: 0, totalPrice: 0 };
// };

// const saveToLocalStorage = (state) => {
//   try {
//     localStorage.setItem(
//       "cartState",
//       JSON.stringify({
//         cartItems: state.cartItems,
//         wishlistItems: state.wishlistItems,
//         totalQuantity: state.totalQuantity,
//         totalPrice: state.totalPrice,
//       }),
//     );
//   } catch (e) {
//     console.error("localStorage write error:", e);
//   }
// };

// // ─────────────────────────────────────────────
// // Helper: recalculate totals from cartItems array
// // Each item shape: { id, productId, name, image, price, quantity, stock, slug }
// // ─────────────────────────────────────────────
// const recalcTotals = (state) => {
//   state.totalQuantity = state.cartItems.reduce(
//     (sum, item) => sum + item.quantity,
//     0,
//   );
//   state.totalPrice = state.cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState: loadFromLocalStorage(),
//   reducers: {
//     // ─── addToCart (local-only fallback, shape matches backend items) ───
//     addToCart: (state, action) => {
//       const newItem = action.payload;
//       // newItem should have: { id, productId, name, image, price, quantity, stock, slug }
//       const existing = state.cartItems.find((i) => i.id === newItem.id);
//       if (existing) {
//         existing.quantity++;
//       } else {
//         state.cartItems.push({ ...newItem, quantity: newItem.quantity || 1 });
//       }
//       recalcTotals(state);
//       saveToLocalStorage(state);
//     },
//     // ─── Called after backend responds with updated cart ───
//     // payload = full cart object from backend (cart.items populated)
//     setCartFromBackend: (state, action) => {
//       const backendItems = action.payload?.items || [];

//       state.cartItems = backendItems.map((item) => ({
//         id: item._id, // cart item _id (used for update/remove)
//         productId: item.product?._id,
//         name: item.product?.name || "",
//         image: item.product?.images?.[0]?.url
//           ? item.product.images[0].url.startsWith("/")
//             ? `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || ""}${item.product.images[0].url}`
//             : item.product.images[0].url
//           : "",
//         price: item.price, // snapshot price stored in cart
//         quantity: item.quantity,
//         stock: item.product?.stock || 0,
//         slug: item.product?.slug || "",
//       }));

//       recalcTotals(state);
//       saveToLocalStorage(state);
//     },

//     // ─── Optimistic remove (before backend confirms) ───
//     removeFromCart: (state, action) => {
//       const id = action.payload; // cart item _id
//       state.cartItems = state.cartItems.filter((item) => item.id !== id);
//       recalcTotals(state);
//       saveToLocalStorage(state);
//     },

//     // ─── Optimistic increase ───
//     increaseQuantity: (state, action) => {
//       const id = action.payload;
//       const item = state.cartItems.find((i) => i.id === id);
//       if (item && item.quantity < item.stock) {
//         item.quantity++;
//         recalcTotals(state);
//         saveToLocalStorage(state);
//       }
//     },

//     // ─── Optimistic decrease ───
//     decreaseQuantity: (state, action) => {
//       const id = action.payload;
//       const item = state.cartItems.find((i) => i.id === id);
//       if (item) {
//         if (item.quantity === 1) {
//           state.cartItems = state.cartItems.filter((i) => i.id !== id);
//         } else {
//           item.quantity--;
//         }
//         recalcTotals(state);
//         saveToLocalStorage(state);
//       }
//     },

//     // ─── Clear cart ───
//     clearCart: (state) => {
//       state.cartItems = [];
//       state.totalQuantity = 0;
//       state.totalPrice = 0;
//       saveToLocalStorage(state);
//     },

//     // ─── Wishlist (unchanged) ───
//     addToWishlist: (state, action) => {
//       const item = action.payload;
//       if (!state.wishlistItems.find((p) => p.id === item.id)) {
//         state.wishlistItems.push(item);
//       }
//       saveToLocalStorage(state);
//     },

//     removeFromWishlist: (state, action) => {
//       state.wishlistItems = state.wishlistItems.filter(
//         (i) => i.id !== action.payload,
//       );
//       saveToLocalStorage(state);
//     },

//     moveToCartFromWishlist: (state, action) => {
//       // NOTE: This is local-only. For full sync, call addToCart API too.
//       const item = state.wishlistItems.find((p) => p.id === action.payload);
//       if (item) {
//         const existing = state.cartItems.find(
//           (i) => i.productId === item.productId,
//         );
//         if (existing) {
//           existing.quantity++;
//         } else {
//           state.cartItems.push({ ...item, quantity: 1 });
//         }
//         state.wishlistItems = state.wishlistItems.filter(
//           (p) => p.id !== item.id,
//         );
//         recalcTotals(state);
//         saveToLocalStorage(state);
//       }
//     },
//   },
// });

// export const {
//   addToCart,
//   setCartFromBackend,
//   removeFromCart,
//   increaseQuantity,
//   decreaseQuantity,
//   clearCart,
//   addToWishlist,
//   removeFromWishlist,
//   moveToCartFromWishlist,
// } = cartSlice.actions;

// export default cartSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

// ─────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────
const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem("cartState");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("localStorage read error:", e);
  }
  return { cartItems: [], wishlistItems: [], totalQuantity: 0, totalPrice: 0 };
};

const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem(
      "cartState",
      JSON.stringify({
        cartItems: state.cartItems,
        wishlistItems: state.wishlistItems,
        totalQuantity: state.totalQuantity,
        totalPrice: state.totalPrice,
      }),
    );
  } catch (e) {
    console.error("localStorage write error:", e);
  }
};

// ─────────────────────────────────────────────
// Helper: recalculate totals
// ─────────────────────────────────────────────
const recalcTotals = (state) => {
  state.totalQuantity = state.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  state.totalPrice = state.cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState: loadFromLocalStorage(),
  reducers: {
    // ─── Guest addToCart (local-only, works without login) ───
    // payload: { id, productId, name, title, image, price, oldPrice, rating, reviews, seller, stock, slug }
    addToCart: (state, action) => {
      const newItem = action.payload;
      // Use productId for dedup if available (guest uses productId as id too)
      const existing = state.cartItems.find(
        (i) => i.productId === newItem.productId || i.id === newItem.id,
      );
      if (existing) {
        if (existing.quantity < (existing.stock || 99)) {
          existing.quantity++;
        }
      } else {
        state.cartItems.push({
          ...newItem,
          id: newItem.id || newItem.productId,
          quantity: newItem.quantity || 1,
        });
      }
      recalcTotals(state);
      saveToLocalStorage(state);
    },

    // ─── Called after backend responds with updated cart (logged-in) ───
    setCartFromBackend: (state, action) => {
      const backendItems = action.payload?.items || [];

      state.cartItems = backendItems.map((item) => ({
        id: item._id,
        productId: item.product?._id,
        name: item.product?.name || "",
        title: item.product?.name || "",
        image: item.product?.images?.[0]?.url
          ? item.product.images[0].url.startsWith("/")
            ? `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || ""}${item.product.images[0].url}`
            : item.product.images[0].url
          : "",
        price: item.price,
        quantity: item.quantity,
        stock: item.product?.stock || 0,
        slug: item.product?.slug || "",
        rating: item.product?.ratingsAverage || 0,
        reviews: item.product?.ratingsCount || 0,
        seller: item.product?.brand || "",
      }));

      recalcTotals(state);
      saveToLocalStorage(state);
    },

    // ─── Merge guest cart into backend cart after login ───
    // Call this after login: dispatch(mergeGuestCartAfterLogin())
    // Then sync to backend separately in your auth flow
    // mergeGuestCart: (state, action) => {
    //   // action.payload = backend cart items (already mapped)
    //   // Keep guest items that aren't in backend cart
    //   const backendProductIds = new Set(
    //     (action.payload || []).map((i) => i.productId),
    //   );
    //   const guestOnlyItems = state.cartItems.filter(
    //     (i) => !backendProductIds.has(i.productId),
    //   );
    //   state.cartItems = [...(action.payload || []), ...guestOnlyItems];
    //   recalcTotals(state);
    //   saveToLocalStorage(state);
    // },

    // ─── Optimistic remove ───
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== id && item.productId !== id,
      );
      recalcTotals(state);
      saveToLocalStorage(state);
    },

    // ─── Optimistic increase ───
    increaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.cartItems.find(
        (i) => i.id === id || i.productId === id,
      );
      if (item && item.quantity < (item.stock || 99)) {
        item.quantity++;
        recalcTotals(state);
        saveToLocalStorage(state);
      }
    },

    // ─── Optimistic decrease ───
    decreaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.cartItems.find(
        (i) => i.id === id || i.productId === id,
      );
      if (item) {
        if (item.quantity === 1) {
          state.cartItems = state.cartItems.filter(
            (i) => i.id !== id && i.productId !== id,
          );
        } else {
          item.quantity--;
        }
        recalcTotals(state);
        saveToLocalStorage(state);
      }
    },

    // ─── Clear cart ───
    clearCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      saveToLocalStorage(state);
    },

    // ─── Wishlist (local fallback, unchanged) ───
    addToWishlist: (state, action) => {
      const item = action.payload;
      if (!state.wishlistItems.find((p) => p.id === item.id)) {
        state.wishlistItems.push(item);
      }
      saveToLocalStorage(state);
    },

    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter(
        (i) => i.id !== action.payload,
      );
      saveToLocalStorage(state);
    },

    moveToCartFromWishlist: (state, action) => {
      const item = state.wishlistItems.find((p) => p.id === action.payload);
      if (item) {
        const existing = state.cartItems.find(
          (i) => i.productId === item.productId || i.id === item.id,
        );
        if (existing) {
          existing.quantity++;
        } else {
          state.cartItems.push({ ...item, quantity: 1 });
        }
        state.wishlistItems = state.wishlistItems.filter(
          (p) => p.id !== item.id,
        );
        recalcTotals(state);
        saveToLocalStorage(state);
      }
    },
  },
});

export const {
  addToCart,
  setCartFromBackend,
  // mergeGuestCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  moveToCartFromWishlist,
} = cartSlice.actions;

export default cartSlice.reducer;
