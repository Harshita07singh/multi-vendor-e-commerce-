import { useState } from "react";
import { TrendingUp, TrendingDown, MoreHorizontal, ShoppingCart, Users, Store, Truck } from "lucide-react";

const TOP_TOURS = {
  Yesterday: [
    { name: "Tomoto",       sales: "600k Sales", rating: 3 },
    { name: "Coconut Water",sales: "480k Sales", rating: 4 },
  ],
  Today: [
    { name: "fruits",      sales: "320k Sales", rating: 4 },
    { name: "vegetables",  sales: "290k Sales", rating: 5 },
  ],
  Monthly: [
    { name: "Apple", sales: "1.2M Sales", rating: 5 },
    { name: "mango", sales: "980k Sales", rating: 4 },
  ],
};

// ── 4 Stat Cards ─────────────────────────────────────────────
const STAT_CARDS = [
  {
    label:  "Orders",
    value:  "6.29k",
    change: "0.43%",
    up:     true,
    days:   30,
    color:  "#3B82F6",
    bg:     "#EFF6FF",
    Icon:   ShoppingCart,
  },
  {
    label:  "Users",
    value:  "4.39k",
    change: "0.43%",
    up:     true,
    days:   30,
    color:  "#10B981",
    bg:     "#ECFDF5",
    Icon:   Users,
  },
  {
    label:  "Vendors",
    value:  "1,280",
    change: "1.2%",
    up:     true,
    days:   30,
    color:  "#8B5CF6",
    bg:     "#F5F3FF",
    Icon:   Store,
  },
  {
    label:  "Delivery Management",
    value:  "956",
    change: "0.43%",
    up:     false,
    days:   30,
    color:  "#F59E0B",
    bg:     "#FFFBEB",
    Icon:   Truck,
  },
];

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= count ? "#F59E0B" : "#E2E8F0", fontSize: 14 }}>★</span>
      ))}
    </div>
  );
}

const SuperAdminDashboardContent = () => {
  const [period, setPeriod]             = useState("Today");
  const [showPeriodDrop, setShowPeriodDrop] = useState(false);
  const [showCardMenu, setShowCardMenu]   = useState(null);

  const tours = TOP_TOURS[period] || [];

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ══ ROW 1: Welcome Banner + Top Selling ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Welcome Banner */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden relative flex items-center"
          style={{
            background: "linear-gradient(120deg, #A8D8EA 0%, #B8E0F7 40%, #C5EDFF 70%, #E8F7C5 100%)",
            minHeight: 200,
          }}
        >
          <div style={{ position:"absolute", top:16, right:200, fontSize:40, opacity:0.7 }}>☁️</div>
          <div style={{ position:"absolute", top:30, right:120, fontSize:28, opacity:0.5 }}>☁️</div>
          <div className="relative z-10 px-8 py-8">
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: "#1a4a6b" }}>Hello, John Doe</h2>
            <p className="text-sm mb-5" style={{ color: "#2d6a8f" }}>Welcome back, your dashboard is ready!</p>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: "#F59E0B", color: "#fff", boxShadow: "0 4px 12px rgba(245,158,11,0.35)" }}
            >
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 right-8 text-8xl select-none hidden md:block" style={{ lineHeight: 1 }}>🧳</div>
          <div style={{
            position:"absolute", right:60, top:"50%", transform:"translateY(-50%)",
            width:140, height:140, borderRadius:"50%",
            background:"radial-gradient(circle, #FFD700 0%, #FFA500 70%)",
            opacity:0.55, pointerEvents:"none",
          }} />
        </div>

        {/* Top Selling */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Top Selling Tour</h3>
            <div className="relative">
              <button
                onClick={() => setShowPeriodDrop(!showPeriodDrop)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                {period}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showPeriodDrop && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden" style={{ width: 120 }}>
                  {["Yesterday","Today","Monthly"].map(p => (
                    <div key={p}
                      onClick={() => { setPeriod(p); setShowPeriodDrop(false); }}
                      className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50"
                      style={{ color: period === p ? "#299E60" : "#374151", fontWeight: period === p ? 700 : 500 }}
                    >{p}</div>
                  ))}
                </div>
              )}
              {showPeriodDrop && <div className="fixed inset-0 z-10" onClick={() => setShowPeriodDrop(false)} />}
            </div>
          </div>
          <div className="space-y-3">
            {tours.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <div
                  className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
                  style={{ background: ["#EEF2FF","#ECFDF5","#FFFBEB"][i % 3] }}
                >
                  {["🏖️","🌅","🗺️","🏝️"][i % 4]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.name}</p>
                  <Stars count={t.rating} />
                  <p className="text-xs text-gray-400 mt-0.5">{t.sales}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ROW 2: 4 Stat Cards ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.Icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 relative overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 3-dot menu */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setShowCardMenu(showCardMenu === i ? null : i)}
                  className="text-gray-300 hover:text-gray-500 transition-colors bg-transparent cursor-pointer"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showCardMenu === i && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 w-32">
                    {["View Details","Export","Share"].map(item => (
                      <div key={item} onClick={() => setShowCardMenu(null)}
                        className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">{item}</div>
                    ))}
                  </div>
                )}
                {showCardMenu === i && <div className="fixed inset-0 z-10" onClick={() => setShowCardMenu(null)} />}
              </div>

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.bg }}
              >
                <Icon size={18} style={{ color: card.color }} />
              </div>

              {/* Label */}
              <p className="text-xs font-semibold text-gray-500 mb-1 leading-tight">{card.label}</p>

              {/* Value */}
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-800 mb-2">{card.value}</h3>

              {/* Change indicator */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div
                  className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: card.up ? "#DCFCE7" : "#FEE2E2",
                    color:      card.up ? "#15803D" : "#B91C1C",
                  }}
                >
                  {card.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {card.change}
                </div>
                <span className="text-xs text-gray-400">({card.days}d)</span>
              </div>

              {/* NO bottom color bar — removed as requested */}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default SuperAdminDashboardContent;