import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorAPI } from "../services/api";
import Logo from "../assets/3Arrow.png";
import { User, Building2 } from "lucide-react";
const STATUS_CONFIG = {
  draft: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.2)",
    label: "Draft",
    icon: "✏️",
    step: 0,
  },
  pending: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    label: "Under Review",
    icon: "⏳",
    step: 1,
  },
  approved: {
    color: "#5BB64A",
    bg: "rgba(91,182,74,0.08)",
    border: "rgba(91,182,74,0.2)",
    label: "Approved",
    icon: "✓",
    step: 2,
  },
  rejected: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    label: "Rejected",
    icon: "✕",
    step: 2,
  },
};

const DESCRIPTIONS = {
  draft:
    "Your application is incomplete. Please fill in all sections before submitting for review.",
  pending:
    "Your application is currently under review by our team. We'll notify you once a decision is made.",
  approved:
    "Your vendor account is active. You can now list products and start selling.",
  rejected:
    "Your application was not approved at this time. Please review the admin remarks and reapply.",
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("business");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await vendorAPI.getMyVendor();
      setVendor(response);
    } catch (err) {
      setError(err.message || "Failed to fetch vendor profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={S.loadingWrap}>
        <style>{KF}</style>
        <div style={S.spinner} />
        <p style={{ color: "#5BB64A", fontSize: 14, margin: 0 }}>
          Loading vendor profile…
        </p>
      </div>
    );
  }

  const cfg = vendor
    ? STATUS_CONFIG[vendor.status] || STATUS_CONFIG.draft
    : STATUS_CONFIG.draft;

  return (
    <div style={S.root}>
      <style>{KF}</style>

      {/* ══════════ MOBILE OVERLAY ══════════ */}
      {sidebarOpen && (
        <div
          style={S.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════ MOBILE TOP NAV BAR ══════════ */}
      <div style={S.mobileTopBar} className="mobile-topbar">
        <button
          style={S.hamburger}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span style={S.hamburgerLine} />
          <span style={S.hamburgerLine} />
          <span style={S.hamburgerLine} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={Logo} alt="3Arrow" style={{ height: 32, width: "auto" }} />
          <span style={{ fontSize: 13, color: cfg.color, fontWeight: 700 }}>
            Vendor Portal
          </span>
        </div>
        <div
          style={{
            ...S.statusPillSmall,
            background: cfg.bg,
            color: cfg.color,
          }}
        >
          <span style={{ ...S.statusDot, background: cfg.color }} />
          {cfg.label}
        </div>
      </div>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        style={{
          ...S.sidebar,
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={S.logoArea}>
          <img
            src={Logo}
            alt="3Arrow"
            style={{ height: 44, width: "auto", objectFit: "contain" }}
          />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
              Vendor
            </div>
            <div style={{ fontSize: 13, color: cfg.color, fontWeight: 700 }}>
              Portal
            </div>
          </div>
          <button
            style={S.sidebarClose}
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav style={S.nav}>
          {[
            { id: "business", icon: <Building2 />, label: "Business Info" },
            { id: "seller", icon: <User />, label: "Seller Info" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              style={{
                ...S.navItem,
                ...(activeSection === item.id ? S.navActive : {}),
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {activeSection === item.id && <div style={S.navBar} />}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={S.sideFooter}>
          <button onClick={fetchVendorProfile} style={S.refreshBtn}>
            ↺ Refresh
          </button>
          {vendor?.status === "approved" && (
            <button
              onClick={() => navigate("/product/home")}
              style={S.proceedBtn}
            >
              Start Selling →
            </button>
          )}
          {(vendor?.status === "draft" || vendor?.status === "rejected") && (
            <button
              onClick={() => navigate("/vendor/onboarding")}
              style={{
                ...S.proceedBtn,
                background:
                  vendor.status === "rejected"
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(99,102,241,0.08)",
                color: vendor.status === "rejected" ? "#ef4444" : "#6366f1",
                border: `1px solid ${
                  vendor.status === "rejected"
                    ? "rgba(239,68,68,0.3)"
                    : "rgba(99,102,241,0.3)"
                }`,
              }}
            >
              {vendor.status === "rejected"
                ? "Reapply →"
                : "Complete Profile →"}
            </button>
          )}
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main style={S.main} className="main-content">
        {/* Top bar - desktop only */}
        <header style={S.topBar} className="desktop-topbar">
          <div>
            <p style={S.greeting}>Good day,</p>
            <h1 style={S.bizName}>
              {vendor?.businessDetails?.businessName || "Vendor"}
            </h1>
          </div>
          <div
            style={{ ...S.statusPill, background: cfg.bg, color: cfg.color }}
          >
            <span style={{ ...S.statusDot, background: cfg.color }} />
            {cfg.label}
          </div>
        </header>

        {/* Mobile page title */}
        <div style={S.mobileTitleArea} className="mobile-title">
          <p style={S.greeting}>Good day,</p>
          <h1 style={{ ...S.bizName, fontSize: 22 }}>
            {vendor?.businessDetails?.businessName || "Vendor"}
          </h1>
        </div>

        {error && <div style={S.errBox}>⚠️ {error}</div>}

        {vendor && (
          <>
            {/* ── Application Progress ── */}
            <div style={S.progressCard}>
              <p style={S.progressTitle}>APPLICATION PROGRESS</p>
              <p style={S.progressDesc}>{DESCRIPTIONS[vendor.status]}</p>

              <div style={S.stepsRow}>
                {[
                  {
                    label: "Submitted",
                    sub: vendor.createdAt
                      ? new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—",
                  },
                  { label: "Under Review", sub: "Admin evaluation" },
                  {
                    label:
                      vendor.status === "rejected" ? "Rejected" : "Approved",
                    sub:
                      vendor.status === "approved"
                        ? "Account active!"
                        : vendor.status === "rejected"
                          ? "See remark below"
                          : "Awaiting decision",
                  },
                ].map((step, i) => {
                  const done = cfg.step > i;
                  const active = cfg.step === i;
                  const isRej = vendor.status === "rejected" && i === 2;
                  const col = isRej
                    ? "#ef4444"
                    : done || active
                      ? "#5BB64A"
                      : "#d1d5db";
                  return (
                    <React.Fragment key={i}>
                      <div style={S.stepItem}>
                        <div
                          style={{
                            ...S.stepCircle,
                            background: done || active ? col : "#fff",
                            border: `2px solid ${col}`,
                            boxShadow: active ? `0 0 0 5px ${col}22` : "none",
                          }}
                        >
                          {done || active ? (
                            <span
                              style={{
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {isRej ? "✕" : "✓"}
                            </span>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>
                              {i + 1}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            ...S.stepLabel,
                            color: done || active ? "#374151" : "#9ca3af",
                          }}
                        >
                          {step.label}
                        </div>
                        <div style={S.stepSub}>{step.sub}</div>
                      </div>
                      {i < 2 && (
                        <div
                          style={{
                            ...S.stepLine,
                            background:
                              cfg.step > i
                                ? "linear-gradient(90deg,#5BB64A,#5BB64A88)"
                                : "#e5e7eb",
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Admin remark */}
            {vendor.adminRemark && (
              <div style={S.remarkCard}>
                <span style={{ fontSize: 22 }}>💬</span>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#b45309",
                      margin: "0 0 4px",
                    }}
                  >
                    Admin Remark
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#78350f",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {vendor.adminRemark}
                  </p>
                </div>
              </div>
            )}

            {/* ══════════ MOBILE ACTION BUTTONS ══════════
                Hidden on desktop (display:none), shown on mobile via CSS.
                Mirrors the sidebar footer so users don't need to open the drawer. */}
            <div style={S.mobileActions} className="mobile-actions">
              <button onClick={fetchVendorProfile} style={S.refreshBtn}>
                ↺ Refresh
              </button>

              {vendor?.status === "approved" && (
                <button
                  onClick={() => navigate("/product/home")}
                  style={{ ...S.proceedBtn, flex: 1 }}
                >
                  Start Selling →
                </button>
              )}

              {(vendor?.status === "draft" ||
                vendor?.status === "rejected") && (
                <button
                  onClick={() => navigate("/vendor/onboarding")}
                  style={{
                    ...S.proceedBtn,
                    flex: 1,
                    background:
                      vendor.status === "rejected"
                        ? "rgba(239,68,68,0.08)"
                        : "rgba(99,102,241,0.08)",
                    color: vendor.status === "rejected" ? "#ef4444" : "#6366f1",
                    border: `1px solid ${
                      vendor.status === "rejected"
                        ? "rgba(239,68,68,0.3)"
                        : "rgba(99,102,241,0.3)"
                    }`,
                  }}
                >
                  {vendor.status === "rejected"
                    ? "Reapply →"
                    : "Complete Profile →"}
                </button>
              )}
            </div>

            {/* ── Mobile Tab Switcher ── */}
            <div style={S.mobileTabs} className="mobile-tabs">
              {[
                { id: "business", icon: <Building2 />, label: "Business" },
                { id: "seller", icon: <User />, label: "Seller" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  style={{
                    ...S.mobileTab,
                    ...(activeSection === tab.id ? S.mobileTabActive : {}),
                  }}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* ── Info sections ── */}
            {activeSection === "business" && <BusinessTable vendor={vendor} />}

            {activeSection === "seller" && vendor.sellerDetails && (
              <SellerTable vendor={vendor} />
            )}

            {activeSection === "seller" && !vendor.sellerDetails && (
              <div style={S.emptyCard}>
                <div style={{ fontSize: 36, opacity: 0.3, marginBottom: 10 }}>
                  📭
                </div>
                <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                  No seller information provided yet.
                </p>
              </div>
            )}
          </>
        )}

        {!vendor && !loading && (
          <div style={S.emptyWrap}>
            <div style={{ fontSize: 52, opacity: 0.3 }}>🏪</div>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#374151",
                margin: 0,
              }}
            >
              No vendor profile found
            </p>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              Start your vendor registration to begin selling.
            </p>
            <button
              onClick={() => navigate("/vendor/onboarding")}
              style={S.proceedBtn}
            >
              Begin Registration →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Business Info Table ──────────────────────────────────────────────────────
function BusinessTable({ vendor: v }) {
  const bd = v?.businessDetails || {};
  return (
    <div style={TBL.card}>
      <div style={TBL.header}>
        <span style={{ fontSize: 20 }}></span>
        <h3 style={TBL.headerTitle}>Business Information</h3>
      </div>

      <div style={TBL.tableWrap} className="desktop-table">
        <table style={TBL.table}>
          <tbody>
            <tr>
              <TH>Business Name</TH>
              <TH>Business Type</TH>
              <TH>Business Email</TH>
              <TH>Business Phone</TH>
            </tr>
            <tr>
              <TD>{bd.businessName}</TD>
              <TD>{bd.businessType}</TD>
              <TD>{bd.businessEmail}</TD>
              <TD>{bd.businessPhone}</TD>
            </tr>
            <tr>
              <TH>GST Number</TH>
              <TH>PAN Number</TH>
              <TH colSpan={2}></TH>
            </tr>
            <tr>
              <TD>{bd.gstNumber}</TD>
              <TD>{bd.panNumber}</TD>
              <TD colSpan={2} empty />
            </tr>
          </tbody>
        </table>
      </div>

      <div style={TBL.mobileFields} className="mobile-fields">
        {[
          { label: "Business Name", value: bd.businessName },
          { label: "Business Type", value: bd.businessType },
          { label: "Business Email", value: bd.businessEmail },
          { label: "Business Phone", value: bd.businessPhone },
          { label: "GST Number", value: bd.gstNumber },
          { label: "PAN Number", value: bd.panNumber },
        ].map(({ label, value }) => (
          <MobileField key={label} label={label} value={value} />
        ))}
      </div>

      {bd.categories?.length > 0 && (
        <div style={TBL.catRow}>
          <div style={TBL.catLabel}>CATEGORIES</div>
          <div style={TBL.catValue}>{bd.categories.join(" · ")}</div>
        </div>
      )}
    </div>
  );
}

// ── Seller Info Table ──────────────────────────────────────────────────────
function SellerTable({ vendor: v }) {
  const sd = v?.sellerDetails || {};
  return (
    <div style={TBL.card}>
      <div style={TBL.header}>
        <span style={{ fontSize: 20 }}></span>
        <h3 style={TBL.headerTitle}>Seller Information</h3>
      </div>

      <div style={TBL.tableWrap} className="desktop-table">
        <table style={TBL.table}>
          <tbody>
            <tr>
              <TH>Seller Name</TH>
              <TH>Seller Email</TH>
              <TH>Seller Phone</TH>
              <TH>City</TH>
            </tr>
            <tr>
              <TD>{sd.sellerName}</TD>
              <TD>{sd.sellerEmail}</TD>
              <TD>{sd.sellerPhone}</TD>
              <TD>{sd.city}</TD>
            </tr>
            <tr>
              <TH>State</TH>
              <TH>Pincode</TH>
              <TH colSpan={2}></TH>
            </tr>
            <tr>
              <TD>{sd.state}</TD>
              <TD>{sd.pincode}</TD>
              <TD colSpan={2} empty />
            </tr>
          </tbody>
        </table>
      </div>

      <div style={TBL.mobileFields} className="mobile-fields">
        {[
          { label: "Seller Name", value: sd.sellerName },
          { label: "Seller Email", value: sd.sellerEmail },
          { label: "Seller Phone", value: sd.sellerPhone },
          { label: "City", value: sd.city },
          { label: "State", value: sd.state },
          { label: "Pincode", value: sd.pincode },
        ].map(({ label, value }) => (
          <MobileField key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

function MobileField({ label, value }) {
  return (
    <div style={TBL.mobileFieldRow}>
      <div style={TBL.mobileFieldLabel}>{label}</div>
      <div
        style={{
          ...TBL.mobileFieldValue,
          color: value ? "#5BB64A" : "#9ca3af",
          fontStyle: value ? "normal" : "italic",
        }}
      >
        {value || "Not provided"}
      </div>
    </div>
  );
}

const TH = ({ children, colSpan }) => (
  <th
    colSpan={colSpan}
    style={{
      padding: "14px 20px",
      textAlign: "left",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: 1.5,
      color: "#374151",
      textTransform: "uppercase",
      background: "#fff",
      border: "1px solid #e5e7eb",
      width: "25%",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </th>
);

const TD = ({ children, colSpan, empty }) => (
  <td
    colSpan={colSpan}
    style={{
      padding: "14px 20px",
      fontSize: 14,
      color: children ? "#5BB64A" : "#9ca3af",
      fontStyle: !children && !empty ? "italic" : "normal",
      border: "1px solid #e5e7eb",
      background: "#fff",
      fontWeight: children ? 500 : 400,
      verticalAlign: "top",
    }}
  >
    {empty ? "" : children || "Not provided"}
  </td>
);

const TBL = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
    animation: "fadeUp .35s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 22px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  tableWrap: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  catRow: {
    borderTop: "1px solid #e5e7eb",
    padding: "16px 22px",
  },
  catLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: "#374151",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  catValue: {
    fontSize: 14,
    color: "#5BB64A",
    fontWeight: 500,
  },
  mobileFields: {
    display: "none",
    flexDirection: "column",
    gap: 0,
  },
  mobileFieldRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px 18px",
    borderBottom: "1px solid #f3f4f6",
    gap: 12,
  },
  mobileFieldLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: "#374151",
    textTransform: "uppercase",
    flexShrink: 0,
    paddingTop: 1,
    minWidth: 100,
  },
  mobileFieldValue: {
    fontSize: 14,
    fontWeight: 500,
    textAlign: "right",
    wordBreak: "break-all",
  },
};

const S = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    color: "#111827",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 90,
    backdropFilter: "blur(2px)",
  },
  mobileTopBar: {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 80,
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    gap: 12,
  },
  hamburger: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
  },
  hamburgerLine: {
    display: "block",
    width: 22,
    height: 2.5,
    background: "#374151",
    borderRadius: 2,
  },
  statusPillSmall: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px",
    borderRadius: 100,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
    whiteSpace: "nowrap",
  },
  sidebar: {
    width: 226,
    flexShrink: 0,
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    padding: "0 0 20px",
    position: "sticky",
    top: 0,
    height: "100vh",
    zIndex: 100,
    transition: "transform .25s ease",
  },
  sidebarClose: {
    display: "none",
    marginLeft: "auto",
    background: "none",
    border: "none",
    fontSize: 16,
    color: "#6b7280",
    cursor: "pointer",
    padding: 4,
    lineHeight: 1,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "22px 18px 20px",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 12,
  },
  nav: {
    flex: 1,
    padding: "0 10px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "none",
    color: "#6b7280",
    fontSize: 13.5,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .15s",
    textAlign: "left",
    position: "relative",
    fontFamily: "inherit",
    width: "100%",
  },
  navActive: {
    background: "rgba(91,182,74,0.08)",
    color: "#5BB64A",
    fontWeight: 700,
  },
  navBar: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 3,
    height: 20,
    background: "#5BB64A",
    borderRadius: "3px 0 0 3px",
  },
  sideFooter: {
    padding: "16px 12px 0",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  refreshBtn: {
    padding: "9px 16px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "transparent",
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  proceedBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid rgba(91,182,74,0.35)",
    background: "rgba(91,182,74,0.08)",
    color: "#5BB64A",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "center",
  },
  main: {
    flex: 1,
    padding: "32px 40px",
    overflowY: "auto",
    minWidth: 0,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  mobileTitleArea: {
    display: "none",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 11,
    color: "#9ca3af",
    margin: "0 0 4px",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontWeight: 600,
  },
  bizName: {
    fontSize: 30,
    fontWeight: 800,
    margin: 0,
    color: "#111827",
    letterSpacing: "-0.5px",
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    animation: "pulse 2s infinite",
  },
  errBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 20,
  },
  progressCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "24px 28px",
    marginBottom: 20,
    animation: "fadeUp .3s ease",
  },
  progressTitle: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
    color: "#374151",
    margin: "0 0 6px",
    textTransform: "uppercase",
  },
  progressDesc: {
    fontSize: 13.5,
    color: "#6b7280",
    margin: "0 0 28px",
    lineHeight: 1.6,
  },
  stepsRow: { display: "flex", alignItems: "center" },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    minWidth: 80,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .3s",
  },
  stepLabel: { fontSize: 12.5, fontWeight: 700, textAlign: "center" },
  stepSub: { fontSize: 11.5, color: "#9ca3af", textAlign: "center" },
  stepLine: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    marginBottom: 42,
    minWidth: 20,
    transition: "background .4s",
  },
  remarkCard: {
    display: "flex",
    gap: 14,
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 20,
    alignItems: "flex-start",
  },

  // ── NEW: Mobile action buttons (hidden on desktop) ──
  mobileActions: {
    display: "none", // shown via .mobile-actions CSS class on mobile
    gap: 10,
    marginBottom: 16,
    alignItems: "stretch",
  },

  mobileTabs: {
    display: "none",
    background: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  mobileTab: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all .15s",
  },
  mobileTabActive: {
    background: "#fff",
    color: "#5BB64A",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "48px 24px",
    textAlign: "center",
  },
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    gap: 14,
    textAlign: "center",
  },
  loadingWrap: {
    minHeight: "100vh",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    fontFamily: "DM Sans, sans-serif",
  },
  spinner: {
    width: 38,
    height: 38,
    border: "3px solid #e5e7eb",
    borderTopColor: "#5BB64A",
    borderRadius: "50%",
    animation: "spin .7s linear infinite",
  },
};

const KF = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

  button:hover { opacity: .88; }

  /* ── MOBILE BREAKPOINT (< 768px) ── */
  @media (max-width: 767px) {

    .mobile-topbar {
      display: flex !important;
    }

    .main-content {
      padding: 72px 16px 24px !important;
    }

    .sidebar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      height: 100vh !important;
      transform: translateX(-100%);
      box-shadow: 4px 0 24px rgba(0,0,0,0.12) !important;
      z-index: 100 !important;
    }

    .sidebar[style*="translateX(0)"] {
      transform: translateX(0) !important;
    }

    .sidebar-close {
      display: block !important;
    }

    .desktop-topbar {
      display: none !important;
    }

    .mobile-title {
      display: block !important;
    }

    /* Show the action buttons row in main content */
    .mobile-actions {
      display: flex !important;
    }

    .mobile-tabs {
      display: flex !important;
    }

    .desktop-table {
      display: none !important;
    }

    .mobile-fields {
      display: flex !important;
    }
  }

  /* ── TABLET (768px - 1024px) ── */
  @media (min-width: 768px) and (max-width: 1023px) {
    .sidebar {
      width: 200px !important;
    }
    .main-content {
      padding: 24px 24px !important;
    }
  }
`;
