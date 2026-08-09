import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getServerBase } from "../../config/apiConfig";
// Fallback images — tab use honge jab API fail ho ya koi banner na ho
import fruits2 from "../../assets/fruits2.png";
import Food from "../../assets/Food.png";
import Basket from "../../assets/Basket.png";

const fallbackSlides = [
  { image: fruits2, link: "#", title: "" },
  { image: Food, link: "#", title: "" },
  { image: Basket, link: "#", title: "" },
];

// ── Build server base URL without relying on env vars being set ──────────────
// Works on both localhost dev and production without needing .env configuration
// const getServerBase = () => {
//   if (import.meta.env.VITE_API_BASE_URL_UB) {
//     return import.meta.env.VITE_API_BASE_URL_UB;
//   }
//   const { hostname, protocol } = window.location;
//   const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
//   return isLocal ? "http://localhost:3000" : `${protocol}//${hostname}`;
// };

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch banners from API ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const serverBase = getServerBase();
        const res = await fetch(`${serverBase}/api/hero-banners`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // Controller returns plain array — guard against future wrapper shapes too
        const data = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.banners)
              ? json.banners
              : [];

        if (data.length > 0) {
          const apiSlides = data
            .filter((b) => b.isActive)
            .sort((a, b) => a.order - b.order)
            .map((b) => ({
              image: b.image
                ? b.image.startsWith("http")
                  ? b.image
                  : `${serverBase}${b.image.startsWith("/") ? "" : "/"}${b.image}`
                : null,
              link: b.link || "#",
              title: b.title || "",
            }))
            .filter((s) => s.image);

          setSlides(apiSlides.length > 0 ? apiSlides : fallbackSlides);
        } else {
          setSlides(fallbackSlides);
        }
      } catch (err) {
        console.warn(
          "HeroSlider: API unavailable, using fallback:",
          err.message,
        );
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const nextSlide = useCallback(
    () => setCurrentSlide((prev) => (prev + 1) % slides.length),
    [slides.length],
  );

  const prevSlide = useCallback(
    () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length),
    [slides.length],
  );

  // ── Auto-play ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-9xl mx-auto px-4 sm:px-6 mt-6">
        <div className="w-full h-[250px] sm:h-[400px] md:h-[450px] bg-gray-200 animate-pulse rounded-3xl" />
      </div>
    );
  }

  const current = slides[currentSlide];

  return (
    <div className="max-w-9xl mx-auto px-4 sm:px-6 mt-6 relative overflow-hidden rounded-3xl">
      {/* ── Banner Image ── */}
      <a
        href={current.link}
        aria-label={current.title || `Banner ${currentSlide + 1}`}
      >
        <img
          key={current.image}
          src={current.image}
          alt={current.title || `Banner ${currentSlide + 1}`}
          className="w-full h-[250px] sm:h-[400px] md:h-[450px] object-cover rounded-3xl transition-opacity duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fruits2;
          }}
        />
      </a>

      {/* ── Left Arrow ── */}
      {slides.length > 1 && (
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-20"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
      )}

      {/* ── Right Arrow ── */}
      {slides.length > 1 && (
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-20"
        >
          <ChevronRight size={24} className="text-gray-700" />
        </button>
      )}

      {/* ── Dot Indicators ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background:
                  i === currentSlide ? "#166534" : "rgba(255,255,255,0.7)",
                transform: i === currentSlide ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
