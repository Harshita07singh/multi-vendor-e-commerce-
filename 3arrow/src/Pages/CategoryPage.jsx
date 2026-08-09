import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubCategories,
  resetSubCategories,
} from "../redux/subCategorySlice";
import { getProducts, resetProducts } from "../redux/productSlice";
import {
  fetchBrowserLocation,
  selectCustomerCoords,
  selectCustomerCoordsKey,
} from "../redux/Locationslice";
import { ShoppingCart, ArrowLeft, MapPin } from "lucide-react";
import { setCartFromBackend, addToCart } from "../redux/cartSlice";
import WishlistButton from "../components/WishlistButton";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

const getCustomerPrice = (p) =>
  p?.pricingBreakdown?.customerFacingPrice ?? p?.price ?? 0;
const getMRP = (p) => p?.mrp ?? null;
const getDiscountPct = (p) => {
  if (p?.pricingBreakdown?.discountPct != null)
    return +p.pricingBreakdown.discountPct.toFixed(1);
  const cp = getCustomerPrice(p),
    mrp = getMRP(p);
  if (mrp && mrp > cp) return +(((mrp - cp) / mrp) * 100).toFixed(1);
  return null;
};

function CategoryPage() {
  const { categoryId, categoryName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addedToCartId, setAddedToCartId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const customerCoords = useSelector(selectCustomerCoords);
  const customerCoordsKey = useSelector(selectCustomerCoordsKey);
  const { subCategories, status: subStatus } = useSelector(
    (state) => state.subCategories,
  );
  const { products, status: prodStatus } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [categoryId]);

  useEffect(() => {
    dispatch(resetSubCategories());
    dispatch(resetProducts());
    dispatch(getSubCategories(categoryId));
  }, [categoryId]);

  useEffect(() => {
    const params = { category: categoryId };
    if (activeSubCategory) params.subCategory = activeSubCategory;
    if (searchQuery) params.search = searchQuery;
    if (customerCoords) {
      params.lat = customerCoords.lat;
      params.lng = customerCoords.lng;
      params.radiusKm = 50;
    }
    dispatch(getProducts(params));
  }, [categoryId, activeSubCategory, searchQuery, customerCoordsKey]);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      const imageUrl = product.images?.[0]?.url
        ? product.images[0].url.startsWith("/")
          ? `${BASE_URL}${product.images[0].url}`
          : product.images[0].url
        : null;
      dispatch(
        addToCart({
          id: product._id,
          productId: product._id,
          title: product.name,
          name: product.name,
          image: imageUrl || "",
          price: getCustomerPrice(product),
          rating: product.ratingsAverage ?? 0,
          reviews: product.ratingsCount ?? 0,
          stock: product.stock || 99,
          slug: product.slug || product._id,
          quantity: 1,
        }),
      );
      setAddedToCartId(product._id);
      setTimeout(() => setAddedToCartId(null), 2000);
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      dispatch(setCartFromBackend(data.data));
      setAddedToCartId(product._id);
      setTimeout(() => setAddedToCartId(null), 2000);
    } catch (err) {
      console.error("Add to cart error:", err.message);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky header + subcategory bar ── */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Back + title */}
          <div className="flex items-center gap-2 py-2 border-b border-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors flex-shrink-0 -ml-1 px-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Back</span>
            </button>
            <h1 className="text-sm font-bold text-gray-800 capitalize truncate">
              {decodeURIComponent(categoryName)}
            </h1>
          </div>

          {/* Subcategory pills */}
          <div
            className="flex items-center gap-1.5 py-1.5 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => setActiveSubCategory(null)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border transition-all ${
                activeSubCategory === null
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-500"
              }`}
            >
              All
            </button>

            {!customerCoords && (
              <button
                onClick={() => dispatch(fetchBrowserLocation())}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition"
              >
                <MapPin className="w-3 h-3" />
                Nearby
              </button>
            )}

            {subStatus === "loading" &&
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-14 h-6 bg-gray-200 rounded-full animate-pulse"
                />
              ))}

            {subCategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() =>
                  setActiveSubCategory(
                    sub._id === activeSubCategory ? null : sub._id,
                  )
                }
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border transition-all ${
                  activeSubCategory === sub._id
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-500"
                }`}
              >
                {sub.image && (
                  <img
                    src={`${BASE_URL}${sub.image}`}
                    alt={sub.name}
                    className="w-3 h-3 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="whitespace-nowrap">{sub.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 pb-16 pt-2">
        {/* Loading skeleton */}
        {prodStatus === "loading" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-1.5 animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-lg mb-1.5" />
                <div className="h-2 bg-gray-200 rounded mb-1" />
                <div className="h-2 bg-gray-200 rounded w-2/3 mb-1.5" />
                <div className="h-5 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {prodStatus === "succeeded" && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No products found</p>
            <p className="text-xs mt-1">
              Try selecting a different subcategory
            </p>
          </div>
        )}

        {/* Product grid */}
        {prodStatus === "succeeded" && products.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2">
            {products.map((product) => {
              const imageUrl = product.images?.[0]?.url
                ? product.images[0].url.startsWith("/")
                  ? `${BASE_URL}${product.images[0].url}`
                  : product.images[0].url
                : null;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl p-1.5 hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                  onClick={() => navigate(`/product/${product.slug}`)}
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-1.5 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-50 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-green-200" />
                      </div>
                    )}

                    {getDiscountPct(product) > 0 && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full leading-none">
                        -{getDiscountPct(product)}%
                      </span>
                    )}

                    <div
                      className="absolute top-1 right-1 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WishlistButton
                        productId={product._id}
                        product={product}
                        size={9}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold text-[9px] sm:text-[10px] text-gray-800 line-clamp-2 leading-tight mb-0.5">
                      {product.name}
                    </h3>

                    {product.subCategory && (
                      <p className="text-[8px] text-gray-400 truncate mb-0.5">
                        {product.subCategory.name}
                      </p>
                    )}

                    <div className="mt-auto mb-1">
                      <span className="text-green-700 font-bold text-[10px] sm:text-[11px]">
                        ₹{getCustomerPrice(product)?.toLocaleString()}
                      </span>
                      {(() => {
                        const mrp = getMRP(product);
                        const cp = getCustomerPrice(product);
                        return mrp && mrp > cp ? (
                          <span className="text-[8px] text-gray-400 line-through ml-1">
                            ₹{mrp?.toLocaleString()}
                          </span>
                        ) : null;
                      })()}
                    </div>

                    <button
                      className={`w-full py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-semibold rounded-full transition-all flex items-center justify-center gap-0.5 active:scale-95 ${
                        addedToCartId === product._id
                          ? "bg-green-700 text-white"
                          : "bg-green-50 hover:bg-green-700 text-green-700 hover:text-white"
                      }`}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <ShoppingCart className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
                      {addedToCartId === product._id ? "Added ✓" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
