import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingCart,
  Heart,
  Menu,
  Search,
  MapPin,
  ChevronDown,
  User,
  HelpCircle,
  X,
  LogOut,
  UserCircle,
  Settings,
  Coffee,
  Home,
  Smartphone,
  Sparkles,
  Shirt,
  Gamepad2,
  Leaf,
  Package,
  Navigation,
  Plus,
  Briefcase,
  Tag,
  Loader2,
  Star,
  Grid,
  Layers,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { buildImageUrl } from "../../config/apiConfig";
import Logo from "../../assets/3Arrow.png";
import WhiteLogo from "../../assets/3ArrowWhite.png";
import { getCategories } from "../../redux/categorySlice";
import { fetchCurrentUser, logoutUser } from "../../redux/authSlice";
import {
  fetchLocations,
  setActiveLocation,
  setDefaultLocation,
} from "../../redux/Locationslice";
import { useGPS } from "../../hooks/Usegps";
import LocationModal from "../Locationmodal";
import Swal from "sweetalert2";

const CATEGORY_ICONS = {
  cafe: Coffee,
  home: Home,
  toys: Gamepad2,
  fresh: Leaf,
  electronics: Smartphone,
  beauty: Sparkles,
  fashion: Shirt,
  default: Package,
};

function getCategoryIcon(name = "") {
  const key = name.toLowerCase();
  for (const [k, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return CATEGORY_ICONS.default;
}

const LABEL_ICON = { home: Home, work: Briefcase, other: Tag };

// ─── Debounce utility ─────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Search result highlight ──────────────────────────────────────────────────
function Highlight({ text = "", query = "" }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              background: "#fff3b0",
              color: "#1a1a1a",
              borderRadius: 2,
              padding: "0 1px",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// ─── Search Dropdown Component ────────────────────────────────────────────────
function SearchDropdown({ results, loading, query, onSelect, onViewAll }) {
  const hasResults =
    results &&
    (results.categories?.length > 0 ||
      results.subCategories?.length > 0 ||
      results.products?.length > 0);

  if (!query || query.length < 2) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        right: 0,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 16px 48px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.06)",
        border: "1px solid #eee",
        zIndex: 300,
        overflow: "hidden",
        animation: "srchSlide .15s ease",
        maxHeight: 520,
        overflowY: "auto",
      }}
    >
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            color: "#aaa",
            fontSize: 13,
          }}
        >
          <Loader2
            size={15}
            style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
          />
          Searching…
        </div>
      )}

      {!loading && !hasResults && (
        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <Search size={28} color="#ddd" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: "#999", margin: 0 }}>
            No results for "{query}"
          </p>
          <p style={{ fontSize: 12, color: "#bbb", margin: "4px 0 0" }}>
            Try different keywords
          </p>
        </div>
      )}

      {!loading && hasResults && (
        <>
          {/* Did-you-mean */}
          {results.suggestion &&
            results.suggestion.toLowerCase() !== query.toLowerCase() && (
              <div
                style={{
                  padding: "8px 16px",
                  background: "#fffbe6",
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: 13,
                  color: "#666",
                }}
              >
                Did you mean:{" "}
                <button
                  onClick={() => onSelect(results.suggestion)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5CB74B",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {results.suggestion}
                </button>
              </div>
            )}

          {/* Categories */}
          {results.categories?.length > 0 && (
            <div>
              <div
                style={{
                  padding: "8px 16px 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Grid size={11} /> Categories
              </div>
              {results.categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                return (
                  <Link
                    key={cat._id}
                    to={cat.url}
                    onClick={onViewAll}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="srch-item">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "#f0faf0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {cat.image ? (
                          <img
                            src={buildImageUrl(cat.image)}
                            alt={cat.name}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Icon size={17} color="#5CB74B" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#1a1a1a",
                            fontWeight: 500,
                          }}
                        >
                          <Highlight text={cat.name} query={query} />
                        </div>
                        {cat.description && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#aaa",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cat.description}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#5CB74B",
                          background: "#f0faf0",
                          borderRadius: 6,
                          padding: "2px 8px",
                          flexShrink: 0,
                        }}
                      >
                        Category
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* SubCategories */}
          {results.subCategories?.length > 0 && (
            <div
              style={{
                borderTop:
                  results.categories?.length > 0 ? "1px solid #f5f5f5" : "none",
              }}
            >
              <div
                style={{
                  padding: "8px 16px 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Layers size={11} /> Sub-Categories
              </div>
              {results.subCategories.map((sub) => (
                <Link
                  key={sub._id}
                  to={sub.url}
                  onClick={onViewAll}
                  style={{ textDecoration: "none" }}
                >
                  <div className="srch-item">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {sub.image ? (
                        <img
                          src={buildImageUrl(sub.image)}
                          alt={sub.name}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Layers size={16} color="#888" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1a1a1a",
                          fontWeight: 500,
                        }}
                      >
                        <Highlight text={sub.name} query={query} />
                      </div>
                      {sub.categoryName && (
                        <div style={{ fontSize: 12, color: "#aaa" }}>
                          in {sub.categoryName}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#888",
                        background: "#f5f5f5",
                        borderRadius: 6,
                        padding: "2px 8px",
                        flexShrink: 0,
                      }}
                    >
                      Sub-category
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Products */}
          {results.products?.length > 0 && (
            <div style={{ borderTop: "1px solid #f5f5f5" }}>
              <div
                style={{
                  padding: "8px 16px 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <TrendingUp size={11} /> Products
              </div>
              {results.products.map((prod) => (
                <Link
                  key={prod._id}
                  to={prod.url}
                  onClick={onViewAll}
                  style={{ textDecoration: "none" }}
                >
                  <div className="srch-item">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "#f8f8f8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      {prod.images?.[0]?.url ? (
                        <img
                          src={buildImageUrl(prod.images[0].url)}
                          alt={prod.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Package size={17} color="#ccc" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1a1a1a",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Highlight text={prod.name} query={query} />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 2,
                        }}
                      >
                        {prod.price != null && (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#5CB74B",
                            }}
                          >
                            ₹{prod.price.toLocaleString("en-IN")}
                          </span>
                        )}
                        {prod.mrp != null && prod.mrp > prod.price && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#bbb",
                              textDecoration: "line-through",
                            }}
                          >
                            ₹{prod.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                        {prod.discount > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#e84040",
                              fontWeight: 600,
                            }}
                          >
                            {Math.round(prod.discount)}% off
                          </span>
                        )}
                        {prod.ratingsAverage > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#f59e0b",
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Star size={10} fill="#f59e0b" />{" "}
                            {prod.ratingsAverage.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View all results */}
          <div style={{ borderTop: "1px solid #f0f0f0" }}>
            <button
              onClick={() => onViewAll(query)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: "#5CB74B",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "background .12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0faf0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              View all results for "{query}" <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const dropdownTimeout = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_VENDOR_URL;
  const CUSTOMER_API = import.meta.env.VITE_API_BASE_URL_UB || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Selectors ──────────────────────────────────────────────────
  const totalQuantity = useSelector((s) => s.cart?.totalQuantity || 0);
  const wishlistItems = useSelector((s) => s.wishlist?.wishlistItems || []);
  const { categories = [] } = useSelector((s) => s.categories);
  const { user, isLoggedIn } = useSelector((s) => s.auth);
  const { locations = [], activeLocation = null } = useSelector(
    (s) => s.location ?? {},
  );

  // ── GPS hook ────────────────────────────────────────────────────
  const {
    locate: gpsLocate,
    loading: gpsLoading,
    error: gpsError,
    result: gpsResult,
  } = useGPS();

  // ── Local state ─────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState("All");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationModal, setLocationModal] = useState(false);

  // ── Search state ─────────────────────────────────────────────────
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchResults, setMobileSearchResults] = useState(null);
  const [mobileSearchLoading, setMobileSearchLoading] = useState(false);
  const [showMobileSearchDropdown, setShowMobileSearchDropdown] =
    useState(false);

  const debouncedQuery = useDebounce(searchQuery, 320);

  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const locationRef = useRef(null);
  const accountRef = useRef(null);

  // ── Effects ─────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (isLoggedIn && user) {
      dispatch(fetchLocations());
    }
  }, [dispatch, isLoggedIn, user]);

  useEffect(() => {
    if (activeLocation) return;
    const timer = setTimeout(() => {
      gpsLocate();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("gpsAsked")) return;
    if (activeLocation) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem("gpsAsked", "true");
      gpsLocate();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!gpsResult) return;
    if (!isLoggedIn || locations.length === 0) {
      dispatch(
        setActiveLocation({
          coordinates: gpsResult.coordinates,
          address: gpsResult.address,
          city: gpsResult.city,
          _id: "gps-temp",
        }),
      );
    }
    if (locations.length > 0) return;
    if (sessionStorage.getItem("locationModalShown")) return;
    sessionStorage.setItem("locationModalShown", "true");
    setShowLocationDropdown(false);
    setShowMobileMenu(false);
    setLocationModal(true);
  }, [gpsResult]);

  useEffect(() => {
    const fn = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target))
        setShowLocationDropdown(false);
      if (accountRef.current && !accountRef.current.contains(e.target))
        setShowAccountDropdown(false);
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      )
        setShowSearchDropdown(false);
      if (
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(e.target)
      )
        setShowMobileSearchDropdown(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileMenu]);

  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    };
  }, []);

  // ── Search effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      setMobileSearchResults(null);
      setShowMobileSearchDropdown(false);
      return;
    }
    doSearch(debouncedQuery);
  }, [debouncedQuery]);

  async function doSearch(q) {
    setSearchLoading(true);
    setMobileSearchLoading(true);
    setShowSearchDropdown(true);
    setShowMobileSearchDropdown(true);

    try {
      const res = await fetch(
        `${CUSTOMER_API}/api/search?q=${encodeURIComponent(q)}&size=5`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data);
      setMobileSearchResults(data);
    } catch (err) {
      console.error("[Search]", err.message);
      setSearchResults({
        categories: [],
        subCategories: [],
        products: [],
        total: 0,
      });
      setMobileSearchResults({
        categories: [],
        subCategories: [],
        products: [],
        total: 0,
      });
    } finally {
      setSearchLoading(false);
      setMobileSearchLoading(false);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setShowAccountDropdown(true);
  };
  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(
      () => setShowAccountDropdown(false),
      300,
    );
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#5CB74B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
    });
    if (result.isConfirmed) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (e) {}
      dispatch(logoutUser());
      setShowAccountDropdown(false);
      setShowMobileMenu(false);
      navigate("/login");
    }
  };

  const handleGpsClick = () => {
    gpsLocate();
    setShowLocationDropdown(false);
    setShowMobileMenu(false);
  };

  const handleSearchClose = useCallback(() => {
    setSearchQuery("");
    setSearchResults(null);
    setShowSearchDropdown(false);
    setMobileSearchResults(null);
    setShowMobileSearchDropdown(false);
  }, []);

  const handleViewAll = useCallback(
    (q) => {
      const query = typeof q === "string" ? q : searchQuery;
      handleSearchClose();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    },
    [searchQuery, navigate, handleSearchClose],
  );

  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchQuery(suggestion);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleViewAll(searchQuery);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const getLocationLabel = (loc) =>
    loc?.label === "other" && loc?.customLabel ? loc.customLabel : loc?.label;

  const getLocationDisplay = (loc) =>
    loc ? loc.city || loc.address?.split(",")[0] || "Location" : "Set Location";

  const Bdg = ({ n }) =>
    n > 0 ? (
      <span
        style={{
          position: "absolute",
          top: -5,
          right: -5,
          background: "#5CB74B",
          color: "#fff",
          fontSize: 9,
          fontWeight: 700,
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 3px",
        }}
      >
        {n}
      </span>
    ) : null;

  return (
    <>
      <style>{`
        .znav * { box-sizing: border-box; }
        .hs { scrollbar-width: none; -ms-overflow-style: none; }
        .hs::-webkit-scrollbar { display: none; }
        .ctab { display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 16px; cursor:pointer; white-space:nowrap; font-size:13px; font-weight:500; color:#444; border-bottom:2px solid transparent; transition:color .15s,border-color .15s; flex-shrink:0; }
        .ctab:hover { color:#5CB74B; }
        .ctab.on { color:#5CB74B; border-bottom-color:#5CB74B; font-weight:600; }
        .dsrch { display:flex; align-items:center; background:#f5f5f5; border:1.5px solid #e8e8e8; border-radius:8px; padding:0 14px; gap:10px; flex:1; min-width:0; transition:border-color .2s,box-shadow .2s; }
        .dsrch:focus-within { border-color:#5CB74B; box-shadow:0 0 0 3px rgba(92,183,75,.12); background:#fff; }
        .dsrch input { flex:1; min-width:0; border:none; outline:none; background:transparent; font-size:14px; color:#1a1a1a; padding:11px 0; }
        .dsrch input::placeholder { color:#aaa; }
        .ibtn { display:flex; align-items:center; gap:6px; padding:8px 10px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:500; color:#333; transition:background .15s; border:none; background:transparent; flex-shrink:0; }
        .ibtn:hover { background:#f0faf0; color:#5CB74B; }
        .lbtn { display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:8px; border:none; background:transparent; cursor:pointer; flex-shrink:0; transition:background .15s; }
        .lbtn:hover { background:#f0faf0; }
        .dd { position:absolute; top:calc(100% + 8px); background:#fff; border:1px solid #e8e8e8; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,.12); z-index:200; overflow:hidden; animation:sd .15s ease; }
        .ddi { display:flex; align-items:center; gap:10px; padding:10px 16px; font-size:14px; color:#333; cursor:pointer; transition:background .12s; white-space:nowrap; text-decoration:none; }
        .ddi:hover { background:#f0faf0; color:#5CB74B; }
        .ddi.al { background:#5CB74B; color:#fff; }
        .ddi.al:hover { background:#4aa33a; }
        @keyframes sd { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes srchSlide { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        .mpromo { background:#5CB74B; padding:7px 14px; display:flex; justify-content:space-between; align-items:center; gap:8px; }
        .mpromo-l { display:flex; align-items:center; gap:8px; overflow-x:auto; flex:1; min-width:0; }
        .mpromo-l::-webkit-scrollbar { display:none; }
        .mpromo a,.mpromo span,.mpromo-l span,.mpromo-l a { color:#fff; font-size:11px; text-decoration:none; white-space:nowrap; }
        .mhdr { background:#fff; border-bottom:1px solid #f0f0f0; padding:10px 14px; display:flex; align-items:center; gap:8px; }
        .msrch { display:flex; align-items:center; background:#f5f5f5; border:1.5px solid #e8e8e8; border-radius:8px; padding:0 12px; gap:8px; flex:1; min-width:0; }
        .msrch:focus-within { border-color:#5CB74B; background:#fff; }
        .msrch input { flex:1; min-width:0; border:none; outline:none; background:transparent; font-size:13px; color:#1a1a1a; padding:9px 0; }
        .msrch input::placeholder { color:#aaa; }
        .micn { position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:8px; border:none; background:transparent; cursor:pointer; color:#333; flex-shrink:0; }
        .micn:active { background:#f0faf0; }
        .mbdg { position:absolute; top:1px; right:1px; background:#5CB74B; color:#fff; font-size:9px; font-weight:700; min-width:15px; height:15px; border-radius:8px; display:flex; align-items:center; justify-content:center; padding:0 2px; }
        .mcat { background:#fff; border-bottom:1px solid #f0f0f0; display:flex; overflow-x:auto; gap:2px; padding:4px 10px; }
        .mcat::-webkit-scrollbar { display:none; }
        .mchip { display:flex; flex-direction:column; align-items:center; gap:3px; padding:5px 10px; border-radius:8px; border:none; cursor:pointer; white-space:nowrap; flex-shrink:0; font-size:11px; color:#555; background:transparent; transition:all .15s; }
        .mchip.on { background:#f0faf0; color:#5CB74B; font-weight:600; }
        .ovl { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:60; }
        .sbar { position:fixed; top:0; left:0; height:100%; width:min(300px,85vw); background:#fff; z-index:70; overflow-y:auto; box-shadow:4px 0 24px rgba(0,0,0,.12); display:flex; flex-direction:column; }
        .sbar-hd { background:#5CB74B; padding:16px; display:flex; align-items:center; justify-content:space-between; }
        .sl { display:flex; align-items:center; gap:12px; padding:11px 16px; font-size:14px; color:#333; font-weight:500; text-decoration:none; border-radius:8px; cursor:pointer; transition:background .12s; }
        .sl:hover { background:#f0faf0; color:#5CB74B; }
        .loc-item { display:flex; align-items:center; gap:10px; padding:10px 16px; font-size:13px; color:#333; cursor:pointer; transition:background .12s; }
        .loc-item:hover { background:#f0faf0; }
        .loc-item.active-loc { background:#f0faf0; color:#5CB74B; }
        .gps-btn { width:100%; display:flex; align-items:center; gap:8px; padding:10px 14px; border:none; background:transparent; cursor:pointer; color:#5CB74B; font-weight:600; font-size:13px; transition:background .12s; }
        .gps-btn:hover { background:#f0faf0; }
        .gps-btn:disabled { opacity:.6; cursor:not-allowed; }
        .add-loc-btn { width:100%; display:flex; align-items:center; justifyContent:center; gap:6px; padding:10px 14px; border:none; background:#f6fff4; color:#5CB74B; font-weight:600; font-size:13px; cursor:pointer; transition:background .12s; border-top:1px solid #f0f0f0; }
        .add-loc-btn:hover { background:#e8f5e4; }
        .srch-item { display:flex; align-items:center; gap:12px; padding:10px 16px; cursor:pointer; transition:background .12s; text-decoration:none; }
        .srch-item:hover { background:#f8fffe; }
        .srch-clear { background:none; border:none; cursor:pointer; color:#bbb; padding:4px; display:flex; align-items:center; justify-content:center; transition:color .12s; border-radius:4px; }
        .srch-clear:hover { color:#999; background:#f5f5f5; }
        @media (max-width:767px) { .dsk { display:none !important; } }
        @media (min-width:768px) { .mob { display:none !important; } }
      `}</style>

      <div className="znav">
        {/* ═══ STICKY WRAPPER ═══ */}
        <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
          {/* ── DESKTOP: green promo bar ── */}
          <div className="dsk" style={{ background: "#5CB74B" }}>
            <div
              style={{
                maxWidth: 1600,
                margin: "0 auto",
                padding: "9px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#fff",
                  fontSize: 13,
                }}
              >
                <a
                  href={API_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#fff", textDecoration: "none" }}
                >
                  Become A Seller
                </a>
                <a href="/" style={{ color: "#fff", textDecoration: "none" }}>
                  Home
                </a>
                <a
                  href="/contact"
                  style={{ color: "#fff", textDecoration: "none" }}
                >
                  Contact us
                </a>
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#fff",
                  fontSize: 13,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setShowHelpDropdown(true)}
                onMouseLeave={() => setShowHelpDropdown(false)}
              >
                <HelpCircle size={14} />
                <span>Help Center</span>
                <ChevronDown size={14} />
                {showHelpDropdown && (
                  <div className="dd" style={{ right: 0, width: 180 }}>
                    <div className="ddi">📞 Call Center</div>
                    <div className="ddi">💬 Live Chat</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── MOBILE: green promo bar ── */}
          <div className="mob mpromo">
            <div className="mpromo-l">
              <a href={API_BASE_URL} target="_blank" rel="noopener noreferrer">
                Become A Seller
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <span>Free Delivery</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span>Returns Policy</span>
            </div>
            {isLoggedIn && user ? (
              <button
                onClick={() => setShowMobileMenu(true)}
                style={{
                  background: "rgba(255,255,255,.18)",
                  border: "none",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 8px",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span
                  style={{
                    maxWidth: 60,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name?.split(" ")[0]}
                </span>
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link
                  to="/login"
                  style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}
                >
                  Login
                </Link>
                <span style={{ color: "rgba(255,255,255,.4)" }}>|</span>
                <Link
                  to="/register"
                  style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* ── DESKTOP: white main header ── */}
          <div
            className="dsk"
            style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}
          >
            <div
              style={{
                maxWidth: 1400,
                margin: "0 auto",
                padding: "12px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Link to="/" style={{ flexShrink: 0, marginRight: 8 }}>
                <img
                  src={Logo}
                  alt="Logo"
                  style={{ height: 48, width: "auto", objectFit: "contain" }}
                />
              </Link>

              {/* ── DESKTOP LOCATION DROPDOWN ── */}
              <div
                ref={locationRef}
                style={{ position: "relative", flexShrink: 0 }}
              >
                <button
                  className="lbtn"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                >
                  <MapPin size={18} color="#5CB74B" />
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{ fontSize: 11, color: "#999", lineHeight: 1.2 }}
                    >
                      Deliver to
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a1a1a",
                          maxWidth: 130,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getLocationDisplay(activeLocation)}
                      </span>
                      <ChevronDown size={12} color="#666" />
                    </div>
                  </div>
                </button>

                {showLocationDropdown && (
                  <div
                    className="dd"
                    style={{
                      left: 0,
                      width: 280,
                      maxHeight: 340,
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <button
                        className="gps-btn"
                        style={{
                          borderRadius: 8,
                          border: "1.5px solid #5CB74B",
                          background: "#f6fff4",
                          justifyContent: "center",
                          padding: "9px 12px",
                        }}
                        onClick={handleGpsClick}
                        disabled={gpsLoading}
                      >
                        {gpsLoading ? (
                          <Loader2
                            size={15}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                        ) : (
                          <Navigation size={15} />
                        )}
                        {gpsLoading
                          ? "Detecting location…"
                          : "Use current location"}
                      </button>
                      {gpsError && (
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 11,
                            color: "#e53e3e",
                          }}
                        >
                          {gpsError}
                        </p>
                      )}
                    </div>

                    {locations.length > 0 ? (
                      <div>
                        <p
                          style={{
                            margin: 0,
                            padding: "8px 16px 4px",
                            fontSize: 11,
                            color: "#aaa",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".05em",
                          }}
                        >
                          Saved Addresses
                        </p>
                        {locations.map((loc) => {
                          const LIcon = LABEL_ICON[loc.label] || Tag;
                          const isActive = activeLocation?._id === loc._id;
                          return (
                            <div
                              key={loc._id}
                              className={`loc-item ${isActive ? "active-loc" : ""}`}
                              onClick={() => {
                                dispatch(setActiveLocation(loc));
                                setShowLocationDropdown(false);
                              }}
                            >
                              <LIcon
                                size={15}
                                color={isActive ? "#5CB74B" : "#999"}
                                style={{ flexShrink: 0 }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    textTransform: "capitalize",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  {getLocationLabel(loc)}
                                  {loc.isDefault && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        color: "#5CB74B",
                                        background: "#f0faf0",
                                        padding: "1px 6px",
                                        borderRadius: 10,
                                        border: "1px solid #c8edc1",
                                      }}
                                    >
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#999",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {loc.city
                                    ? `${loc.city}${loc.state ? ", " + loc.state : ""}`
                                    : loc.address}
                                </div>
                              </div>
                              {isActive && (
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#5CB74B",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "14px 16px",
                          fontSize: 13,
                          color: "#aaa",
                          textAlign: "center",
                        }}
                      >
                        No saved addresses yet
                      </div>
                    )}

                    <button
                      className="add-loc-btn"
                      onClick={() => {
                        setLocationModal(true);
                        setShowLocationDropdown(false);
                      }}
                    >
                      <Plus size={15} /> Add New Address
                    </button>
                  </div>
                )}
              </div>

              {/* ── DESKTOP SEARCH ── */}
              <div
                ref={searchContainerRef}
                style={{ position: "relative", flex: 1, minWidth: 0 }}
              >
                <div className="dsrch">
                  <Search size={17} color="#aaa" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search products, categories, brands…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults && searchQuery.length >= 2)
                        setShowSearchDropdown(true);
                    }}
                    onKeyDown={handleSearchSubmit}
                  />
                  {searchQuery && (
                    <button
                      className="srch-clear"
                      onClick={handleSearchClose}
                      title="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {showSearchDropdown && (
                  <SearchDropdown
                    results={searchResults}
                    loading={searchLoading}
                    query={searchQuery}
                    onSelect={handleSuggestionSelect}
                    onViewAll={handleViewAll}
                  />
                )}
              </div>

              {/* Right icons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  marginLeft: "auto",
                  flexShrink: 0,
                }}
              >
                <Link to="/wishlist">
                  <button className="ibtn">
                    <div style={{ position: "relative" }}>
                      <Heart size={22} />
                      <Bdg n={wishlistItems.length} />
                    </div>
                    <span>Wishlist</span>
                  </button>
                </Link>
                <Link to="/cart">
                  <button className="ibtn">
                    <div style={{ position: "relative" }}>
                      <ShoppingCart size={22} />
                      <Bdg n={totalQuantity} />
                    </div>
                    <span>Cart</span>
                  </button>
                </Link>

                {/* Account dropdown */}
                <div ref={accountRef} style={{ position: "relative" }}>
                  {!isLoggedIn || !user ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to="/login">
                        <button className="ibtn">
                          <User size={20} />
                          <span>Login</span>
                        </button>
                      </Link>
                      <Link to="/register">
                        <button
                          style={{
                            background: "#5CB74B",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 18px",
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: "pointer",
                            transition: "background .15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#4aa33a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#5CB74B")
                          }
                        >
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <button
                      className="ibtn"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      onClick={() =>
                        setShowAccountDropdown(!showAccountDropdown)
                      }
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#5CB74B",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span
                        style={{
                          maxWidth: 80,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.name?.split(" ")[0]}
                      </span>
                      <ChevronDown size={14} />
                    </button>
                  )}

                  {showAccountDropdown && user && (
                    <div
                      className="dd"
                      style={{ right: 0, width: 220, paddingBottom: 8 }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f0f0f0",
                          background: "#f6fef6",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#1a1a1a",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.name}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#888",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <div className="ddi">
                          <UserCircle size={16} /> My Profile
                        </div>
                      </Link>
                      {user.role === "customer" && (
                        <Link
                          to="/orders"
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <div className="ddi">
                            <ShoppingCart size={16} /> My Orders
                          </div>
                        </Link>
                      )}
                      {(user.role === "admin" ||
                        user.role === "superadmin") && (
                        <Link
                          to={
                            user.role === "superadmin"
                              ? "/SuperAdmin"
                              : "/admin"
                          }
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <div className="ddi">
                            <Settings size={16} /> Dashboard
                          </div>
                        </Link>
                      )}
                      <div
                        style={{ borderTop: "1px solid #f0f0f0", marginTop: 4 }}
                      />
                      <div
                        className="ddi"
                        style={{ color: "#e53e3e" }}
                        onClick={handleLogout}
                      >
                        <LogOut size={16} /> Logout
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── MOBILE: header row ── */}
          <div className="mob mhdr">
            <Link to="/" style={{ flexShrink: 0 }}>
              <img
                src={Logo}
                alt="Logo"
                style={{ height: 36, width: "auto", objectFit: "contain" }}
              />
            </Link>

            {/* MOBILE SEARCH */}
            <div
              ref={mobileSearchContainerRef}
              style={{ position: "relative", flex: 1, minWidth: 0 }}
            >
              <div className="msrch">
                <Search size={15} color="#aaa" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (mobileSearchResults && searchQuery.length >= 2)
                      setShowMobileSearchDropdown(true);
                  }}
                  onKeyDown={handleSearchSubmit}
                />
                {searchQuery && (
                  <button
                    className="srch-clear"
                    onClick={handleSearchClose}
                    style={{ padding: 2 }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {showMobileSearchDropdown && (
                <SearchDropdown
                  results={mobileSearchResults}
                  loading={mobileSearchLoading}
                  query={searchQuery}
                  onSelect={handleSuggestionSelect}
                  onViewAll={handleViewAll}
                />
              )}
            </div>

            <Link to="/wishlist" className="micn">
              <Heart size={21} color="#333" />
              {wishlistItems.length > 0 && (
                <span className="mbdg">{wishlistItems.length}</span>
              )}
            </Link>
            <Link to="/cart" className="micn">
              <ShoppingCart size={21} color="#333" />
              {totalQuantity > 0 && (
                <span className="mbdg">{totalQuantity}</span>
              )}
            </Link>
            <button className="micn" onClick={() => setShowMobileMenu(true)}>
              <Menu size={23} color="#333" />
            </button>
          </div>

          {/* ── DESKTOP: category tabs ── */}
          <div
            className="dsk"
            style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}
          >
            <div
              style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}
            >
              <div
                className="hs"
                style={{ display: "flex", overflowX: "auto" }}
              ></div>
            </div>
          </div>

          {/* ── MOBILE: category chips ── */}
          <div className="mob mcat"></div>
        </div>
        {/* ═══ END STICKY ═══ */}

        {/* ═══ MOBILE SIDEBAR ═══ */}
        {showMobileMenu && (
          <>
            <div className="ovl" onClick={() => setShowMobileMenu(false)} />
            <div className="sbar">
              <div className="sbar-hd">
                <img
                  src={WhiteLogo}
                  alt="Logo"
                  style={{ height: 30, filter: "brightness(0) invert(1)" }}
                />
                <button
                  onClick={() => setShowMobileMenu(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: 16, flex: 1 }}>
                {/* Account section */}
                {isLoggedIn && user ? (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: 14,
                      background: "#f6fef6",
                      borderRadius: 12,
                      border: "1px solid #c8edc1",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "#5CB74B",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 17,
                          flexShrink: 0,
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#1a1a1a",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.name}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#888",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="sl">
                        <UserCircle size={18} color="#5CB74B" /> My Profile
                      </div>
                    </Link>
                    {user.role === "customer" && (
                      <Link
                        to="/orders"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div className="sl">
                          <ShoppingCart size={18} color="#5CB74B" /> My Orders
                        </div>
                      </Link>
                    )}
                    {(user.role === "admin" || user.role === "superadmin") && (
                      <Link
                        to={
                          user.role === "superadmin" ? "/SuperAdmin" : "/admin"
                        }
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div className="sl">
                          <Settings size={18} color="#5CB74B" /> Dashboard
                        </div>
                      </Link>
                    )}
                    <div
                      className="sl"
                      style={{ color: "#e53e3e" }}
                      onClick={handleLogout}
                    >
                      <LogOut size={18} /> Logout
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginBottom: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setShowMobileMenu(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 16px",
                        border: "2px solid #5CB74B",
                        color: "#5CB74B",
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 14,
                        textDecoration: "none",
                      }}
                    >
                      <User size={18} /> Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setShowMobileMenu(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 16px",
                        background: "#5CB74B",
                        color: "#fff",
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 14,
                        textDecoration: "none",
                      }}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* Nav links */}
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                  <Link to="/" onClick={() => setShowMobileMenu(false)}>
                    <div className="sl">Home</div>
                  </Link>
                  <Link to="/contact" onClick={() => setShowMobileMenu(false)}>
                    <div className="sl">Contact Us</div>
                  </Link>
                </div>

                {/* ── MOBILE LOCATION SECTION ── */}
                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 10,
                    marginTop: 6,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      margin: "0 0 6px 16px",
                    }}
                  >
                    Deliver To
                  </p>

                  <button
                    className="gps-btn"
                    onClick={handleGpsClick}
                    disabled={gpsLoading}
                    style={{ borderRadius: 8 }}
                  >
                    {gpsLoading ? (
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Navigation size={16} />
                    )}
                    {gpsLoading
                      ? "Detecting location…"
                      : "Use Current Location"}
                  </button>
                  {gpsError && (
                    <p
                      style={{
                        margin: "0 0 4px 16px",
                        fontSize: 11,
                        color: "#e53e3e",
                      }}
                    >
                      {gpsError}
                    </p>
                  )}

                  {locations.map((loc) => {
                    const LIcon = LABEL_ICON[loc.label] || Tag;
                    const isActive = activeLocation?._id === loc._id;
                    return (
                      <div
                        key={loc._id}
                        className="sl"
                        style={{ color: isActive ? "#5CB74B" : "#333" }}
                        onClick={() => {
                          dispatch(setActiveLocation(loc));
                          setShowMobileMenu(false);
                        }}
                      >
                        <LIcon
                          size={16}
                          color={isActive ? "#5CB74B" : "#aaa"}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              textTransform: "capitalize",
                            }}
                          >
                            {getLocationLabel(loc)}
                            {loc.isDefault && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  color: "#5CB74B",
                                }}
                              >
                                ● default
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#999",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {loc.city || loc.address}
                          </div>
                        </div>
                        {isActive && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#5CB74B",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                  <button
                    className="sl"
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      color: "#5CB74B",
                      fontWeight: 600,
                      cursor: "pointer",
                      justifyContent: "flex-start",
                    }}
                    onClick={() => {
                      setLocationModal(true);
                      setShowMobileMenu(false);
                    }}
                  >
                    <Plus size={16} color="#5CB74B" /> Add New Address
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ LOCATION MODAL ═══ */}
        <LocationModal
          open={locationModal}
          onClose={() => setLocationModal(false)}
          editData={null}
          prefillData={gpsResult}
          locate={gpsLocate}
        />
      </div>
    </>
  );
}
