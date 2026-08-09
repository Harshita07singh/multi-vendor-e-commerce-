import { setCartFromBackend } from "../redux/cartSlice";
import { setWishlistFromBackend } from "../redux/wishlistSlice";

export const mergeGuestDataAfterLogin = async (
  dispatch,
  guestCartItems = [],
  guestWishlistItems = [],
) => {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

  // ── 1. Merge guest cart items into backend cart ──
  if (guestCartItems.length > 0) {
    try {
      for (const item of guestCartItems) {
        const productId = item?.productId || item?.id || item?._id;
        if (!productId) continue;

        let quantity = Number(item?.quantity || 1);
        // Clamp to guest-known stock to reduce "out of stock" failures.
        if (typeof item?.stock === "number" && item.stock >= 0) {
          quantity = Math.min(quantity, item.stock || quantity);
        }
        quantity = Math.max(1, quantity);

        const addToCart = async (qty) => {
          const res = await fetch(`${BASE}/cart/add`, {
            method: "POST",
            headers,
            body: JSON.stringify({ productId, quantity: qty }),
          });
          if (res.ok) return true;

          // If server rejects due to stock, retry with its allowed quantity.
          try {
            const data = await res.json();
            const msg = data?.message || "";
            const m = msg.match(/Only\s+(\d+)\s+units available/i);
            if (m) {
              const allowed = Number(m[1]);
              return { allowed, rejected: true };
            }
          } catch {
            // ignore JSON parse failures
          }
          return false;
        };

        const first = await addToCart(quantity);
        if (first && typeof first === "object" && first.rejected) {
          const allowedQty = Number(first.allowed);
          if (allowedQty >= 1) {
            await addToCart(allowedQty);
          }
        }
      }

      // Fetch updated cart from backend
      const cartRes = await fetch(`${BASE}/cart`, { headers });
      const cartData = await cartRes.json();
      if (cartData.success) {
        dispatch(setCartFromBackend(cartData.data));
      }
    } catch (err) {
      console.error("Guest cart merge error:", err);
    }
  } else {
    // Still fetch backend cart even if no guest items
    try {
      const cartRes = await fetch(`${BASE}/cart`, { headers });
      const cartData = await cartRes.json();
      if (cartData.success) {
        dispatch(setCartFromBackend(cartData.data));
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  }

  // ── 2. Merge guest wishlist items into backend wishlist ──
  if (guestWishlistItems.length > 0) {
    try {
      for (const item of guestWishlistItems) {
        await fetch(`${BASE}/wishlist/add`, {
          method: "POST",
          headers,
          body: JSON.stringify({ productId: item._id || item.id }),
        });
      }

      // Fetch updated wishlist from backend
      const wishRes = await fetch(`${BASE}/wishlist`, { headers });
      const wishData = await wishRes.json();
      if (wishData.success) {
        dispatch(setWishlistFromBackend(wishData.data));
      }
    } catch (err) {
      console.error("Guest wishlist merge error:", err);
    }
  } else {
    try {
      const wishRes = await fetch(`${BASE}/wishlist`, { headers });
      const wishData = await wishRes.json();
      if (wishData.success) {
        dispatch(setWishlistFromBackend(wishData.data));
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    }
  }
};
