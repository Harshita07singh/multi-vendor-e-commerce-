import { useState } from "react";
import {
  Truck, Search, Plus, Trash2, CheckCircle, XCircle, Eye,
  MoreVertical, TrendingUp, Star, DollarSign, MapPin,
  Bell, X, Phone, Calendar, Navigation
} from "lucide-react";

const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

const INIT_RIDERS = [
  { id: 1, name: "Bilal Ahmed",  email: "bilal@delivery.com", phone: "+92-330-9999999", avatar: "BA", status: "Active",      joined: "Jan 15, 2024", city: "Karachi",   trips: 342, earning: "Rs 68,400", rating: 4.7, vehicle: "Bike",    lastDelivery: "Feb 23, 2024" },
  { id: 2, name: "Rahul Gupta",  email: "rahul@delivery.com", phone: "+92-331-0000000", avatar: "RG", status: "On Delivery", joined: "Feb 28, 2024", city: "Lahore",    trips: 218, earning: "Rs 43,600", rating: 4.5, vehicle: "Bike",    lastDelivery: "Feb 23, 2024" },
  { id: 3, name: "Zara Hussain", email: "zara@delivery.com",  phone: "+92-332-1111111", avatar: "ZH", status: "Inactive",    joined: "Apr 7, 2024",  city: "Islamabad", trips: 89,  earning: "Rs 17,800", rating: 4.3, vehicle: "Scooter", lastDelivery: "Jan 10, 2024" },
  { id: 4, name: "Sam Wilson",   email: "sam@delivery.com",   phone: "+92-333-2222222", avatar: "SW", status: "Active",      joined: "May 30, 2024", city: "Karachi",   trips: 156, earning: "Rs 31,200", rating: 4.6, vehicle: "Bike",    lastDelivery: "Feb 22, 2024" },
  { id: 5, name: "Hamza Sheikh", email: "hamza@delivery.com", phone: "+92-334-3333333", avatar: "HS", status: "On Delivery", joined: "Jun 12, 2024", city: "Lahore",    trips: 275, earning: "Rs 55,000", rating: 4.8, vehicle: "Car",     lastDelivery: "Feb 23, 2024" },
  { id: 6, name: "Nadia Ali",    email: "nadia@delivery.com", phone: "+92-335-4444444", avatar: "NA", status: "Active",      joined: "Jul 19, 2024", city: "Multan",    trips: 98,  earning: "Rs 19,600", rating: 4.4, vehicle: "Scooter", lastDelivery: "Feb 21, 2024" },
  { id: 7, name: "Usman Tariq",  email: "usman@delivery.com", phone: "+92-336-5555555", avatar: "UT", status: "Inactive",    joined: "Aug 5, 2024",  city: "Karachi",   trips: 42,  earning: "Rs 8,400",  rating: 3.9, vehicle: "Bike",    lastDelivery: "Dec 15, 2023" },
  { id: 8, name: "Faraz Khan",   email: "faraz@delivery.com", phone: "+92-337-6666666", avatar: "FK", status: "Active",      joined: "Sep 22, 2024", city: "Islamabad", trips: 187, earning: "Rs 37,400", rating: 4.5, vehicle: "Car",     lastDelivery: "Feb 23, 2024" },
];

const VEHICLES = ["Bike", "Scooter", "Car", "Van"];

function Av({ text, size = 36, soft = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: soft ? "rgba(255,255,255,0.25)" : G,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size < 32 ? 9 : size < 42 ? 11 : 15,
      fontWeight: 700, flexShrink: 0,
    }}>{text}</div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    Active:        { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
    Inactive:      { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
    "On Delivery": { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  }[status] || { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: cfg.bg, color: cfg.color,
      fontSize: 10, fontWeight: 700,
      padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-white shadow-sm border border-green-50 hover:shadow-md transition-all duration-200">
      {/* <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-green-50" /> */}
      <div className="p-2.5 md:p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-green-50">
            <Icon size={13} color="#16a34a" />
          </div>
          <div className="hidden md:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            <TrendingUp size={8} />{sub}
          </div>
        </div>
        <p className="text-lg md:text-2xl font-extrabold m-0 leading-none text-gray-900">{value}</p>
        <p className="text-[10px] md:text-[11px] font-semibold mt-1 truncate text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="p-5 pb-6" style={GS}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Av text={item.avatar} size={52} soft />
                <div>
                  <p className="text-lg font-extrabold text-white m-0">{item.name}</p>
                  <p className="text-xs text-white/75 mt-0.5 mb-1.5">{item.email}</p>
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center">
                <X size={13} color="#fff" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 border-b border-green-50">
            {[{ label: "Trips", value: item.trips }, { label: "Earning", value: item.earning }, { label: "Rating", value: `⭐ ${item.rating}` }].map(s => (
              <div key={s.label} className="py-3 text-center border-r border-green-50 last:border-0">
                <p className="text-sm font-extrabold text-gray-800 m-0">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="p-5">
            {[
              { label: "Phone",         value: item.phone,        Icon: Phone      },
              { label: "City",          value: item.city,         Icon: MapPin     },
              { label: "Vehicle",       value: item.vehicle,      Icon: Truck      },
              { label: "Joined",        value: item.joined,       Icon: Calendar   },
              { label: "Last Delivery", value: item.lastDelivery, Icon: Navigation },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-green-50 last:border-0">
                <div className="flex items-center gap-2">
                  <row.Icon size={12} color="#16a34a" />
                  <span className="text-xs text-gray-400 font-semibold">{row.label}</span>
                </div>
                <span className="text-sm text-gray-800 font-bold">{row.value}</span>
              </div>
            ))}
            <button onClick={onClose} className="mt-4 w-full py-3 text-sm font-bold rounded-xl border-none cursor-pointer text-white shadow-md" style={GS}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", vehicle: VEHICLES[0] });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={GS}><Truck size={17} color="#fff" /></div>
            <div>
              <p className="text-sm font-extrabold text-gray-800 m-0">Add New Rider</p>
              <p className="text-xs text-gray-400 mt-0.5">Fill in all details</p>
            </div>
          </div>
          {[
            { label: "Full Name", key: "name",  ph: "e.g. Ali Khan"         },
            { label: "Email",     key: "email", ph: "e.g. ali@delivery.com" },
            { label: "Phone",     key: "phone", ph: "e.g. +92-300-1234567"  },
            { label: "City",      key: "city",  ph: "e.g. Karachi"          },
          ].map(f => (
            <div key={f.key} className="mb-3">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">{f.label}</label>
              <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.ph}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors" />
            </div>
          ))}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Vehicle Type</label>
            <select value={form.vehicle} onChange={e => set("vehicle", e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none">
              {VEHICLES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold rounded-xl border-none cursor-pointer bg-green-50 text-green-700">Cancel</button>
            <button onClick={() => { if (!form.name || !form.email) return; onAdd(form); onClose(); }}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl border-none cursor-pointer text-white shadow-md" style={GS}>Add</button>
          </div>
        </div>
      </div>
    </>
  );
}

function RiderTable({ data, setData }) {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = data.filter(item => {
    const ms = item.name.toLowerCase().includes(search.toLowerCase()) ||
               item.email.toLowerCase().includes(search.toLowerCase()) ||
               item.city.toLowerCase().includes(search.toLowerCase());
    return ms && (filter === "All" || item.status === filter);
  });

  const deleteItem   = id => setData(prev => prev.filter(i => i.id !== id));
  const toggleStatus = id => setData(prev => prev.map(i =>
    i.id === id ? { ...i, status: i.status === "Active" ? "Inactive" : "Active" } : i));
  const addItem = form => setData(prev => [...prev, {
    id: Date.now(), ...form, status: "Active",
    joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    avatar: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    trips: 0, earning: "Rs 0", rating: 0, lastDelivery: "—",
  }]);

  return (
    <div>
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-green-50">
        <div>
          <p className="text-sm font-extrabold text-gray-800 m-0">Rider List</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} total riders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none w-40 focus:border-green-400 transition-colors" />
          </div>
          <div className="flex gap-1 bg-green-50 rounded-xl p-1">
            {["All", "Active", "On Delivery", "Inactive"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all whitespace-nowrap
                  ${filter === f ? "text-white shadow-sm" : "bg-transparent text-green-700"}`}
                style={filter === f ? GS : {}}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border-none cursor-pointer text-white shadow-md" style={GS}>
            <Plus size={12} /> Add Rider
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden px-3 py-3 border-b border-green-50">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-extrabold text-gray-800 m-0">Riders <span className="text-gray-400 font-normal text-xs">({filtered.length})</span></p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border-none cursor-pointer text-white" style={GS}>
            <Plus size={10} /> Add
          </button>
        </div>
        <div className="flex gap-1.5 mb-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["All", "Active", "On Delivery", "Inactive"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border-none cursor-pointer shrink-0 transition-all
                ${filter === f ? "text-white" : "bg-green-50 text-green-700"}`}
              style={filter === f ? GS : {}}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or city..."
            className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors" />
        </div>
      </div>

      {/* Desktop Table — sirf 5 columns */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}>
              {["Rider", "City", "Vehicle", "Performance", "Joined", "Actions"].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-[11px] font-bold text-green-700 uppercase tracking-wide
                  ${i === 5 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className="hover:bg-green-50/40 transition-colors"
                style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4" }}>

                {/* Rider */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Av text={item.avatar} />
                    <div>
                      <p className="text-sm font-bold text-gray-800 m-0">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.email}</p>
                    </div>
                  </div>
                </td>

                {/* City */}
                <td className="px-5 py-3 text-sm text-gray-500">{item.city}</td>

                {/* Vehicle */}
                <td className="px-5 py-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">{item.vehicle}</span>
                </td>

                {/* Performance — trips + rating + status chips */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-50 text-gray-600">🚚 {item.trips} trips</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-yellow-50 text-yellow-600">⭐ {item.rating}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </td>

                {/* Joined */}
                <td className="px-5 py-3 text-sm text-gray-400">{item.joined}</td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => setSelected(item)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                      <Eye size={14} color="#16a34a" />
                    </button>
                    <button onClick={() => toggleStatus(item.id)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-transparent hover:bg-gray-50 transition-colors">
                      {item.status === "Active" || item.status === "On Delivery"
                        ? <XCircle size={14} color="#EF4444" />
                        : <CheckCircle size={14} color="#22C55E" />}
                    </button>
                    <button onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-transparent hover:bg-red-50 transition-colors">
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm text-gray-400 m-0">No riders found</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-green-50">
        {filtered.map(item => (
          <div key={item.id} className="px-3 py-3">
            <div className="flex items-center gap-2.5">
              <Av text={item.avatar} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 m-0 truncate">{item.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.email}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700">{item.vehicle}</span>
                  <span className="text-[9px] text-gray-400">· {item.trips} trips</span>
                  <span className="text-[9px] text-gray-400">· ⭐ {item.rating}</span>
                  <span className="text-[9px] text-gray-400">· {item.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusBadge status={item.status} />
                <button onClick={() => setSelected(item)}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-green-50 flex items-center justify-center">
                  <Eye size={12} color="#16a34a" />
                </button>
                <div className="relative">
                  <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === item.id ? null : item.id); }}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-gray-100 flex items-center justify-center">
                    <MoreVertical size={12} color="#9CA3AF" />
                  </button>
                  {openMenu === item.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl w-36 overflow-hidden shadow-xl z-20">
                      <div onClick={() => { toggleStatus(item.id); setOpenMenu(null); }}
                        className="px-3.5 py-2.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-50">
                        {item.status === "Active" || item.status === "On Delivery" ? "❌ Deactivate" : "✅ Activate"}
                      </div>
                      <div className="h-px bg-green-50" />
                      <div onClick={() => { deleteItem(item.id); setOpenMenu(null); }}
                        className="px-3.5 py-2.5 text-xs text-red-500 cursor-pointer hover:bg-red-50">
                        🗑️ Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <div className="text-2xl mb-1.5">🔍</div>
            <p className="text-xs text-gray-400 m-0">No riders found</p>
          </div>
        )}
      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
      {showAdd  && <AddModal onClose={() => setShowAdd(false)} onAdd={addItem} />}
      {openMenu && <div onClick={() => setOpenMenu(null)} className="fixed inset-0 z-10" />}
    </div>
  );
}

// ── MAIN ──
export default function DeliveryManagement() {
  const [data, setData] = useState(INIT_RIDERS);

  const active     = data.filter(r => r.status === "Active").length;
  const onDelivery = data.filter(r => r.status === "On Delivery").length;
  const inactive   = data.filter(r => r.status === "Inactive").length;
  const totalTrips = data.reduce((a, r) => a + r.trips, 0);
  const avgRating  = (
    data.filter(r => r.rating > 0).reduce((a, r) => a + r.rating, 0) /
    (data.filter(r => r.rating > 0).length || 1)
  ).toFixed(1);

  const stats = [
    { label: "Total Riders", value: data.length,  sub: "All",    icon: Truck       },
    { label: "Active",       value: active,        sub: "Active", icon: CheckCircle },
    { label: "On Delivery",  value: onDelivery,    sub: "Live",   icon: Navigation  },
    { label: "Inactive",     value: inactive,      sub: "Paused", icon: XCircle     },
    { label: "Total Trips",  value: totalTrips,    sub: "Trips",  icon: TrendingUp  },
    { label: "Avg Rating",   value: `⭐ ${avgRating}`, sub: "Avg", icon: Star       },
  ];

  return (
    <div className="p-3 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-extrabold text-gray-800 m-0">Delivery Management</h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">Manage all riders & delivery performance</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center cursor-pointer">
          <Bell size={16} color="#16a34a" />
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {stats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} sub={s.sub} icon={s.icon} />)}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <RiderTable data={data} setData={setData} />
      </div>
    </div>
  );
}