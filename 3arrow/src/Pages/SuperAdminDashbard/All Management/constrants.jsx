// ═══ API URLS ═══
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/auth/vendor";
export const API_BASE_UB =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

// ═══ THEME COLORS ═══
export const C = {
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

// ═══ FONTS ═══
export const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

// ═══ MISC ═══
export const CAT_EMOJIS = [
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

export const SF_EMOJIS = [
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

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export const inputStyle = {
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
