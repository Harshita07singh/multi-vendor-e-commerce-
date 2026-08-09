// ─────────────────────────────────────────────────────────────────────────────
// LiveMap.jsx  —  3Arrow Delivery · 100% FREE Real-Time Map
// Stack: Leaflet.js + OpenStreetMap + OSRM routing + Nominatim geocoding
// NO API KEY REQUIRED — completely free, no billing, no quota
// ─────────────────────────────────────────────────────────────────────────────
//
// DROP-IN for your existing <LiveMap activeOrder={...} /> usage.
//
// INSTALL (one-time):
//   npm install leaflet
//
// USAGE:
//   import LiveMap from "./LiveMap";
//   <LiveMap activeOrder={activeOrder} profile={profile} />
//
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";

// ── Leaflet is loaded from CDN to avoid build config issues with its CSS ──
// If you prefer npm: import L from "leaflet"; import "leaflet/dist/leaflet.css";
// and remove the loadLeaflet() function below.

// ── Constants ────────────────────────────────────────────────────────────────
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371,
    toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function bearingDeg(a, b) {
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180,
    lat2 = (b[0] * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function fmtDist(meters) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}
function fmtDur(seconds) {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

// ── Load Leaflet from CDN (idempotent) ───────────────────────────────────────
function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    // inject CSS
    if (!document.getElementById("lf-css")) {
      const link = document.createElement("link");
      link.id = "lf-css";
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    // inject JS
    if (document.getElementById("lf-js")) {
      document
        .getElementById("lf-js")
        .addEventListener("load", () => resolve(window.L));
      return;
    }
    const script = document.createElement("script");
    script.id = "lf-js";
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ── SVG bike icon (rotates with bearing) ─────────────────────────────────────
function bikeIcon(L, rot = 0) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:52px;height:52px">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          border:2.5px solid #5AB748;
          animation:lm-ping 1.8s ease-out infinite;
          background:rgba(90,183,72,0.08)
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:#1a3a14;
          border:2px solid #5AB748;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;transform:rotate(${rot}deg);
          box-shadow:0 2px 12px rgba(90,183,72,0.35)
        ">🛵</div>
      </div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

function customerIcon(L) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:44px;height:56px">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
          <filter id="ps"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.28)"/></filter>
          <g filter="url(#ps)">
            <path d="M22 2C10.4 2 1 11.4 1 23c0 15 21 32 21 32s21-17 21-32C43 11.4 33.6 2 22 2Z"
                  fill="#ef4444" stroke="white" stroke-width="2"/>
          </g>
          <circle cx="22" cy="23" r="10" fill="white"/>
          <text x="22" y="27" text-anchor="middle" font-size="12">🏠</text>
        </svg>
      </div>`,
    iconSize: [44, 56],
    iconAnchor: [22, 54],
    popupAnchor: [0, -54],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const LiveMap = ({ activeOrder, profile }) => {
  const mapDivRef = useRef(null);
  const LRef = useRef(null); // Leaflet lib ref
  const mapRef = useRef(null); // map instance
  const bikeRef = useRef(null); // bike marker
  const custRef = useRef(null); // customer marker
  const polyRef = useRef(null); // route polyline
  const animRef = useRef(null); // rAF handle
  const prevPos = useRef(null); // [lat,lng] before move
  const targetPos = useRef(null); // [lat,lng] GPS target
  const custPos = useRef(null); // [lat,lng] customer
  const lastRoute = useRef([0, 0]); // last route-fetch origin

  const [ready, setReady] = useState(false);
  const [loadErr, setLoadErr] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { dist, dur, steps[] }
  const [geocoding, setGeocoding] = useState(false);
  const [myLatLng, setMyLatLng] = useState(null);

  // ── 1. Inject CSS ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById("lm-styles")) {
      const s = document.createElement("style");
      s.id = "lm-styles";
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // ── 2. Init map ────────────────────────────────────────────────────────
  useEffect(() => {
    let destroyed = false;
    loadLeaflet()
      .then((L) => {
        if (destroyed || !mapDivRef.current) return;
        LRef.current = L;

        // Fix Leaflet's broken default icon paths when bundled
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapDivRef.current, {
          center: [28.6139, 77.209],
          zoom: 13,
          zoomControl: false,
          attributionControl: true,
        });

        // Green-tinted OSM tiles
        L.tileLayer(TILE_URL, {
          attribution: TILE_ATTR,
          maxZoom: 19,
        }).addTo(map);

        // Custom zoom control (bottom right)
        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapRef.current = map;
        bikeRef.current = L.marker([28.6139, 77.209], {
          icon: bikeIcon(L, 0),
          zIndexOffset: 1000,
        }).addTo(map);
        custRef.current = L.marker([28.6139, 77.209], {
          icon: customerIcon(L),
          zIndexOffset: 900,
        });
        // customer marker NOT added to map until geocoded

        setReady(true);
      })
      .catch(() =>
        setLoadErr("Failed to load Leaflet. Check your internet connection."),
      );

    return () => {
      destroyed = true;
      cancelAnimationFrame(animRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // run once

  // ── 3. Watch GPS ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    if (!navigator.geolocation) return;

    const wid = navigator.geolocation.watchPosition(
      (pos) => {
        const next = [pos.coords.latitude, pos.coords.longitude];
        setMyLatLng(next);
        targetPos.current = next;
        if (prevPos.current) {
          smoothMoveBike(prevPos.current, next);
        } else {
          prevPos.current = next;
          bikeRef.current?.setLatLng(next);
          mapRef.current?.setView(next, 15);
        }
      },
      () => {
        // Fallback to server-stored location
        const cl = profile?.currentLocation;
        if (cl?.lat && cl?.lng) {
          const pos = [cl.lat, cl.lng];
          setMyLatLng(pos);
          targetPos.current = pos;
          prevPos.current = pos;
          bikeRef.current?.setLatLng(pos);
          mapRef.current?.setView(pos, 15);
        }
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(wid);
  }, [ready]); // eslint-disable-line

  // ── 4. Smooth bike movement ────────────────────────────────────────────
  const smoothMoveBike = useCallback((from, to) => {
    const L = LRef.current;
    if (!L || !bikeRef.current) return;
    const rot = bearingDeg(from, to);
    const t0 = performance.now();
    const dur = 900;

    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const pos = lerp(from, to, t);
      bikeRef.current.setLatLng(pos);
      bikeRef.current.setIcon(bikeIcon(L, rot));
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        prevPos.current = to;
      }
    };
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
  }, []);

  // ── 5. Geocode customer address ────────────────────────────────────────
  useEffect(() => {
    if (!ready || !activeOrder) return;
    const addr = activeOrder.shippingAddress;
    const q = [addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.pincode]
      .filter(Boolean)
      .join(", ");
    if (!q) return;

    setGeocoding(true);
    const url = `${NOMINATIM}?format=json&q=${encodeURIComponent(q + ", India")}&limit=1`;

    fetch(url, { headers: { "Accept-Language": "en" } })
      .then((r) => r.json())
      .then((data) => {
        setGeocoding(false);
        if (!data?.length) return;
        const { lat, lon } = data[0];
        const cPos = [parseFloat(lat), parseFloat(lon)];
        custPos.current = cPos;

        const L = LRef.current;
        const map = mapRef.current;
        if (!L || !map) return;

        custRef.current?.setLatLng(cPos);
        if (!map.hasLayer(custRef.current)) custRef.current?.addTo(map);

        custRef.current?.bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;min-width:160px">
            <div style="font-weight:700;color:#1a3a14;margin-bottom:3px">🏠 Customer</div>
            <div style="font-size:12px;color:#5a7a55">${addr?.city || ""}</div>
            <div style="font-size:11px;color:#888;margin-top:2px">${q}</div>
          </div>`,
        );

        // Fit both markers
        if (targetPos.current) {
          const bounds = L.latLngBounds([targetPos.current, cPos]);
          map.fitBounds(bounds, { padding: [60, 60] });
          fetchRoute(targetPos.current, cPos);
        } else {
          map.setView(cPos, 14);
        }
      })
      .catch(() => setGeocoding(false));
  }, [ready, activeOrder]); // eslint-disable-line

  // ── 6. Re-fetch route when partner moves ~200m ─────────────────────────
  useEffect(() => {
    if (!myLatLng || !custPos.current || !ready) return;
    const moved =
      haversineKm(
        myLatLng[0],
        myLatLng[1],
        lastRoute.current[0],
        lastRoute.current[1],
      ) * 1000;
    if (moved < 200) return;
    lastRoute.current = myLatLng;
    fetchRoute(myLatLng, custPos.current);
  }, [myLatLng, ready]); // eslint-disable-line

  // ── OSRM route fetch ───────────────────────────────────────────────────
  function fetchRoute(origin, destination) {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const url = `${OSRM_BASE}/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true&annotations=false`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.code !== "Ok" || !data.routes?.length)
          throw new Error("No route");

        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);
        const leg = route.legs[0];
        const distance = route.distance; // meters
        const duration = route.duration; // seconds

        // Draw / update polyline
        if (polyRef.current) map.removeLayer(polyRef.current);
        polyRef.current = L.polyline(coords, {
          color: "#5AB748",
          weight: 5,
          opacity: 0.88,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        // Extract steps
        const steps = (leg.steps || []).slice(0, 8).map((s) => ({
          text: s.maneuver?.instruction || s.name || "Continue",
          dist: fmtDist(s.distance),
          type: s.maneuver?.type || "turn",
        }));

        setRouteInfo({ dist: fmtDist(distance), dur: fmtDur(duration), steps });
      })
      .catch(() => {
        // Fallback: straight line
        if (!L || !mapRef.current) return;
        if (polyRef.current) mapRef.current.removeLayer(polyRef.current);
        polyRef.current = L.polyline([origin, destination], {
          color: "#5AB748",
          weight: 4,
          opacity: 0.6,
          dashArray: "10 8",
        }).addTo(mapRef.current);

        const dist = haversineKm(
          origin[0],
          origin[1],
          destination[0],
          destination[1],
        );
        setRouteInfo({
          dist: `~${dist.toFixed(1)} km`,
          dur: `~${Math.round(dist * 3)} min`,
          steps: [],
        });
      });
  }

  // ── Recenter on bike ──────────────────────────────────────────────────
  function recenter() {
    const pos = targetPos.current;
    if (pos && mapRef.current) mapRef.current.flyTo(pos, 16, { duration: 1 });
  }

  // ── Fit full route ────────────────────────────────────────────────────
  function fitRoute() {
    const L = LRef.current,
      map = mapRef.current;
    if (!L || !map || !targetPos.current || !custPos.current) return;
    map.fitBounds(L.latLngBounds([targetPos.current, custPos.current]), {
      padding: [60, 60],
    });
  }

  // ── Maneuver icon ─────────────────────────────────────────────────────
  function stepIcon(type) {
    const m = {
      turn: "↱",
      "new name": "→",
      depart: "🚀",
      arrive: "🏁",
      merge: "⇉",
      roundabout: "↻",
      rotary: "↻",
      fork: "⑂",
      continue: "↑",
      "end of road": "⊥",
    };
    return m[type] || "→";
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="lm-root">
      {/* ── Map ── */}
      <div className="lm-map-wrap">
        <div ref={mapDivRef} className="lm-map" />

        {/* Live badge */}
        {ready && (
          <div className="lm-live-badge">
            <div className="lm-live-dot" /> LIVE · OSM
          </div>
        )}

        {/* Loading overlay */}
        {(!ready || geocoding) && !loadErr && (
          <div className="lm-overlay">
            <div className="lm-spinner" />
            <span className="lm-overlay-txt">
              {!ready ? "Loading map…" : "Locating customer…"}
            </span>
          </div>
        )}

        {/* Error */}
        {loadErr && (
          <div className="lm-overlay lm-overlay-err">
            <span style={{ fontSize: 32 }}>⚠️</span>
            <span
              className="lm-overlay-txt"
              style={{ color: "#ef4444", textAlign: "center" }}
            >
              {loadErr}
            </span>
          </div>
        )}

        {/* No order */}
        {ready && !activeOrder && !loadErr && (
          <div className="lm-overlay">
            <span style={{ fontSize: 44 }}>🗺️</span>
            <span style={{ fontWeight: 700, color: "#3d6b32", fontSize: 15 }}>
              No Active Delivery
            </span>
            <span style={{ color: "#6b9960", fontSize: 12 }}>
              Accept an order to see your route
            </span>
          </div>
        )}

        {/* Map action buttons */}
        {ready && (
          <div className="lm-btn-group">
            <button className="lm-fab" onClick={recenter} title="Center on me">
              🎯
            </button>
            {custPos.current && (
              <button
                className="lm-fab"
                onClick={fitRoute}
                title="Fit full route"
              >
                ↔
              </button>
            )}
          </div>
        )}

        {/* OSM attribution override (smaller) */}
        <div className="lm-attr-fix" />
      </div>

      {/* ── Stats strip ── */}
      {activeOrder && (
        <div className="lm-strip">
          <div className="lm-chip lm-chip-accent">
            <div className="lm-chip-lbl">Distance</div>
            <div className="lm-chip-val">{routeInfo?.dist || "—"}</div>
            <div className="lm-chip-sub">via road</div>
          </div>
          <div className="lm-chip">
            <div className="lm-chip-lbl">ETA</div>
            <div className="lm-chip-val">{routeInfo?.dur || "—"}</div>
            <div className="lm-chip-sub">estimated</div>
          </div>
          <div className="lm-chip">
            <div className="lm-chip-lbl">Deliver To</div>
            <div
              className="lm-chip-val"
              style={{ fontSize: 14, marginTop: 2, lineHeight: 1.2 }}
            >
              {activeOrder.shippingAddress?.city || "Customer"}
            </div>
            <div
              className="lm-chip-sub"
              style={{
                fontSize: 10,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeOrder.shippingAddress?.pincode || "—"}
            </div>
          </div>
          <div className="lm-chip">
            <div className="lm-chip-lbl">Earning</div>
            <div className="lm-chip-val">
              ₹{activeOrder.deliveryEarning || 40}
            </div>
            <div className="lm-chip-sub">this delivery</div>
          </div>
        </div>
      )}

      {/* ── Turn-by-turn ── */}
      {routeInfo?.steps?.length > 0 && (
        <div className="lm-steps">
          <div className="lm-steps-hdr">
            <span>🗺️</span> Turn-by-turn Directions
          </div>
          {routeInfo.steps.map((s, i) => (
            <div key={i} className={`lm-step${i === 0 ? " lm-step-now" : ""}`}>
              <div className="lm-step-ic">{stepIcon(s.type)}</div>
              <div className="lm-step-body">
                <div className="lm-step-txt">{s.text}</div>
                <div className="lm-step-dist">{s.dist}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMap;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

/* ── Ping animation ── */
@keyframes lm-ping {
  0%   { transform: scale(1);   opacity: .6; }
  70%  { transform: scale(1.8); opacity: 0;  }
  100% { transform: scale(1.8); opacity: 0;  }
}
@keyframes lm-spin { to { transform: rotate(360deg); } }
@keyframes lm-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(.65); }
}
@keyframes lm-fadeup {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0);    }
}

.lm-root {
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: lm-fadeup .35s ease both;
}

/* ── Map wrapper ── */
.lm-map-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 36px rgba(30,62,24,0.18), 0 2px 8px rgba(30,62,24,0.1);
  border: 2px solid rgba(90,183,72,0.28);
  background: #e2f0de;
}
@media (max-width: 600px) { .lm-map-wrap { height: 290px; } }

.lm-map { width: 100%; height: 100%; }

/* Fix Leaflet attribution overlap */
.lm-attr-fix + .leaflet-control-attribution {
  font-size: 9px !important;
  background: rgba(255,255,255,0.6) !important;
  backdrop-filter: blur(4px);
  border-radius: 6px 0 0 0 !important;
}

/* ── Live badge ── */
.lm-live-badge {
  position: absolute;
  top: 12px; left: 12px;
  background: rgba(26,58,20,0.88);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(90,183,72,0.45);
  border-radius: 100px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #7ee869;
  letter-spacing: .07em;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 1000;
  pointer-events: none;
}
.lm-live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #5AB748;
  animation: lm-pulse 1.4s ease infinite;
}

/* ── Overlay (loading / error / empty) ── */
.lm-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px;
  background: rgba(226,240,222,0.82);
  backdrop-filter: blur(6px);
  z-index: 900;
}
.lm-overlay-err { background: rgba(255,240,240,0.9); }
.lm-overlay-txt { font-size: 13px; font-weight: 600; color: #3d6b32; }

.lm-spinner {
  width: 40px; height: 40px;
  border: 3.5px solid rgba(90,183,72,0.18);
  border-top-color: #5AB748;
  border-radius: 50%;
  animation: lm-spin .75s linear infinite;
}

/* ── FAB buttons ── */
.lm-btn-group {
  position: absolute;
  bottom: 54px; right: 12px;
  display: flex; flex-direction: column; gap: 8px;
  z-index: 1000;
}
.lm-fab {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.18);
  cursor: pointer;
  font-size: 17px;
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s, box-shadow .15s;
}
.lm-fab:hover { transform: scale(1.12); box-shadow: 0 4px 16px rgba(0,0,0,0.22); }
.lm-fab:active { transform: scale(.95); }

/* ── Stats strip ── */
.lm-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 500px) {
  .lm-strip { grid-template-columns: repeat(2, 1fr); }
}

.lm-chip {
  background: rgba(255,255,255,0.84);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(90,183,72,0.22);
  border-radius: 16px;
  padding: 13px 15px;
  display: flex; flex-direction: column; gap: 3px;
  box-shadow: 0 2px 8px rgba(30,62,24,0.07);
  transition: border-color .2s, transform .2s;
}
.lm-chip:hover { border-color: rgba(90,183,72,0.5); transform: translateY(-1px); }
.lm-chip-accent {
  background: linear-gradient(135deg,#1a3a14 0%,#2d6624 100%);
  border-color: #5AB748;
  box-shadow: 0 4px 16px rgba(90,183,72,0.2);
}
.lm-chip-lbl {
  font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .12em;
  color: #6b9960;
}
.lm-chip-accent .lm-chip-lbl { color: rgba(255,255,255,0.55); }
.lm-chip-val {
  font-family: 'Syne', sans-serif;
  font-size: 20px; font-weight: 800;
  color: #1a3a14; line-height: 1;
}
.lm-chip-accent .lm-chip-val { color: #7ee869; }
.lm-chip-sub { font-size: 11px; color: #6b9960; font-weight: 500; }
.lm-chip-accent .lm-chip-sub { color: rgba(255,255,255,0.45); }

/* ── Turn-by-turn panel ── */
.lm-steps {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(90,183,72,0.2);
  border-radius: 18px;
  padding: 16px 18px;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(90,183,72,0.25) transparent;
}
.lm-steps-hdr {
  font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .12em;
  color: #3d6b32;
  margin-bottom: 12px;
  display: flex; align-items: center; gap: 7px;
}
.lm-step {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 7px 0;
  border-bottom: 1px solid rgba(90,183,72,0.1);
}
.lm-step:last-child { border-bottom: none; }
.lm-step-now .lm-step-ic {
  background: rgba(245,158,11,0.15);
  color: #f59e0b;
  border-color: rgba(245,158,11,0.4);
}
.lm-step-ic {
  width: 28px; height: 28px; flex-shrink: 0;
  border-radius: 8px;
  background: rgba(90,183,72,0.1);
  border: 1.5px solid rgba(90,183,72,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #3d6b32;
}
.lm-step-body { flex: 1; min-width: 0; }
.lm-step-txt {
  font-size: 12.5px; font-weight: 600; color: #2d4a28;
  line-height: 1.4;
}
.lm-step-dist {
  font-size: 11px; color: #6b9960; font-weight: 500; margin-top: 2px;
}
`;
