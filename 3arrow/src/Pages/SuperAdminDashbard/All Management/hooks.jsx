import { useState, useEffect, useCallback, useRef } from "react";

export function useDebounce(fn, delay) {
  const t = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(t.current);
      t.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

export function useWindowSize() {
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
