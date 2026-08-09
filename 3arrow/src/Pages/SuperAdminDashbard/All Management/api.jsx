import { BASE_URL } from "../All Management/constrants";

export function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

export async function apiFetch(method, path, body) {
  const token = getToken();
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}
