import React, { useEffect, useRef, useState } from "react";
import { flashSaleAPI } from "../services/api";
import { Zap, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Countdown Timer ─── */
const Countdown = ({ endDate }) => {
  const calc = () => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc());
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      {[
        { label: "HRS", value: pad(time.h) },
        { label: "MIN", value: pad(time.m) },
        { label: "SEC", value: pad(time.s) },
      ].map(({ label, value }, i) => (
        <React.Fragment key={label}>
          {i > 0 && (
            <span className="text-white/60 font-bold text-lg mb-3">:</span>
          )}
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-2.5 py-1.5 min-w-[44px] text-center">
              <span className="text-white font-mono font-bold text-lg leading-none">
                {value}
              </span>
            </div>
            <span className="text-white/50 text-[9px] font-semibold tracking-widest mt-1">
              {label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─── Single Grid Card ─── */
const SaleCard = ({ sale }) => {
  const navigate = useNavigate();
  const approvedCount = sale.products?.filter((p) => p.isApproved)?.length || 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer h-[220px] sm:h-[240px] md:h-[330px]"
      onClick={() => navigate(`/daily-sale/${sale._id}`)}
    >
      {/* Background */}
      {sale.bannerImage ? (
        <img
          src={sale.bannerImage}
          alt={sale.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: sale.bannerColor || "#e63946" }}
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5 border border-white/10" />
      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/5 border border-white/10" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            LIVE SALE
          </span>
          <span className="text-white/60 text-xs font-medium">
            {approvedCount} {approvedCount === 1 ? "deal" : "deals"}
          </span>
        </div>

        {/* Middle: title + banner text + countdown */}
        <div>
          <h2 className="text-white font-extrabold text-xl sm:text-2xl leading-tight mb-1 drop-shadow">
            {sale.title}
          </h2>
          {sale.displayBannerText && (
            <p className="text-white/75 text-sm mb-3">
              {sale.displayBannerText}
            </p>
          )}
          <Countdown endDate={sale.endDate} />
        </div>

        {/* Bottom: CTA */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/daily-sale/${sale._id}`);
            }}
            className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold text-sm px-5 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 w-fit"
          >
            Shop Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Sales Grid / Mobile Slider ─── */
const SaleGrid = ({ sales }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const startX = useRef(null);
  const isDragging = useRef(false);

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(index, sales.length - 1));
    setActiveIndex(clamped);
    sliderRef.current?.scrollTo({
      left: sliderRef.current.offsetWidth * clamped,
      behavior: "smooth",
    });
  };

  // Sync dot indicator on native scroll
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const idx = Math.round(
      sliderRef.current.scrollLeft / sliderRef.current.offsetWidth,
    );
    setActiveIndex(idx);
  };

  // Touch / pointer drag support
  const onPointerDown = (e) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };
  const onPointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = startX.current - e.clientX;
    if (Math.abs(delta) > 40) goTo(activeIndex + (delta > 0 ? 1 : -1));
  };

  return (
    <>
      {/* ── Mobile: horizontal snap slider ── */}
      <div className="sm:hidden relative">
        <div
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {/* hide webkit scrollbar via inline style since we can't add global CSS here */}
          <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
          {sales.map((sale) => (
            <div
              key={sale._id}
              className="snap-center shrink-0 w-[88vw] first:ml-[6vw] last:mr-[6vw]"
            >
              <SaleCard sale={sale} />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {sales.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {sales.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-red-500 w-5 h-2"
                    : "bg-gray-300 w-2 h-2"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Tablet / Desktop: grid ── */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sales.map((sale) => (
          <SaleCard key={sale._id} sale={sale} />
        ))}
      </div>
    </>
  );
};

/* ─── DailySale Page ─── */
const DailySale = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveSales = async () => {
      try {
        const data = await flashSaleAPI.getLiveSales();
        setSales(Array.isArray(data) ? data : []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchLiveSales();
    const t = setInterval(fetchLiveSales, 60000);
    return () => clearInterval(t);
  }, []);

  if (loading || sales.length === 0) return null;

  return (
    <div>
      <div className="max-w-9xl mx-auto px-4 sm:px-6 py-1">
        <SaleGrid sales={sales} />
      </div>
    </div>
  );
};

export default DailySale;
