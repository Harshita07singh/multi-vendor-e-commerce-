import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCartFromBackend } from "../../redux/cartSlice";
import WishlistButton from "../WishlistButton";

import fruits2 from "../../assets/fruits2.png";
import Basket from "../../assets/Basket.png";
import Food from "../../assets/Food.png";
import image from "../../assets/image.png";
import Green from "../../assets/Green.png";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

export default function MergedShopComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 12,
    minutes: 35,
    seconds: 45,
  });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [addedToCartId, setAddedToCartId] = useState(null);

  const slides = [
    { title: "Daily Snacks", image: fruits2, bgColor: "#FBE8DF" },
    { title: "Fresh Bakery", image: Basket, bgColor: "#EBFACC" },
    { title: "Organic Fruits", image: image, bgColor: "#FBE8DF" },
    { title: "Sweet Treats", image: Green, bgColor: "#EBFACC" },
  ];

  useEffect(() => {
    const update = () => setSlidesPerView(window.innerWidth >= 640 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const infiniteSlides = [slides[slides.length - 1], ...slides, slides[0]];

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/products?limit=50`);
        const data = await res.json();
        const prods =
          data.data || data.products || (Array.isArray(data) ? data : []);
        const shuffled = [...prods].sort(() => Math.random() - 0.5).slice(0, 8);
        setProducts(shuffled);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
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

  useEffect(() => {
    const slideTimer = setInterval(() => nextSlide(), 4000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        return prev;
      });
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, []);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex >= infiniteSlides.length - 1) setCurrentIndex(1);
    if (currentIndex <= 0) setCurrentIndex(infiniteSlides.length - 2);
  };

  return (
    <div className="bg-white">
      {/* ── Products Section ── */}
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading Skeleton */}
          {productsLoading && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-2 animate-pulse border border-gray-100"
                >
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg mb-2" />
                  <div className="h-2.5 bg-gray-200 rounded mb-1.5" />
                  <div className="h-2.5 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!productsLoading && products.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No products found</p>
            </div>
          )}

          {/* Product Cards */}
          {!productsLoading && products.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2">
              {products.map((product) => {
                const imageUrl = product.images?.[0]?.url
                  ? product.images[0].url.startsWith("/")
                    ? `${BASE_URL}${product.images[0].url}`
                    : product.images[0].url
                  : null;

                const discountedPrice =
                  product.discount > 0
                    ? Math.round(product.price * (1 - product.discount / 100))
                    : product.price;

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg p-1.5 hover:shadow-md transition-all cursor-pointer group border border-gray-100 flex flex-col"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 mb-1.5">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-50 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-green-200" />
                        </div>
                      )}

                      {/* Discount badge */}
                      {product.discount > 0 && (
                        <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                          -{product.discount}%
                        </span>
                      )}

                      {/* Wishlist */}
                      <div
                        className="absolute top-1 right-1 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WishlistButton
                          productId={product._id}
                          size={10}
                          className="w-5 h-5 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1">
                      <h3 className="font-semibold text-[10px] sm:text-[11px] text-gray-800 line-clamp-2 mb-0.5 leading-tight">
                        {product.name}
                      </h3>

                      {product.category?.name && (
                        <p className="text-[8px] sm:text-[9px] text-gray-400 mb-0.5 truncate">
                          {product.category.name}
                        </p>
                      )}

                      {product.ratingsAverage > 0 && (
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <Star className="w-2 h-2 fill-orange-400 text-orange-400 flex-shrink-0" />
                          <span className="text-[9px] text-gray-600 font-medium">
                            {product.ratingsAverage.toFixed(1)}
                          </span>
                          {product.ratingsCount > 0 && (
                            <span className="text-[8px] text-gray-400">
                              ({product.ratingsCount})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-0.5 flex-wrap mb-1 mt-auto">
                        <span className="text-green-700 font-bold text-[11px] sm:text-xs">
                          ₹{discountedPrice.toLocaleString()}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-gray-400 text-[8px] sm:text-[9px] line-through">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                        {product.unit && (
                          <span className="text-[8px] text-gray-400">
                            /{product.unit}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <button
                        className={`w-full py-1 text-[9px] sm:text-[10px] font-semibold rounded-full transition-all flex items-center justify-center gap-1 ${
                          addedToCartId === product._id
                            ? "bg-green-700 text-white"
                            : "bg-green-50 hover:bg-green-700 text-green-700 hover:text-white"
                        }`}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingCart className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {addedToCartId === product._id ? "Added ✓" : "Add"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
