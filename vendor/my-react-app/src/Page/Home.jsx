import { useState, useEffect, useCallback, useRef } from "react";
import {
  SquarePen,
  Trash2,
  ShoppingBasket,
  File,
  FileCheckCorner,
  Star,
  ShoppingCart,
  Puzzle,
  Store,
  CircleDollarSign,
  BadgeDollarSign,
  Hourglass,
  Settings,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  UserRoundPen,
  ShieldAlert,
  Zap,
  CirclePile,
} from "lucide-react";
import Logo from "../assets/3Arrow.png";
import VendorProfileSection from "./VendorProfileSection";
import VendorFlashSales from "./VendorFlashSales";
import InventoryPage from "./Inventorypage";
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/auth/vendor";
const API_BASE_UB =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

const C = {
  green: "#299E60",
  greenDark: "#1e7a49",
  greenLight: "#34c478",
  greenGlow: "rgba(41,158,96,0.15)",
  greenBorder: "rgba(41,158,96,0.3)",
  bg: "#f5f9f6",
  bgCard: "#ffffff",
  bgSide: "#ffffff",
  bgSideSub: "#ffffff",
  text: "#5AB748",
  textMuted: "#6b8577",
  textLight: "#a8c4b4",
  border: "#d8eddf",
  danger: "#e53935",
  dangerBg: "rgba(229,57,53,0.08)",
  gold: "#f5a623",
  shadow: "0 2px 16px rgba(41,158,96,0.08)",
  shadowMd: "0 8px 40px rgba(41,158,96,0.14)",
};

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

// ── Pricing config (amounts in INR, must match backend PLANS in paise ÷ 100)
const PRICING = {
  pro: {
    monthly: { amount: 499, label: "Pro", period: "month", days: 30 },
    yearly: { amount: 3999, label: "Pro", period: "year", days: 365 },
  },
  premium: {
    monthly: { amount: 999, label: "Premium", period: "month", days: 30 },
    yearly: { amount: 7999, label: "Premium", period: "year", days: 365 },
  },
};

const PLAN_FEATURES = {
  pro: [
    "Unlimited Categories",
    "Unlimited Sub-Categories",
    "Priority product listing",
    "Basic analytics",
    "Email support",
  ],
  premium: [
    "Everything in Pro",
    "Advanced analytics dashboard",
    "Flash Sales access",
    "Dedicated account manager",
    "API access",
  ],
};

function getToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function setToken(newToken) {
  if (localStorage.getItem("accessToken") !== null) {
    localStorage.setItem("accessToken", newToken);
  } else if (localStorage.getItem("token") !== null) {
    localStorage.setItem("token", newToken);
  } else {
    localStorage.setItem("accessToken", newToken);
  }
}

let _refreshPromise = null;
async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const refreshToken =
        localStorage.getItem("refreshToken") ||
        sessionStorage.getItem("refreshToken") ||
        null;
      const body = refreshToken ? JSON.stringify({ refreshToken }) : undefined;
      const res = await fetch(`${API_BASE_UB}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...(body ? { body } : {}),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      const newToken =
        data.accessToken || data.token || data.data?.accessToken || null;
      if (newToken) {
        setToken(newToken);
        return newToken;
      }
      throw new Error("No token in refresh response");
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

async function _doFetch(baseUrl, method, path, body) {
  const makeOpts = (token) => {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    };
    if (body) opts.body = JSON.stringify(body);
    return opts;
  };

  let token = getToken();
  let res = await fetch(baseUrl + path, makeOpts(token));
  let data = await res.json();

  if (
    res.status === 401 &&
    (data?.message === "Relogin" ||
      data?.message === "Not authorized" ||
      data?.message === "jwt expired")
  ) {
    try {
      token = await refreshAccessToken();
      res = await fetch(baseUrl + path, makeOpts(token));
      data = await res.json();
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("token");
      window.location.href = "/";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}

async function apiFetch(method, path, body) {
  return _doFetch(BASE_URL, method, path, body);
}

// Helper for endpoints that live under API_BASE_UB (not /api/auth/vendor)
async function apiFetchUB(method, path, body) {
  return _doFetch(API_BASE_UB, method, path, body);
}

function useDebounce(fn, delay) {
  const t = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(t.current);
      t.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

function useWindowSize() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ═══ TOAST ═══ */
function Toast({ toasts }) {
  const winW = useWindowSize();
  const isMobile = winW < 600;
  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? 16 : 24,
        right: isMobile ? 16 : 24,
        left: isMobile ? 16 : "auto",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${t.type === "error" ? C.danger : C.green}`,
            borderRadius: 10,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: C.shadowMd,
            fontFamily: "Outfit,sans-serif",
            fontSize: 14,
            color: C.text,
            animation: "slideUp .3s ease",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: t.type === "error" ? C.danger : C.green,
              fontWeight: 700,
            }}
          >
            {t.type === "error" ? "✕" : "✓"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ═══ MODAL ═══ */
function Modal({ open, onClose, title, children, footer, wide }) {
  const winW = useWindowSize();
  const isMobile = winW < 600;
  if (!open) return null;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 200,
        padding: isMobile ? 0 : 20,
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: isMobile ? "16px 16px 0 0" : 16,
          width: "100%",
          maxWidth: isMobile ? "100%" : wide ? 700 : 560,
          maxHeight: isMobile ? "94vh" : "90vh",
          overflowY: "auto",
          boxShadow: "0 40px 80px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            padding: isMobile ? "18px 16px 14px" : "26px 32px 20px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: C.bgCard,
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: isMobile ? 17 : 22,
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: "none",
              background: "none",
              cursor: "pointer",
              borderRadius: 6,
              fontSize: 20,
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: isMobile ? "16px" : "26px 32px" }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: isMobile ? "12px 16px 20px" : "16px 32px 26px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              position: "sticky",
              bottom: 0,
              background: C.bgCard,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ FORM COMPONENTS ═══ */
const inputStyle = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "10px 14px",
  color: C.text,
  fontFamily: "Outfit,sans-serif",
  fontSize: 14,
  width: "100%",
  outline: "none",
  transition: "border .2s, box-shadow .2s",
};

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: C.textMuted,
          fontFamily: "JetBrains Mono,monospace",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? C.green : C.border,
        boxShadow: focused ? `0 0 0 3px ${C.greenGlow}` : "none",
        ...props.style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Select({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? C.green : C.border,
        boxShadow: focused ? `0 0 0 3px ${C.greenGlow}` : "none",
        cursor: "pointer",
        ...props.style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

function Textarea(props) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        minHeight: 88,
        resize: "vertical",
        borderColor: focused ? C.green : C.border,
        boxShadow: focused ? `0 0 0 3px ${C.greenGlow}` : "none",
        ...props.style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 22,
          cursor: "pointer",
          background: checked ? C.green : C.border,
          position: "relative",
          transition: "background .2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      {label && (
        <span
          style={{
            fontSize: 13,
            color: C.textMuted,
            fontFamily: "Outfit,sans-serif",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/* ═══ BUTTONS ═══ */
function Btn({
  children,
  variant = "primary",
  sm,
  onClick,
  style: s,
  type = "button",
  disabled,
}) {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: sm ? "6px 14px" : "9px 20px",
    borderRadius: 8,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "Outfit,sans-serif",
    fontSize: sm ? 12 : 14,
    fontWeight: 500,
    transition: "all .2s",
    letterSpacing: ".3px",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.5 : 1,
  };
  const vars = {
    primary: {
      background: hov && !disabled ? C.greenDark : C.green,
      color: "#fff",
    },
    secondary: {
      background: "transparent",
      color: hov && !disabled ? C.green : C.textMuted,
      border: `1px solid ${hov && !disabled ? C.green : C.border}`,
    },
    danger: {
      background: hov && !disabled ? C.danger : "transparent",
      color: hov && !disabled ? "#fff" : C.danger,
      border: `1px solid ${C.danger}`,
    },
    ghost: {
      background: hov && !disabled ? C.greenGlow : "transparent",
      color: C.green,
    },
  };
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...base,
        ...vars[variant],
        ...s,
        transform:
          hov && variant === "primary" && !disabled
            ? "translateY(-1px)"
            : "none",
      }}
    >
      {children}
    </button>
  );
}

/* ═══ BADGE ═══ */
function Badge({ type, children }) {
  const colors = {
    active: { bg: "rgba(41,158,96,0.12)", color: C.green },
    inactive: { bg: C.dangerBg, color: C.danger },
    featured: { bg: "rgba(245,166,35,0.12)", color: C.gold },
    pending: { bg: "rgba(245,166,35,0.15)", color: "#d97706" },
    processing: { bg: "rgba(59,130,246,0.12)", color: "#2563eb" },
    shipped: { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
    delivered: { bg: "rgba(41,158,96,0.12)", color: C.green },
    cancelled: { bg: C.dangerBg, color: C.danger },
    refunded: { bg: "rgba(107,133,119,0.12)", color: C.textMuted },
    percentage: { bg: "rgba(41,158,96,0.12)", color: C.green },
    flat: { bg: "rgba(245,166,35,0.12)", color: C.gold },
  };
  const s = colors[type] || colors.active;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 100,
        fontSize: 11,
        fontFamily: "JetBrains Mono,monospace",
        fontWeight: 500,
        letterSpacing: ".5px",
        background: s.bg,
        color: s.color,
        textTransform: "capitalize",
      }}
    >
      {children}
    </span>
  );
}

/* ═══ STAT CARD ═══ */
function StatCard({ label, value, sub, icon }) {
  const [hov, setHov] = useState(false);
  const winW = useWindowSize();
  const isMobile = winW < 768;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bgCard,
        border: `1px solid ${hov ? C.greenBorder : C.border}`,
        borderRadius: 12,
        padding: isMobile ? "14px 16px" : "24px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color .2s, box-shadow .2s",
        boxShadow: hov ? C.shadowMd : C.shadow,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `radial-gradient(circle at top right, ${C.greenGlow}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.greenGlow,
          borderRadius: 8,
          color: C.green,
          fontSize: isMobile ? 14 : 17,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: C.textMuted,
          fontFamily: "JetBrains Mono,monospace",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "Fraunces,serif",
          fontSize: isMobile ? 28 : 38,
          fontWeight: 700,
          color: C.text,
          lineHeight: 1,
        }}
      >
        {value ?? "—"}
      </div>
      {!isMobile && (
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* ═══ SEARCH BOX ═══ */
function SearchBox({ placeholder, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "8px 14px",
        flex: 1,
        minWidth: 120,
      }}
    >
      <svg
        width={14}
        height={14}
        fill="none"
        stroke={C.textMuted}
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx={11} cy={11} r={8} />
        <line x1={21} y1={21} x2={16.65} y2={16.65} />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          color: C.text,
          fontFamily: "Outfit,sans-serif",
          fontSize: 13,
          width: "100%",
          minWidth: 0,
        }}
      />
    </div>
  );
}

/* ═══ TABLE WRAPPER ═══ */
function TableWrap({ children }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: C.shadow,
      }}
    >
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {children}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        padding: "12px 16px",
        textAlign: "left",
        fontSize: 11,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: C.textMuted,
        fontFamily: "JetBrains Mono,monospace",
        borderBottom: `1px solid ${C.border}`,
        whiteSpace: "nowrap",
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, mono, price }) {
  return (
    <td
      style={{
        padding: "12px 16px",
        fontSize: 14,
        verticalAlign: "middle",
        fontFamily:
          mono || price ? "JetBrains Mono,monospace" : "Outfit,sans-serif",
        color: price ? C.gold : C.text,
      }}
    >
      {children}
    </td>
  );
}

/* ═══ EMPTY STATE ═══ */
function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      <div
        style={{
          fontFamily: "Fraunces,serif",
          fontSize: 20,
          color: C.text,
          opacity: 0.5,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: C.textMuted,
          maxWidth: 320,
          margin: "0 auto 24px",
        }}
      >
        {desc}
      </div>
      {action}
    </div>
  );
}

/* ═══ LOADING ═══ */
function Loading({ text = "Loading…" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: 12,
        color: C.textMuted,
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          border: `2px solid ${C.border}`,
          borderTopColor: C.green,
          borderRadius: "50%",
          animation: "spin .7s linear infinite",
        }}
      />
      {text}
    </div>
  );
}

/* ═══ PAGINATION ═══ */
function Pagination({ page, pages, total, onChange }) {
  const winW = useWindowSize();
  const isMobile = winW < 600;
  if (pages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderTop: `1px solid ${C.border}`,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: C.textMuted,
          fontFamily: "JetBrains Mono,monospace",
        }}
      >
        {total} items · Page {page}/{pages}
      </span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {isMobile ? (
          <>
            <button
              onClick={() => onChange(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: "6px 14px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.textMuted,
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.4 : 1,
                fontFamily: "JetBrains Mono,monospace",
                fontSize: 13,
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => onChange(Math.min(pages, page + 1))}
              disabled={page === pages}
              style={{
                padding: "6px 14px",
                background: page === pages ? C.bg : C.green,
                border: `1px solid ${page === pages ? C.border : C.green}`,
                borderRadius: 6,
                color: page === pages ? C.textMuted : "#fff",
                cursor: page === pages ? "not-allowed" : "pointer",
                opacity: page === pages ? 0.4 : 1,
                fontFamily: "JetBrains Mono,monospace",
                fontSize: 13,
              }}
            >
              Next →
            </button>
          </>
        ) : (
          Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              style={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: i + 1 === page ? C.green : C.bg,
                border: `1px solid ${i + 1 === page ? C.green : C.border}`,
                borderRadius: 6,
                color: i + 1 === page ? "#fff" : C.textMuted,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "JetBrains Mono,monospace",
                transition: "all .2s",
              }}
            >
              {i + 1}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ═══ GRID HELPERS ═══ */
function Grid2({ children }) {
  const winW = useWindowSize();
  const isMobile = winW < 600;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}
function FullCol({ children }) {
  return <div style={{ gridColumn: "1/-1" }}>{children}</div>;
}

/* ═══ MOBILE CARD ═══ */
function MobileCard({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        background: C.bgCard,
        border: `1px solid ${hov ? C.greenBorder : C.border}`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: onClick ? "pointer" : "default",
        transition: "all .2s",
        boxShadow: hov ? C.shadowMd : C.shadow,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   UPGRADE MODAL  (Razorpay)
═══════════════════════════════════════════ */
function UpgradeModal({ open, onClose, onSuccess }) {
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("plans"); // "plans" | "success"
  const [activePlan, setActivePlan] = useState(null);
  const winW = useWindowSize();
  const isMobile = winW < 600;

  if (!open) return null;

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function startPayment(planKey) {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check internet.");

      const token = getToken();
      const orderRes = await fetch(
        `${API_BASE_UB}/api/subscription/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ plan: planKey, billing }),
        },
      );
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Order failed");

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: "INR",
          name: "3Arrow",
          description: orderData.label,
          order_id: orderData.orderId,
          theme: { color: C.green },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
          handler: async (response) => {
            try {
              const verifyRes = await fetch(
                `${API_BASE_UB}/api/subscription/verify-payment`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    plan: planKey,
                    billing,
                  }),
                },
              );
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok)
                throw new Error(verifyData.message || "Verification failed");
              setActivePlan(planKey);
              setStep("success");
              onSuccess?.(planKey);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });
        rzp.open();
      });
    } catch (err) {
      if (err.message !== "Payment cancelled") alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const yearSaving = {
    pro: Math.round(((499 * 12 - 3999) / (499 * 12)) * 100),
    premium: Math.round(((999 * 12 - 7999) / (999 * 12)) * 100),
  };

  // ── Success screen ──
  if (step === "success") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 300,
          padding: 20,
          animation: "fadeIn .2s ease",
        }}
      >
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.greenBorder}`,
            borderRadius: 20,
            padding: isMobile ? "36px 24px" : "52px 44px",
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            boxShadow: C.shadowMd,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 38,
              boxShadow: `0 8px 28px ${C.green}55`,
              animation: "apulse 1s ease",
            }}
          >
            🎉
          </div>
          <div
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: isMobile ? 22 : 26,
              fontWeight: 900,
              color: C.text,
              marginBottom: 10,
            }}
          >
            You're now on{" "}
            <span
              style={{
                background: `linear-gradient(90deg,${C.green},${C.greenLight})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {activePlan === "premium" ? "Premium" : "Pro"}!
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              color: C.textMuted,
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Your subscription is active. Categories, Sub-Categories, and all Pro
            features are now unlocked.
          </p>
          <button
            onClick={() => {
              setStep("plans");
              onClose();
            }}
            style={{
              width: "100%",
              padding: "13px 0",
              background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontFamily: "Outfit,sans-serif",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 6px 18px ${C.green}44`,
              letterSpacing: ".3px",
            }}
          >
            Start Using Pro →
          </button>
        </div>
      </div>
    );
  }

  // ── Plans screen ──
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: isMobile ? "12px 0 0" : 20,
        animation: "fadeIn .2s ease",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.greenBorder}`,
          borderRadius: isMobile ? "20px 20px 0 0" : 20,
          width: "100%",
          maxWidth: 700,
          boxShadow: C.shadowMd,
          position: "relative",
          marginTop: isMobile ? "auto" : 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? "22px 20px 18px" : "32px 36px 24px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: isMobile ? 20 : 26,
                fontWeight: 900,
                color: C.text,
                marginBottom: 4,
              }}
            >
              Upgrade Your Store 🚀
            </div>
            <div style={{ fontSize: 13, color: C.textMuted }}>
              Unlock Categories, Sub-Categories & more
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: "none",
              background: "none",
              fontSize: 22,
              color: C.textMuted,
              cursor: "pointer",
              flexShrink: 0,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Billing toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: isMobile ? "16px 20px" : "20px 36px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: 4,
              gap: 4,
            }}
          >
            {["monthly", "yearly"].map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: "7px 20px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 13,
                  fontWeight: billing === b ? 700 : 400,
                  background:
                    billing === b
                      ? `linear-gradient(135deg,${C.green},${C.greenLight})`
                      : "transparent",
                  color: billing === b ? "#fff" : C.textMuted,
                  transition: "all .2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {b === "monthly" ? "Monthly" : "Yearly"}
                {b === "yearly" && (
                  <span
                    style={{
                      fontSize: 10,
                      background:
                        billing === "yearly"
                          ? "rgba(255,255,255,0.25)"
                          : C.greenGlow,
                      color: billing === "yearly" ? "#fff" : C.green,
                      borderRadius: 100,
                      padding: "1px 7px",
                      fontWeight: 700,
                    }}
                  >
                    Save up to {yearSaving.pro}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 12 : 20,
            padding: isMobile ? "16px 20px 24px" : "24px 36px 32px",
          }}
        >
          {["pro", "premium"].map((planKey) => {
            const price = PRICING[planKey][billing];
            const isPremium = planKey === "premium";
            return (
              <div
                key={planKey}
                style={{
                  border: `2px solid ${isPremium ? C.green : C.border}`,
                  borderRadius: 16,
                  padding: isMobile ? "20px 18px" : "24px",
                  position: "relative",
                  background: isPremium
                    ? `linear-gradient(135deg,${C.greenGlow},${C.bg})`
                    : C.bgCard,
                  boxShadow: isPremium ? C.shadowMd : C.shadow,
                }}
              >
                {isPremium && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: `linear-gradient(90deg,${C.green},${C.greenLight})`,
                      color: "#fff",
                      fontSize: 10,
                      fontFamily: "JetBrains Mono,monospace",
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      padding: "4px 14px",
                      borderRadius: 100,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ★ MOST POPULAR
                  </div>
                )}

                {/* Price */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontFamily: "Fraunces,serif",
                      fontSize: 18,
                      fontWeight: 900,
                      color: C.text,
                      marginBottom: 4,
                    }}
                  >
                    {price.label} {isPremium ? "⭐" : "✨"}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 4 }}
                  >
                    <span
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: 30,
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      ₹{price.amount.toLocaleString("en-IN")}
                    </span>
                    <span style={{ fontSize: 13, color: C.textMuted }}>
                      /{price.period}
                    </span>
                  </div>
                  {billing === "yearly" && (
                    <div
                      style={{
                        fontSize: 11,
                        color: C.green,
                        fontFamily: "JetBrains Mono,monospace",
                        marginTop: 2,
                      }}
                    >
                      Save {yearSaving[planKey]}% vs monthly
                    </div>
                  )}
                </div>

                {/* Features */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    marginBottom: 20,
                  }}
                >
                  {PLAN_FEATURES[planKey].map((f) => (
                    <div
                      key={f}
                      style={{
                        fontSize: 13,
                        color: C.text,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          color: C.green,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => startPayment(planKey)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    background: isPremium
                      ? `linear-gradient(135deg,${C.green},${C.greenLight})`
                      : "transparent",
                    border: isPremium ? "none" : `2px solid ${C.green}`,
                    borderRadius: 10,
                    color: isPremium ? "#fff" : C.green,
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    boxShadow: isPremium ? `0 6px 18px ${C.green}44` : "none",
                    letterSpacing: ".3px",
                    transition: "opacity .2s",
                  }}
                >
                  {loading
                    ? "Processing…"
                    : `Get ${price.label} ${billing === "yearly" ? "Yearly" : "Monthly"}`}
                </button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "0 36px 20px",
            fontSize: 11,
            color: C.textLight,
            fontFamily: "JetBrains Mono,monospace",
          }}
        >
          Secured by Razorpay · Cancel anytime
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LOCKED PAGE  (shown when not Pro)
═══════════════════════════════════════════ */
function LockedPage({ title, onUpgrade }) {
  const winW = useWindowSize();
  const isMobile = winW < 600;
  const dummies = Array.from({ length: 6 });

  return (
    <div style={{ position: "relative", minHeight: 380 }}>
      {/* Blurred skeleton */}
      <div
        style={{
          filter: "blur(3px)",
          opacity: 0.18,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            All <span style={{ color: C.green }}>{title}</span>
          </h2>
          <Btn>+ Add</Btn>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr 1fr"
              : "repeat(auto-fill,minmax(200px,1fr))",
            gap: isMobile ? 12 : 18,
          }}
        >
          {dummies.map((_, i) => (
            <div
              key={i}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: isMobile ? 14 : 24,
                textAlign: "center",
                boxShadow: C.shadow,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: C.bg,
                  margin: "0 auto 10px",
                }}
              />
              <div
                style={{
                  height: 14,
                  background: C.bg,
                  borderRadius: 6,
                  marginBottom: 8,
                  width: "70%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <div
                style={{
                  height: 10,
                  background: C.bg,
                  borderRadius: 6,
                  width: "50%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.greenBorder}`,
            borderRadius: 20,
            padding: isMobile ? "32px 24px" : "44px 40px",
            maxWidth: 400,
            width: "90%",
            textAlign: "center",
            boxShadow: C.shadowMd,
            animation: "fadeIn .3s ease",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              fontSize: 28,
              boxShadow: `0 6px 20px ${C.green}44`,
            }}
          >
            🔒
          </div>
          <div
            style={{
              fontFamily: "Fraunces,serif",
              fontSize: isMobile ? 20 : 22,
              fontWeight: 900,
              color: C.text,
              marginBottom: 8,
            }}
          >
            {title} —{" "}
            <span
              style={{
                background: `linear-gradient(90deg,${C.green},${C.greenLight})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pro Only
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: C.textMuted,
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            Subscribe to the <strong style={{ color: C.text }}>Pro Plan</strong>{" "}
            to create and manage {title.toLowerCase()} for your store.
          </p>
          <button
            onClick={onUpgrade}
            style={{
              width: "100%",
              padding: "13px 0",
              background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontFamily: "Outfit,sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 6px 18px ${C.green}44`,
              letterSpacing: ".3px",
              transition: "opacity .2s, transform .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "none";
            }}
          >
            🚀 View Plans & Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════ */
function DashboardPage({ stats, setStats }) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const winW = useWindowSize();
  const isMobile = winW < 768;
  const isTablet = winW < 1024;

  useEffect(() => {
    fetch(`${API_BASE_UB}/api/products?page=1&limit=6`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setRecent(d.products || []);
        setStats((s) => ({ ...s, products: d.total }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div
        style={{
          background: `linear-gradient(135deg,${C.green}18 0%,${C.green}08 50%,transparent 100%)`,
          border: `1px solid ${C.greenBorder}`,
          borderRadius: 14,
          padding: isMobile ? "10px 10px" : "12px 20px",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
          minHeight: isMobile ? "auto" : "140px",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -1,
            top: -10,
            fontFamily: "Fraunces,serif",
            fontSize: isMobile ? 42 : 72,
            fontWeight: 900,
            color: `${C.green}06`,
            pointerEvents: "none",
            letterSpacing: -3,
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          3arrow
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.green,
                fontFamily: "JetBrains Mono,monospace",
              }}
            >
              Product Catalog System
            </span>
            <h1
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: isMobile ? 18 : 22,
                fontWeight: 900,
                color: C.text,
                margin: "0 0 4px",
                letterSpacing: "-0.3px",
                lineHeight: 1.05,
              }}
            >
              Good to have you back 👋
            </h1>
            <p
              style={{
                color: C.textMuted,
                fontSize: isMobile ? 11 : 12,
                maxWidth: 420,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Add your products and manage your catalog with ease
            </p>
          </div>
          <div
            style={{
              width: isMobile ? "100%" : "38%",
              display: "flex",
              justifyContent: isMobile ? "flex-start" : "flex-end",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                transform: isMobile ? "scale(0.95)" : "scale(0.9)",
                transformOrigin: "top right",
              }}
            >
              <VendorProfileSection
                onLogoUpdate={(url) => console.log("New logo:", url)}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr 1fr"
            : isTablet
              ? "repeat(2,1fr)"
              : "repeat(4,1fr)",
          gap: isMobile ? 10 : 20,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Categories"
          value={stats.cats}
          sub="Active parent categories"
          icon={<File />}
        />
        <StatCard
          label="Sub-Categories"
          value={stats.subs}
          sub="Active sub-categories"
          icon={<FileCheckCorner />}
        />
        <StatCard
          label="Products"
          value={stats.products}
          sub="Total in catalog"
          icon={<ShoppingBasket />}
        />
        <StatCard
          label="Featured"
          value={stats.featured}
          sub="Highlighted products"
          icon={<Star />}
        />
      </div>

      <h2
        style={{
          fontFamily: "Fraunces,serif",
          fontSize: 18,
          fontWeight: 700,
          color: C.text,
          margin: "0 0 16px",
        }}
      >
        Recent <span style={{ color: C.green }}>Products</span>
      </h2>

      {loading ? (
        <Loading />
      ) : recent.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket />}
          title="No products yet"
          desc="Start adding products to your catalog."
        />
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recent.map((p) => (
            <MobileCard key={p._id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {p.images?.[0]?.url ? (
                    <img
                      src={p.images[0].url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = "🛒";
                      }}
                    />
                  ) : (
                    <ShoppingBasket size={20} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      color: C.text,
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    /{p.slug}
                  </div>
                </div>
                <Badge type={p.isActive ? "active" : "inactive"}>●</Badge>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                <span style={{ color: C.textMuted }}>
                  {p.category?.name || "—"}
                </span>
                {p.pricingBreakdown ? (
                  <>
                    <span
                      style={{
                        color: "#2563eb",
                        fontFamily: "JetBrains Mono,monospace",
                        fontWeight: 700,
                      }}
                    >
                      ₹
                      {p.pricingBreakdown.customerFacingPrice?.toLocaleString()}
                    </span>
                    <span
                      style={{
                        color: C.green,
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: 11,
                      }}
                    >
                      Earn ₹{p.price?.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      color: C.gold,
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    ₹{p.price?.toLocaleString()}
                  </span>
                )}
                <span
                  style={{
                    color: C.textMuted,
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  Stock: {p.stock}
                </span>
              </div>
            </MobileCard>
          ))}
        </div>
      ) : (
        <TableWrap>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p, i) => (
                <tr
                  key={p._id}
                  style={{
                    borderBottom:
                      i < recent.length - 1 ? `1px solid ${C.border}` : "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.greenGlow)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        fontFamily: "JetBrains Mono,monospace",
                      }}
                    >
                      /{p.slug}
                    </div>
                  </Td>
                  <Td>{p.category?.name || "—"}</Td>
                  <Td>
                    {p.pricingBreakdown ? (
                      <div>
                        <div
                          style={{
                            color: "#2563eb",
                            fontFamily: "JetBrains Mono,monospace",
                            fontWeight: 900,
                            fontSize: 14,
                          }}
                        >
                          ₹
                          {p.pricingBreakdown.customerFacingPrice?.toLocaleString()}
                        </div>
                        <div
                          style={{
                            color: C.green,
                            fontFamily: "JetBrains Mono,monospace",
                            fontSize: 11,
                          }}
                        >
                          Earn ₹{p.price?.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span
                        style={{
                          color: C.gold,
                          fontFamily: "JetBrains Mono,monospace",
                          fontWeight: 700,
                        }}
                      >
                        ₹{p.price?.toLocaleString()}
                      </span>
                    )}
                  </Td>
                  <Td mono>{p.stock}</Td>
                  <Td>
                    <Badge type={p.isActive ? "active" : "inactive"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CATEGORIES PAGE
═══════════════════════════════════════════ */
const CAT_EMOJIS = [
  "🛍️",
  "🔌",
  "👗",
  "🏠",
  "📱",
  "🎮",
  "🍕",
  "🚗",
  "💄",
  "📚",
  "⚽",
  "🎵",
  "💎",
  "🌿",
  "🔧",
];

function CategoriesPage({ categories, setCategories, showToast }) {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = {
    name: "",
    imageFile: null,
    image: "",
    imagePreview: "",
    description: "",
    isActive: true,
    seo: { metaTitle: "", metaDescription: "" },
  };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch("GET", "/my-categories");
      setCategories(d);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }
  function openEdit(c) {
    setEditing(c._id);
    setForm({
      name: c.name || "",
      imageFile: null,
      image: c.image || "",
      imagePreview: c.image ? `${API_BASE_UB}${c.image}` : "",
      description: c.description || "",
      isActive: c.isActive,
      seo: {
        metaTitle: c.seo?.metaTitle || "",
        metaDescription: c.seo?.metaDescription || "",
      },
    });
    setModal(true);
  }

  async function submit() {
    if (!form.name) return showToast("Name is required", "error");
    if (!form.imageFile && !form.image)
      return showToast("Image is required", "error");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("isActive", form.isActive);
      formData.append("seo", JSON.stringify(form.seo));
      if (form.imageFile) formData.append("image", form.imageFile);
      const endpoint = editing
        ? `/auth/vendor/my-categories/${editing}`
        : "/auth/vendor/my-categories";
      const response = await fetch(`${API_BASE_UB}/api${endpoint}`, {
        method: editing ? "PUT" : "POST",
        body: formData,
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed");
      }
      showToast(editing ? "Category updated!" : "Category created!");
      setModal(false);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function del(id) {
    if (!confirm("Deactivate this category?")) return;
    try {
      await apiFetch("DELETE", `/my-categories/${id}`);
      showToast("Deactivated");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const FS = (k, v) => setForm((f) => ({ ...f, seo: { ...f.seo, [k]: v } }));
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      F("imageFile", file);
      const r = new FileReader();
      r.onloadend = () => F("imagePreview", r.result);
      r.readAsDataURL(file);
    }
  };

  const winW = useWindowSize();
  const isMobile = winW < 600;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            margin: 0,
          }}
        >
          All <span style={{ color: C.green }}>Categories</span>
        </h2>
        <Btn onClick={openAdd}>+ Add Category</Btn>
      </div>

      {loading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<File />}
          title="No Categories Yet"
          desc="Create your first category."
          action={<Btn onClick={openAdd}>+ Add Category</Btn>}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr 1fr"
              : "repeat(auto-fill,minmax(200px,1fr))",
            gap: isMobile ? 12 : 18,
          }}
        >
          {categories.map((c, i) => (
            <CatTile
              key={c._id}
              cat={c}
              emoji={CAT_EMOJIS[i % CAT_EMOJIS.length]}
              onEdit={() => openEdit(c)}
              onDelete={() => del(c._id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submit}>Save Category</Btn>
          </>
        }
      >
        <Grid2>
          <Field label="Name *">
            <Input
              value={form.name}
              onChange={(e) => F("name", e.target.value)}
              placeholder="e.g. Electronics"
            />
          </Field>
          <Field label="Image Upload *">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="category-image-input"
            />
            <label
              htmlFor="category-image-input"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 20px",
                border: `2px dashed ${C.border}`,
                borderRadius: 8,
                cursor: "pointer",
                background: C.bg,
                transition: "all .2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = C.green;
                e.currentTarget.style.background = C.greenGlow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.bg;
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
                <div style={{ color: C.textMuted, fontSize: 12 }}>
                  {form.imageFile ? form.imageFile.name : "Click to upload"}
                </div>
              </div>
            </label>
            {form.imagePreview && (
              <div
                style={{
                  marginTop: 10,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                }}
              >
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            )}
          </Field>
          <FullCol>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => F("description", e.target.value)}
                placeholder="Short description…"
              />
            </Field>
          </FullCol>
          <Field label="Meta Title">
            <Input
              value={form.seo.metaTitle}
              onChange={(e) => FS("metaTitle", e.target.value)}
            />
          </Field>
          <Field label="Meta Description">
            <Input
              value={form.seo.metaDescription}
              onChange={(e) => FS("metaDescription", e.target.value)}
            />
          </Field>
          <FullCol>
            <Field label="Active">
              <Toggle
                checked={form.isActive}
                onChange={(v) => F("isActive", v)}
                label="Visible in storefront"
              />
            </Field>
          </FullCol>
        </Grid2>
      </Modal>
    </div>
  );
}

function CatTile({ cat, emoji, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  const winW = useWindowSize();
  const isMobile = winW < 600;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bgCard,
        border: `1px solid ${hov ? C.greenBorder : C.border}`,
        borderRadius: 12,
        padding: isMobile ? 14 : 24,
        textAlign: "center",
        transition: "all .2s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? C.shadowMd : C.shadow,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg,${C.green},${C.greenLight})`,
          transform: hov ? "scaleX(1)" : "scaleX(0)",
          transition: "transform .3s",
          transformOrigin: "left",
        }}
      />
      <div style={{ fontSize: isMobile ? 28 : 38, marginBottom: 8 }}>
        {emoji}
      </div>
      <div
        style={{
          fontFamily: "Fraunces,serif",
          fontSize: isMobile ? 13 : 16,
          fontWeight: 700,
          color: C.text,
          marginBottom: 4,
        }}
      >
        {cat.name}
      </div>
      <div
        style={{
          fontFamily: "JetBrains Mono,monospace",
          fontSize: 10,
          color: C.textMuted,
          marginBottom: 8,
        }}
      >
        /{cat.slug}
      </div>
      <Badge type={cat.isActive ? "active" : "inactive"}>
        {cat.isActive ? "Active" : "Inactive"}
      </Badge>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginTop: 12,
        }}
      >
        <Btn variant="secondary" sm onClick={onEdit}>
          <SquarePen size={12} />
        </Btn>
        <Btn variant="danger" sm onClick={onDelete}>
          <Trash2 size={12} />
        </Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUBCATEGORIES PAGE
═══════════════════════════════════════════ */
function SubCategoriesPage({ categories, showToast }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catFilter, setCatFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = {
    name: "",
    category: "",
    imageFile: null,
    image: "",
    imagePreview: "",
    description: "",
    isActive: true,
  };
  const [form, setForm] = useState(blank);
  const winW = useWindowSize();
  const isMobile = winW < 768;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSubs(
        await apiFetch(
          "GET",
          catFilter
            ? `/my-subcategories?category=${catFilter}`
            : "/my-subcategories",
        ),
      );
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [catFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }
  function openEdit(s) {
    setEditing(s._id);
    setForm({
      name: s.name || "",
      category: s.category?._id || s.category || "",
      imageFile: null,
      image: s.image || "",
      imagePreview: s.image ? `${API_BASE_UB}${s.image}` : "",
      description: s.description || "",
      isActive: s.isActive,
    });
    setModal(true);
  }

  async function submit() {
    if (!form.name || !form.category)
      return showToast("Name and Category required", "error");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("isActive", form.isActive);
      if (form.imageFile) formData.append("image", form.imageFile);
      const endpoint = editing
        ? `/auth/vendor/my-subcategories/${editing}`
        : "/auth/vendor/my-subcategories";
      const response = await fetch(`${API_BASE_UB}/api${endpoint}`, {
        method: editing ? "PUT" : "POST",
        body: formData,
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed");
      }
      showToast(editing ? "Updated!" : "Created!");
      setModal(false);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function del(id) {
    if (!confirm("Deactivate?")) return;
    try {
      await apiFetch("DELETE", `/my-subcategories/${id}`);
      showToast("Deactivated");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      F("imageFile", file);
      const r = new FileReader();
      r.onloadend = () => F("imagePreview", r.result);
      r.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            margin: 0,
          }}
        >
          All <span style={{ color: C.green }}>Sub-Categories</span>
        </h2>
        <Btn onClick={openAdd}>+ Add Sub-Category</Btn>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          boxShadow: C.shadow,
          flexWrap: "wrap",
        }}
      >
        <Select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <span
          style={{
            fontSize: 13,
            color: C.textMuted,
            fontFamily: "JetBrains Mono,monospace",
          }}
        >
          {subs.length} sub-categories
        </span>
      </div>

      {loading ? (
        <Loading />
      ) : subs.length === 0 ? (
        <EmptyState
          icon="🗃️"
          title="No Sub-Categories"
          desc="Add sub-categories under a parent category."
          action={<Btn onClick={openAdd}>+ Add Sub-Category</Btn>}
        />
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subs.map((s) => (
            <MobileCard key={s._id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: C.text, fontSize: 14 }}>
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    /{s.slug}
                  </div>
                </div>
                <Badge type={s.isActive ? "active" : "inactive"}>
                  {s.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div style={{ fontSize: 13, color: C.textMuted }}>
                {s.category?.name || "—"}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" sm onClick={() => openEdit(s)}>
                  <SquarePen size={12} />
                </Btn>
                <Btn variant="danger" sm onClick={() => del(s._id)}>
                  <Trash2 size={12} />
                </Btn>
              </div>
            </MobileCard>
          ))}
        </div>
      ) : (
        <TableWrap>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Slug</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr
                  key={s._id}
                  style={{
                    borderBottom:
                      i < subs.length - 1 ? `1px solid ${C.border}` : "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.greenGlow)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Td>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                  </Td>
                  <Td mono>/{s.slug}</Td>
                  <Td>{s.category?.name || "—"}</Td>
                  <Td>
                    <Badge type={s.isActive ? "active" : "inactive"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="secondary" sm onClick={() => openEdit(s)}>
                        <SquarePen size={12} />
                      </Btn>
                      <Btn variant="danger" sm onClick={() => del(s._id)}>
                        <Trash2 size={12} />
                      </Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Sub-Category" : "Add Sub-Category"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submit}>Save</Btn>
          </>
        }
      >
        <Grid2>
          <Field label="Name *">
            <Input
              value={form.name}
              onChange={(e) => F("name", e.target.value)}
              placeholder="e.g. Laptops"
            />
          </Field>
          <Field label="Parent Category *">
            <Select
              value={form.category}
              onChange={(e) => F("category", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Image Upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="subcategory-image-input"
            />
            <label
              htmlFor="subcategory-image-input"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 20px",
                border: `2px dashed ${C.border}`,
                borderRadius: 8,
                cursor: "pointer",
                background: C.bg,
                transition: "all .2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = C.green;
                e.currentTarget.style.background = C.greenGlow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.bg;
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
                <div style={{ color: C.textMuted, fontSize: 12 }}>
                  {form.imageFile ? form.imageFile.name : "Click to upload"}
                </div>
              </div>
            </label>
            {form.imagePreview && (
              <div
                style={{
                  marginTop: 10,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                }}
              >
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  style={{ width: "100%", height: 140, objectFit: "cover" }}
                />
              </div>
            )}
          </Field>
          <Field label="Active">
            <Toggle
              checked={form.isActive}
              onChange={(v) => F("isActive", v)}
            />
          </Field>
          <FullCol>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => F("description", e.target.value)}
              />
            </Field>
          </FullCol>
        </Grid2>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PRODUCTS PAGE  (unchanged — kept in full)
═══════════════════════════════════════════ */
function ProductsPage({
  categories,
  showToast,
  autoOpenAdd,
  onAutoOpenHandled,
}) {
  const [data, setData] = useState({
    products: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("");
  const [subF, setSubF] = useState("");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [subOptions, setSubOptions] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const winW = useWindowSize();
  const isMobile = winW < 768;
  const blank = {
    name: "",
    brand: "",
    category: "",
    subCategory: "",
    mrp: "", // Maximum Retail Price (tag price)
    price: "", // Selling price (≤ MRP)
    costPrice: "", // Vendor's sourcing cost
    compareAtPrice: "",
    stock: 0,
    sku: "",
    gst: 0,
    weight: "",
    description: "",
    shortDescription: "",
    tags: "",
    imageFiles: [],
    imagePreviews: [],
    existingImages: [],
    videoFile: null,
    videoUrl: "",
    isFeatured: false,
    isActive: true,
    customFields: [],
  };
  const [form, setForm] = useState(blank);

  const load = useCallback(
    async (pg = 1) => {
      setLoading(true);
      let q = `/api/products?page=${pg}&limit=12`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      if (catF) q += `&category=${catF}`;
      if (subF) q += `&subCategory=${subF}`;
      if (minP) q += `&minPrice=${minP}`;
      if (maxP) q += `&maxPrice=${maxP}`;
      try {
        const r = await fetch(`${API_BASE_UB}${q}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          credentials: "include",
        });
        if (!r.ok) throw new Error("Failed to load products");
        setData(await r.json());
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [search, catF, subF, minP, maxP],
  );

  useEffect(() => {
    load(1);
    loadAllSubcategories();
  }, [load]);
  useEffect(() => {
    if (autoOpenAdd) {
      openAdd();
      if (onAutoOpenHandled) onAutoOpenHandled();
    }
  }, [autoOpenAdd]);

  // ProductsPage — loadAllSubcategories function
  async function loadAllSubcategories() {
    try {
      // ✅ Public endpoint use karo jo vendor + superadmin dono return kare
      const token = getToken();
      const r = await fetch(`${API_BASE_UB}/api/subcategories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const subs = await r.json();
      setAllSubcategories(Array.isArray(subs) ? subs : []);
    } catch {
      setAllSubcategories([]);
    }
  }
  const debouncedLoad = useDebounce(() => load(1), 500);
  async function loadSubsForCat(catId) {
    if (!catId) {
      setSubOptions([]);
      return;
    }
    setSubOptions(allSubcategories.filter((s) => s.category?._id === catId));
  }
  function openAdd() {
    setEditing(null);
    setForm(blank);
    setSubOptions([]);
    setModal(true);
  }
  async function openEdit(id) {
    setEditing(id);
    setForm(blank);
    setModal(true);
    setLoadingEdit(true);
    try {
      const res = await fetch(`${API_BASE_UB}/api/products/id/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load product");
      const p = await res.json();
      setForm({
        name: p.name || "",
        brand: p.brand || "",
        category: p.category?._id || "",
        subCategory: p.subCategory?._id || "",
        mrp: p.mrp || "",
        price: p.price || "",
        costPrice: p.costPrice || "",
        compareAtPrice: p.compareAtPrice || "",
        stock: p.stock || 0,
        sku: p.sku || "",
        gst: p.gst || 0,
        weight: p.weight || "",
        description: p.description || "",
        shortDescription: p.shortDescription || "",
        tags: (p.tags || []).join(", "),
        imageFiles: [],
        imagePreviews: (p.images || []).map((img) =>
          img.url?.startsWith("/") ? `${API_BASE_UB}${img.url}` : img.url,
        ),
        existingImages: (p.images || []).map((img) => ({
          url: img.url?.startsWith("/") ? `${API_BASE_UB}${img.url}` : img.url,
          _id: img._id,
        })),
        videoFile: null,
        videoUrl: p.videoUrl || "",
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        customFields: (p.customFields || []).map((f) => ({
          id: f._id || Date.now() + Math.random(),
          label: f.label,
          value: f.value,
        })),
      });
      if (p.category?._id) await loadSubsForCat(p.category._id);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoadingEdit(false);
    }
  }

  async function submit() {
    const { name, mrp, price, category, subCategory, description } = form;
    if (!name || !mrp || !price || !category || !subCategory || !description)
      return showToast(
        "Name, MRP, Price, Category, Sub-Category and Description required",
        "error",
      );
    if (Number(price) > Number(mrp))
      return showToast("Selling price cannot exceed MRP", "error");
    if (Number(price) <= 0)
      return showToast("Selling price must be greater than 0", "error");
    const tags = form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("brand", form.brand);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("mrp", Number(mrp));
      formData.append("price", Number(price));
      if (form.costPrice) formData.append("costPrice", Number(form.costPrice));
      if (form.compareAtPrice)
        formData.append("compareAtPrice", Number(form.compareAtPrice));
      formData.append("stock", Number(form.stock) || 0);
      if (form.sku) formData.append("sku", form.sku);
      formData.append("gst", Number(form.gst) || 0);
      if (form.weight) formData.append("weight", Number(form.weight));
      formData.append("description", description);
      if (form.shortDescription)
        formData.append("shortDescription", form.shortDescription);
      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));
      formData.append(
        "customFields",
        JSON.stringify(form.customFields.map(({ id, ...f }) => f)),
      );
      formData.append("isFeatured", form.isFeatured);
      formData.append("isActive", form.isActive);
      if (form.videoFile) formData.append("video", form.videoFile);
      else if (form.videoUrl) formData.append("videoUrl", form.videoUrl);
      form.imageFiles.forEach((file) => formData.append("images", file));
      if (editing && form.existingImages.length > 0)
        formData.append(
          "existingImages",
          JSON.stringify(form.existingImages.map((img) => img._id)),
        );
      const response = await fetch(
        `${API_BASE_UB}/api/products${editing ? `/${editing}` : ""}`,
        {
          method: editing ? "PUT" : "POST",
          body: formData,
          headers: { Authorization: `Bearer ${getToken()}` },
          credentials: "include",
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed");
      }
      showToast(editing ? "Product updated!" : "Product created!");
      setModal(false);
      load(data.page);
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function del(id) {
    if (!confirm("Soft-delete this product?")) return;
    try {
      const delRes = await fetch(`${API_BASE_UB}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (!delRes.ok) throw new Error("Delete failed");
      showToast("Product deleted");
      load(data.page);
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    F("imageFiles", [...form.imageFiles, ...files]);
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result);
            r.readAsDataURL(file);
          }),
      ),
    ).then((results) =>
      F("imagePreviews", [...form.imagePreviews, ...results]),
    );
  };
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) F("videoFile", file);
  };
  const removeImagePreview = (index) => {
    const preview = form.imagePreviews[index];
    const isExisting = form.existingImages.some((img) => img.url === preview);
    F(
      "imagePreviews",
      form.imagePreviews.filter((_, i) => i !== index),
    );
    if (isExisting) {
      F(
        "existingImages",
        form.existingImages.filter((img) => img.url !== preview),
      );
    } else {
      const existingUrls = new Set(form.existingImages.map((img) => img.url));
      const newFileIndex = form.imagePreviews
        .slice(0, index)
        .filter((p) => !existingUrls.has(p)).length;
      F(
        "imageFiles",
        form.imageFiles.filter((_, i) => i !== newFileIndex),
      );
    }
  };
  const addCustomField = () =>
    F("customFields", [
      ...form.customFields,
      { id: Date.now() + Math.random(), label: "", value: "" },
    ]);
  const updateCustomField = (fieldId, key, val) =>
    F(
      "customFields",
      form.customFields.map((f) =>
        f.id === fieldId ? { ...f, [key]: val } : f,
      ),
    );
  const removeCustomField = (fieldId) =>
    F(
      "customFields",
      form.customFields.filter((f) => f.id !== fieldId),
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            margin: 0,
          }}
        >
          All <span style={{ color: C.green }}>Products</span>
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {isMobile && (
            <Btn
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "🔽 Filters"}
            </Btn>
          )}
          <Btn onClick={openAdd}>+ Add</Btn>
        </div>
      </div>

      {(!isMobile || showFilters) && (
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 16,
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "12px 16px",
            boxShadow: C.shadow,
          }}
        >
          <SearchBox
            placeholder="Search products…"
            value={search}
            onChange={(v) => {
              setSearch(v);
              debouncedLoad();
            }}
          />
          <Select
            value={catF}
            onChange={(e) => {
              setCatF(e.target.value);
              loadSubsForCat(e.target.value);
              setSubF("");
            }}
            style={{
              maxWidth: isMobile ? "100%" : 180,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={subF}
            onChange={(e) => setSubF(e.target.value)}
            style={{
              maxWidth: isMobile ? "100%" : 180,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <option value="">All Sub-Cats</option>
            {allSubcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.category?.name || "?"})
              </option>
            ))}
          </Select>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              value={minP}
              onChange={(e) => {
                setMinP(e.target.value);
                debouncedLoad();
              }}
              placeholder="Min ₹"
              style={{ maxWidth: 90 }}
            />
            <Input
              value={maxP}
              onChange={(e) => {
                setMaxP(e.target.value);
                debouncedLoad();
              }}
              placeholder="Max ₹"
              style={{ maxWidth: 90 }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : data.products.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket />}
          title="No Products Found"
          desc="Try adjusting filters or add a new product."
          action={<Btn onClick={openAdd}>+ Add Product</Btn>}
        />
      ) : isMobile ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.products.map((p) => (
              <MobileCard key={p._id}>
                <div
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = "🛒";
                        }}
                      />
                    ) : (
                      <ShoppingBasket size={20} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: C.text,
                        fontSize: 14,
                        marginBottom: 2,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        fontFamily: "JetBrains Mono,monospace",
                        marginBottom: 4,
                      }}
                    >
                      /{p.slug}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {/* Customer-facing price shown prominently */}
                      {p.pricingBreakdown ? (
                        <>
                          <span
                            style={{
                              color: "#2563eb",
                              fontFamily: "JetBrains Mono,monospace",
                              fontSize: 13,
                              fontWeight: 900,
                            }}
                          >
                            ₹
                            {p.pricingBreakdown.customerFacingPrice?.toLocaleString()}
                          </span>
                          <span
                            style={{
                              color: C.green,
                              fontFamily: "JetBrains Mono,monospace",
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Earn ₹{p.price?.toLocaleString()}
                          </span>
                          {p.pricingBreakdown.discountPct > 0 && p.mrp > 0 && (
                            <span
                              style={{
                                background: "rgba(229,57,53,0.1)",
                                color: C.danger,
                                fontFamily: "JetBrains Mono,monospace",
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: 4,
                              }}
                            >
                              -{p.pricingBreakdown.discountPct}%
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          style={{
                            color: C.gold,
                            fontFamily: "JetBrains Mono,monospace",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          ₹{p.price?.toLocaleString()}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: C.textMuted }}>
                        Stock: {p.stock}
                      </span>
                      <Badge type={p.isActive ? "active" : "inactive"}>
                        {p.isActive ? "Active" : "Off"}
                      </Badge>
                      {p.isFeatured && <Badge type="featured">★</Badge>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  {p.category?.name || "—"}
                  {p.subCategory?.name ? ` › ${p.subCategory.name}` : ""}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="secondary" sm onClick={() => openEdit(p._id)}>
                    <SquarePen size={12} />
                  </Btn>
                  <Btn variant="danger" sm onClick={() => del(p._id)}>
                    <Trash2 size={12} />
                  </Btn>
                </div>
              </MobileCard>
            ))}
          </div>
          <div
            style={{
              marginTop: 8,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
            }}
          >
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onChange={load}
            />
          </div>
        </>
      ) : (
        <TableWrap>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th></Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Sub-Cat</Th>
                <Th>MRP / Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p, i) => (
                <tr
                  key={p._id}
                  style={{
                    borderBottom:
                      i < data.products.length - 1
                        ? `1px solid ${C.border}`
                        : "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.greenGlow)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Td>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = "🛒";
                          }}
                        />
                      ) : (
                        <ShoppingBasket size={20} />
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        fontFamily: "JetBrains Mono,monospace",
                      }}
                    >
                      /{p.slug}
                    </div>
                  </Td>
                  <Td>{p.category?.name || "—"}</Td>
                  <Td>{p.subCategory?.name || "—"}</Td>
                  <Td>
                    {/* Customer-facing price (vendor price + platform margin) */}
                    {p.pricingBreakdown ? (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "JetBrains Mono,monospace",
                              fontSize: 13,
                              fontWeight: 900,
                              color: "#2563eb",
                            }}
                          >
                            ₹
                            {p.pricingBreakdown.customerFacingPrice?.toLocaleString()}
                          </span>
                          {p.pricingBreakdown.discountPct > 0 && p.mrp > 0 && (
                            <span
                              style={{
                                background: "rgba(229,57,53,0.1)",
                                color: C.danger,
                                fontFamily: "JetBrains Mono,monospace",
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "1px 5px",
                                borderRadius: 4,
                              }}
                            >
                              -{p.pricingBreakdown.discountPct}%
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.textMuted,
                            fontFamily: "JetBrains Mono,monospace",
                            marginTop: 1,
                          }}
                        >
                          You earn ₹{p.price?.toLocaleString()}
                        </div>
                        {p.mrp > 0 && (
                          <div
                            style={{
                              fontSize: 10,
                              color: C.textMuted,
                              fontFamily: "JetBrains Mono,monospace",
                              textDecoration: "line-through",
                            }}
                          >
                            MRP ₹{p.mrp?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span
                          style={{
                            fontFamily: "JetBrains Mono,monospace",
                            color: C.gold,
                            fontWeight: 700,
                          }}
                        >
                          ₹{p.price?.toLocaleString()}
                        </span>
                        {p.mrp > 0 && (
                          <div
                            style={{
                              fontSize: 10,
                              color: C.textMuted,
                              fontFamily: "JetBrains Mono,monospace",
                              textDecoration: "line-through",
                            }}
                          >
                            MRP ₹{p.mrp?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </Td>
                  <Td mono>{p.stock}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <Badge type={p.isActive ? "active" : "inactive"}>
                        {p.isActive ? "Active" : "Off"}
                      </Badge>
                      {p.isFeatured && <Badge type="featured">★</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn
                        variant="secondary"
                        sm
                        onClick={() => openEdit(p._id)}
                      >
                        <SquarePen size={12} />
                      </Btn>
                      <Btn variant="danger" sm onClick={() => del(p._id)}>
                        <Trash2 size={12} />
                      </Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            onChange={load}
          />
        </TableWrap>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        wide
        title={editing ? "Edit Product" : "Add Product"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submit}>Save Product</Btn>
          </>
        }
      >
        {loadingEdit ? (
          <Loading text="Loading product…" />
        ) : (
          <Grid2>
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => F("name", e.target.value)}
                placeholder="Product name"
              />
            </Field>
            <Field label="Brand">
              <Input
                value={form.brand}
                onChange={(e) => F("brand", e.target.value)}
                placeholder="Brand name"
              />
            </Field>
            <Field label="Category *">
              <Select
                value={form.category}
                onChange={(e) => {
                  F("category", e.target.value);
                  loadSubsForCat(e.target.value);
                  F("subCategory", "");
                }}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sub-Category *">
              <Select
                value={form.subCategory}
                onChange={(e) => F("subCategory", e.target.value)}
              >
                <option value="">
                  {!form.category
                    ? "Select a category first"
                    : subOptions.length === 0
                      ? "No sub-categories"
                      : "Select sub-category"}
                </option>
                {(form.category ? subOptions : allSubcategories).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                    {!form.category ? ` (${s.category?.name || "?"})` : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="MRP (₹) *">
              <Input
                type="number"
                value={form.mrp}
                onChange={(e) => F("mrp", e.target.value)}
                placeholder="e.g. 1299"
                min="0"
              />
            </Field>
            <Field label="Selling Price (₹) *">
              <Input
                type="number"
                value={form.price}
                onChange={(e) => F("price", e.target.value)}
                placeholder="e.g. 999"
                min="0"
                style={{
                  borderColor:
                    form.price &&
                    form.mrp &&
                    Number(form.price) > Number(form.mrp)
                      ? C.danger
                      : undefined,
                }}
              />
              {form.price &&
                form.mrp &&
                Number(form.price) > Number(form.mrp) && (
                  <div
                    style={{
                      fontSize: 11,
                      color: C.danger,
                      marginTop: 3,
                      fontFamily: "JetBrains Mono,monospace",
                    }}
                  >
                    ⚠ Price cannot exceed MRP
                  </div>
                )}
            </Field>
            <Field label="Cost Price (₹)">
              <Input
                type="number"
                value={form.costPrice}
                onChange={(e) => F("costPrice", e.target.value)}
                placeholder="Your sourcing cost"
                min="0"
              />
            </Field>
            {/* ── Live Pricing Breakdown ── */}
            {form.price && Number(form.price) > 0 && (
              <FullCol>
                {form.mrp && Number(form.price) > Number(form.mrp) && (
                  <div
                    style={{
                      color: C.danger,
                      fontSize: 11,
                      fontFamily: "JetBrains Mono,monospace",
                      marginBottom: 6,
                    }}
                  >
                    ⚠ Vendor price exceeds MRP
                  </div>
                )}
                <div
                  style={{
                    background: `linear-gradient(135deg,${C.greenGlow},${C.bg})`,
                    border: `1px solid ${C.greenBorder}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: C.textMuted,
                      fontFamily: "JetBrains Mono,monospace",
                      marginBottom: 10,
                    }}
                  >
                    Live Pricing Preview
                  </div>
                  {/* Hero: what customer sees */}
                  {(() => {
                    const vendorPrice = Number(form.price) || 0;
                    const mrp = Number(form.mrp) || 0;
                    const costPrice = Number(form.costPrice) || 0;
                    const gst = Number(form.gst) || 0;
                    // Category margin is not known here (no live fetch), so show formula hint
                    // We show the breakdown conceptually
                    const gstAmt = vendorPrice * (gst / 100);
                    const grossProfit =
                      costPrice > 0 ? vendorPrice - costPrice : null;

                    return (
                      <>
                        <div
                          style={{
                            background: C.bgCard,
                            borderRadius: 10,
                            padding: "12px 14px",
                            border: `1.5px solid ${C.greenBorder}`,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              letterSpacing: 2,
                              textTransform: "uppercase",
                              color: C.textMuted,
                              fontFamily: "JetBrains Mono,monospace",
                              marginBottom: 4,
                            }}
                          >
                            Customer Pays (shown on store)
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "JetBrains Mono,monospace",
                                fontSize: 22,
                                fontWeight: 900,
                                color: "#2563eb",
                              }}
                            >
                              ₹{vendorPrice.toLocaleString()} + margin%
                            </span>
                            {mrp > 0 && (
                              <span
                                style={{
                                  fontFamily: "JetBrains Mono,monospace",
                                  fontSize: 12,
                                  color: C.textMuted,
                                  textDecoration: "line-through",
                                }}
                              >
                                MRP ₹{mrp.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: C.textMuted,
                              marginTop: 3,
                            }}
                          >
                            Final price = your price × (1 + category margin%).
                            Admin sets margin on the category.
                          </div>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill,minmax(130px,1fr))",
                            gap: 8,
                          }}
                        >
                          {[
                            {
                              label: "Your Earning",
                              val: `₹${vendorPrice.toLocaleString()}`,
                              color: C.green,
                              bold: true,
                            },
                            ...(mrp > 0
                              ? [
                                  {
                                    label: "MRP",
                                    val: `₹${mrp.toLocaleString()}`,
                                    muted: true,
                                  },
                                ]
                              : []),
                            ...(gst > 0
                              ? [
                                  {
                                    label: `GST (${gst}%)`,
                                    val: `₹${gstAmt.toFixed(0)}`,
                                    muted: true,
                                  },
                                ]
                              : []),
                            ...(grossProfit !== null
                              ? [
                                  {
                                    label: "Gross Profit",
                                    val: `₹${grossProfit.toLocaleString()}`,
                                    color:
                                      grossProfit >= 0 ? C.green : C.danger,
                                    bold: true,
                                  },
                                ]
                              : []),
                          ].map(({ label, val, color, muted, bold }) => (
                            <div
                              key={label}
                              style={{
                                background: C.bgCard,
                                border: `1px solid ${C.border}`,
                                borderRadius: 8,
                                padding: "8px 10px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 9,
                                  letterSpacing: 1.5,
                                  textTransform: "uppercase",
                                  color: C.textMuted,
                                  fontFamily: "JetBrains Mono,monospace",
                                  marginBottom: 3,
                                }}
                              >
                                {label}
                              </div>
                              <div
                                style={{
                                  fontFamily: "JetBrains Mono,monospace",
                                  fontSize: 13,
                                  fontWeight: bold ? 700 : 500,
                                  color: muted ? C.textMuted : color || C.text,
                                }}
                              >
                                {val}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </FullCol>
            )}
            <Field label="GST %">
              <Input
                type="number"
                value={form.gst}
                onChange={(e) => F("gst", e.target.value)}
                min="0"
                max="100"
                placeholder="0"
              />
            </Field>
            <Field label="Stock *">
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => F("stock", e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="SKU">
              <Input
                value={form.sku}
                onChange={(e) => F("sku", e.target.value)}
                placeholder="SKU-001"
              />
            </Field>
            <Field label="Weight (g)">
              <Input
                type="number"
                value={form.weight}
                onChange={(e) => F("weight", e.target.value)}
                placeholder="0"
              />
            </Field>
            <FullCol>
              <Field label="Description *">
                <Textarea
                  value={form.description}
                  onChange={(e) => F("description", e.target.value)}
                />
              </Field>
            </FullCol>
            <FullCol>
              <Field label="Short Description">
                <Input
                  value={form.shortDescription}
                  onChange={(e) => F("shortDescription", e.target.value)}
                />
              </Field>
            </FullCol>
            <FullCol>
              <Field label="Tags (comma separated)">
                <Input
                  value={form.tags}
                  onChange={(e) => F("tags", e.target.value)}
                  placeholder="sale, new, trending"
                />
              </Field>
            </FullCol>
            <FullCol>
              <Field label="Images Upload (Multiple)">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImageChange}
                  style={{ display: "none" }}
                  id="product-images-input"
                />
                <label
                  htmlFor="product-images-input"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "28px 20px",
                    border: `2px dashed ${C.border}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: C.bg,
                    transition: "all .2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = C.green;
                    e.currentTarget.style.background = C.greenGlow;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = C.bg;
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>
                      {form.imageFiles.length > 0
                        ? `${form.imageFiles.length} image(s) selected`
                        : "Click to upload images"}
                    </div>
                  </div>
                </label>
                {form.imagePreviews?.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(100px,1fr))",
                      gap: 10,
                    }}
                  >
                    {form.imagePreviews.map((preview, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          borderRadius: 8,
                          overflow: "hidden",
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${idx}`}
                          style={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                          }}
                        />
                        <button
                          onClick={() => removeImagePreview(idx)}
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: C.danger,
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </FullCol>
            <FullCol>
              <Field label="Video Upload">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  style={{ display: "none" }}
                  id="product-video-input"
                />
                <label
                  htmlFor="product-video-input"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "28px 20px",
                    border: `2px dashed ${C.border}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: C.bg,
                    transition: "all .2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = C.green;
                    e.currentTarget.style.background = C.greenGlow;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = C.bg;
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🎬</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>
                      {form.videoFile
                        ? form.videoFile.name
                        : "Click to upload video"}
                    </div>
                  </div>
                </label>
                {form.videoUrl && !form.videoFile && (
                  <div
                    style={{
                      marginTop: 10,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `1px solid ${C.border}`,
                      background: C.bg,
                      padding: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        marginBottom: 6,
                      }}
                    >
                      Current video:
                    </div>
                    <video
                      src={form.videoUrl}
                      controls
                      style={{ width: "100%", maxHeight: 200, borderRadius: 6 }}
                    />
                  </div>
                )}
              </Field>
            </FullCol>
            <FullCol>
              <div
                style={{
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: 16,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.text,
                      fontFamily: "Outfit,sans-serif",
                    }}
                  >
                    Custom Fields
                  </label>
                  <Btn variant="secondary" sm onClick={addCustomField}>
                    + Add Field
                  </Btn>
                </div>
                {form.customFields.length === 0 ? (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      background: C.bg,
                      borderRadius: 8,
                      border: `1px dashed ${C.border}`,
                      color: C.textMuted,
                      fontSize: 13,
                    }}
                  >
                    No custom fields yet.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {form.customFields.map((field) => (
                      <div
                        key={field.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr auto",
                          gap: 8,
                          alignItems: "center",
                          padding: 10,
                          background: C.bg,
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateCustomField(field.id, "label", e.target.value)
                          }
                          placeholder="Label (e.g. Color)"
                          style={{ fontSize: 13 }}
                        />
                        <Input
                          value={field.value}
                          onChange={(e) =>
                            updateCustomField(field.id, "value", e.target.value)
                          }
                          placeholder="Value (e.g. Red)"
                          style={{ fontSize: 13 }}
                        />
                        <Btn
                          variant="danger"
                          sm
                          onClick={() => removeCustomField(field.id)}
                        >
                          ✕
                        </Btn>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FullCol>
            <Field label="Featured">
              <Toggle
                checked={form.isFeatured}
                onChange={(v) => F("isFeatured", v)}
                label="Show as featured"
              />
            </Field>
            <Field label="Active">
              <Toggle
                checked={form.isActive}
                onChange={(v) => F("isActive", v)}
                label="Visible in store"
              />
            </Field>
          </Grid2>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ORDERS PAGE
═══════════════════════════════════════════ */
const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

function OrdersPage({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const winW = useWindowSize();
  const isMobile = winW < 768;

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchOrders(page);
  }, [page, statusFilter]);

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const res = await apiFetchUB("GET", "/api/orders/vendor/my-orders");
      const orders = res.data || [];
      setOrderStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        todayRevenue: orders
          .filter(
            (o) =>
              new Date(o.createdAt).toDateString() ===
              new Date().toDateString(),
          )
          .reduce((sum, o) => sum + (o.total || 0), 0),
        pendingOrders: orders.filter((o) => o.status === "pending").length,
      });
    } catch {
      showToast("Failed to load order stats", "error");
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchOrders(pg = 1) {
    setLoading(true);
    try {
      let q = `/api/orders/vendor/my-orders?page=${pg}&limit=12`;
      if (statusFilter) q += `&status=${statusFilter}`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      const res = await apiFetchUB("GET", q);
      const orders = res.data || [];
      const pagination = res.pagination ?? { total: orders.length, pages: 1 };
      setOrders(orders);
      setTotal(pagination.total ?? orders.length);
      setPages(pagination.pages ?? 1);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const debouncedFetch = useDebounce(() => fetchOrders(1), 500);

  async function updateStatus() {
    if (!newStatus || !selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `${API_BASE_UB}/api/orders/vendor/${selectedOrder._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
          const d = await response.json();
          msg = d.message || msg;
        } catch {}
        throw new Error(msg);
      }
      showToast(`Order status updated to ${newStatus}`);
      setStatusModal(false);
      fetchOrders(page);
      fetchStats();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setUpdatingStatus(false);
    }
  }

  const statColors = {
    totalOrders: {
      icon: <ShoppingCart size={20} />,
      label: "Total Orders",
      sub: "All time",
    },
    totalRevenue: {
      icon: <CircleDollarSign />,
      label: "Total Revenue",
      sub: "Gross earnings",
      isPrice: true,
    },
    todayRevenue: {
      icon: <BadgeDollarSign />,
      label: "Today Revenue",
      sub: "Today's earnings",
      isPrice: true,
    },
    pendingOrders: {
      icon: <Hourglass />,
      label: "Pending",
      sub: "Awaiting action",
    },
    pending: {
      icon: <Hourglass />,
      label: "Pending",
      sub: "Awaiting processing",
    },
    processing: {
      icon: <Settings />,
      label: "Processing",
      sub: "Being prepared",
    },
    shipped: { icon: <Truck />, label: "Shipped", sub: "In transit" },
    delivered: {
      icon: <CheckCircle />,
      label: "Delivered",
      sub: "Successfully delivered",
    },
    cancelled: {
      icon: <XCircle />,
      label: "Cancelled",
      sub: "Cancelled orders",
    },
    refunded: {
      icon: <RefreshCw />,
      label: "Refunded",
      sub: "Refunded orders",
    },
  };
  const STAT_KEYS = [
    "totalOrders",
    "totalRevenue",
    "todayRevenue",
    "pendingOrders",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            margin: 0,
          }}
        >
          Order <span style={{ color: C.green }}>Management</span>
        </h2>
        <Btn
          variant="secondary"
          onClick={() => {
            fetchOrders(page);
            fetchStats();
          }}
        >
          ↺ Refresh
        </Btn>
      </div>
      {statsLoading ? (
        <Loading text="Loading stats…" />
      ) : (
        orderStats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
              gap: isMobile ? 10 : 16,
              marginBottom: 28,
            }}
          >
            {STAT_KEYS.filter(
              (k) => orderStats[k] !== undefined && orderStats[k] !== null,
            )
              .slice(0, isMobile ? 4 : 8)
              .map((key) => {
                const meta = statColors[key] || {
                  icon: "📊",
                  label: key,
                  sub: "",
                };
                const val = meta.isPrice
                  ? `₹${Number(orderStats[key] || 0).toLocaleString()}`
                  : orderStats[key];
                return (
                  <StatCard
                    key={key}
                    label={meta.label}
                    value={val}
                    sub={meta.sub}
                    icon={meta.icon}
                  />
                );
              })}
          </div>
        )
      )}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          boxShadow: C.shadow,
        }}
      >
        <SearchBox
          placeholder="Search by order ID or customer…"
          value={search}
          onChange={(v) => {
            setSearch(v);
            debouncedFetch();
          }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 180 }}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
        <span
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontFamily: "JetBrains Mono,monospace",
            whiteSpace: "nowrap",
          }}
        >
          {total} orders
        </span>
      </div>
      {loading ? (
        <Loading text="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Orders Found"
          desc="No orders match your current filters."
        />
      ) : isMobile ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map((order) => (
              <MobileCard key={order._id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: 12,
                        color: C.green,
                        marginBottom: 2,
                      }}
                    >
                      #{order._id?.slice(-8).toUpperCase()}
                    </div>
                    <div
                      style={{ fontWeight: 500, color: C.text, fontSize: 14 }}
                    >
                      {order.user?.name ||
                        order.shippingAddress?.name ||
                        "Customer"}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>
                      {order.user?.email || "—"}
                    </div>
                  </div>
                  <Badge type={order.status}>{order.status}</Badge>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 13,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: C.gold,
                      fontFamily: "JetBrains Mono,monospace",
                      fontWeight: 600,
                    }}
                  >
                    ₹
                    {(order.total ?? order.totalPrice)?.toLocaleString() || "—"}
                  </span>
                  <span style={{ color: C.textMuted }}>
                    {order.items?.length || 0} item(s)
                  </span>
                  <span style={{ color: C.textMuted }}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant="ghost"
                    sm
                    onClick={() => {
                      setSelectedOrder(order);
                      setDetailModal(true);
                    }}
                  >
                    👁 View
                  </Btn>
                  <Btn
                    variant="secondary"
                    sm
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.status);
                      setStatusModal(true);
                    }}
                  >
                    Update Status
                  </Btn>
                </div>
              </MobileCard>
            ))}
          </div>
          <div
            style={{
              marginTop: 8,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
            }}
          >
            <Pagination
              page={page}
              pages={pages}
              total={total}
              onChange={(p) => setPage(p)}
            />
          </div>
        </>
      ) : (
        <TableWrap>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order._id}
                  style={{
                    borderBottom:
                      i < orders.length - 1 ? `1px solid ${C.border}` : "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.greenGlow)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Td>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: 12,
                        color: C.green,
                        fontWeight: 600,
                      }}
                    >
                      #{order._id?.slice(-8).toUpperCase()}
                    </span>
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 500 }}>
                      {order.user?.name || order.shippingAddress?.name || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {order.user?.email || "—"}
                    </div>
                  </Td>
                  <Td mono>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </Td>
                  <Td mono>{order.items?.length || 0}</Td>
                  <Td price>
                    ₹
                    {(order.total ?? order.totalPrice)?.toLocaleString() || "—"}
                  </Td>
                  <Td>
                    <Badge type={order.isPaid ? "active" : "inactive"}>
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge type={order.status}>{order.status}</Badge>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn
                        variant="ghost"
                        sm
                        onClick={() => {
                          setSelectedOrder(order);
                          setDetailModal(true);
                        }}
                      >
                        👁
                      </Btn>
                      <Btn
                        variant="secondary"
                        sm
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setStatusModal(true);
                        }}
                      >
                        Status
                      </Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pages={pages}
            total={total}
            onChange={(p) => setPage(p)}
          />
        </TableWrap>
      )}
      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        wide
        title="Order Details"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setDetailModal(false)}>
              Close
            </Btn>
            <Btn
              onClick={() => {
                setDetailModal(false);
                setNewStatus(selectedOrder?.status);
                setStatusModal(true);
              }}
            >
              Update Status
            </Btn>
          </>
        }
      >
        {selectedOrder && <OrderDetail order={selectedOrder} />}
      </Modal>
      <Modal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title="Update Order Status"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setStatusModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={updateStatus} disabled={updatingStatus}>
              {updatingStatus ? "Updating…" : "Update Status"}
            </Btn>
          </>
        }
      >
        {selectedOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: C.bg,
                borderRadius: 10,
                padding: "14px 16px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: C.textMuted,
                  fontFamily: "JetBrains Mono,monospace",
                  marginBottom: 4,
                }}
              >
                ORDER
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: 14,
                  color: C.green,
                  fontWeight: 600,
                }}
              >
                #{selectedOrder._id?.slice(-8).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, color: C.text, marginTop: 4 }}>
                {selectedOrder.user?.name ||
                  selectedOrder.shippingAddress?.name}{" "}
                · ₹
                {(
                  selectedOrder.total ?? selectedOrder.totalPrice
                )?.toLocaleString()}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: 12,
                  color: C.textMuted,
                }}
              >
                Current:
              </div>
              <Badge type={selectedOrder.status}>{selectedOrder.status}</Badge>
            </div>
            <Field label="New Status">
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

function OrderDetail({ order }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            background: C.bg,
            borderRadius: 10,
            padding: "14px 16px",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.textMuted,
              fontFamily: "JetBrains Mono,monospace",
              marginBottom: 6,
            }}
          >
            Order ID
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono,monospace",
              fontSize: 13,
              color: C.green,
              fontWeight: 600,
            }}
          >
            #{order._id?.slice(-8).toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN")
              : "—"}
          </div>
        </div>
        <div
          style={{
            background: C.bg,
            borderRadius: 10,
            padding: "14px 16px",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.textMuted,
              fontFamily: "JetBrains Mono,monospace",
              marginBottom: 6,
            }}
          >
            Status
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge type={order.status}>{order.status}</Badge>
            <Badge type={order.isPaid ? "active" : "inactive"}>
              {order.isPaid ? "Paid" : "Unpaid"}
            </Badge>
          </div>
        </div>
      </div>
      {order.shippingAddress && (
        <div
          style={{
            background: C.bg,
            borderRadius: 10,
            padding: "14px 16px",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.textMuted,
              fontFamily: "JetBrains Mono,monospace",
              marginBottom: 10,
            }}
          >
            Shipping Address
          </div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>
            {[
              order.shippingAddress.address,
              order.shippingAddress.city,
              order.shippingAddress.state,
              order.shippingAddress.postalCode,
              order.shippingAddress.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
          {order.shippingAddress.phone && (
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
              📞 {order.shippingAddress.phone}
            </div>
          )}
        </div>
      )}
      {order.items?.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.textMuted,
              fontFamily: "JetBrains Mono,monospace",
              marginBottom: 10,
            }}
          >
            Order Items
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {order.items.map((item, idx) => {
              const prod = item.product || {};
              const imgUrl = prod.images?.[0]?.url || item.image || null;
              const name = prod.name || item.name || "—";
              const qty = item.quantity ?? item.qty ?? 1;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: C.bg,
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      background: C.bgCard,
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={
                          imgUrl.startsWith("/")
                            ? `${API_BASE_UB}${imgUrl}`
                            : imgUrl
                        }
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = "🛒";
                        }}
                      />
                    ) : (
                      <ShoppingBasket size={20} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      Qty: {qty} × ₹{item.price?.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono,monospace",
                      fontSize: 13,
                      color: C.gold,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ₹{(item.price * qty).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          background: `linear-gradient(135deg,${C.greenGlow},${C.bg})`,
          borderRadius: 10,
          padding: "16px",
          border: `1px solid ${C.greenBorder}`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.textMuted,
            fontFamily: "JetBrains Mono,monospace",
            marginBottom: 12,
          }}
        >
          Price Breakdown
        </div>
        {[
          { label: "Subtotal", value: order.subtotal },
          { label: "Delivery", value: order.deliveryCharge },
          { label: "GST", value: order.gst },
        ]
          .filter(({ value }) => value !== undefined && value !== null)
          .map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: C.textMuted,
                marginBottom: 6,
              }}
            >
              <span>{label}</span>
              <span style={{ fontFamily: "JetBrains Mono,monospace" }}>
                ₹{Number(value || 0).toLocaleString()}
              </span>
            </div>
          ))}
        <div
          style={{ height: 1, background: C.greenBorder, margin: "10px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <span style={{ fontFamily: "Fraunces,serif", color: C.text }}>
            Total
          </span>
          <span
            style={{ fontFamily: "JetBrains Mono,monospace", color: C.green }}
          >
            ₹{Number(order.total ?? order.totalPrice ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COUPONS PAGE
═══════════════════════════════════════════ */
function CouponsPage({ showToast }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const winW = useWindowSize();
  const isMobile = winW < 768;
  const blank = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    usageLimit: "",
    perUserLimit: 1,
    expiryDate: "",
    isActive: true,
  };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetchUB("GET", "/api/coupons");
      setCoupons(d.coupons || []);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }
  function openEdit(c) {
    setEditing(c._id);
    setForm({
      code: c.code || "",
      description: c.description || "",
      discountType: c.discountType || "percentage",
      discountValue: c.discountValue ?? "",
      maxDiscountAmount: c.maxDiscountAmount ?? "",
      minOrderAmount: c.minOrderAmount ?? "",
      usageLimit: c.usageLimit ?? "",
      perUserLimit: c.perUserLimit ?? 1,
      expiryDate: c.expiryDate ? c.expiryDate.substring(0, 10) : "",
      isActive: c.isActive,
    });
    setModal(true);
  }

  async function submit() {
    if (!form.code) return showToast("Coupon code is required", "error");
    if (!form.discountValue)
      return showToast("Discount value is required", "error");
    if (!form.expiryDate) return showToast("Expiry date is required", "error");
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount
        ? Number(form.maxDiscountAmount)
        : null,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: Number(form.perUserLimit) || 1,
      expiryDate: new Date(form.expiryDate).toISOString(),
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await apiFetchUB("PATCH", `/api/coupons/${editing}`, payload);
        showToast("Coupon updated!");
      } else {
        await apiFetchUB("POST", "/api/coupons", payload);
        showToast("Coupon created!");
      }
      setModal(false);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function del(id) {
    try {
      await apiFetchUB("DELETE", `/api/coupons/${id}`);
      showToast("Coupon deleted");
      setDeleteConfirm(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }
  async function toggleActive(coupon) {
    try {
      await apiFetchUB("PATCH", `/api/coupons/${coupon._id}`, {
        isActive: !coupon.isActive,
      });
      showToast(coupon.isActive ? "Coupon deactivated" : "Coupon activated");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const filtered = coupons.filter(
    (c) =>
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()),
  );
  const isExpired = (date) => date && new Date(date) < new Date();
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(
    (c) => c.isActive && !isExpired(c.expiryDate),
  ).length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const expiredCoupons = coupons.filter((c) => isExpired(c.expiryDate)).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            margin: 0,
          }}
        >
          Coupon <span style={{ color: C.green }}>Manager</span>
        </h2>
        <Btn onClick={openAdd}>
          <Puzzle /> Create Coupon
        </Btn>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
          gap: isMobile ? 10 : 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Coupons"
          value={totalCoupons}
          sub="All coupons created"
          icon={<Puzzle />}
        />
        <StatCard
          label="Active"
          value={activeCoupons}
          sub="Currently usable"
          icon={<ShieldCheck />}
        />
        <StatCard
          label="Total Usage"
          value={totalUsage}
          sub="Times redeemed"
          icon={<UserRoundPen />}
        />
        <StatCard
          label="Expired"
          value={expiredCoupons}
          sub="Past expiry date"
          icon={<ShieldAlert />}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          boxShadow: C.shadow,
          flexWrap: "wrap",
        }}
      >
        <SearchBox
          placeholder="Search by code or description…"
          value={search}
          onChange={setSearch}
        />
        <span
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontFamily: "JetBrains Mono,monospace",
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} coupons
        </span>
      </div>

      {loading ? (
        <Loading text="Loading coupons…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No Coupons Yet"
          desc="Create your first coupon to offer discounts to customers."
          action={<Btn onClick={openAdd}>🎟️ Create Coupon</Btn>}
        />
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c) => {
            const expired = isExpired(c.expiryDate);
            return (
              <MobileCard key={c._id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.text,
                        letterSpacing: 1,
                      }}
                    >
                      {c.code}
                    </div>
                    {c.description && (
                      <div
                        style={{
                          fontSize: 12,
                          color: C.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {c.description}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Badge type={c.discountType}>{c.discountType}</Badge>
                    {expired ? (
                      <Badge type="inactive">Expired</Badge>
                    ) : (
                      <Badge type={c.isActive ? "active" : "inactive"}>
                        {c.isActive ? "Active" : "Off"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    fontSize: 13,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: C.green,
                      fontFamily: "JetBrains Mono,monospace",
                      fontWeight: 600,
                    }}
                  >
                    {c.discountType === "percentage"
                      ? `${c.discountValue}%`
                      : `₹${c.discountValue}`}{" "}
                    off
                  </span>
                  <span style={{ color: C.textMuted }}>
                    Used: {c.usageCount || 0}
                    {c.usageLimit ? `/${c.usageLimit}` : ""}
                  </span>
                  <span style={{ color: expired ? C.danger : C.textMuted }}>
                    Exp:{" "}
                    {c.expiryDate
                      ? new Date(c.expiryDate).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn variant="secondary" sm onClick={() => openEdit(c)}>
                    <SquarePen size={12} />
                  </Btn>
                  <Btn variant="ghost" sm onClick={() => toggleActive(c)}>
                    {c.isActive ? "Deactivate" : "Activate"}
                  </Btn>
                  <Btn variant="danger" sm onClick={() => setDeleteConfirm(c)}>
                    <Trash2 size={12} />
                  </Btn>
                </div>
              </MobileCard>
            );
          })}
        </div>
      ) : (
        <TableWrap>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Type</Th>
                <Th>Discount</Th>
                <Th>Min Order</Th>
                <Th>Usage</Th>
                <Th>Expiry</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const expired = isExpired(c.expiryDate);
                return (
                  <tr
                    key={c._id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1
                          ? `1px solid ${C.border}`
                          : "none",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.greenGlow)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Td>
                      <div
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontWeight: 700,
                          fontSize: 14,
                          color: C.text,
                          letterSpacing: 1,
                        }}
                      >
                        {c.code}
                      </div>
                      {c.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: C.textMuted,
                            marginTop: 2,
                            maxWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.description}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <Badge type={c.discountType}>{c.discountType}</Badge>
                    </Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontWeight: 600,
                          color: C.green,
                          fontSize: 14,
                        }}
                      >
                        {c.discountType === "percentage"
                          ? `${c.discountValue}%`
                          : `₹${c.discountValue}`}
                      </span>
                      {c.maxDiscountAmount && (
                        <div style={{ fontSize: 11, color: C.textMuted }}>
                          max ₹{c.maxDiscountAmount}
                        </div>
                      )}
                    </Td>
                    <Td mono>
                      {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : "—"}
                    </Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 13,
                        }}
                      >
                        {c.usageCount || 0}
                      </span>
                      {c.usageLimit && (
                        <span
                          style={{
                            color: C.textMuted,
                            fontFamily: "JetBrains Mono,monospace",
                            fontSize: 12,
                          }}
                        >
                          /{c.usageLimit}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 12,
                          color: expired ? C.danger : C.textMuted,
                        }}
                      >
                        {c.expiryDate
                          ? new Date(c.expiryDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </Td>
                    <Td>
                      <div
                        style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                      >
                        {expired ? (
                          <Badge type="inactive">Expired</Badge>
                        ) : (
                          <Badge type={c.isActive ? "active" : "inactive"}>
                            {c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn variant="secondary" sm onClick={() => openEdit(c)}>
                          <SquarePen size={12} />
                        </Btn>
                        <Btn variant="ghost" sm onClick={() => toggleActive(c)}>
                          {c.isActive ? "Off" : "On"}
                        </Btn>
                        <Btn
                          variant="danger"
                          sm
                          onClick={() => setDeleteConfirm(c)}
                        >
                          <Trash2 size={14} />
                        </Btn>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Coupon" : "Create Coupon"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submit}>
              🎟️ {editing ? "Update" : "Create"} Coupon
            </Btn>
          </>
        }
      >
        <Grid2>
          <Field label="Coupon Code *">
            <Input
              value={form.code}
              onChange={(e) => F("code", e.target.value.toUpperCase())}
              placeholder="e.g. SAVE10"
              disabled={!!editing}
              style={{
                fontFamily: "JetBrains Mono,monospace",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            />
          </Field>
          <Field label="Discount Type *">
            <Select
              value={form.discountType}
              onChange={(e) => F("discountType", e.target.value)}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </Select>
          </Field>
          <Field
            label={
              form.discountType === "percentage"
                ? "Discount % *"
                : "Discount Amount (₹) *"
            }
          >
            <Input
              type="number"
              value={form.discountValue}
              onChange={(e) => F("discountValue", e.target.value)}
              placeholder={
                form.discountType === "percentage" ? "e.g. 10" : "e.g. 50"
              }
              min="0"
              max={form.discountType === "percentage" ? "100" : undefined}
            />
          </Field>
          {form.discountType === "percentage" && (
            <Field label="Max Discount Cap (₹)">
              <Input
                type="number"
                value={form.maxDiscountAmount}
                onChange={(e) => F("maxDiscountAmount", e.target.value)}
                placeholder="e.g. 200 (optional)"
                min="0"
              />
            </Field>
          )}
          <Field label="Min Order Amount (₹)">
            <Input
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => F("minOrderAmount", e.target.value)}
              placeholder="0 = no minimum"
              min="0"
            />
          </Field>
          <Field label="Total Usage Limit">
            <Input
              type="number"
              value={form.usageLimit}
              onChange={(e) => F("usageLimit", e.target.value)}
              placeholder="Leave blank = unlimited"
              min="1"
            />
          </Field>
          <Field label="Per User Limit">
            <Input
              type="number"
              value={form.perUserLimit}
              onChange={(e) => F("perUserLimit", e.target.value)}
              placeholder="1"
              min="1"
            />
          </Field>
          <Field label="Expiry Date *">
            <Input
              type="date"
              value={form.expiryDate}
              onChange={(e) => F("expiryDate", e.target.value)}
              min={new Date().toISOString().substring(0, 10)}
            />
          </Field>
          <FullCol>
            <Field label="Description (shown to customers)">
              <Input
                value={form.description}
                onChange={(e) => F("description", e.target.value)}
                placeholder="e.g. 10% off on all orders above ₹299"
              />
            </Field>
          </FullCol>
          <FullCol>
            <Field label="Status">
              <Toggle
                checked={form.isActive}
                onChange={(v) => F("isActive", v)}
                label="Coupon is active and usable"
              />
            </Field>
          </FullCol>
          {form.code && form.discountValue && (
            <FullCol>
              <div
                style={{
                  background: `linear-gradient(135deg,${C.greenGlow},${C.bg})`,
                  border: `1px dashed ${C.greenBorder}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 32 }}>🎟️</div>
                <div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono,monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.text,
                      letterSpacing: 2,
                    }}
                  >
                    {form.code || "CODE"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: C.green,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    {form.discountType === "percentage"
                      ? `${form.discountValue}% off${form.maxDiscountAmount ? ` (max ₹${form.maxDiscountAmount})` : ""}`
                      : `₹${form.discountValue} flat off`}
                  </div>
                  {form.minOrderAmount > 0 && (
                    <div
                      style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}
                    >
                      Min order: ₹{form.minOrderAmount}
                    </div>
                  )}
                  {form.expiryDate && (
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      Expires:{" "}
                      {new Date(form.expiryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </FullCol>
          )}
        </Grid2>
      </Modal>
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Coupon"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Btn>
            <Btn variant="danger" onClick={() => del(deleteConfirm._id)}>
              Yes, Delete
            </Btn>
          </>
        }
      >
        {deleteConfirm && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <div
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: 18,
                color: C.text,
                marginBottom: 8,
              }}
            >
              Delete{" "}
              <span
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  color: C.danger,
                }}
              >
                {deleteConfirm.code}
              </span>
              ?
            </div>
            <div style={{ fontSize: 13, color: C.textMuted }}>
              This coupon has been used{" "}
              <strong>{deleteConfirm.usageCount || 0}</strong> time(s). This
              action cannot be undone.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STOREFRONT PAGE
═══════════════════════════════════════════ */
const SF_EMOJIS = [
  "📱",
  "💻",
  "👟",
  "🎒",
  "⌚",
  "📸",
  "🎧",
  "🖥️",
  "🕹️",
  "🧥",
  "👜",
  "🏋️",
  "🎨",
  "🌿",
  "💐",
];

function StorefrontPage({ categories, showToast }) {
  const [data, setData] = useState({
    products: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("");
  const load = useCallback(
    async (pg = 1) => {
      setLoading(true);
      let q = `/api/products?page=${pg}&limit=12`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      if (catF) q += `&category=${catF}`;
      try {
        const r = await fetch(`${API_BASE_UB}${q}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          credentials: "include",
        });
        if (!r.ok) throw new Error("Failed to load products");
        setData(await r.json());
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [search, catF],
  );
  useEffect(() => {
    load(1);
  }, [load]);
}

function SFProductCard({ product: p, idx }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bgCard,
        border: `1px solid ${hov ? C.greenBorder : C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "transform .25s,border-color .25s,box-shadow .25s",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? C.shadowMd : C.shadow,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: 180,
          background: `linear-gradient(135deg,${C.bg} 0%,${C.greenGlow} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {p.images?.[0]?.url ? (
          <img
            src={p.images[0].url}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = `<span style="font-size:52px">${SF_EMOJIS[idx % SF_EMOJIS.length]}</span>`;
            }}
          />
        ) : (
          SF_EMOJIS[idx % SF_EMOJIS.length]
        )}
        {p.isFeatured && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: C.green,
              color: "#fff",
              fontSize: 10,
              fontFamily: "JetBrains Mono,monospace",
              letterSpacing: 1,
              padding: "3px 10px",
              borderRadius: 100,
            }}
          >
            ★ FEATURED
          </div>
        )}
        {p.discount > 0 && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: C.danger,
              color: "#fff",
              fontSize: 10,
              fontFamily: "JetBrains Mono,monospace",
              padding: "3px 10px",
              borderRadius: 100,
            }}
          >
            -{p.discount}%
          </div>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.green,
            fontFamily: "JetBrains Mono,monospace",
            marginBottom: 5,
          }}
        >
          {p.category?.name}
          {p.subCategory?.name ? ` › ${p.subCategory.name}` : ""}
        </div>
        <div
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {p.name}
        </div>
        {p.brand && (
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
            {p.brand}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Customer-facing price: vendor price + platform margin */}
            <div
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: 17,
                fontWeight: 900,
                color: "#2563eb",
              }}
            >
              {p.pricingBreakdown
                ? `₹${p.pricingBreakdown.customerFacingPrice?.toLocaleString()}`
                : `₹${p.price?.toLocaleString()}`}
            </div>
            {p.pricingBreakdown?.categoryMarginPct > 0 && (
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: 10,
                  color: C.green,
                }}
              >
                incl. {p.pricingBreakdown.categoryMarginPct}% platform fee
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "JetBrains Mono,monospace",
              color: p.stock > 0 ? C.textMuted : C.danger,
            }}
          >
            {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ NAV ITEM ═══ */
function NavItem({ icon, label, active, onClick, proLocked }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 20px",
        border: "none",
        borderLeft: `2px solid ${active ? "#5BB74A" : "transparent"}`,
        background: active ? "#5BB74A15" : hov ? "#EE630810" : "none",
        color: active ? "#5BB74A" : hov ? "#EE6308" : "#5BB74A",
        fontFamily: "Outfit,sans-serif",
        fontSize: 13,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        transition: "all .2s",
        letterSpacing: ".3px",
        fontWeight: active ? 600 : 400,
      }}
    >
      <span style={{ opacity: active ? 1 : 0.8, fontSize: 15 }}>{icon}</span>
      {label}
      {proLocked && (
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#a8c4b4" }}>
          🔒
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════
   ROOT — Home
═══════════════════════════════════════════ */
export default function Home() {
  const [page, setPage] = useState("dashboard");
  const [cancelling, setCancelling] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [stats, setStats] = useState({
    cats: null,
    subs: null,
    products: null,
    featured: null,
  });

  // ── Subscription state ──
  const [vendorPlan, setVendorPlan] = useState(null); // null = loading
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isPro = vendorPlan === "pro" || vendorPlan === "premium";
  const handleUpgrade = useCallback(() => setShowUpgradeModal(true), []);

  const winW = useWindowSize();
  const isMobile = winW < 768;

  useEffect(() => {
    if (!document.getElementById("_gfonts_grove")) {
      const l = document.createElement("link");
      l.id = "_gfonts_grove";
      l.rel = "stylesheet";
      l.href = FONT_LINK;
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    if (document.getElementById("_grove_kf")) return;
    const s = document.createElement("style");
    s.id = "_grove_kf";
    s.textContent = `
      @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
      @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      @keyframes spin    { to{transform:rotate(360deg)} }
      @keyframes apulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(41,158,96,0.3); border-radius: 3px; }
      table { min-width: 500px; }
    `;
    document.head.appendChild(s);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // ── Boot: load cats, subs, AND vendor plan ──
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setVendorPlan("free");
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${API_BASE_UB}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (r.ok) {
          const cats = await r.json();
          const arr = Array.isArray(cats) ? cats : cats.data || [];
          setCategories(arr);
          setStats((s) => ({ ...s, cats: arr.length }));
        }
      } catch {}

      // subcategories stats
      try {
        const r = await fetch(`${API_BASE_UB}/api/subcategories`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (r.ok) {
          const subs = await r.json();
          const arr = Array.isArray(subs) ? subs : [];
          setStats((s) => ({ ...s, subs: arr.length }));
        }
      } catch {}

      // Fetch subscription plan
      try {
        const r = await fetch(`${API_BASE_UB}/api/subscription/my-plan`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (r.ok) {
          const d = await r.json();
          const plan =
            d.plan ?? d.subscription?.plan ?? (d.isPro ? "pro" : "free");
          setVendorPlan(plan);
        } else {
          setVendorPlan("free");
        }
      } catch {
        setVendorPlan("free");
      }
    })();
  }, []);
  async function handleCancelPlan() {
    if (
      !confirm(
        "Cancel your Pro subscription? You will lose access to Categories and Sub-Categories immediately.",
      )
    )
      return;
    setCancelling(true);
    try {
      const r = await fetch(`${API_BASE_UB}/api/subscription/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Cancel failed");
      setVendorPlan("free");
      showToast("Subscription cancelled. You are now on the free plan.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCancelling(false);
    }
  }
  const handleSetCategories = useCallback((cats) => {
    setCategories(cats);
    setStats((s) => ({ ...s, cats: cats.length }));
  }, []);

  const nav = [
    { id: "dashboard", icon: "⊞", label: "Dashboard", section: "Overview" },
    {
      id: "flashsales",
      icon: <Zap size={18} />,
      label: "Flash Sales",
      section: "Sales",
    },
    {
      id: "categories",
      icon: <File size={18} />,
      label: "Categories",
      section: "Catalog",
      proLocked: !isPro && vendorPlan !== null,
    },
    {
      id: "subcategories",
      icon: <FileCheckCorner size={18} />,
      label: "Sub-Categories",
      section: "Catalog",
      proLocked: !isPro && vendorPlan !== null,
    },
    {
      id: "products",
      icon: <ShoppingBasket size={18} />,
      label: "Products",
      section: "Catalog",
    },
    {
      id: "orders",
      icon: <ShoppingCart size={18} />,
      label: "Orders",
      section: "Sales",
    },
    {
      id: "coupons",
      icon: <Puzzle size={18} />,
      label: "Coupons",
      section: "Sales",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <CirclePile size={18} />,
      section: "Catalog",
    },
  ];

  const sections = [...new Set(nav.map((n) => n.section))];
  const pageTitles = {
    dashboard: "Vendor Dashboard",
    categories: "Categories",
    subcategories: "Sub-Categories",
    products: "Products",
    orders: "Orders",
    coupons: "Coupons",
    storefront: "Live Preview",
    flashsales: "Flash Sales",
  };

  const handleNav = (id) => {
    setPage(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "260px 1fr",
        minHeight: "100vh",
        fontFamily: "Outfit,sans-serif",
        background: C.bg,
      }}
    >
      {/* ── Razorpay Upgrade Modal ── */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={(plan) => {
          setVendorPlan(plan);
          setShowUpgradeModal(false);
        }}
      />

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          background: C.bgSide,
          display: "flex",
          flexDirection: "column",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: isMobile ? (sidebarOpen ? 0 : -280) : 0,
          height: "100vh",
          width: isMobile ? 260 : "auto",
          overflowY: "auto",
          zIndex: 100,
          transition: "left .3s ease",
          boxShadow:
            isMobile && sidebarOpen ? "4px 0 24px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <div
                style={{
                  fontFamily: "Fraunces,serif",
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: 2.5,
                  color: "#fff",
                }}
              >
                <img
                  src={Logo}
                  alt="Three-Arrow"
                  className="h-10 md:h-15 lg:h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
                />
              </div>
              <div
                style={{
                  fontSize: 15,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "#5BB648",
                  fontFamily: "JetBrains Mono,monospace",
                }}
              >
                Product Catalog
              </div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "12px 0", flex: 1 }}>
          {sections.map((sec) => (
            <div key={sec}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "#5BB74A88",
                  padding: "12px 20px 4px",
                  fontFamily: "JetBrains Mono,monospace",
                }}
              >
                {sec}
              </div>
              {nav
                .filter((n) => n.section === sec)
                .map((n) => (
                  <NavItem
                    key={n.id}
                    icon={n.icon}
                    label={n.label}
                    active={page === n.id}
                    proLocked={n.proLocked}
                    onClick={() => handleNav(n.id)}
                  />
                ))}
            </div>
          ))}
        </nav>

        {/* Pro badge / upgrade nudge in sidebar */}
        {vendorPlan !== null && (
          <div style={{ padding: "12px 16px 20px" }}>
            {isPro ? (
              <div
                style={{
                  background: C.greenGlow,
                  border: `1px solid ${C.greenBorder}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                {/* Plan info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>⭐</span>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.green,
                        fontFamily: "JetBrains Mono,monospace",
                      }}
                    >
                      PRO PLAN
                    </div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>
                      All features unlocked
                    </div>
                  </div>
                </div>
                {/* Cancel button */}
                <button
                  onClick={handleCancelPlan}
                  disabled={cancelling}
                  style={{
                    width: "100%",
                    padding: "6px 0",
                    background: "transparent",
                    border: `1px solid ${C.danger}`,
                    borderRadius: 7,
                    color: C.danger,
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: cancelling ? "not-allowed" : "pointer",
                    opacity: cancelling ? 0.6 : 1,
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.dangerBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {cancelling ? "Cancelling…" : "Cancel Plan"}
                </button>
              </div>
            ) : (
              <div
                onClick={handleUpgrade}
                style={{
                  background: `linear-gradient(135deg,${C.green}18,${C.greenLight}18)`,
                  border: `1px solid ${C.greenBorder}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  cursor: "pointer",
                  transition: "opacity .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.green,
                    fontFamily: "JetBrains Mono,monospace",
                    marginBottom: 2,
                  }}
                >
                  🚀 Upgrade to Pro
                </div>
                <div style={{ fontSize: 10, color: C.textMuted }}>
                  Unlock Categories & more
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        <header
          style={{
            background: C.bgCard,
            borderBottom: `1px solid ${C.border}`,
            padding: isMobile ? "0 14px" : "0 36px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: `0 1px 0 ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  background: C.bg,
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 2,
                    background: C.text,
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    width: 16,
                    height: 2,
                    background: C.text,
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    width: 16,
                    height: 2,
                    background: C.text,
                    borderRadius: 2,
                  }}
                />
              </button>
            )}
            <h1
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: isMobile ? 16 : 30,
                fontWeight: 900,
                color: C.text,
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              {pageTitles[page]}
            </h1>
          </div>
          {!isMobile && (
            <div
              style={{
                fontSize: 12,
                fontFamily: "JetBrains Mono,monospace",
                color: C.textMuted,
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 100,
                padding: "5px 14px",
              }}
            >
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </header>

        <main
          style={{
            flex: 1,
            padding: isMobile ? "16px 14px" : "32px 36px",
            animation: "fadeIn .3s ease",
          }}
          key={page}
        >
          {page === "dashboard" && (
            <DashboardPage stats={stats} setStats={setStats} />
          )}

          {/* Categories — gated behind Pro */}
          {page === "categories" &&
            (isPro ? (
              <CategoriesPage
                categories={categories}
                setCategories={handleSetCategories}
                showToast={showToast}
              />
            ) : (
              <LockedPage title="Categories" onUpgrade={handleUpgrade} />
            ))}

          {/* Sub-Categories — gated behind Pro */}
          {page === "subcategories" &&
            (isPro ? (
              <SubCategoriesPage
                categories={categories}
                showToast={showToast}
              />
            ) : (
              <LockedPage title="Sub-Categories" onUpgrade={handleUpgrade} />
            ))}

          {page === "products" && (
            <ProductsPage
              categories={categories}
              showToast={showToast}
              autoOpenAdd={openAddProduct}
              onAutoOpenHandled={() => setOpenAddProduct(false)}
            />
          )}
          {page === "orders" && <OrdersPage showToast={showToast} />}
          {page === "coupons" && <CouponsPage showToast={showToast} />}
          {page === "storefront" && (
            <StorefrontPage categories={categories} showToast={showToast} />
          )}
          {page === "flashsales" && (
            <VendorFlashSales
              onGoToProducts={() => {
                setPage("products");
                setOpenAddProduct(true);
              }}
            />
          )}
          {page === "inventory" && <InventoryPage showToast={showToast} />}
        </main>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
