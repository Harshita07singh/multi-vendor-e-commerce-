/**
 * inventoryApi.js
 * Thin fetch wrapper for all /api/inventory endpoints.
 * Mirrors the pattern used in Home.jsx (apiFetch).
 */

const BASE = import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
const ENDPOINT = `${BASE}/api/inventory`;

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
  } else {
    localStorage.setItem("token", newToken);
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
      const res = await fetch(`${BASE}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...(body ? { body } : {}),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      const newToken = data.accessToken || data.token || null;
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

async function req(method, path, body, isFormData = false) {
  let token = getToken();
  if (!token) throw new Error("Not authenticated");

  const makeOpts = (t) => {
    const headers = {
      Authorization: `Bearer ${t}`,
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    };
    const opts = { method, headers, credentials: "include" };
    if (body && !isFormData) opts.body = JSON.stringify(body);
    if (body && isFormData) opts.body = body;
    return opts;
  };

  let res = await fetch(ENDPOINT + path, makeOpts(token));
  let data = await res.json();

  if (
    res.status === 401 &&
    (data?.message === "Relogin" ||
      data?.message === "Not authorized" ||
      data?.message === "jwt expired")
  ) {
    try {
      token = await refreshAccessToken();
      res = await fetch(ENDPOINT + path, makeOpts(token));
      data = await res.json();
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      window.location.href = "/";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const inventoryApi = {
  /** GET /api/inventory/my/summary */
  getSummary: () => req("GET", "/my/summary"),

  /** GET /api/inventory/my?page=&limit=&search=&status=&sortBy=&order= */
  getAll: (params) => req("GET", `/my${buildQuery(params)}`),

  /** GET /api/inventory/my/:id */
  getOne: (id) => req("GET", `/my/${id}`),

  /** POST /api/inventory/my */
  create: (body) => req("POST", "/my", body),

  /** PUT /api/inventory/my/:id */
  update: (id, body) => req("PUT", `/my/${id}`, body),

  /** POST /api/inventory/my/:id/adjust */
  adjust: (id, body) => req("POST", `/my/${id}/adjust`, body),

  /** GET /api/inventory/my/:id/history */
  getHistory: (id) => req("GET", `/my/${id}/history`),

  /** DELETE /api/inventory/my/:id */
  delete: (id) => req("DELETE", `/my/${id}`),

  // ── Admin ──────────────────────────────────────────────────────────────────
  /** GET /api/inventory/admin/all?page=&limit=&vendorId= */
  adminGetAll: (params) => req("GET", `/admin/all${buildQuery(params)}`),
};
