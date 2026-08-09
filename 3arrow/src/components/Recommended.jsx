import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  LayoutGrid,
  Car,
  Cpu,
  Apple,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Baby,
  Gem,
  Smartphone,
  UtensilsCrossed,
  Bike,
  Sofa,
  Palette,
  PawPrint,
  Leaf,
  Wrench,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return img.startsWith("/") ? `${BASE_URL}${img}` : `${BASE_URL}/${img}`;
};

const CATEGORY_ICONS = {
  all: LayoutGrid,
  car: Car,
  cars: Car,
  electronics: Cpu,
  food: Apple,
  "casual wear": Shirt,
  clothing: Shirt,
  fashion: Shirt,
  home: Home,
  fitness: Dumbbell,
  sports: Dumbbell,
  books: BookOpen,
  baby: Baby,
  kids: Baby,
  "kids wear": Baby,
  jewelry: Gem,
  accessories: Gem,
  mobile: Smartphone,
  smartphones: Smartphone,
  kitchen: UtensilsCrossed,
  furniture: Sofa,
  beauty: Palette,
  pets: PawPrint,
  organic: Leaf,
  tools: Wrench,
  bikes: Bike,
};

function getCategoryIcon(name) {
  const key = name?.toLowerCase?.() || "";
  return CATEGORY_ICONS[key] || Package;
}

export default function Recommended() {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  const [activeTab, setActiveTab] = useState("All");
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    // Small delay to let DOM settle after products render
    const t = setTimeout(checkScroll, 100);
    return () => clearTimeout(t);
  }, [subCategories]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/categories`);
        const data = await res.json();
        const cats = data.data || data.categories || data || [];
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        const matchedCat = categories.find((c) => c.name === activeTab);
        const url =
          activeTab === "All"
            ? `${BASE_URL}/api/subcategories`
            : matchedCat
              ? `${BASE_URL}/api/subcategories?category=${matchedCat._id}`
              : `${BASE_URL}/api/subcategories`;

        const res = await fetch(url);
        const data = await res.json();
        const subs = Array.isArray(data)
          ? data
          : (data?.subCategories ?? data?.data ?? []);

        // Show newest first
        const sorted = [...subs].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        setSubCategories(sorted);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [activeTab, categories]);

  const tabs = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="max-w-9xl bg-white py-3 px-3 sm:px-5">
      <div className="max-w-9xl mx-auto">
        {/* ── Filter Tabs ── */}
        <div className="relative mb-3">
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />
          <div
            className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div
              className="flex gap-1.5 pb-1"
              style={{ flexWrap: "nowrap", minWidth: "max-content" }}
            >
              {tabs.map((tab) => {
                const Icon = getCategoryIcon(tab);
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border flex-shrink-0 ${
                      isActive
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-gray-600 hover:text-green-600 hover:border-green-300 border-gray-200"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}
                    />
                    <span>{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div
            className="flex gap-3 overflow-hidden"
            style={{ flexWrap: "nowrap" }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse text-center flex-shrink-0"
                style={{ width: "72px", minWidth: "72px" }}
              >
                <div className="w-full aspect-square bg-gray-100 rounded-xl mb-1.5" />
                <div className="h-2 bg-gray-100 rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && subCategories.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="w-5 h-5 mx-auto text-gray-200 mb-1.5" />
            <p className="text-gray-400 text-xs">No subcategories found</p>
          </div>
        )}

        {/* ── Subcategories Carousel ── */}
        {!loading && subCategories.length > 0 && (
          <div className="relative group/carousel">
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-700 hover:border-green-300 transition-all opacity-0 group-hover/carousel:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable track */}
            <div
              ref={trackRef}
              onScroll={checkScroll}
              className="flex gap-3 overflow-x-auto pb-1"
              style={{
                flexWrap: "nowrap",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
              }}
            >
              {subCategories.map((sub) => {
                const imageUrl = getImageUrl(sub.image);

                return (
                  <div
                    key={sub._id}
                    className="cursor-pointer group/card text-center flex-shrink-0"
                    style={{
                      width: "72px",
                      minWidth: "72px",
                      maxWidth: "72px",
                    }}
                    onClick={() =>
                      navigate(
                        `/subcategory/${sub._id}/${encodeURIComponent(sub.name || "")}`,
                      )
                    }
                  >
                    {/* Image */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-1.5 shadow-sm group-hover/card:shadow-md transition-shadow duration-200">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-50 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-green-200" />
                        </div>
                      )}
                    </div>
                    {/* Name */}
                    <p className="text-[10px] text-gray-700 font-medium line-clamp-1 leading-tight px-0.5">
                      {sub.name}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-700 hover:border-green-300 transition-all opacity-0 group-hover/carousel:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
