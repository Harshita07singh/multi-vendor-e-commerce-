import { useState, useEffect } from "react";

// ── Donut Chart ──────────────────────────────────────────────
function DonutChart({ percentage, color }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percentage), 100);
    return () => clearTimeout(t);
  }, [percentage]);

  const animatedOffset = circ - (animated / 100) * circ;

  return (
    <div className="relative w-36 h-36 md:w-44 md:h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
        <circle cx="96" cy="96" r={r} stroke="#f0f0f0" strokeWidth="20" fill="none" />
        <circle
          cx="96" cy="96" r={r}
          stroke={color} strokeWidth="20" fill="none"
          strokeDasharray={circ}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl md:text-3xl font-bold text-gray-800">{percentage}%</span>
      </div>
    </div>
  );
}

// ── Weekly Revenue Line Chart ────────────────────────────────
function WeeklyRevenueChart() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const thisWeek = [200, 350, 280, 500, 420, 600, 480];
  const lastWeek = [150, 280, 320, 400, 360, 500, 380];

  const maxVal = 800;
  const width = 420;
  const height = 160;
  const padX = 30;
  const padY = 10;

  const toX = (i) => padX + (i / (days.length - 1)) * (width - padX * 2);
  const toY = (v) => padY + (1 - v / maxVal) * (height - padY * 2);
  const polyline = (data) => data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full" style={{ minWidth: 220 }}>
        {[0, 200, 400, 600, 800].map((v) => (
          <g key={v}>
            <line x1={padX} y1={toY(v)} x2={width - padX} y2={toY(v)} stroke="#f0f0f0" strokeWidth="1" />
            <text x={0} y={toY(v) + 4} fontSize="9" fill="#bbb">{v}</text>
          </g>
        ))}
        <polyline points={polyline(lastWeek)} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ opacity: 0.8 }} />
        <polyline points={polyline(thisWeek)} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {thisWeek.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={hovered === i ? 6 : 4}
            fill={hovered === i ? "#0ea5e9" : "#fff"} stroke="#38bdf8" strokeWidth="2"
            style={{ cursor: "pointer", transition: "r 0.2s" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          />
        ))}
        {hovered !== null && (
          <g>
            <rect x={toX(hovered) - 38} y={toY(thisWeek[hovered]) - 30} width={76} height={22} rx={4} fill="#0ea5e9" />
            <text x={toX(hovered)} y={toY(thisWeek[hovered]) - 14} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">
              {days[hovered]} ${thisWeek[hovered]}
            </text>
          </g>
        )}
        {days.map((d, i) => (
          <text key={d} x={toX(i)} y={height + 22} textAnchor="middle" fontSize="10" fill="#9ca3af">{d}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Main Statistics Section ──────────────────────────────────
export default function StatisticsSection() {
  return (
    <div className="px-4 md:px-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

        {/* Monthly Booking */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Statistics</p>
          <h3 className="text-base font-bold text-gray-700 mb-4">Monthly Orders</h3>
          <div className="flex flex-col items-center gap-3">
            <DonutChart percentage={90} color="#38bdf8" />
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-0.5">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">6,29k</p>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Statistics</p>
          <h3 className="text-base font-bold text-gray-700 mb-4">Monthly Revenue</h3>
          <div className="flex flex-col items-center gap-3">
            <DonutChart percentage={80} color="#fbbf24" />
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-0.5">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">$956,290</p>
            </div>
          </div>
        </div>

        {/* Weekly Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Statistics</p>
          <h3 className="text-base font-bold text-gray-700 mb-3">Weekly Revenue</h3>
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-sky-400" />
              <span className="text-xs text-gray-500">This Week ($290k)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-xs text-gray-500">Last Week ($380k)</span>
            </div>
          </div>
          <WeeklyRevenueChart />
        </div>

      </div>
    </div>
  );
}