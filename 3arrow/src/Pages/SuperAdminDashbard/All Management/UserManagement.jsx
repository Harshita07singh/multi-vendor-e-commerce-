import { useState } from "react";
import {
  Users, Search, Plus, Trash2, CheckCircle, XCircle, Eye,
  MoreVertical, TrendingUp, ShoppingCart, DollarSign,
  Bell, X, Phone, Mail, Calendar, ShieldOff, Shield
} from "lucide-react";

const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

const INIT_USERS = [
  { id: 1, name: "Ayesha Malik",  email: "ayesha@user.com",  phone: "+92-310-1111111", avatar: "AM", status: "Active",  joined: "Jan 5, 2024",  orders: 12, spent: "Rs 45,200", city: "Karachi",   lastOrder: "Feb 20, 2024" },
  { id: 2, name: "David Lee",     email: "david@user.com",   phone: "+92-311-2222222", avatar: "DL", status: "Active",  joined: "Feb 19, 2024", orders: 8,  spent: "Rs 28,400", city: "Lahore",    lastOrder: "Feb 18, 2024" },
  { id: 3, name: "Priya Singh",   email: "priya@user.com",   phone: "+92-312-3333333", avatar: "PS", status: "Blocked", joined: "Mar 3, 2024",  orders: 3,  spent: "Rs 9,600",  city: "Islamabad", lastOrder: "Jan 10, 2024" },
  { id: 4, name: "Omar Farooq",   email: "omar@user.com",    phone: "+92-313-4444444", avatar: "OF", status: "Active",  joined: "Jun 11, 2024", orders: 21, spent: "Rs 78,900", city: "Karachi",   lastOrder: "Feb 23, 2024" },
  { id: 5, name: "Sara Ahmed",    email: "sara@user.com",    phone: "+92-314-5555555", avatar: "SA", status: "Active",  joined: "Jul 2, 2024",  orders: 5,  spent: "Rs 15,300", city: "Multan",    lastOrder: "Feb 15, 2024" },
  { id: 6, name: "Rahul Verma",   email: "rahul@user.com",   phone: "+92-315-6666666", avatar: "RV", status: "Blocked", joined: "Aug 14, 2024", orders: 1,  spent: "Rs 2,100",  city: "Lahore",    lastOrder: "Aug 20, 2024" },
  { id: 7, name: "Zainab Khan",   email: "zainab@user.com",  phone: "+92-316-7777777", avatar: "ZK", status: "Active",  joined: "Sep 1, 2024",  orders: 17, spent: "Rs 61,500", city: "Karachi",   lastOrder: "Feb 22, 2024" },
  { id: 8, name: "James Wilson",  email: "james@user.com",   phone: "+92-317-8888888", avatar: "JW", status: "Active",  joined: "Oct 9, 2024",  orders: 4,  spent: "Rs 11,800", city: "Islamabad", lastOrder: "Feb 10, 2024" },
];

// ── Avatar ──
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

// ── Badge ──
function Badge({ status, small }) {
  const cfg = {
    Active:  { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    Blocked: { bg: "bg-red-100",   text: "text-red-700",   dot: "bg-red-500"   },
  }[status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap
      ${cfg.bg} ${cfg.text}
      ${small ? "text-[9px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"}`}>
      <span className={`rounded-full shrink-0 ${cfg.dot} ${small ? "w-1 h-1" : "w-1.5 h-1.5"}`} />
      {status}
    </span>
  );
}

// ── Stat Card ──
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

// ── Detail Modal ──
function DetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          {/* green header */}
          <div className="p-5 pb-6" style={GS}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Av text={item.avatar} size={52} soft />
                <div>
                  <p className="text-lg font-extrabold text-white m-0">{item.name}</p>
                  <p className="text-xs text-white/75 mt-0.5 mb-1.5">{item.email}</p>
                  <Badge status={item.status} small />
                </div>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center">
                <X size={13} color="#fff" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-0 border-b border-green-50">
            {[
              { label: "Orders", value: item.orders },
              { label: "Total Spent", value: item.spent },
            ].map(s => (
              <div key={s.label} className="py-3 text-center border-r border-green-50 last:border-0">
                <p className="text-sm font-extrabold text-gray-800 m-0">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* body */}
          <div className="p-5">
            {[
              { label: "Phone",      value: item.phone,     Icon: Phone    },
              { label: "City",       value: item.city,      Icon: Users    },
              { label: "Joined",     value: item.joined,    Icon: Calendar },
              { label: "Last Order", value: item.lastOrder, Icon: ShoppingCart },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-green-50 last:border-0">
                <div className="flex items-center gap-2">
                  <row.Icon size={12} color="#16a34a" />
                  <span className="text-xs text-gray-400 font-semibold">{row.label}</span>
                </div>
                <span className="text-sm text-gray-800 font-bold">{row.value}</span>
              </div>
            ))}
            <button onClick={onClose}
              className="mt-4 w-full py-3 text-sm font-bold rounded-xl border-none cursor-pointer text-white shadow-md"
              style={GS}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Add Modal ──
function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={GS}>
              <Users size={17} color="#fff" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-800 m-0">Add New User</p>
              <p className="text-xs text-gray-400 mt-0.5">Fill in all details</p>
            </div>
          </div>

          {[
            { label: "Full Name", key: "name",  ph: "e.g. John Doe"          },
            { label: "Email",     key: "email", ph: "e.g. john@example.com"  },
            { label: "Phone",     key: "phone", ph: "e.g. +92-300-1234567"   },
            { label: "City",      key: "city",  ph: "e.g. Karachi"           },
          ].map(f => (
            <div key={f.key} className="mb-3">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">{f.label}</label>
              <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.ph}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors" />
            </div>
          ))}

          <div className="flex gap-2.5 mt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl border-none cursor-pointer bg-green-50 text-green-700">
              Cancel
            </button>
            <button onClick={() => { if (!form.name || !form.email) return; onAdd(form); onClose(); }}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl border-none cursor-pointer text-white shadow-md"
              style={GS}>
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Table ──
function UserTable({ data, setData }) {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = data.filter(item => {
    const ms = item.name.toLowerCase().includes(search.toLowerCase()) ||
               item.email.toLowerCase().includes(search.toLowerCase());
    return ms && (filter === "All" || item.status === filter);
  });

  const deleteItem   = id => setData(prev => prev.filter(i => i.id !== id));
  const toggleStatus = id => setData(prev => prev.map(i =>
    i.id === id ? { ...i, status: i.status === "Active" ? "Blocked" : "Active" } : i));
  const addItem = form => setData(prev => [...prev, {
    id: Date.now(), ...form, status: "Active",
    joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    avatar: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    orders: 0, spent: "Rs 0",
    lastOrder: "—",
  }]);

  return (
    <div>
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-green-50">
        <div>
          <p className="text-sm font-extrabold text-gray-800 m-0">User List</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none w-40 focus:border-green-400 transition-colors" />
          </div>
          <div className="flex gap-1 bg-green-50 rounded-xl p-1">
            {["All", "Active", "Blocked"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all
                  ${filter === f ? "text-white shadow-sm" : "bg-transparent text-green-700"}`}
                style={filter === f ? GS : {}}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border-none cursor-pointer text-white shadow-md"
            style={GS}>
            <Plus size={12} /> Add User
          </button>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden px-3 py-3 border-b border-green-50">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-extrabold text-gray-800 m-0">
            Users
            <span className="text-gray-400 font-normal text-xs ml-1">({filtered.length})</span>
          </p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border-none cursor-pointer text-white"
            style={GS}>
            <Plus size={10} /> Add
          </button>
        </div>
        <div className="flex gap-1.5 mb-2.5">
          {["All", "Active", "Blocked"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border-none cursor-pointer transition-all
                ${filter === f ? "text-white" : "bg-green-50 text-green-700"}`}
              style={filter === f ? GS : {}}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
            className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors" />
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}>
              {["User", "Email", "Phone", "Orders", "Total Spent", "Status", "Joined", "Actions"].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-[11px] font-bold text-green-700 uppercase tracking-wide
                  ${i === 7 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id}
                className="hover:bg-green-50/40 transition-colors"
                style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4" }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Av text={item.avatar} />
                    <span className="text-sm font-bold text-gray-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{item.email}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{item.phone}</td>
                <td className="px-5 py-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">{item.orders} orders</span>
                </td>
                <td className="px-5 py-3 text-sm font-bold text-gray-800">{item.spent}</td>
                <td className="px-5 py-3"><Badge status={item.status} /></td>
                <td className="px-5 py-3 text-sm text-gray-400">{item.joined}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => setSelected(item)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                      <Eye size={14} color="#16a34a" />
                    </button>
                    <button onClick={() => toggleStatus(item.id)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                      title={item.status === "Active" ? "Block User" : "Unblock User"}>
                      {item.status === "Active"
                        ? <ShieldOff size={14} color="#EF4444" />
                        : <Shield size={14} color="#22C55E" />}
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
              <tr><td colSpan={8} className="py-12 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm text-gray-400 m-0">No users found</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile List ── */}
      <div className="md:hidden divide-y divide-green-50">
        {filtered.map(item => (
          <div key={item.id} className="px-3 py-3">
            <div className="flex items-center gap-2.5">
              <Av text={item.avatar} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 m-0 truncate">{item.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700">{item.orders} orders</span>
                  <span className="text-[9px] text-gray-400">· {item.spent}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge status={item.status} small />
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
                        {item.status === "Active" ? "🚫 Block User" : "✅ Unblock User"}
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
            <p className="text-xs text-gray-400 m-0">No users found</p>
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
export default function UserManagement() {
  const [data, setData] = useState(INIT_USERS);

  const active  = data.filter(u => u.status === "Active").length;
  const blocked = data.filter(u => u.status === "Blocked").length;
  const totalOrders = data.reduce((a, u) => a + u.orders, 0);
  const totalSpent  = data.reduce((a, u) => {
    const n = parseFloat(u.spent.replace(/[^0-9.]/g, "")) || 0;
    return a + n;
  }, 0);

  const stats = [
    { label: "Total Users",   value: data.length,                        sub: "All",     icon: Users        },
    { label: "Active Users",  value: active,                             sub: "Active",  icon: CheckCircle  },
    { label: "Blocked",       value: blocked,                            sub: "Blocked", icon: ShieldOff    },
    { label: "Total Orders",  value: totalOrders,                        sub: "Orders",  icon: ShoppingCart },
    { label: "Total Revenue", value: `Rs ${(totalSpent/1000).toFixed(0)}K`, sub: "Rs",  icon: DollarSign   },
    { label: "Avg Orders",    value: (totalOrders / (data.length || 1)).toFixed(1), sub: "Per User", icon: TrendingUp },
  ];

  return (
    <div className="p-3 md:p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-extrabold text-gray-800 m-0">User Management</h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">Manage all customers & their activity</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center cursor-pointer">
          <Bell size={16} color="#16a34a" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} sub={s.sub} icon={s.icon} />
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <UserTable data={data} setData={setData} />
      </div>
    </div>
  );
}