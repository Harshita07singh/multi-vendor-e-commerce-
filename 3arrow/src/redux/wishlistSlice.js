// import { createSlice } from "@reduxjs/toolkit";
// const BASE_URL =
//   import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
// const wishlistSlice = createSlice({
//   name: "wishlist",
//   initialState: { wishlistItems: [], loading: false },
//   reducers: {
//     setWishlistFromBackend(state, action) {
//       // action.payload = array of { product: {...}, addedAt }
//       state.wishlistItems = action.payload.map((entry) => {
//         const p = entry.product;
//         return {
//           id: p._id,
//           _id: p._id,
//           title: p.name,
//           image: p.images?.[0]?.url ? `${BASE_URL}${p.images[0].url}` : "",
//           newPrice: `₹${p.price}`,
//           price: p.price,
//           rating: p.ratingsAverage ?? 0,
//           reviews: p.ratingsCount ?? 0,
//           category: p.category?.name ?? "",
//           slug: p.slug,
//         };
//       });
//     },
//     removeFromWishlist(state, action) {
//       state.wishlistItems = state.wishlistItems.filter(
//         (item) => item.id !== action.payload,
//       );
//     },
//     clearWishlist(state) {
//       state.wishlistItems = [];
//     },
//   },
// });

// export const { setWishlistFromBackend, removeFromWishlist, clearWishlist } =
//   wishlistSlice.actions;
// export default wishlistSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

// ─────────────────────────────────────────────
// localStorage helpers for guest wishlist
// ─────────────────────────────────────────────
const WISHLIST_KEY = "guestWishlist";

const loadGuestWishlist = () => {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveGuestWishlist = (items) => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("wishlist localStorage error:", e);
  }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    wishlistItems: loadGuestWishlist(), // ✅ Load from localStorage on start
    loading: false,
  },
  reducers: {
    // ─── Backend sync (logged-in user) ───
    setWishlistFromBackend(state, action) {
      state.wishlistItems = action.payload.map((entry) => {
        const p = entry.product || entry; // handle both shapes
        const imageUrl = p.images?.[0]?.url || "";
        return {
          id: p._id,
          _id: p._id,
          title: p.name,
          image: imageUrl.startsWith("http")
            ? imageUrl
            : imageUrl
              ? `${BASE_URL}${imageUrl}`
              : "",
          newPrice: `₹${p.price}`,
          price: p.price,
          rating: p.ratingsAverage ?? 0,
          reviews: p.ratingsCount ?? 0,
          category: p.category?.name ?? "",
          slug: p.slug,
          stock: p.stock || 0,
        };
      });
      // ✅ Also save to localStorage so guest→login merge works
      saveGuestWishlist(state.wishlistItems);
    },

    // ─── Guest addToWishlist (works without login) ───
    addToWishlist(state, action) {
      const item = action.payload;
      const exists = state.wishlistItems.find(
        (i) => i.id === item.id || i._id === item._id,
      );
      if (!exists) {
        state.wishlistItems.push(item);
        saveGuestWishlist(state.wishlistItems);
      }
    },

    // ─── Remove from wishlist ───
    removeFromWishlist(state, action) {
      state.wishlistItems = state.wishlistItems.filter(
        (item) => item.id !== action.payload && item._id !== action.payload,
      );
      saveGuestWishlist(state.wishlistItems);
    },

    // ─── Toggle wishlist (add if not present, remove if present) ───
    toggleWishlist(state, action) {
      const item = action.payload;
      const index = state.wishlistItems.findIndex(
        (i) => i.id === item.id || i._id === item._id,
      );
      if (index !== -1) {
        state.wishlistItems.splice(index, 1);
      } else {
        state.wishlistItems.push(item);
      }
      saveGuestWishlist(state.wishlistItems);
    },

    // ─── Clear wishlist ───
    clearWishlist(state) {
      state.wishlistItems = [];
      saveGuestWishlist([]);
    },
  },
});

export const {
  setWishlistFromBackend,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
