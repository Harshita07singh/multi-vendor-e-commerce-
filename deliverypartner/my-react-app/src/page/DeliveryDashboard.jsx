// DeliveryDashboard.jsx — 3Arrow Delivery Partner Dashboard
// API base: VITE_API_BASE_URL/delivery/...
// Auth token: localStorage "accessToken"

import { useState, useEffect, useRef, useCallback } from "react";
import { io as socketIO } from "socket.io-client"; 
import logo from "../assets/image.png";
import Livemap from "./Livemap";
import {
  LayoutDashboard,
  MapPin,
  ArrowLeftRight,
  HandCoins,
  UserPen,
  Goal,
  Bell,
} from "lucide-react";

const API =
  (import.meta?.env?.VITE_API_BASE_URL ?? "http://localhost:3000/api") +
  "/delivery";

// Socket connects to the root of the server (no /api suffix)
const SOCKET_URL =
  import.meta?.env?.VITE_API_BASE_URL?.replace("/api", "") ??
  "http://localhost:3000";

const token = () => localStorage.getItem("accessToken");

const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* ── Brand ── */
  --p:          #5CB74B;
  --p-dark:     #3f8f34;
  --p-deep:     #2d6624;
  --p-light:    #f0faed;
  --p-mid:      #d6f0cf;
  --p-glow:     rgba(92,183,75,0.22);
  --p-border:   rgba(92,183,75,0.2);
  --p-border2:  rgba(92,183,75,0.35);

  /* ── Backgrounds ── */
  --bg:         #f5f7f5;
  --surface:    #ffffff;
  --surface2:   #fafcfa;
  --surface3:   #f0f5ef;

  /* ── Sidebar ── */
  --sb-bg:      #ffffff;
  --sb-border:  #e8efe7;
  --sb-active:  #f0faed;
  --sb-hover:   #f7fbf6;
  --sb-text:    #374a35;
  --sb-muted:   #8faa8b;

  /* ── Text ── */
  --t1:  #5CB74B;
  --t2:  #5CB74B;
  --t3:  #5CB74B;
  --t4:  #5CB74B;

  /* ── Borders ── */
  --border:    #e4ede3;
  --border2:   #cddecb;

  /* ── Shadows ── */
  --sh-xs: 0 1px 3px rgba(28,43,26,0.06);
  --sh-sm: 0 2px 8px rgba(28,43,26,0.07), 0 1px 3px rgba(28,43,26,0.05);
  --sh-md: 0 4px 20px rgba(28,43,26,0.09), 0 2px 8px rgba(28,43,26,0.05);
  --sh-lg: 0 8px 40px rgba(28,43,26,0.11), 0 3px 12px rgba(28,43,26,0.06);
  --sh-p:  0 4px 16px rgba(92,183,75,0.28);

  /* ── Radii ── */
  --r-xs: 6px;
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 18px;
  --r-xl: 22px;
  --r-pill: 100px;

  font-family: 'Nunito', sans-serif;
}

html, body {
  background: var(--bg);
  min-height: 100vh;
  color: var(--t1);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}

button { font-family: inherit; cursor: pointer; border: none; background: none; }

/* ══════════════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════════════ */
.layout { display: flex; min-height: 100vh; }

/* ══════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════ */
.sb {
  width: 248px;
  background: var(--sb-bg);
  border-right: 1px solid var(--sb-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  inset-block: 0;
  left: 0;
  z-index: 50;
  transition: width 0.26s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 2px 0 12px rgba(28,43,26,0.04);
}

.sb.slim { width: 70px; }

.sb-top {
  padding: 18px 16px;
  border-bottom: 1px solid var(--sb-border);
  min-height: 30px;
  display: flex;
  align-items: center;
  gap: 11px;
  overflow: hidden;
}

.sb-logo-icon {
  width: 60px;
  height: 50px;
  border-radius: var(--r-sm); 
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.sb-logo-icon img { width: 100%; height: 100%; object-fit: contain; padding: 5px; }

.sb-logo-text {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: var(--t1);
  white-space: nowrap;
  letter-spacing: 0em;
  line-height: 1.2;
}

.sb-logo-text span { color: var(--p); }
.sb-sub {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--t4);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.nav-list {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-list::-webkit-scrollbar { width: 0; }

.ni {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all 0.16s ease;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  color: var(--sb-muted);
  text-decoration: none;
}

.ni:hover {
  background: var(--sb-hover);
  color: var(--t2);
}

.ni.act {
  background: var(--sb-active);
  color: var(--p-dark);
  box-shadow: inset 0 0 0 1px var(--p-border);
}

.ni.act::before {
  content: '';
  position: absolute;
  left: 0; top: 8px; bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--p);
}

.ni-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  transition: background 0.16s;
}

.ni.act .ni-icon { background: var(--p-mid); }
.ni:hover:not(.act) .ni-icon { background: var(--surface3); }

.ni-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.3;
}

.ni-badge {
  margin-left: auto;
  background: var(--p);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: var(--r-pill);
  flex-shrink: 0;
}

.sb-divider { height: 1px; background: var(--sb-border); margin: 4px 10px; }

.sb-foot {
  padding: 12px 10px;
  border-top: 1px solid var(--sb-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  background: var(--surface3);
  border-radius: var(--r-md);
  border: 1px solid var(--border);
  overflow: hidden;
}

.dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.on {
  background: var(--p);
  box-shadow: 0 0 0 3px rgba(92,183,75,0.25);
  animation: dot-pulse 2s infinite;
}

.dot.off { background: #c9d4c8; }

@keyframes dot-pulse {
  0%,100% { box-shadow: 0 0 0 3px rgba(92,183,75,0.2); }
  50%      { box-shadow: 0 0 0 6px rgba(92,183,75,0.04); }
}

.status-pill-label { font-size: 12px; font-weight: 600; color: var(--t2); white-space: nowrap; }

.sb-collapse-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: background 0.16s;
  color: var(--t4);
}
.sb-collapse-btn:hover { background: var(--sb-hover); color: var(--t2); }

.sb-collapse-icon {
  width: 32px; height: 32px;
  border-radius: var(--r-sm);
  background: var(--surface3);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0;
  border: 1px solid var(--border);
}

/* ══════════════════════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════════════════════ */
.topbar {
  height: 64px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 22px;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 0 var(--border), var(--sh-xs);
}

.tb-menu-btn {
  width: 36px; height: 36px;
  border-radius: var(--r-sm);
  background: var(--surface3);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--t2);
  font-size: 15px;
}
.tb-menu-btn:hover { background: var(--p-light); border-color: var(--p-border); }

.tb-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 19px;
  color: var(--t1);
  flex: 1;
  letter-spacing: 0em;
  line-height: 1.2;
}

.online-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 15px;
  border-radius: var(--r-pill);
  border: 1.5px solid;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Nunito', inherit;
  letter-spacing: 0.02em;
}

.online-toggle.on {
  background: var(--p-light);
  border-color: var(--p-border2);
  color: var(--p-dark);
  box-shadow: var(--sh-p);
}

.online-toggle.off {
  background: var(--surface3);
  border-color: var(--border);
  color: var(--t3);
}

.tb-icon-btn {
  width: 36px; height: 36px;
  border-radius: var(--r-sm);
  background: var(--surface3);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  color: var(--t2);
  font-size: 15px;
}
.tb-icon-btn:hover { background: var(--p-light); border-color: var(--p-border); transform: translateY(-1px); box-shadow: var(--sh-xs); }

.notif-dot {
  position: absolute; top: 7px; right: 7px;
  width: 7px; height: 7px;
  background: #f59e0b;
  border-radius: 50%;
  border: 2px solid var(--surface);
}

.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--p), var(--p-dark));
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 13px; color: #fff;
  cursor: pointer; flex-shrink: 0;
  border: 2px solid var(--p-mid);
  box-shadow: var(--sh-p);
  transition: all 0.15s;
  letter-spacing: 0.02em;
}
.avatar:hover { transform: translateY(-1px); box-shadow: 0 6px 20px var(--p-glow); }

/* ══════════════════════════════════════════════════════════
   MAIN AREA
══════════════════════════════════════════════════════════ */
.main { margin-left: 248px; flex: 1; transition: margin-left 0.26s cubic-bezier(0.4,0,0.2,1); }
.main.slim { margin-left: 70px; }
.page { padding: 24px; max-width: 1300px; }

/* ══════════════════════════════════════════════════════════
   SECTION HEADER
══════════════════════════════════════════════════════════ */
.section-header {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.section-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800; font-size: 15px;
  color: var(--t1); letter-spacing: 0.01em;
  line-height: 1.3;
}

/* ══════════════════════════════════════════════════════════
   STAT CARDS
══════════════════════════════════════════════════════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 18px 18px 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: var(--sh-xs);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--sh-md);
  border-color: var(--border2);
}

.stat-card-accent {
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}

.stat-card-bg {
  position: absolute; right: -8px; bottom: -8px;
  font-size: 54px; opacity: 0.055;
  pointer-events: none; line-height: 1;
}

.stat-label {
  font-size: 11px; font-weight: 800;
  color: var(--t3);
  text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 10px;
  line-height: 1.4;
}

.stat-value {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 30px; font-weight: 800;
  color: var(--t1); line-height: 1.1;
  margin-bottom: 6px;
  letter-spacing: 0.01em;
}

.stat-sub { font-size: 12px; color: var(--t4); font-weight: 600; line-height: 1.4; }

/* ══════════════════════════════════════════════════════════
   CARDS
══════════════════════════════════════════════════════════ */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--sh-xs);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.card:hover { box-shadow: var(--sh-sm); }

.card-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center;
  justify-content: space-between; gap: 8px;
  background: var(--surface2);
}

.card-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; font-weight: 700;
  color: var(--t1);
  display: flex; align-items: center; gap: 7px;
  letter-spacing: 0.01em;
  line-height: 1.3;
}

.card-body { padding: 18px; }

/* ══════════════════════════════════════════════════════════
   BADGES
══════════════════════════════════════════════════════════ */
.bdg {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  letter-spacing: 0.02em;
  border: 1px solid;
}

.bdg-g { background: #edfae8; color: #2d7a22; border-color: #b8e8b0; }
.bdg-o { background: #fef9ec; color: #b45309; border-color: #fcd97a; }
.bdg-r { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.bdg-b { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.bdg-n { background: var(--surface3); color: var(--t3); border-color: var(--border); }

/* ══════════════════════════════════════════════════════════
   BUTTONS
══════════════════════════════════════════════════════════ */
.btn {
  padding: 9px 18px;
  border-radius: var(--r-sm);
  font-size: 13.5px; font-weight: 800;
  cursor: pointer; font-family: 'Nunito', inherit;
  transition: all 0.16s ease;
  border: 1.5px solid transparent;
  display: inline-flex; align-items: center; gap: 6px;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.btn:active { transform: scale(0.97); }
.btn-sm { padding: 6px 13px; font-size: 12px; border-radius: var(--r-xs); }
.btn-xs { padding: 4px 10px; font-size: 11px; border-radius: var(--r-xs); }
.btn-fw { width: 100%; justify-content: center; }

.btn-primary {
  background: var(--p);
  border-color: var(--p-dark);
  color: #fff;
  box-shadow: var(--sh-p);
}
.btn-primary:hover { background: var(--p-dark); transform: translateY(-1px); box-shadow: 0 6px 20px var(--p-glow); }

.btn-outline {
  background: var(--surface);
  border-color: var(--border2);
  color: var(--t2);
}
.btn-outline:hover { background: var(--p-light); border-color: var(--p-border2); color: var(--p-dark); }

.btn-danger {
  background: #fff5f5;
  color: #dc2626;
  border-color: #fecaca;
}
.btn-danger:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

/* ══════════════════════════════════════════════════════════
   GRID HELPERS
══════════════════════════════════════════════════════════ */
.g2 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px; margin-bottom: 22px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-bottom: 22px; }
.mb16 { margin-bottom: 16px; }
.mb20 { margin-bottom: 20px; }

/* ══════════════════════════════════════════════════════════
   MAP PLACEHOLDER (used when no real map loaded)
══════════════════════════════════════════════════════════ */
.map-wrap {
  background: var(--surface3);
  border-radius: var(--r-md);
  overflow: hidden;
  position: relative;
  height: 248px;
  border: 1px solid var(--border);
}

.map-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--p-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--p-border) 1px, transparent 1px);
  background-size: 32px 32px;
}

.map-route {
  position: absolute;
  top: 50%; left: 20%; width: 60%; height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--p), #f59e0b);
  transform: rotate(-4deg); z-index: 2;
  box-shadow: 0 0 14px rgba(92,183,75,0.4);
}

.map-pin { position: absolute; font-size: 22px; z-index: 3; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25)); }
.map-pin-a { top: 26%; left: 16%; }
.map-pin-b { bottom: 18%; right: 16%; }

.map-pulse {
  width: 13px; height: 13px;
  background: var(--p);
  border-radius: 50%;
  border: 2.5px solid #fff;
  z-index: 4;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 0 var(--p-glow);
  animation: map-ping 2s infinite;
}

@keyframes map-ping {
  0%   { box-shadow: 0 0 0 0 var(--p-glow); }
  70%  { box-shadow: 0 0 0 14px rgba(92,183,75,0); }
  100% { box-shadow: 0 0 0 0 rgba(92,183,75,0); }
}

.map-badge {
  position: absolute;
  background: rgba(255,255,255,0.95);
  border: 1px solid var(--border2);
  border-radius: var(--r-pill);
  padding: 5px 12px;
  font-size: 11.5px; font-weight: 700;
  color: var(--t1); z-index: 5;
  display: flex; align-items: center; gap: 5px;
  box-shadow: var(--sh-xs);
}

.map-badge-eta { top: 12px; left: 12px; color: var(--p-dark); }
.map-badge-dist { bottom: 12px; right: 12px; font-size: 11px; color: var(--t2); }

.map-no-order {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100%; gap: 8px;
  color: var(--t4); font-size: 13px; font-weight: 600;
}

/* ══════════════════════════════════════════════════════════
   DELIVERY TRACKER
══════════════════════════════════════════════════════════ */
.tracker { display: flex; flex-direction: column; }

.track-step {
  display: flex; gap: 13px;
  align-items: flex-start; position: relative;
}

.track-step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 15px; top: 33px;
  width: 2px; height: calc(100% - 12px);
  background: var(--border);
  border-radius: 1px;
}

.track-step.done::before { background: var(--p-mid); }

.track-icon {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--surface3);
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; flex-shrink: 0; z-index: 1;
  transition: all 0.22s;
}

.track-step.done .track-icon {
  background: var(--p-light);
  border-color: var(--p);
  color: var(--p-dark);
}

.track-step.active .track-icon {
  border-color: #f59e0b;
  background: #fef9ec;
  animation: track-pulse 1.6s infinite;
}

@keyframes track-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); }
  50%      { box-shadow: 0 0 0 7px rgba(245,158,11,0); }
}

.track-info { padding: 3px 0 18px; flex: 1; }
.track-label { font-size: 13.5px; font-weight: 800; color: var(--t1); line-height: 1.35; letter-spacing: 0.01em; }
.track-step.done .track-label { color: var(--p-dark); }
.track-step.active .track-label { color: #b45309; }
.track-sub { font-size: 12px; color: var(--t3); margin-top: 2px; font-weight: 600; line-height: 1.4; }

/* ══════════════════════════════════════════════════════════
   CHART BARS
══════════════════════════════════════════════════════════ */
.chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 112px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; justify-content: flex-end; }

.bar {
  width: 100%; border-radius: 5px 5px 0 0;
  background: var(--p-mid);
  transition: height 0.7s cubic-bezier(0.34,1.56,0.64,1);
  min-height: 3px;
}
.bar:hover { background: var(--p); }
.bar.today { background: linear-gradient(180deg, var(--p), var(--p-dark)); box-shadow: 0 4px 12px var(--p-glow); }
.bar-lbl { font-size: 10px; color: var(--t4); font-weight: 800; letter-spacing: 0.04em; }

/* ══════════════════════════════════════════════════════════
   NOTIFICATION PANEL (dropdown)
══════════════════════════════════════════════════════════ */
.notif-panel {
  position: absolute;
  top: 50px; right: 0;
  width: 316px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-lg);
  z-index: 100;
  overflow: hidden;
  animation: panel-fade 0.18s ease;
}

@keyframes panel-fade {
  from { transform: translateY(-8px) scale(0.98); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

.notif-panel-header {
  padding: 13px 15px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border);
  background: var(--surface2);
}

.notif-panel-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 13px; color: var(--t1);
}

.notif-mark-all {
  font-size: 11px; color: var(--p-dark);
  cursor: pointer; font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--r-xs);
  transition: background 0.14s;
}
.notif-mark-all:hover { background: var(--p-light); }

.notif-item {
  display: flex; gap: 10px;
  padding: 11px 15px;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.12s;
}
.notif-item:hover { background: var(--surface3); }
.notif-item:last-child { border-bottom: none; }

/* ══════════════════════════════════════════════════════════
   INCOMING ORDER POPUP
══════════════════════════════════════════════════════════ */
.incoming {
  position: fixed;
  bottom: 24px; right: 24px;
  z-index: 200;
  animation: popup-slide 0.42s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes popup-slide {
  from { transform: translateY(72px) scale(0.92); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

.inc-card {
  background: var(--surface);
  border: 1.5px solid var(--p-border2);
  border-radius: var(--r-xl);
  padding: 18px;
  width: 318px;
  box-shadow: var(--sh-lg), 0 0 0 4px var(--p-glow);
}

.inc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 13px; }

.inc-icon {
  width: 44px; height: 44px;
  background: var(--p-light);
  border-radius: var(--r-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  animation: icon-ring 0.55s ease infinite alternate;
  border: 1.5px solid var(--p-border2);
  flex-shrink: 0;
}

@keyframes icon-ring {
  from { transform: rotate(-8deg) scale(1); }
  to   { transform: rotate(8deg) scale(1.04); }
}

.inc-meta {
  background: var(--surface3);
  border-radius: var(--r-md);
  padding: 11px 13px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
}

.inc-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
.inc-row:last-child { margin: 0; }
.inc-row span { color: var(--t3); font-weight: 500; }
.inc-row strong { color: var(--t1); font-weight: 700; }

.timer-track { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 5px; }
.timer-fill { height: 100%; background: #f59e0b; border-radius: 2px; transition: width 1s linear; }
.timer-txt { font-size: 10.5px; color: var(--t4); font-weight: 600; text-align: center; margin-bottom: 12px; }

.inc-actions { display: flex; gap: 9px; }

.btn-inc-accept {
  flex: 2; padding: 10px;
  background: var(--p);
  color: #fff;
  border-radius: var(--r-sm);
  font-size: 13px; font-weight: 800;
  cursor: pointer;
  transition: all 0.16s;
  border: none; font-family: inherit;
  box-shadow: var(--sh-p);
  letter-spacing: -0.01em;
}
.btn-inc-accept:hover { background: var(--p-dark); transform: translateY(-1px); box-shadow: 0 6px 20px var(--p-glow); }

.btn-inc-decline {
  flex: 1; padding: 10px;
  background: var(--surface3);
  color: var(--t3);
  border-radius: var(--r-sm);
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all 0.16s;
  border: 1px solid var(--border); font-family: inherit;
}
.btn-inc-decline:hover { color: #dc2626; border-color: #fecaca; background: #fff5f5; }

/* ══════════════════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════════════════ */
.tbl { width: 100%; border-collapse: collapse; }

.tbl th {
  text-align: left;
  font-size: 10px; font-weight: 800;
  color: var(--t3);
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 10px 15px;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
}

.tbl td {
  padding: 11px 15px;
  font-size: 12.5px; color: var(--t1);
  border-bottom: 1px solid var(--border);
  font-weight: 500;
}

.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: var(--surface3); }
.tp { font-weight: 800; color: var(--t1) !important; font-family: 'Syne', sans-serif; font-size: 12px !important; }
.tg { color: var(--p-dark) !important; font-weight: 800; font-family: 'Syne', sans-serif; }

/* ══════════════════════════════════════════════════════════
   FORM
══════════════════════════════════════════════════════════ */
.fg { margin-bottom: 16px; }
.fl {
  font-size: 10.5px; font-weight: 800;
  color: var(--t3); margin-bottom: 6px;
  display: block; text-transform: uppercase; letter-spacing: 0.08em;
}

.fi {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  font-size: 13.5px; font-family: inherit;
  background: var(--surface);
  color: var(--t1); outline: none;
  transition: all 0.16s;
}
.fi:focus {
  border-color: var(--p);
  box-shadow: 0 0 0 3px var(--p-glow);
  background: var(--surface);
}

.fsl {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  font-size: 13.5px; font-family: inherit;
  background: var(--surface); color: var(--t1);
  outline: none; cursor: pointer; transition: border-color 0.16s;
}
.fsl:focus { border-color: var(--p); box-shadow: 0 0 0 3px var(--p-glow); }

/* ══════════════════════════════════════════════════════════
   STATUS BOX (full-page state screens)
══════════════════════════════════════════════════════════ */
.status-box {
  padding: 44px 36px;
  background: var(--surface);
  border-radius: var(--r-xl);
  text-align: center;
  border: 1px solid var(--border);
  margin-top: 20px;
  box-shadow: var(--sh-md);
}

.status-emoji { font-size: 52px; margin-bottom: 16px; }
.status-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 10px; color: var(--t1); letter-spacing: -0.02em; }
.status-msg { font-size: 14px; color: var(--t3); max-width: 340px; margin: 0 auto; line-height: 1.65; }

/* ══════════════════════════════════════════════════════════
   ALERTS
══════════════════════════════════════════════════════════ */
.alert {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 15px;
  border-radius: var(--r-sm);
  margin-bottom: 18px;
  font-size: 13px; font-weight: 600;
  border: 1px solid;
}

.alert-g { background: #edfae8; border-color: #b8e8b0; color: #2d7a22; }
.alert-o { background: #fef9ec; border-color: #fcd97a; color: #b45309; }
.alert-r { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

/* ══════════════════════════════════════════════════════════
   PROGRESS
══════════════════════════════════════════════════════════ */
.prog { background: var(--surface3); border-radius: 4px; height: 5px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 4px; transition: width 0.65s ease; }

/* ══════════════════════════════════════════════════════════
   MISC
══════════════════════════════════════════════════════════ */
.dvd { height: 1px; background: var(--border); margin: 14px 0; }

.empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 20px;
  color: var(--t4); text-align: center;
  font-weight: 600; font-size: 13px;
}
.empty-icon { font-size: 36px; opacity: 0.3; margin-bottom: 10px; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--p);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════
   PAGE ANIMATIONS
══════════════════════════════════════════════════════════ */
@keyframes pg-fade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page > * { animation: pg-fade 0.3s ease forwards; opacity: 0; }
.page > *:nth-child(1) { animation-delay: 0.03s; }
.page > *:nth-child(2) { animation-delay: 0.08s; }
.page > *:nth-child(3) { animation-delay: 0.13s; }
.page > *:nth-child(4) { animation-delay: 0.18s; }

/* ══════════════════════════════════════════════════════════
   MOBILE
══════════════════════════════════════════════════════════ */
.mob-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(28,43,26,0.38); z-index: 49;
  backdrop-filter: blur(2px);
}

@media (max-width: 900px) {
  .sb { transform: translateX(-100%); width: 248px !important; box-shadow: none; }
  .sb.open { transform: translateX(0); box-shadow: var(--sh-lg); }
  .mob-overlay { display: block; }
  .main { margin-left: 0 !important; }
  .g2 { grid-template-columns: 1fr; }
  .g3 { grid-template-columns: 1fr 1fr; }
  .page { padding: 14px; }
}

@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .g3 { grid-template-columns: 1fr; }
  .incoming { right: 12px; bottom: 12px; }
  .inc-card { width: calc(100vw - 24px); }
}
`;

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = {
    shipped: ["bdg-o", "▶ En Route"],
    delivered: ["bdg-g", "✓ Delivered"],
    cancelled: ["bdg-r", "✕ Cancelled"],
    pending: ["bdg-n", "⏳ Pending"],
    confirmed: ["bdg-b", "✓ Confirmed"],
    processing: ["bdg-b", "⚙ Processing"],
  };
  const [cls, lbl] = m[status] || ["bdg-n", status];
  return <span className={`bdg ${cls}`}>{lbl}</span>;
};

const Prog = ({ pct, color = "var(--primary)" }) => (
  <div className="prog">
    <div
      className="prog-fill"
      style={{ width: `${pct}%`, background: color }}
    />
  </div>
);

const Spinner = () => (
  <div style={{ padding: 40 }}>
    <div className="spinner" />
  </div>
);

// ─── Live Map ─────────────────────────────────────────────────────────────────
const LiveMap = ({ activeOrder }) => {
  if (!activeOrder) {
    return (
      <div className="map-wrap">
        <div className="map-grid" />
        <div className="map-no-order">
          <div style={{ fontSize: 36 }}>
            <MapPin />
          </div>
          <div style={{ fontWeight: 600 }}>No active delivery</div>
          <div style={{ fontSize: 11.5 }}>Go online to receive orders</div>
        </div>
      </div>
    );
  }
  const addr = activeOrder.shippingAddress;
  return (
    <div className="map-wrap">
      <div className="map-grid" />
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
        }}
        viewBox="0 0 400 248"
      >
        <path
          d="M0 124 Q100 104 200 124 Q300 144 400 124"
          stroke="#5AB748"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M0 174 Q160 158 260 166 Q330 173 400 160"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M112 0 Q118 78 114 124 Q108 184 110 248"
          stroke="#fff"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M272 0 Q278 68 274 124 Q269 188 272 248"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <div className="map-route" />
      <span className="map-pin map-pin-a">🏪</span>
      <span className="map-pin map-pin-b">🏠</span>
      <div className="map-pulse" />
      <div className="map-badge map-badge-eta">▲ ETA ~18 min</div>
      <div className="map-badge map-badge-dist">
        📍 {addr?.city || "Customer"} · ₹{activeOrder.deliveryEarning || 40}
      </div>
    </div>
  );
};

// ─── Delivery Tracker ─────────────────────────────────────────────────────────
const DeliveryTracker = ({ order, onPickup, onDeliver }) => {
  if (!order) return null;
  const steps = [
    { label: "Order Accepted", done: true, icon: "✓", sub: "Completed" },
    { label: "Reached Vendor", done: true, icon: "✓", sub: "Completed" },
    {
      label: "Picked Up",
      done: !!order.deliveryPickedAt,
      icon: <ArrowLeftRight />,
      active: !order.deliveryPickedAt,
      sub: order.deliveryPickedAt ? "Completed" : "In progress",
    },
    {
      label: "Out for Delivery",
      done: !!order.deliveryPickedAt && order.status === "shipped",
      active: !!order.deliveryPickedAt && order.status === "shipped",
      icon: "📦",
      sub: !!order.deliveryPickedAt ? "In progress" : "Pending",
    },
    {
      label: "Delivered",
      done: order.status === "delivered",
      icon: "🏠",
      sub: order.status === "delivered" ? "Completed" : "Pending",
    },
  ];

  return (
    <div className="card mb16">
      <div className="card-header">
        <div className="card-title">
          <ArrowLeftRight /> Active Delivery ·{" "}
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            #{order._id.slice(-6).toUpperCase()}
          </span>
        </div>
        <StatusBadge status="shipped" />
      </div>
      <div className="card-body">
        <div className="tracker">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`track-step${s.done ? " done" : ""}${s.active ? " active" : ""}`}
            >
              <div className="track-icon">{s.icon}</div>
              <div className="track-info">
                <div className="track-label">{s.label}</div>
                <div className="track-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="dvd" />
        <div style={{ display: "flex", gap: 9 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>
            📞 Call Customer
          </button>
          {!order.deliveryPickedAt && (
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={onPickup}
            >
              📦 Mark Picked Up
            </button>
          )}
          {order.deliveryPickedAt && (
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={onDeliver}
            >
              ✅ Mark Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Incoming Order Popup ─────────────────────────────────────────────────────
const IncomingPopup = ({ notif, onAccept, onDecline }) => {
  // expiresInMs is injected by the socket `new_order` event (30 000 ms).
  // For notifications that arrive via REST fallback it defaults to 30 s.
  const totalSecs = Math.round((notif.expiresInMs ?? 30_000) / 1000);
  const [t, setT] = useState(totalSecs);
  const order = notif.order;

  useEffect(() => {
    // Reset when a new notification arrives
    setT(totalSecs);
  }, [notif._id, totalSecs]);

  useEffect(() => {
    // Client-side countdown — purely cosmetic.
    // The server auto-declines after 30 s and emits `notification_expired`,
    // which the parent handles. This local timer is just a UI fallback.
    const iv = setInterval(() => {
      setT((p) => {
        if (p <= 1) {
          clearInterval(iv);
          onDecline();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [notif._id]);

  return (
    <div className="incoming">
      <div className="inc-card">
        <div className="inc-header">
          <div className="inc-icon">
            <ArrowLeftRight />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              New Delivery Request
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              #{order?._id?.slice(-6).toUpperCase() || "NEW"}
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "var(--primary-dark)",
            }}
          >
            ₹{order?.total || "—"}
          </div>
        </div>
        <div className="inc-meta">
          {[
            ["Deliver to", order?.shippingAddress?.city || "Customer"],
            ["Items", order?.items?.length || "—"],
            ["Earning", `₹${order?.deliveryEarning || 40}`],
            ["ETA", "~20 min"],
          ].map(([k, v]) => (
            <div className="inc-row" key={k}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="timer-track">
          <div className="timer-fill" style={{ width: `${(t / totalSecs) * 100}%` }} />
        </div>
        <div className="timer-txt">Auto-declining in {t}s</div>
        <div className="inc-actions">
          <button className="btn-inc-decline" onClick={onDecline}>
            ✕ Decline
          </button>
          <button className="btn-inc-accept" onClick={onAccept}>
            ✓ Accept Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PAGES ────────────────────────────────────────────────────────────────────
const DashboardPage = ({
  profile,
  stats,
  activeOrder,
  onPickup,
  onDeliver,
}) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxEarning = Math.max(
    ...(stats?.weekChart?.map((d) => d.earnings) || [1]),
  );

  const statCards = [
    {
      lbl: "Today's Earnings",
      val: `₹${stats?.todayEarnings || 0}`,
      sub: "Today",
      icon: "💰",
      acc: "#5CB74B",
    },
    {
      lbl: "Today's Deliveries",
      val: stats?.todayOrders || 0,
      sub: "Completed",
      icon: "📦",
      acc: "#5CB74B",
    },
    {
      lbl: "Week Revenue",
      val: `₹${stats?.weekChart?.reduce((a, d) => a + d.earnings, 0) || 0}`,
      sub: "7 days",
      icon: "📈",
      acc: "#5CB74B",
    },
    {
      lbl: "Total Deliveries",
      val: stats?.totalDeliveries || 0,
      sub: "All-time",
      icon: "🚀",
      acc: "#5CB74B",
    },
    {
      lbl: "Rating",
      val: `${stats?.averageRating?.toFixed(1) || "—"}★`,
      sub: `${stats?.ratingCount || 0} reviews`,
      icon: "⭐",
      acc: "#5CB74B",
    },
    {
      lbl: "Total Earned",
      val: `₹${stats?.totalEarnings || 0}`,
      sub: "All-time",
      icon: "💳",
      acc: "#5CB74B",
    },
  ];

  return (
    <>
      {!profile?.isOnline && (
        <div className="alert alert-o">
          ⚠️ You're <strong>offline</strong> — toggle Online to receive new
          deliveries.
        </div>
      )}
      {activeOrder && (
        <div className="alert alert-g">
          <ArrowLeftRight />
          Active delivery to{" "}
          <strong>{activeOrder.shippingAddress?.city}</strong>
        </div>
      )}

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div
              className="stat-card-accent"
              style={{
                background: `linear-gradient(90deg, ${s.acc}, ${s.acc}88)`,
              }}
            />
            <div className="stat-card-bg">{s.icon}</div>
            <div className="stat-label">{s.lbl}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div>
          <div className="mb20">
            <LiveMap activeOrder={activeOrder} profile={profile} />
          </div>
          <DeliveryTracker
            order={activeOrder}
            onPickup={onPickup}
            onDeliver={onDeliver}
          />
          {!activeOrder && (
            <div className="card">
              <div className="card-body">
                <div className="empty">
                  <div className="empty-icon">
                    <ArrowLeftRight />
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: 5,
                    }}
                  >
                    No Active Delivery
                  </div>
                  <div style={{ fontSize: 12.5 }}>
                    {profile?.isOnline
                      ? "Waiting for nearby orders…"
                      : "Go online to start receiving orders"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="card mb16">
            <div className="card-header">
              <div className="card-title">
                <HandCoins /> Weekly Earnings
              </div>
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "var(--primary-dark)",
                }}
              >
                ₹{stats?.weekChart?.reduce((a, d) => a + d.earnings, 0) || 0}
              </span>
            </div>
            <div className="card-body">
              <div className="chart-bars">
                {(stats?.weekChart || Array(7).fill({ earnings: 0 })).map(
                  (d, i) => {
                    const isToday = i === (stats?.weekChart?.length || 7) - 1;
                    return (
                      <div className="bar-col" key={i}>
                        <div
                          className={`bar${isToday ? " today" : ""}`}
                          style={{
                            height: `${maxEarning > 0 ? (d.earnings / maxEarning) * 90 : 0}%`,
                          }}
                        />
                        <div className="bar-lbl">
                          {isToday ? "Today" : days[i]}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Goal /> Weekly Goals
              </div>
            </div>
            <div className="card-body">
              {[
                {
                  label: "Complete 10 orders",
                  pct: Math.min(100, ((stats?.weekOrders || 0) / 10) * 100),
                  color: "var(--primary)",
                },
                {
                  label: "Maintain 4.5+ rating",
                  pct: Math.min(100, ((stats?.averageRating || 0) / 5) * 100),
                  color: "#f59e0b",
                },
                {
                  label: "Earn ₹2,000 this week",
                  pct: Math.min(
                    100,
                    ((stats?.weekChart?.reduce((a, d) => a + d.earnings, 0) ||
                      0) /
                      2000) *
                      100,
                  ),
                  color: "#3b82f6",
                },
              ].map((g, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 7,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {g.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: g.color,
                      }}
                    >
                      {Math.round(g.pct)}%
                    </span>
                  </div>
                  <Prog pct={g.pct} color={g.color} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const OrdersPage = ({ orders, loading, onRefresh }) => {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["all", "shipped", "delivered", "cancelled"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button
          className="btn btn-outline btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={onRefresh}
        >
          🔄 Refresh
        </button>
      </div>
      <div className="card">
        {loading ? (
          <Spinner />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Deliver To</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Earned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((o, i) => (
                    <tr key={i}>
                      <td className="tp">#{o._id.slice(-6).toUpperCase()}</td>
                      <td>{o.user?.name || "—"}</td>
                      <td>{o.shippingAddress?.city || "—"}</td>
                      <td>{o.items?.length || "—"}</td>
                      <td className="tg">₹{o.total}</td>
                      <td style={{ color: "#d97706", fontWeight: 700 }}>
                        ₹{o.deliveryEarning || 40}
                      </td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty">
                        <div className="empty-icon">📭</div>
                        <div>No orders found</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

const MapPage = ({ activeOrder, profile, onPickup, onDeliver }) => (
  <>
    <div className="mb20">
      <LiveMap activeOrder={activeOrder} profile={profile} />
    </div>
    {activeOrder ? (
      <DeliveryTracker
        order={activeOrder}
        onPickup={onPickup}
        onDeliver={onDeliver}
      />
    ) : (
      <div className="card mb16">
        <div className="card-body">
          <div className="empty">
            <div className="empty-icon">
              <MapPin />
            </div>
            <div
              style={{
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 5,
              }}
            >
              No Active Delivery
            </div>
            <div style={{ fontSize: 12.5 }}>
              Accept an order to see your route here
            </div>
          </div>
        </div>
      </div>
    )}
    <div className="card">
      <div className="card-header">
        <div className="card-title">📍 Your Location</div>
        <span className="bdg bdg-g">● Live</span>
      </div>
      <div className="card-body">
        <div style={{ display: "flex", gap: 12 }}>
          {[
            ["Zone", profile?.zone || "Not set"],
            ["Status", profile?.isOnline ? "Online" : "Offline"],
            ["Available", profile?.isAvailable ? "Yes" : "On delivery"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                flex: 1,
                padding: "11px 13px",
                background: "rgba(90,183,72,0.06)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 5,
                }}
              >
                {k}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

const NotificationsPage = ({
  notifs,
  loading,
  onAccept,
  onDecline,
  onReadAll,
}) => (
  <>
    <div
      style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}
    >
      <button className="btn btn-outline btn-sm" onClick={onReadAll}>
        ✓ Mark all read
      </button>
    </div>
    <div className="card">
      {loading ? (
        <Spinner />
      ) : notifs.length === 0 ? (
        <div className="empty" style={{ padding: 44 }}>
          <div className="empty-icon">
            <Bell />
          </div>
          <div>No notifications yet</div>
        </div>
      ) : (
        notifs.map((n, i) => (
          <div
            key={i}
            style={{
              padding: "13px 18px",
              borderBottom:
                i < notifs.length - 1 ? "1px solid var(--border)" : "none",
              background: !n.isRead ? "rgba(90,183,72,0.04)" : "transparent",
              transition: "background 0.15s",
            }}
          >
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  flexShrink: 0,
                  marginTop: 5,
                  background: n.isRead ? "var(--border)" : "var(--primary)",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {n.title}
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    marginBottom: n.isAccepted === null ? 9 : 0,
                    lineHeight: 1.5,
                  }}
                >
                  {n.body}
                </div>
                {n.isAccepted === null && n.type === "new_order" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => onAccept(n)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger btn-xs"
                      onClick={() => onDecline(n)}
                    >
                      Decline
                    </button>
                  </div>
                )}
                {n.isAccepted === true && (
                  <span className="bdg bdg-g">✓ Accepted</span>
                )}
                {n.isAccepted === false && (
                  <span className="bdg bdg-r">✕ Declined</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </>
);

const ProfilePage = ({ profile, onSave }) => {
  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    vehicleType: profile?.vehicleType || "bike",
    vehicleNumber: profile?.vehicleNumber || "",
    zone: profile?.zone || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="g2">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <UserPen /> Edit Profile
          </div>
        </div>
        <div className="card-body">
          {saved && (
            <div className="alert alert-g" style={{ marginBottom: 16 }}>
              ✓ Profile saved successfully!
            </div>
          )}
          {[
            ["Name", "name", "text"],
            ["Phone", "phone", "tel"],
            ["Vehicle Number", "vehicleNumber", "text"],
            ["Zone", "zone", "text"],
          ].map(([label, key, type]) => (
            <div className="fg" key={key}>
              <label className="fl">{label}</label>
              <input
                className="fi"
                type={type}
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
              />
            </div>
          ))}
          <div className="fg">
            <label className="fl">Vehicle Type</label>
            <select
              className="fsl"
              value={form.vehicleType}
              onChange={(e) =>
                setForm((p) => ({ ...p, vehicleType: e.target.value }))
              }
            >
              {["bike", "scooter", "bicycle", "car"].map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary btn-fw"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <UserPen /> Partner Details
            </div>
          </div>
          <div className="card-body">
            {[
              ["Partner ID", profile?._id?.slice(-8).toUpperCase() || "—"],
              ["Status", profile?.status || "—"],
              ["Vehicle", profile?.vehicleType || "—"],
              [
                "Joined",
                profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "—",
              ],
              ["Total Deliveries", profile?.totalDeliveries ?? 0],
              ["Total Earned", `₹${profile?.totalEarnings ?? 0}`],
              ["Rating", `${profile?.averageRating?.toFixed(1) || "—"} ★`],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom:
                    i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{k}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EarningsPage = ({ stats, orders }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxEarning = Math.max(
    ...(stats?.weekChart?.map((d) => d.earnings) || [1]),
  );
  const weekTotal = stats?.weekChart?.reduce((a, d) => a + d.earnings, 0) || 0;

  return (
    <>
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          {
            lbl: "Today",
            val: `₹${stats?.todayEarnings || 0}`,
            sub: `${stats?.todayOrders || 0} deliveries`,
            acc: "var(--primary)",
          },
          {
            lbl: "This Week",
            val: `₹${weekTotal}`,
            sub: `${stats?.weekOrders || 0} deliveries`,
            acc: "var(--primary)",
          },
          {
            lbl: "All-Time",
            val: `₹${stats?.totalEarnings || 0}`,
            sub: `${stats?.totalDeliveries || 0} orders`,
            acc: "#f59e0b",
          },
          {
            lbl: "Avg / Delivery",
            val: `₹${stats?.totalDeliveries ? Math.round(stats.totalEarnings / stats.totalDeliveries) : 0}`,
            sub: "Per trip",
            acc: "#3b82f6",
          },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-accent" style={{ background: s.acc }} />
            <div className="stat-label">{s.lbl}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <HandCoins /> Weekly Chart
            </div>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--primary-dark)",
              }}
            >
              ₹{weekTotal}
            </span>
          </div>
          <div className="card-body">
            <div className="chart-bars">
              {(stats?.weekChart || Array(7).fill({ earnings: 0 })).map(
                (d, i) => {
                  const isToday = i === (stats?.weekChart?.length || 7) - 1;
                  return (
                    <div className="bar-col" key={i}>
                      <div
                        className={`bar${isToday ? " today" : ""}`}
                        style={{
                          height: `${maxEarning > 0 ? (d.earnings / maxEarning) * 90 : 0}%`,
                        }}
                      />
                      <div className="bar-lbl">{isToday ? "Now" : days[i]}</div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">💸 Recent Payouts</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Earned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.status === "delivered")
                  .slice(0, 8)
                  .map((o, i) => (
                    <tr key={i}>
                      <td className="tp">#{o._id.slice(-6).toUpperCase()}</td>
                      <td className="tg">₹{o.deliveryEarning || 40}</td>
                      <td>
                        <span className="bdg bdg-g">✓ Credited</span>
                      </td>
                    </tr>
                  ))}
                {orders.filter((o) => o.status === "delivered").length ===
                  0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty">
                        <div className="empty-icon">💸</div>
                        <div>No payouts yet</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
  { id: "map", icon: <MapPin />, label: "Live Map" },
  { id: "orders", icon: <ArrowLeftRight />, label: "Orders" },
  // { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "earnings", icon: <HandCoins />, label: "Earnings" },
  { id: "profile", icon: <UserPen />, label: "Profile" },
];

const TITLES = {
  dashboard: "Dashboard",
  map: "Live Map",
  orders: "My Orders",
  // notifications: "Notifications",
  earnings: "Earnings",
  profile: "My Profile",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DeliveryDashboard() {
  const [page, setPage] = useState("dashboard");
  const [slim, setSlim] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [pendingNotif, setPendingNotif] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const socketRef = useRef(null);        // ← NEW: holds the socket instance
  const fallbackTimerRef = useRef(null); // slow REST fallback (active order only)
  const pendingNotifRef = useRef(pendingNotif);

  useEffect(() => {
    pendingNotifRef.current = pendingNotif;
  }, [pendingNotif]);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  // ── Geolocation via Socket (replaces REST polling) ────────────────────────
  // The socket `update_location` event is debounced server-side (~55 m).
  // We still gate on isOnline so an offline partner doesn't burn GPS battery.
  const sendLocation = useCallback((lat, lng) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("update_location", { lat, lng });
    } else {
      // Fallback: REST PATCH if socket is not connected
      apiFetch("/location", {
        method: "PATCH",
        body: JSON.stringify({ lat, lng }),
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!profile?.isOnline) return;
    const sendGeo = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
      );
    };
    sendGeo();
    const iv = setInterval(sendGeo, 15_000); // 15 s — socket debounces the DB writes
    return () => clearInterval(iv);
  }, [profile?.isOnline, sendLocation]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiFetch("/me");
      setProfile(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch("/stats");
      setStats(res.data);
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await apiFetch("/orders?limit=20");
      setOrders(res.data || []);
    } catch {
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchActiveOrder = useCallback(async () => {
    try {
      const res = await apiFetch("/orders/active");
      setActiveOrder(res.data || null);
    } catch {}
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await apiFetch("/notifications");
      const list = (res.data?.notifications ?? res.data ?? []).map((n) => ({
        ...n,
        isAccepted: n.isAccepted === undefined ? null : n.isAccepted,
      }));
      setNotifs(list);
      // Show popup for any still-pending notification (REST fallback path)
      const pending = list.find(
        (n) => n.isAccepted === null && n.type === "new_order",
      );
      const current = pendingNotifRef.current;
      if (pending && (!current || current._id !== pending._id)) {
        setPendingNotif(pending);
      } else if (!pending && current) {
        setPendingNotif(null);
      }
    } catch {}
  }, []);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchOrders();
    fetchActiveOrder();
    fetchNotifs();
  }, []);

  // ── Socket setup / teardown ───────────────────────────────────────────────
  // Runs once after profile loads (we need to know the user is authenticated).
  useEffect(() => {
    const jwt = token();
    if (!jwt) return;

    const socket = socketIO(SOCKET_URL, {
      auth: { token: jwt },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2_000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    // ── new_order ─────────────────────────────────────────────────────────
    // Server sends this the moment notifyNearbyDeliveryPartners runs.
    // Shape: { notificationId, orderId, title, body, orderTotal,
    //          deliveryCity, expiresInMs, createdAt }
    socket.on("new_order", (data) => {
      // Build a lightweight notif object that IncomingPopup can render.
      // Full order details are fetched via REST only if partner accepts.
      const pseudoNotif = {
        _id: data.notificationId,
        type: "new_order",
        isAccepted: null,
        isRead: false,
        title: data.title,
        body: data.body,
        expiresInMs: data.expiresInMs ?? 30_000,
        createdAt: data.createdAt,
        order: {
          _id: data.orderId,
          total: data.orderTotal,
          shippingAddress: { city: data.deliveryCity },
          deliveryEarning: data.deliveryEarning ?? 40,
        },
      };

      // Add to the notification list
      setNotifs((prev) => {
        const exists = prev.find((n) => n._id === data.notificationId);
        return exists ? prev : [pseudoNotif, ...prev];
      });

      // Show popup only if nothing is already pending
      if (!pendingNotifRef.current) {
        setPendingNotif(pseudoNotif);
      }
    });

    // ── order_taken ───────────────────────────────────────────────────────
    // Another partner accepted before us — dismiss the popup immediately.
    socket.on("order_taken", ({ notificationId }) => {
      setNotifs((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isAccepted: false } : n,
        ),
      );
      if (pendingNotifRef.current?._id === notificationId) {
        setPendingNotif(null);
      }
    });

    // ── notification_expired ──────────────────────────────────────────────
    // Server auto-declined after 30 s — dismiss the popup.
    socket.on("notification_expired", ({ notificationId }) => {
      setNotifs((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isAccepted: false } : n,
        ),
      );
      if (pendingNotifRef.current?._id === notificationId) {
        setPendingNotif(null);
      }
    });

    // ── order_delivered ───────────────────────────────────────────────────
    // Server confirmed our delivery — mark partner as available again.
    socket.on("order_delivered", () => {
      setActiveOrder(null);
      setProfile((p) => (p ? { ...p, isAvailable: true } : p));
      fetchStats();
    });

    // ── online_status_updated (echo) ──────────────────────────────────────
    socket.on("online_status_updated", ({ isOnline }) => {
      setProfile((p) => (p ? { ...p, isOnline, isAvailable: isOnline } : p));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // mount once — token is read via closure

  // ── Slow REST fallback — active order only, every 2 min ──────────────────
  // Notifications come via socket; this just keeps active order in sync
  // in case the socket reconnects after a long gap.
  useEffect(() => {
    fallbackTimerRef.current = setInterval(() => {
      fetchActiveOrder();
    }, 120_000);
    return () => clearInterval(fallbackTimerRef.current);
  }, [fetchActiveOrder]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const toggleOnline = async () => {
    try {
      const res = await apiFetch("/toggle-online", { method: "PATCH" });
      setProfile((p) => ({ ...p, ...res.data }));
      // Also inform socket layer so server-side state stays in sync
      if (socketRef.current?.connected) {
        socketRef.current.emit("set_online_status", {
          isOnline: res.data?.isOnline,
        });
      }
      if (res.data?.isOnline) {
        fetchActiveOrder();
        fetchNotifs();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAccept = async () => {
    if (!pendingNotif) return;
    try {
      const res = await apiFetch(`/notifications/${pendingNotif._id}/accept`, {
        method: "POST",
      });
      setActiveOrder(res.data);
      setPendingNotif(null);
      fetchStats();
      fetchNotifs();
      setPage("dashboard");
    } catch (e) {
      alert(e.message);
      setPendingNotif(null);
    }
  };

  const handleDecline = async () => {
    if (!pendingNotif) return;
    try {
      await apiFetch(`/notifications/${pendingNotif._id}/decline`, {
        method: "POST",
      });
    } catch {}
    setPendingNotif(null);
  };

  const handlePickup = async () => {
    if (!activeOrder) return;
    try {
      const res = await apiFetch(`/orders/${activeOrder._id}/picked`, {
        method: "PATCH",
      });
      setActiveOrder(res.data);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeliver = async () => {
    if (!activeOrder) return;
    try {
      await apiFetch(`/orders/${activeOrder._id}/delivered`, {
        method: "PATCH",
      });
      // Socket `order_delivered` will fire from the server and update
      // activeOrder + stats automatically. We only need a local fallback
      // in case the socket is temporarily disconnected.
      if (!socketRef.current?.connected) {
        setActiveOrder(null);
        fetchStats();
        fetchOrders();
      }
      alert("🎉 Delivery completed! Earnings updated.");
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReadAll = async () => {
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("mark_notifications_read");
      } else {
        await apiFetch("/notifications/read-all", { method: "PATCH" });
      }
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleNotifAccept = async (n) => {
    setPendingNotif(n);
    setTimeout(() => handleAccept(), 100);
  };
  const handleNotifDecline = async (n) => {
    try {
      await apiFetch(`/notifications/${n._id}/decline`, { method: "POST" });
      fetchNotifs();
    } catch {}
  };

  const handleProfileSave = async (form) => {
    const res = await apiFetch("/me", {
      method: "PUT",
      body: JSON.stringify(form),
    });
    setProfile(res.data);
  };

  // ── Status gates ──────────────────────────────────────────────────────────
  if (loadingProfile)
    return (
      <>
        <style>{CSS}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div className="spinner" />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <style>{CSS}</style>
        <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 8,
              color: "var(--text-primary)",
            }}
          >
            Connection Error
          </div>
          <div style={{ color: "var(--text-muted)" }}>{error}</div>
        </div>
      </>
    );

  if (!profile)
    return (
      <>
        <style>{CSS}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: 20,
          }}
        >
          <div className="status-box" style={{ maxWidth: 420 }}>
            <div className="status-emoji">🚫</div>
            <div className="status-title">Profile Not Found</div>
            <div className="status-msg">
              Please complete your delivery partner registration first.
            </div>
          </div>
        </div>
      </>
    );

  if (profile.status === "pending")
    return (
      <>
        <style>{CSS}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: 20,
          }}
        >
          <div className="status-box" style={{ maxWidth: 420 }}>
            <div className="status-emoji">⏳</div>
            <div className="status-title" style={{ color: "#d97706" }}>
              Under Review
            </div>
            <div className="status-msg">
              Your account is awaiting admin approval. We'll notify you once
              you're approved!
            </div>
            <div
              style={{
                marginTop: 18,
                padding: "9px 18px",
                background: "rgba(245,158,11,0.08)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(245,158,11,0.2)",
                display: "inline-block",
              }}
            >
              <span
                style={{ fontSize: 12.5, color: "#d97706", fontWeight: 700 }}
              >
                ID: {profile._id?.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </>
    );

  if (profile.status === "suspended")
    return (
      <>
        <style>{CSS}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: 20,
          }}
        >
          <div className="status-box" style={{ maxWidth: 420 }}>
            <div className="status-emoji">🚫</div>
            <div className="status-title" style={{ color: "#dc2626" }}>
              Account Suspended
            </div>
            <div className="status-msg">
              Your account has been suspended. Please contact support.
            </div>
          </div>
        </div>
      </>
    );

  const initials =
    profile.name
      ?.split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2) || "DP";

  return (
    <>
      <style>{CSS}</style>

      {mobOpen && (
        <div className="mob-overlay" onClick={() => setMobOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <nav className={`sb${slim ? " slim" : ""}${mobOpen ? " open" : ""}`}>
        <div className="sb-logo-icon ">
          <div>
            <img src={logo} alt="3Arrow" />
          </div>
        </div>

        <div className="nav-list">
          {NAV.map((n) => (
            <div
              key={n.id}
              className={`ni${page === n.id ? " act" : ""}`}
              onClick={() => {
                setPage(n.id);
                setMobOpen(false);
              }}
            >
              <div className="ni-icon">{n.icon}</div>
              {!slim && <span className="ni-label">{n.label}</span>}
              {!slim && n.id === "notifications" && unreadCount > 0 && (
                <span className="ni-badge">{unreadCount}</span>
              )}
            </div>
          ))}
        </div>

        <div className="sb-foot">
          {!slim && (
            <div className="status-pill">
              <div className={`dot ${profile.isOnline ? "on" : "off"}`} />
              <span className="status-pill-label">
                {profile.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          )}
          <div className="sb-collapse-btn" onClick={() => setSlim((p) => !p)}>
            <div className="sb-collapse-icon">{slim ? "→" : "←"}</div>
            {!slim && (
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "var(--text-sidebar-muted)",
                }}
              >
                Collapse
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <div className={`main${slim ? " slim" : ""}`}>
        <header className="topbar">
          <button
            className="tb-menu-btn"
            onClick={() =>
              window.innerWidth <= 900
                ? setMobOpen((p) => !p)
                : setSlim((p) => !p)
            }
          >
            ☰
          </button>

          <div className="tb-title">{TITLES[page]}</div>

          <button
            className={`online-toggle ${profile.isOnline ? "on" : "off"}`}
            onClick={toggleOnline}
          >
            <div className={`dot ${profile.isOnline ? "on" : "off"}`} />
            {profile.isOnline ? "Online" : "Go Online"}
          </button>

          <div style={{ position: "relative" }}>
            <button
              className="tb-icon-btn"
              onClick={() => setShowNotifPanel((p) => !p)}
            >
              <Bell />
              {unreadCount > 0 && <span className="notif-dot" />}
            </button>

            {showNotifPanel && (
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <span className="notif-panel-title">Notifications</span>
                  <span className="notif-mark-all" onClick={handleReadAll}>
                    Mark all read
                  </span>
                </div>
                {notifs.slice(0, 5).map((n, i) => (
                  <div key={i} className="notif-item">
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        marginTop: 5,
                        background: n.isRead
                          ? "var(--border)"
                          : "var(--primary)",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {n.body}
                      </div>
                    </div>
                  </div>
                ))}
                {notifs.length === 0 && (
                  <div
                    style={{
                      padding: "22px 20px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: 12.5,
                    }}
                  >
                    No notifications yet
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="avatar" onClick={() => setPage("profile")}>
            {initials}
          </div>
        </header>

        <main className="page" key={page}>
          {page === "dashboard" && (
            <DashboardPage
              profile={profile}
              stats={stats}
              activeOrder={activeOrder}
              onPickup={handlePickup}
              onDeliver={handleDeliver}
            />
          )}
          {page === "map" && (
            <MapPage
              profile={profile}
              activeOrder={activeOrder}
              onPickup={handlePickup}
              onDeliver={handleDeliver}
            />
          )}
          {page === "orders" && (
            <OrdersPage
              orders={orders}
              loading={loadingOrders}
              onRefresh={fetchOrders}
            />
          )}
          {page === "notifications" && (
            <NotificationsPage
              notifs={notifs}
              loading={false}
              onAccept={handleNotifAccept}
              onDecline={handleNotifDecline}
              onReadAll={handleReadAll}
            />
          )}
          {page === "earnings" && (
            <EarningsPage stats={stats} orders={orders} />
          )}
          {page === "profile" && (
            <ProfilePage profile={profile} onSave={handleProfileSave} />
          )}
        </main>
      </div>

      {pendingNotif && (
        <IncomingPopup
          notif={pendingNotif}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {showNotifPanel && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setShowNotifPanel(false)}
        />
      )}
    </>
  );
}