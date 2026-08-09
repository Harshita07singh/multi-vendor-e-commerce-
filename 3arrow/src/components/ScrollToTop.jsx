import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Scroll immediately
    const scrollToTopImmediate = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Scroll the root element (since body is position: fixed in CSS)
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.scrollTop = 0;
      }
    };

    scrollToTopImmediate();

    // Scroll again after a short delay to ensure it works
    const scrollTimer = setTimeout(() => {
      scrollToTopImmediate();
    }, 50);

    // Use requestAnimationFrame for smooth immediate scroll
    const rafId = requestAnimationFrame(() => {
      scrollToTopImmediate();
    });

    return () => {
      clearTimeout(scrollTimer);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return null;
}
