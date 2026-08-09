

import { useState } from "react";
import { Search, Plus, Trash2, CheckCircle, XCircle, MoreVertical, Shield, Store, Users, Truck, TrendingUp, Eye } from "lucide-react";

const DATA = {
  admins: [
    { id: 1, name: "Ali Hassan",   email: "ali@admin.com",    role: "Admin",        status: "Active",   joined: "Jan 12, 2024", avatar: "AH" },
    { id: 2, name: "Sara Khan",    email: "sara@admin.com",   role: "Vendor Admin", status: "Active",   joined: "Feb 5, 2024",  avatar: "SK" },
    { id: 3, name: "Ravi Sharma",  email: "ravi@admin.com",   role: "Admin",        status: "Inactive", joined: "Mar 18, 2024", avatar: "RS" },
    { id: 4, name: "John Smith",   email: "john@admin.com",   role: "Admin",        status: "Active",   joined: "May 9, 2024",  avatar: "JS" },
  ],
  vendors: [
    { id: 1, name: "FreshMart",    email: "fresh@vendor.com", role: "Grocery",      status: "Active",   joined: "Jan 20, 2024", avatar: "FM" },
    { id: 2, name: "TechZone",     email: "tech@vendor.com",  role: "Electronics",  status: "Active",   joined: "Feb 14, 2024", avatar: "TZ" },
    { id: 3, name: "StyleHub",     email: "style@vendor.com", role: "Fashion",      status: "Inactive", joined: "Mar 8, 2024",  avatar: "SH" },
    { id: 4, name: "FoodCorner",   email: "food@vendor.com",  role: "Restaurant",   status: "Active",   joined: "Apr 22, 2024", avatar: "FC" },
  ],
  users: [
    { id: 1, name: "Ayesha Malik", email: "ayesha@user.com",  role: "Customer",     status: "Active",   joined: "Jan 5, 2024",  avatar: "AM" },
    { id: 2, name: "David Lee",    email: "david@user.com",   role: "Customer",     status: "Active",   joined: "Feb 19, 2024", avatar: "DL" },
    { id: 3, name: "Priya Singh",  email: "priya@user.com",   role: "Customer",     status: "Inactive", joined: "Mar 3, 2024",  avatar: "PS" },
    { id: 4, name: "Omar Farooq",  email: "omar@user.com",    role: "Customer",     status: "Active",   joined: "Jun 11, 2024", avatar: "OF" },
  ],
  delivery: [
    { id: 1, name: "Bilal Ahmed",  email: "bilal@delivery.com", role: "Rider",      status: "Active",   joined: "Jan 15, 2024", avatar: "BA" },
    { id: 2, name: "Rahul Gupta",  email: "rahul@delivery.com", role: "Rider",      status: "Active",   joined: "Feb 28, 2024", avatar: "RG" },
    { id: 3, name: "Zara Hussain", email: "zara@delivery.com",  role: "Rider",      status: "Inactive", joined: "Apr 7, 2024",  avatar: "ZH" },
    { id: 4, name: "Sam Wilson",   email: "sam@delivery.com",   role: "Rider",      status: "Active",   joined: "May 30, 2024", avatar: "SW" },
  ],
};

const TABS = [
  { key: "admins",   label: "Admins",           Icon: Shield },
  { key: "vendors",  label: "Vendors",           Icon: Store  },
  { key: "users",    label: "Users",             Icon: Users  },
  { key: "delivery", label: "Delivery Partners", Icon: Truck  },
];

const ROLES = {
  admins:   ["Admin", "Vendor Admin", "Delivery Admin"],
  vendors:  ["Grocery", "Electronics", "Fashion", "Restaurant"],
  users:    ["Customer"],
  delivery: ["Rider"],
};

const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";

function Avatar({ text, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: G,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size < 36 ? 10 : 12, fontWeight: 700, flexShrink: 0,
    }}>{text}</div>
  );
}

function StatusBadge({ status, small = false }) {
  const active = status === "Active";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: small ? 10 : 11, fontWeight: 600,
      padding: small ? "2px 7px" : "3px 10px", borderRadius: 999,
      background: active ? "#DCFCE7" : "#FEE2E2",
      color: active ? "#15803D" : "#B91C1C",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#22C55E" : "#EF4444", flexShrink: 0 }} />
      {status}
    </span>
  );
}

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState("admins");
  const [allData,   setAllData]   = useState(DATA);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("All");
  const [openMenu,  setOpenMenu]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newEntry,  setNewEntry]  = useState({ name: "", email: "", role: "" });

  const currentData = allData[activeTab] || [];
  const currentTab  = TABS.find(t => t.key === activeTab);

  const filtered = currentData.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                        item.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || item.status === filter;
    return matchSearch && matchFilter;
  });

  const deleteItem = (id) => {
    setAllData(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(i => i.id !== id) }));
    setOpenMenu(null);
  };

  const toggleStatus = (id) => {
    setAllData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(i =>
        i.id === id ? { ...i, status: i.status === "Active" ? "Inactive" : "Active" } : i
      ),
    }));
    setOpenMenu(null);
  };

  const addEntry = () => {
    if (!newEntry.name || !newEntry.email) return;
    setAllData(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], {
        id: Date.now(),
        name: newEntry.name, email: newEntry.email,
        role: newEntry.role || ROLES[activeTab][0],
        status: "Active",
        joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        avatar: newEntry.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      }],
    }));
    setNewEntry({ name: "", email: "", role: "" });
    setShowAdd(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key); setSearch(""); setFilter("All"); setOpenMenu(null);
  };

  return (
   <div className="p-3 md:p-6" style={{ display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box", maxWidth: "100%" }}>

      {/* ── Stat Cards ── Mobile: 2x2, Desktop: 4 col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {TABS.map(tab => {
          const count    = allData[tab.key].length;
          const active   = allData[tab.key].filter(i => i.status === "Active").length;
          const isActive = activeTab === tab.key;
          return (
            <div key={tab.key} onClick={() => handleTabChange(tab.key)}
              style={{
                position: "relative", borderRadius: 12, padding: "10px",
                cursor: "pointer", overflow: "hidden",
                background: isActive ? G : "#fff",
                boxShadow: isActive ? "0 6px 16px rgba(34,197,94,0.28)" : "0 2px 8px rgba(0,0,0,0.06)",
                transform: isActive ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s ease",
              }}
            >
              {/* Deco circle */}
              {/* <div style={{
                position: "absolute", top: -14, right: -14,
                width: 56, height: 56, borderRadius: "50%",
                background: isActive ? "rgba(255,255,255,0.12)" : "#F0FDF4",
              }} /> */}

              {/* Icon + badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: isActive ? "rgba(255,255,255,0.22)" : "#F0FDF4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <tab.Icon size={13} color={isActive ? "#fff" : "#16a34a"} />
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 2,
                  fontSize: 9, fontWeight: 600, padding: "2px 5px", borderRadius: 999,
                  background: isActive ? "rgba(255,255,255,0.22)" : "#DCFCE7",
                  color: isActive ? "#fff" : "#15803D",
                }}>
                  <TrendingUp size={7} />+{active}
                </div>
              </div>

              <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: isActive ? "#fff" : "#111827" }}>{count}</p>
              <p style={{ fontSize: 10, fontWeight: 600, margin: "2px 0 0", color: isActive ? "rgba(255,255,255,0.85)" : "#6B7280" }}>{tab.label}</p>
              <p style={{ fontSize: 9, margin: "2px 0 0", color: isActive ? "rgba(255,255,255,0.65)" : "#9CA3AF" }}>
                {active} active · {count - active} inactive
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 11px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              whiteSpace: "nowrap", border: "none", cursor: "pointer", flexShrink: 0,
              background: activeTab === tab.key ? G : "#F0FDF4",
              color: activeTab === tab.key ? "#fff" : "#16a34a",
              boxShadow: activeTab === tab.key ? "0 4px 10px rgba(34,197,94,0.3)" : "none",
              transition: "all 0.2s",
            }}
          >
            <tab.Icon size={12} />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>

        {/* ── Desktop Header ── */}
        <div className="hidden md:flex" style={{
          alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
          gap: 12, padding: "16px 20px", borderBottom: "1px solid #F0FDF4",
        }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{currentTab?.label} List</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "2px 0 0" }}>{filtered.length} total records</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, borderRadius: 12, outline: "none", width: 150, background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
                onFocus={e => e.target.style.borderColor = "#22c55e"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div style={{ display: "flex", gap: 4, background: "#F0FDF4", borderRadius: 12, padding: 4 }}>
              {["All","Active","Inactive"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", background: filter === f ? G : "transparent", color: filter === f ? "#fff" : "#16a34a", transition: "all 0.15s" }}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => { setNewEntry({ name:"", email:"", role: ROLES[activeTab][0] }); setShowAdd(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: G, color: "#fff", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>
              <Plus size={13} /> Add {currentTab?.label.slice(0,-1)}
            </button>
          </div>
        </div>

        {/* ── Mobile Header ── */}
        <div className="md:hidden" style={{ padding: "10px 12px", borderBottom: "1px solid #F0FDF4" }}>
          {/* Row 1: Title + Add */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{currentTab?.label} List</p>
              <p style={{ fontSize: 10, color: "#9CA3AF", margin: "1px 0 0" }}>{filtered.length} records</p>
            </div>
            <button onClick={() => { setNewEntry({ name:"", email:"", role: ROLES[activeTab][0] }); setShowAdd(true); }}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", background: G, color: "#fff", flexShrink: 0 }}>
              <Plus size={11} /> Add
            </button>
          </div>
          {/* Row 2: Search + Filters */}
          {/* <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <Search size={11} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ width: "100%", paddingLeft: 26, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 11, borderRadius: 8, outline: "none", background: "#F8FAFC", border: "1.5px solid #E2E8F0", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#22c55e"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div style={{ display: "flex", gap: 2, background: "#F0FDF4", borderRadius: 8, padding: "3px", flexShrink: 0 }}>
              {["All","Active","Inactive"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: "4px 7px", fontSize: 10, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer", background: filter === f ? G : "transparent", color: filter === f ? "#fff" : "#16a34a", whiteSpace: "nowrap" }}>
                  {f}
                </button>
              ))}
            </div>
          </div> */}
          {/* Row 2: Search only */}
          <div style={{ position: "relative" }}>
            <Search size={11} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ width: "100%", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 11, borderRadius: 8, outline: "none", background: "#F8FAFC", border: "1.5px solid #E2E8F0", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#22c55e"}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden md:block" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f0fdf4, #ecfdf5)" }}>
                {["Name","Email","Role","Status","Joined","Actions"].map((h, i) => (
                  <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: i === 5 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
             <tr key={item.id}
          
              style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4", transition: "background 0.15s", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar text={item.avatar} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#6B7280" }}>{item.email}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: "#F0FDF4", color: "#15803D" }}>{item.role}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}><StatusBadge status={item.status} /></td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#9CA3AF" }}>{item.joined}</td>
                  <td style={{ padding: "14px 20px" }}>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
  
                {/* 👁️ Eye Button */}
               <button 
               onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
               style={{ padding: 6, borderRadius: 8, border: "none", cursor: "pointer", background: "#F0FDF4" }}>
                <Eye size={16} color="#16a34a" />
                </button>

                <button onClick={(e) => { e.stopPropagation(); toggleStatus(item.id); }}

                style={{ padding: 6, borderRadius: 8, border: "none", cursor: "pointer", background: "transparent" }}>
                        {item.status === "Active" ? <XCircle size={16} color="#EF4444" /> : <CheckCircle size={16} color="#22C55E" />}
                      </button>
                      <button onClick={() => deleteItem(item.id)} style={{ padding: 6, borderRadius: 8, border: "none", cursor: "pointer", background: "transparent" }}>
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "50px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>No records found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile List ── FULLY FIXED ── */}
        <div className="md:hidden">
          {filtered.map((item, idx) => (
     <div key={item.id} style={{ padding: "10px 12px", borderTop: idx === 0 ? "none" : "1px solid #F0FDF4" }}>
              {/* Top row: Avatar + Name/Email + Status + Menu */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <Avatar text={item.avatar} size={34} />

                {/* Name + email - flex:1 so it takes remaining space and truncates */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.email}</p>
                </div>

                {/* Status badge + 3-dot menu: flexShrink:0 so never squished */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <StatusBadge status={item.status} small />
                  <div style={{ position: "relative" }}>
               <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === item.id ? null : item.id); }}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "none", cursor: "pointer", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MoreVertical size={12} color="#9CA3AF" />
                    </button>
                    {openMenu === item.id && (
                      <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "#fff", borderRadius: 10, width: 130, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 20 }}>
                        <div onClick={() => toggleStatus(item.id)} style={{ padding: "9px 14px", fontSize: 12, color: "#374151", cursor: "pointer" }}>
                          {item.status === "Active" ? "Deactivate" : "Activate"}
                        </div>
                        <div style={{ height: 1, background: "#F0FDF4" }} />
                        <div onClick={() => deleteItem(item.id)} style={{ padding: "9px 14px", fontSize: 12, color: "#EF4444", cursor: "pointer" }}>
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom: Role + Joined */}
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, paddingLeft: 42 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "#F0FDF4", color: "#15803D", whiteSpace: "nowrap" }}>{item.role}</span>
                <span style={{ fontSize: 10, color: "#9CA3AF" }}>· {item.joined}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "36px", textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>🔍</div>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>No records found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Modal ── */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, padding: 20, boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {currentTab && <currentTab.Icon size={17} color="#fff" />}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Add New {currentTab?.label.slice(0,-1)}</p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>Fill in the details below</p>
                </div>
              </div>
              {[
                { label: "Full Name", key: "name",  placeholder: "e.g. John Doe"         },
                { label: "Email",     key: "email", placeholder: "e.g. john@example.com" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>{f.label}</label>
                  <input value={newEntry[f.key]} onChange={e => setNewEntry(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "9px 12px", fontSize: 12, borderRadius: 10, outline: "none", border: "1.5px solid #E2E8F0", background: "#F8FAFC", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "#22c55e"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Role</label>
                <select value={newEntry.role} onChange={e => setNewEntry(p => ({ ...p, role: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", fontSize: 12, borderRadius: 10, outline: "none", border: "1.5px solid #E2E8F0", background: "#F8FAFC" }}>
                  {ROLES[activeTab].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAdd(false)}
                  style={{ flex: 1, padding: "10px", fontSize: 12, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer", background: "#F0FDF4", color: "#16a34a" }}>
                  Cancel
                </button>
                <button onClick={addEntry}
                  style={{ flex: 1, padding: "10px", fontSize: 12, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer", background: G, color: "#fff", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>
                  Add {currentTab?.label.slice(0,-1)}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {selectedItem && (
  <>
    <div onClick={() => setSelectedItem(null)} 
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:50 }} />
    <div style={{ position:"fixed", inset:0, zIndex:51, display:"flex", 
      alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", 
        maxWidth:400, padding:24, boxShadow:"0 24px 48px rgba(0,0,0,0.18)" }}>
        
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <Avatar text={selectedItem.avatar} size={52} />
          <div>
            <p style={{ fontSize:16, fontWeight:700, color:"#111827", margin:0 }}>
              {selectedItem.name}
            </p>
            <p style={{ fontSize:12, color:"#9CA3AF", margin:"3px 0 0" }}>
              {selectedItem.email}
            </p>
          </div>
        </div>

        {[
          { label:"Role",   value: selectedItem.role   },
          { label:"Status", value: selectedItem.status },
          { label:"Joined", value: selectedItem.joined },
          { label:"Email",  value: selectedItem.email  },
        ].map(row => (
          <div key={row.label} style={{ display:"flex", justifyContent:"space-between",
            padding:"10px 0", borderBottom:"1px solid #F0FDF4" }}>
            <span style={{ fontSize:12, color:"#9CA3AF", fontWeight:600 }}>{row.label}</span>
            {row.label === "Status" 
              ? <StatusBadge status={row.value} />
              : <span style={{ fontSize:12, color:"#111827", fontWeight:600 }}>{row.value}</span>
            }
          </div>
        ))}

        <button onClick={() => setSelectedItem(null)}
          style={{ marginTop:20, width:"100%", padding:"10px", fontSize:13, 
            fontWeight:600, borderRadius:12, border:"none", cursor:"pointer", 
            background:G, color:"#fff" }}>
          Close
        </button>
      </div>
    </div>
  </>
)}

      {openMenu && <div onClick={() => setOpenMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />}

    </div>
  );
}