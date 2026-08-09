import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../redux/authSlice";
import {
  User,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Heart,
  ShoppingCart,
  Headphones,
  HelpCircle,
  Edit3,
  Save,
  X,
  MapPin,
  Plus,
  Trash2,
  ChevronRight,
  Star,
  Package,
  ArrowUpRight,
  Zap,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

function cn(...c) {
  return c.filter(Boolean).join(" ");
}

/* ─── Animated Number ─── */
function AnimNum({ n }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = 0,
      step = n / 30;
    const t = setInterval(() => {
      s += step;
      if (s >= n) {
        setV(n);
        clearInterval(t);
      } else setV(Math.floor(s));
    }, 30);
    return () => clearInterval(t);
  }, [n]);
  return <span>{v}</span>;
}

/* ─── Status Pill ─── */
function Pill({ children, color = "green" }) {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue: "bg-sky-50 text-sky-700 border border-sky-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
        map[color],
      )}
    >
      {children}
    </span>
  );
}

/* ─── Field ─── */
function Field({
  label,
  value,
  name,
  editable,
  editData,
  onChange,
  type = "text",
}) {
  return (
    <div className="group">
      <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
        {label}
      </label>
      {editable ? (
        <input
          type={type}
          name={name}
          value={editData?.[name] || ""}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-sm font-semibold
                     focus:border-emerald-400 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-slate-300"
        />
      ) : (
        <p className="text-sm font-bold text-slate-800 leading-relaxed">
          {value || (
            <span className="text-slate-300 font-normal italic text-xs">
              Not provided
            </span>
          )}
        </p>
      )}
    </div>
  );
}

/* ─── Nav Row ─── */
function NavRow({ icon, label, sub, onClick, href }) {
  const cls =
    "flex items-center gap-4 px-5 py-4 rounded-2xl group cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent border border-transparent hover:border-emerald-100";
  const inner = (
    <>
      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-all duration-200 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
          {label}
        </p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <ArrowUpRight
        size={14}
        className="text-slate-300 group-hover:text-emerald-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </>
  );
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <button onClick={onClick} className={cn(cls, "w-full text-left")}>
      {inner}
    </button>
  );
}

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn, loading } = useSelector((s) => s.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    if (!user) dispatch(fetchCurrentUser());
    else setEditData(user);
  }, [isLoggedIn, user, dispatch, navigate]);

  useEffect(() => {
    try {
      setAddresses(JSON.parse(localStorage.getItem("savedAddresses") || "[]"));
    } catch {
      setAddresses([]);
    }
  }, []);

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditData((p) => ({ ...p, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL_UB}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(editData),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update profile");
        return;
      }
      dispatch(fetchCurrentUser());
      setIsEditing(false);
    } catch {
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  }

  function saveAddress() {
    if (!newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      alert("Please fill required fields.");
      return;
    }
    const updated = [...addresses, { ...newAddr, id: Date.now() }];
    setAddresses(updated);
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
    setNewAddr({ label: "Home", line1: "", city: "", state: "", pincode: "" });
    setShowAddrForm(false);
  }

  function deleteAddress(id) {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
  }

  if (!isLoggedIn) return null;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-slate-800 font-bold text-sm">
              Loading your profile
            </p>
            <p className="text-slate-400 text-xs mt-1">Just a moment…</p>
          </div>
        </div>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const tabs = [
    { id: "info", label: "Profile" },
    { id: "addresses", label: "Addresses" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8">
      {/* ── GLOBAL STYLE BLOCK ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .profile-root { font-family: 'DM Sans', sans-serif; }
        .profile-root h1, .profile-root h2, .profile-root .sora { font-family: 'Sora', sans-serif; }
        .card { background: white; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 2px 12px 0 rgba(15,23,42,.04), 0 0 0 0 rgba(16,185,129,.0); transition: box-shadow .3s; }
        .card:hover { box-shadow: 0 4px 24px 0 rgba(15,23,42,.08); }
        .avatar-ring { background: conic-gradient(from 180deg, #10b981, #059669, #34d399, #10b981); }
        .stat-bar { height: 3px; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 99px; }
        .tab-active { background: white; box-shadow: 0 2px 8px rgba(15,23,42,.08); color: #059669; font-weight: 700; }
        .tab-inactive { color: #94a3b8; font-weight: 600; }
        .addr-card { transition: all .2s; }
        .addr-card:hover { border-color: #10b981; background: #f0fdf4; transform: translateY(-1px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .45s ease both; }
        .fade-up-1 { animation-delay: .05s; }
        .fade-up-2 { animation-delay: .1s; }
        .fade-up-3 { animation-delay: .15s; }
        .fade-up-4 { animation-delay: .2s; }
      `}</style>

      <div className="profile-root max-w-5xl mx-auto space-y-6">
        {/* ══ HERO CARD ══ */}
        <div className="card overflow-hidden fade-up">
          {/* Banner */}
          <div className="relative h-36 pb-1 sm:h-44 overflow-hidden bg-gradient-to-135 from-emerald-600 via-emerald-500 to-teal-400">
            {/* Geometric overlay */}
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="80%"
                cy="30%"
                r="120"
                fill="white"
                fillOpacity=".04"
              />
              <circle cx="20%" cy="80%" r="80" fill="white" fillOpacity=".04" />
              <circle cx="65%" cy="70%" r="60" fill="white" fillOpacity=".03" />
              <path
                d="M0 120 Q 200 60 400 100 T 800 80 L800 200 L0 200Z"
                fill="white"
                fillOpacity=".04"
              />
            </svg>
          </div>

          {/* Avatar + meta row */}
          <div className="px-6 sm:px-8 pb-7">
            <div className="flex flex-wrap gap-5 items-end -mt-40 mb-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div>
                  <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-white">
                    <span className="sora text-white font-black text-2xl select-none">
                      {initials}
                    </span>
                  </div>
                </div>
                <div />
              </div>

              {/* Name / email */}
              <div className="flex-1 min-w-0 pt-8 sm:pt-6">
                <h1 className="text-1xl sm:text-1xl font-black text-slate-900 leading-none truncate">
                  {user.name}
                </h1>
                <p className="text-sm text-slate-400 mt-1 font-medium truncate">
                  {user.email}
                </p>
              </div>

              {/* Edit controls */}
              <div className="flex gap-2 pb-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setEditData(user);
                        setIsEditing(false);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black transition-all shadow-lg shadow-emerald-200 disabled:opacity-60"
                    >
                      <Save size={13} /> {saving ? "Saving…" : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-200 text-white text-sm font-black transition-all duration-300 shadow-lg"
                  >
                    <Edit3 size={13} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Pill color="blue">{user.role || "Customer"}</Pill>
              {user.status === "active" ? (
                <Pill color="green">
                  <CheckCircle2 size={11} /> Active
                </Pill>
              ) : (
                <Pill color="amber">
                  <Clock size={11} /> {user.status || "Pending"}
                </Pill>
              )}
              {user.isApproved ? (
                <Pill color="green">
                  <Shield size={11} /> Verified
                </Pill>
              ) : (
                <Pill color="amber">
                  <Clock size={11} /> Unverified
                </Pill>
              )}
            </div>
          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="fade-up fade-up-1 flex bg-slate-100/80 rounded-2xl p-1.5 gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-sm transition-all duration-200",
                activeTab === t.id
                  ? "tab-active"
                  : "tab-inactive hover:text-slate-600",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB: PROFILE INFO ══ */}
        {activeTab === "info" && (
          <div className="fade-up fade-up-2 card p-7 sm:p-8">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="sora font-black text-slate-900 text-lg">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your account details and contact info
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <User size={16} className="text-emerald-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <Field
                label="Full Name"
                name="name"
                value={user.name}
                editable={isEditing}
                editData={editData}
                onChange={handleEditChange}
              />
              <Field label="Email Address" value={user.email} />
              <Field
                label="Phone Number"
                name="phone"
                value={user.phone}
                editable={isEditing}
                editData={editData}
                onChange={handleEditChange}
                type="tel"
              />
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                  Member Since
                </label>
                <p className="text-sm font-bold text-slate-800">{joinDate}</p>
              </div>
            </div>

            {!isEditing && (
              <div className="mt-7 pt-6 border-t border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={13} className="text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your email address{" "}
                  <span className="font-bold text-slate-700">{user.email}</span>{" "}
                  cannot be changed. Contact support if you need to update it.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: ADDRESSES ══ */}
        {activeTab === "addresses" && (
          <div className="fade-up fade-up-2 card p-7 sm:p-8">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="sora font-black text-slate-900 text-lg">
                  Saved Addresses
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your delivery locations
                </p>
              </div>
              <button
                onClick={() => setShowAddrForm(!showAddrForm)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all shadow-md shadow-emerald-100"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            {addresses.length === 0 && !showAddrForm && (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin size={24} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-500 text-sm">
                  No addresses saved yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Add your first address for faster checkout
                </p>
                <button
                  onClick={() => setShowAddrForm(true)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus size={12} /> Add Address
                </button>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {addresses.map((a, i) => (
                <div
                  key={a.id}
                  className="addr-card flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-white group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <MapPin size={15} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                      {a.label}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                      {[a.line1, a.city, a.state, a.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAddress(a.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {showAddrForm && (
              <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 bg-gradient-to-br from-emerald-50/60 to-white space-y-4">
                <h3 className="sora font-bold text-slate-800 text-sm">
                  New Address
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                      Label
                    </label>
                    <select
                      value={newAddr.label}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, label: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold focus:border-emerald-400 outline-none"
                    >
                      {["Home", "Work", "Other"].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                      Pincode *
                    </label>
                    <input
                      value={newAddr.pincode}
                      onChange={(e) =>
                        setNewAddr({
                          ...newAddr,
                          pincode: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        })
                      }
                      placeholder="6-digit pincode"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                    Street Address *
                  </label>
                  <input
                    value={newAddr.line1}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, line1: e.target.value })
                    }
                    placeholder="House no., Street, Colony…"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold focus:border-emerald-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                      City *
                    </label>
                    <input
                      value={newAddr.city}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, city: e.target.value })
                      }
                      placeholder="City"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold focus:border-emerald-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                      State
                    </label>
                    <input
                      value={newAddr.state}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, state: e.target.value })
                      }
                      placeholder="State"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => {
                      setShowAddrForm(false);
                      setNewAddr({
                        label: "Home",
                        line1: "",
                        city: "",
                        state: "",
                        pincode: "",
                      });
                    }}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAddress}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black transition-all shadow-lg shadow-emerald-100"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: ACCOUNT ══ */}
        {activeTab === "account" && (
          <div className="fade-up fade-up-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* My Account */}
            <div className="card p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="sora font-black text-slate-900 text-base">
                    My Account
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Manage your activity
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <NavRow
                  icon={<ShoppingBag size={15} />}
                  label="My Orders"
                  sub="Track & manage orders"
                  onClick={() => navigate("/orders")}
                />
                <NavRow
                  icon={<Heart size={15} />}
                  label="Wishlist"
                  sub="Items you love"
                  onClick={() => navigate("/wishlist")}
                />
                <NavRow
                  icon={<ShoppingCart size={15} />}
                  label="Cart"
                  sub="Ready to checkout?"
                  onClick={() => navigate("/cart")}
                />
              </div>
            </div>

            {/* Support */}
            <div className="card p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Headphones size={16} className="text-sky-600" />
                </div>
                <div>
                  <h2 className="sora font-black text-slate-900 text-base">
                    Support
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    We're here to help
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <NavRow
                  icon={<Mail size={15} />}
                  label="Contact Support"
                  sub="support@3arrow.com"
                  href="mailto:support@3arrow.com"
                />
                <NavRow
                  icon={<HelpCircle size={15} />}
                  label="Help Center / FAQ"
                  sub="Browse common questions"
                  href="#"
                />
              </div>

              {/* support card */}
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute bottom-0 right-8 w-12 h-12 rounded-full bg-white/10" />
                <p className="sora font-black text-sm mb-1 relative">
                  Need help?
                </p>
                <p className="text-xs text-white/75 mb-3 relative">
                  Our team typically responds within 2 hours.
                </p>
                <a
                  href="mailto:support@3arrow.com"
                  className="inline-flex items-center gap-1.5 text-xs font-black bg-white text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-50 transition-colors relative"
                >
                  <Mail size={11} /> Get in touch
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
