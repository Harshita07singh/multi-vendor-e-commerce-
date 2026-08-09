import { useState, useCallback } from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
/**
 * useGPS — Browser Geolocation + Nominatim reverse geocode
 *
 * Returns { locate, loading, error, result, setResult }
 *   result = { address, city, state, pincode, country, coordinates: { lat, lng } }
 */
export function useGPS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const locate = useCallback(() => {
    setError(null);
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(
            `${API_BASE}/locations/reverse-geocode?lat=${lat}&lng=${lng}`,
            { credentials: "include" },
          );
          const json = await res.json();
          if (!json.success) throw new Error(json.message);

          setResult({
            ...json.data,
            coordinates: { lat, lng },
          });
        } catch (e) {
          setError("Could not fetch address. Please enter manually.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        const messages = {
          1: "Location permission denied. Please allow location access.",
          2: "Location unavailable. Please try again.",
          3: "Location request timed out.",
        };
        setError(messages[err.code] || "Unknown location error.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  return { locate, loading, error, result, setResult };
}
