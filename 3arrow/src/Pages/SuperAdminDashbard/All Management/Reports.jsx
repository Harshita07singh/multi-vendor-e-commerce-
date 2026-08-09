import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, ShoppingCart, Users, Truck, DollarSign,
  Package, RefreshCcw, Star, ArrowUp, ArrowDown, Bell,
  Store, XCircle, CheckCircle
} from "lucide-react";

const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

// ── Mock Data ──
const SALES_DATA = {
  today: [
    { time: "9am",  sales: 12000 }, { time: "11am", sales: 18000 },
    { time: "1pm",  sales: 25000 }, { time: "3pm",  sales: 21000 },
    { time: "5pm",  sales: 31000 }, { time: "7pm",  sales: 27000 },
    { time: "9pm",  sales: 15000 },
  ],
  week: [
    { time: "Mon", sales: 85000  }, { time: "Tue", sales: 92000  },
    { time: "Wed", sales: 78000  }, { time: "Thu", sales: 110000 },
    { time: "Fri", sales: 135000 }, { time: "Sat", sales: 160000 },
    { time: "Sun", sales: 120000 },
  ],
  month: [
    { time: "Week 1", sales: 320000 }, { time: "Week 2", sales: 410000 },
    { time: "Week 3", sales: 380000 }, { time: "Week 4", sales: 520000 },
  ],
};

const ORDERS_DATA = {
  today: [
    { time: "9am",  orders: 8  }, { time: "11am", orders: 14 },
    { time: "1pm",  orders: 22 }, { time: "3pm",  orders: 18 },
    { time: "5pm",  orders: 27 }, { time: "7pm",  orders: 20 },
    { time: "9pm",  orders: 11 },
  ],
  week: [
    { time: "Mon", orders: 62  }, { time: "Tue", orders: 74  },
    { time: "Wed", orders: 55  }, { time: "Thu", orders: 88  },
    { time: "Fri", orders: 105 }, { time: "Sat", orders: 130 },
    { time: "Sun", orders: 94  },
  ],
  month: [
    { time: "Week 1", orders: 280 }, { time: "Week 2", orders: 340 },
    { time: "Week 3", orders: 310 }, { time: "Week 4", orders: 420 },
  ],
};

const ORDER_STATUS_DATA = [
  { name: "Delivered",  value: 68, color: "#22c55e" },
  { name: "Pending",    value: 18, color: "#f59e0b" },
  { name: "Cancelled",  value: 9,  color: "#ef4444" },
  { name: "In Transit", value: 5,  color: "#3b82f6" },
];

const TOP_VENDORS = [
  { name: "FoodCorner",  sales: "Rs 2.1M", orders: 650, rating: 4.9, growth: "+12%" },
  { name: "TechZone",    sales: "Rs 3.4M", orders: 820, rating: 4.6, growth: "+8%"  },
  { name: "FreshMart",   sales: "Rs 1.2M", orders: 340, rating: 4.8, growth: "+15%" },
  { name: "StyleHub",    sales: "Rs 0.8M", orders: 210, rating: 4.2, growth: "-3%"  },
  { name: "BookWorld",   sales: "Rs 0.5M", orders: 180, rating: 4.4, growth: "+5%"  },
];

const TOP_USERS = [
  { name: "Omar Farooq",   spent: "Rs 78,900", orders: 21, city: "Karachi"   },
  { name: "Zainab Khan",   spent: "Rs 61,500", orders: 17, city: "Karachi"   },
  { name: "Ayesha Malik",  spent: "Rs 45,200", orders: 12, city: "Karachi"   },
  { name: "David Lee",     spent: "Rs 28,400", orders: 8,  city: "Lahore"    },
  { name: "Sara Ahmed",    spent: "Rs 15,300", orders: 5,  city: "Multan"    },
];

const TOP_RIDERS = [
  { name: "Bilal Ahmed",  trips: 342, rating: 4.7, earning: "Rs 68,400" },
  { name: "Hamza Sheikh", trips: 275, rating: 4.8, earning: "Rs 55,000" },
  { name: "Rahul Gupta",  trips: 218, rating: 4.5, earning: "Rs 43,600" },
  { name: "Faraz Khan",   trips: 187, rating: 4.5, earning: "Rs 37,400" },
  { name: "Sam Wilson",   trips: 156, rating: 4.6, earning: "Rs 31,200" },
];

const REFUND_DATA = [
  { name: "Pending",  value: 4, color: "#f59e0b" },
  { name: "Approved", value: 1, color: "#22c55e" },
  { name: "Rejected", value: 1, color: "#ef4444" },
];

const CATEGORY_DATA = [
  { name: "Electronics", sales: 34 },
  { name: "Restaurant",  sales: 21 },
  { name: "Grocery",     sales: 18 },
  { name: "Fashion",     sales: 14 },
  { name: "Books",       sales: 8  },
  { name: "Home",        sales: 5  },
];

// ── Summary Stats per filter ──
const SUMMARY = {
  today: {
    revenue:  "Rs 1,49,000", revenueGrow: "+11%", revenueUp: true,
    orders:   120,            ordersGrow:  "+8%",  ordersUp:  true,
    newUsers: 14,             usersGrow:   "+5%",  usersUp:   true,
    deliveries: 98,           delivGrow:   "+6%",  delivUp:   true,
    refunds:  3,              refundGrow:  "-2%",  refundUp:  false,
    avgOrder: "Rs 1,241",     avgGrow:     "+3%",  avgUp:     true,
  },
  week: {
    revenue:  "Rs 7,80,000", revenueGrow: "+14%", revenueUp: true,
    orders:   608,            ordersGrow:  "+10%", ordersUp:  true,
    newUsers: 87,             usersGrow:   "+9%",  usersUp:   true,
    deliveries: 540,          delivGrow:   "+7%",  delivUp:   true,
    refunds:  12,             refundGrow:  "+1%",  refundUp:  false,
    avgOrder: "Rs 1,282",     avgGrow:     "+4%",  avgUp:     true,
  },
  month: {
    revenue:  "Rs 16,30,000", revenueGrow: "+18%", revenueUp: true,
    orders:   1350,           ordersGrow:  "+15%", ordersUp:  true,
    newUsers: 312,            usersGrow:   "+21%", usersUp:   true,
    deliveries: 1190,         delivGrow:   "+12%", delivUp:   true,
    refunds:  6,              refundGrow:  "-5%",  refundUp:  false,
    avgOrder: "Rs 1,207",     avgGrow:     "+2%",  avgUp:     true,
  },
};

// ── Components ──
function SummaryCard({ label, value, grow, up, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-50 p-3 md:p-4 relative overflow-hidden hover:shadow-md transition-all">
      {/* <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-green-50" /> */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
          <Icon size={14} color="#16a34a" />
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5
          ${up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {up ? <ArrowUp size={8} /> : <ArrowDown size={8} />}{grow}
        </span>
      </div>
      <p className="text-lg md:text-xl font-extrabold text-gray-900 m-0 leading-none">{value}</p>
      <p className="text-[10px] md:text-xs font-semibold text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-extrabold text-gray-800 m-0">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, prefix = "Rs " }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-green-100 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs font-bold text-gray-500 m-0">{label}</p>
        <p className="text-sm font-extrabold text-green-600 m-0">{prefix}{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [period, setPeriod] = useState("week");
  const s = SUMMARY[period];

  const summaryCards = [
    { label: "Total Revenue",    value: s.revenue,    grow: s.revenueGrow, up: s.revenueUp,  icon: DollarSign  },
    { label: "Total Orders",     value: s.orders,     grow: s.ordersGrow,  up: s.ordersUp,   icon: ShoppingCart },
    { label: "New Users",        value: s.newUsers,   grow: s.usersGrow,   up: s.usersUp,    icon: Users        },
    { label: "Deliveries",       value: s.deliveries, grow: s.delivGrow,   up: s.delivUp,    icon: Truck        },
    { label: "Refunds",          value: s.refunds,    grow: s.refundGrow,  up: s.refundUp,   icon: RefreshCcw   },
    { label: "Avg Order Value",  value: s.avgOrder,   grow: s.avgGrow,     up: s.avgUp,      icon: TrendingUp   },
  ];

  return (
    <div className="p-3 md:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-extrabold text-gray-800 m-0">Reports & Analytics</h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">Full e-commerce performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Filter */}
          <div className="flex gap-1 bg-green-50 rounded-xl p-1">
            {[["today","Today"], ["week","This Week"], ["month","This Month"]].map(([key, label]) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all whitespace-nowrap
                  ${period === key ? "text-white shadow-sm" : "bg-transparent text-green-700"}`}
                style={period === key ? GS : {}}>
                {label}
              </button>
            ))}
          </div>
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center cursor-pointer">
            <Bell size={16} color="#16a34a" />
          </div>
        </div>
      </div>
 
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {summaryCards.map((c, i) => <SummaryCard key={i} {...c} />)}
      </div>

      {/* Charts Row  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <SectionTitle title="Sales Revenue" sub={`Revenue trend — ${period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}`} />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={SALES_DATA[period]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}  
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <SectionTitle title="Order Volume" sub={`Orders trend — ${period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}`} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ORDERS_DATA[period]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip prefix="" />} />
              <Bar dataKey="orders" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 — Order Status Pie + Category Bar + Refund Pie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <SectionTitle title="Order Status" sub="Distribution" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ORDER_STATUS_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {ORDER_STATUS_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
            {ORDER_STATUS_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                <span className="text-[10px] text-gray-500 font-semibold">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sales Bar */} 
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <SectionTitle title="Sales by Category" sub="% share" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CATEGORY_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="sales" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Refund Pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <SectionTitle title="Refund Status" sub="Distribution" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={REFUND_DATA} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                {REFUND_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
            {REFUND_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                <span className="text-[10px] text-gray-500 font-semibold">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row — Top Vendors + Top User */}


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Vendors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-green-50 flex items-center gap-2">
            <Store size={14} color="#16a34a" />
            <div>
              <p className="text-sm font-extrabold text-gray-800 m-0">Top Vendors</p>
              <p className="text-xs text-gray-400">By total sales</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}>
                  {["Vendor", "Sales", "Orders", "Rating", "Growth"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-green-700 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_VENDORS.map((v, idx) => (
                  <tr key={v.name} className="hover:bg-green-50/40 transition-colors"
                    style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4" }}>
                    <td className="px-4 py-2.5 text-sm font-bold text-gray-800">{v.name}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-600">{v.sales}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{v.orders}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">⭐ {v.rating}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${v.growth.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {v.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         </div>

        {/* Top Users */}


        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-green-50 flex items-center gap-2">
            <Users size={14} color="#16a34a" />
            <div>
              <p className="text-sm font-extrabold text-gray-800 m-0">Top Customers</p>
              <p className="text-xs text-gray-400">By total spending</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}>
                  {["Customer", "Spent", "Orders", "City"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-green-700 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_USERS.map((u, idx) => (
                  <tr key={u.name} className="hover:bg-green-50/40 transition-colors"
                    style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4" }}>
                    <td className="px-4 py-2.5 text-sm font-bold text-gray-800">{u.name}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-600">{u.spent}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{u.orders}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{u.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> 

      {/* Top Riders Table */}
      

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-green-50 flex items-center gap-2">
          <Truck size={14} color="#16a34a" />
          <div>
            <p className="text-sm font-extrbold text-gray-800 m-0">Top Riders</p>
            <p className="text-xs text-gray-400">By total trips completed</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}>
                {["#", "Rider", "Trips", "Earning", "Rating"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-green-700 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_RIDERS.map((r, idx) => (
                <tr key={r.name} className="hover:bg-green-50/40 transition-colors"
                  style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4" }}>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center
                      ${idx === 0 ? "bg-yellow-100 text-yellow-600" : idx === 1 ? "bg-gray-100 text-gray-500" : idx === 2 ? "bg-orange-100 text-orange-500" : "text-gray-400"}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-bold text-gray-800">{r.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">{r.trips} trips</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-gray-600">{r.earning}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">⭐ {r.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> 

    </div>
  );
}