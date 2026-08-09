import React, { useState, useEffect } from "react";
import {
  Truck,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Ban,
  Mail,
  Phone,
  Globe,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

const lastUpdated = "March 2026";

const shippingMethods = [
  {
    icon: Zap,
    title: "Express Delivery",
    subtitle: "Same Day / Next Day",
    time: "Delivered within 24 hrs",
    charge: "₹49 (Free above ₹999)",
    available: "Select pin codes only",
    highlight: true,
  },
  {
    icon: Truck,
    title: "Standard Delivery",
    subtitle: "2–5 Business Days",
    time: "Most orders arrive in 3 days",
    charge: "₹29 (Free above ₹499)",
    available: "Pan India",
    highlight: false,
  },
  {
    icon: Globe,
    title: "Scheduled Delivery",
    subtitle: "Choose Your Slot",
    time: "Pick a date & time window",
    charge: "₹59 flat",
    available: "Metro cities only",
    highlight: false,
  },
];

const steps = [
  {
    icon: Package,
    title: "Order Confirmed",
    desc: "You receive an order confirmation email with your order ID and summary.",
    color: "#5CB74B",
  },
  {
    icon: ShieldCheck,
    title: "Order Processed",
    desc: "Our warehouse team picks, packs, and quality-checks your item within 24 hours.",
    color: "#3da32e",
  },
  {
    icon: Truck,
    title: "Shipped",
    desc: "Your package is handed to our logistics partner. You'll receive a tracking link via SMS & email.",
    color: "#5CB74B",
  },
  {
    icon: MapPin,
    title: "Out for Delivery",
    desc: "Your package is with the delivery agent and will arrive at your door today.",
    color: "#3da32e",
  },
];

const coveredAreas = [
  "All metro cities — Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune",
  "All state capitals and Tier-2 cities across India",
  "Most Tier-3 towns and semi-urban pin codes",
  "Deliveries to over 27,000 pin codes across 29 states and 7 UTs",
];

const notCoveredAreas = [
  "Remote locations and extremely rural pin codes",
  "Certain restricted border areas and conflict zones",
  "Islands without regular logistics connectivity",
  "Areas temporarily suspended due to natural disasters or emergencies",
];

const trackingSteps = [
  {
    step: "01",
    label: "Order Placed",
    desc: "Confirmation sent to your email & phone.",
  },
  {
    step: "02",
    label: "Processing",
    desc: "Warehouse picks and packs your order.",
  },
  {
    step: "03",
    label: "Dispatched",
    desc: "Tracking link shared via SMS & email.",
  },
  {
    step: "04",
    label: "In Transit",
    desc: "Live tracking updates every few hours.",
  },
  {
    step: "05",
    label: "Out for Delivery",
    desc: "Agent will call before arriving.",
  },
  {
    step: "06",
    label: "Delivered",
    desc: "Order marked complete in My Orders.",
  },
];

const faqs = [
  {
    q: "How do I track my order?",
    a: "Once your order is dispatched, you will receive a tracking link via SMS and email. You can also track your order from the 'My Orders' section in your account by clicking 'Track Order' next to the relevant item.",
  },
  {
    q: "What happens if I'm not available at the time of delivery?",
    a: "Our delivery partner will attempt delivery up to 3 times. After the third failed attempt, the package will be returned to our warehouse and a refund will be initiated. You will be notified via SMS and email before each attempt.",
  },
  {
    q: "Can I change my delivery address after placing an order?",
    a: "Address changes are possible only before the order is dispatched. Please contact our support team immediately with your order ID and the new address. Once dispatched, address changes cannot be accommodated.",
  },
  {
    q: "Do you offer international shipping?",
    a: "Currently, 3Arrow delivers only within India. We are working on expanding our logistics network to support international deliveries in the near future. Stay tuned for updates.",
  },
  {
    q: "Why is my order delayed?",
    a: "Delays can occur due to high-demand periods (sale events, holidays), weather disruptions, logistics issues, or incorrect address details. You will receive a notification if your order is significantly delayed. You can also check live status via your tracking link.",
  },
  {
    q: "Is there free shipping on all orders?",
    a: "Free shipping is available on Standard Delivery for orders above ₹499 and Express Delivery for orders above ₹999. Scheduled Delivery has a flat charge of ₹59 regardless of order value.",
  },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

export default function ShippingPolicy() {
  const [openFaq, setOpenFaq] = useState(null);
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        color: "#1a1a1a",
        background: "#f8faf8",
      }}
    >
      {/* ── HERO ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #5CB74B 0%, #3d9e2e 60%, #2d7a21 100%)",
          padding: isMobile ? "40px 20px 36px" : "64px 32px 56px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.18)",
            borderRadius: "50%",
            width: 72,
            height: 72,
            marginBottom: 20,
          }}
        >
          <Truck size={34} color="#fff" />
        </div>
        <h1
          style={{
            color: "#fff",
            fontSize: isMobile ? 26 : 36,
            fontWeight: 800,
            margin: "0 0 12px",
            letterSpacing: "-0.5px",
          }}
        >
          Shipping Policy
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: isMobile ? 14 : 16,
            maxWidth: 520,
            margin: "0 auto 20px",
            lineHeight: 1.6,
          }}
        >
          Fast, reliable, and transparent delivery across India. Here's
          everything you need to know about how we ship your orders.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "8px 18px",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Clock size={15} /> Last updated: {lastUpdated}
        </div>
      </div>

      {/* ── HIGHLIGHTS ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8f5e2" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            padding: isMobile ? "16px 16px" : "28px 24px",
            gap: isMobile ? 12 : 0,
          }}
        >
          {[
            {
              icon: Zap,
              label: "Same-Day Delivery",
              sub: "Available in select cities",
            },
            {
              icon: Globe,
              label: "Pan India Shipping",
              sub: "27,000+ pin codes covered",
            },
            {
              icon: MapPin,
              label: "Live Tracking",
              sub: "Real-time order updates",
            },
          ].map(({ icon: Icon, label, sub }, idx) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: isMobile ? "10px 12px" : "0 16px",
                borderRight:
                  !isMobile && idx < 2 ? "1px solid #e8f5e2" : "none",
                borderBottom:
                  isMobile && idx < 2 ? "1px solid #e8f5e2" : "none",
                paddingBottom: isMobile && idx < 2 ? 12 : undefined,
              }}
            >
              <div
                style={{
                  background: "#edfce8",
                  borderRadius: 12,
                  padding: 12,
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color="#5CB74B" />
              </div>
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 13, color: "#777" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "24px 16px 48px" : "40px 24px 60px",
        }}
      >
        {/* ── SHIPPING METHODS ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
              color: "#1a1a1a",
            }}
          >
            Shipping Methods
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Choose the delivery speed that works best for you
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {shippingMethods.map((m, i) => (
              <div
                key={i}
                style={{
                  background: m.highlight
                    ? "linear-gradient(135deg, #5CB74B, #3d9e2e)"
                    : "#fff",
                  border: m.highlight ? "none" : "1.5px solid #e8f5e2",
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: m.highlight
                    ? "0 8px 24px rgba(92,183,75,0.25)"
                    : "0 2px 12px rgba(92,183,75,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {m.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 8,
                      padding: "3px 10px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    POPULAR
                  </div>
                )}
                <div
                  style={{
                    background: m.highlight
                      ? "rgba(255,255,255,0.2)"
                      : "#edfce8",
                    borderRadius: 12,
                    width: 52,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <m.icon size={24} color={m.highlight ? "#fff" : "#5CB74B"} />
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    color: m.highlight ? "#fff" : "#1a1a1a",
                    marginBottom: 2,
                  }}
                >
                  {m.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: m.highlight ? "rgba(255,255,255,0.8)" : "#888",
                    marginBottom: 16,
                  }}
                >
                  {m.subtitle}
                </div>
                {[
                  { label: "Delivery Time", value: m.time },
                  { label: "Shipping Charge", value: m.charge },
                  { label: "Availability", value: m.available },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: `1px solid ${m.highlight ? "rgba(255,255,255,0.15)" : "#f0f8ee"}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: m.highlight ? "rgba(255,255,255,0.7)" : "#999",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: m.highlight ? "#fff" : "#333",
                        fontWeight: 600,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── ORDER JOURNEY ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Your Order's Journey
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            From checkout to your doorstep — here's what happens
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: 20,
            }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: isMobile ? 16 : 24,
                  textAlign: "center",
                  border: "1.5px solid #e8f5e2",
                  boxShadow: "0 2px 12px rgba(92,183,75,0.07)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#edfce8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <s.icon size={24} color={s.color} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: isMobile ? 12 : 20,
                    right: isMobile ? 12 : 20,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#5CB74B",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: isMobile ? 13 : 15,
                    marginBottom: 8,
                    color: "#1a1a1a",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    color: "#666",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRACKING TIMELINE ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Tracking Your Order
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Stay informed at every stage of delivery
          </p>
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e8f5e2",
              borderRadius: 16,
              padding: isMobile ? 20 : 32,
              boxShadow: "0 2px 12px rgba(92,183,75,0.05)",
            }}
          >
            {trackingSteps.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 20,
                  position: "relative",
                  paddingBottom: i < trackingSteps.length - 1 ? 28 : 0,
                }}
              >
                {i < trackingSteps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 19,
                      top: 36,
                      width: 2,
                      height: "calc(100% - 8px)",
                      background: "#e8f5e2",
                    }}
                  />
                )}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #5CB74B, #3d9e2e)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {t.step}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#1a1a1a",
                      marginBottom: 4,
                    }}
                  >
                    {t.label}
                  </div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                    {t.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COVERAGE ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Delivery Coverage
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Where we deliver and where we currently don't
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 24,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #c6ebbf",
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <CheckCircle size={22} color="#5CB74B" />
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    margin: 0,
                    color: "#2d7a21",
                  }}
                >
                  Areas We Cover
                </h3>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {coveredAreas.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 14,
                      color: "#333",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#edfce8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <ArrowRight size={11} color="#5CB74B" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #fdd",
                borderRadius: 16,
                padding: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <Ban size={22} color="#e53e3e" />
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    margin: 0,
                    color: "#c0392b",
                  }}
                >
                  Currently Not Covered
                </h3>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {notCoveredAreas.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 14,
                      color: "#333",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#fff0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Ban size={11} color="#e53e3e" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── IMPORTANT NOTE ── */}
        <div
          style={{
            background: "#fffbea",
            border: "1.5px solid #ffe082",
            borderRadius: 14,
            padding: "18px 24px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            marginBottom: 52,
          }}
        >
          <AlertCircle
            size={22}
            color="#f59e0b"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#92400e",
                marginBottom: 4,
              }}
            >
              Important Note on Delays
            </div>
            <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
              Delivery timelines are estimates and not guaranteed. During peak
              periods such as festive sales, national holidays, or adverse
              weather conditions, deliveries may experience delays of 1–3
              additional business days. 3Arrow will proactively notify you of
              significant delays via email and SMS. We are not liable for delays
              caused by third-party logistics partners or events beyond our
              reasonable control.
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Common shipping questions — answered clearly.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${openFaq === i ? "#5CB74B" : "#e8f5e2"}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "border 0.2s",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "18px 22px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}
                  >
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp size={18} color="#5CB74B" />
                  ) : (
                    <ChevronDown size={18} color="#999" />
                  )}
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 22px 18px",
                      fontSize: 13.5,
                      color: "#555",
                      lineHeight: 1.7,
                      borderTop: "1px solid #e8f5e2",
                    }}
                  >
                    <div style={{ paddingTop: 14 }}>{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT CTA ── */}
        <section>
          <div
            style={{
              background: "linear-gradient(135deg, #5CB74B, #3d9e2e)",
              borderRadius: 20,
              padding: isMobile ? "28px 20px" : "40px 36px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              gap: 24,
            }}
          >
            <div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 800,
                  margin: "0 0 8px",
                }}
              >
                Shipping question or issue?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                Our support team is available 7 days a week to help you.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <a
                href="mailto:support@3arrow.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  color: "#5CB74B",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  flex: isMobile ? 1 : "none",
                  justifyContent: isMobile ? "center" : "flex-start",
                }}
              >
                <Mail size={16} /> Email Support
              </a>
              <Link
                to="/contact"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  flex: isMobile ? 1 : "none",
                  justifyContent: isMobile ? "center" : "flex-start",
                }}
              >
                <Phone size={16} /> Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          background: "#fff",
          borderTop: "1px solid #e8f5e2",
          padding: isMobile ? "16px 16px" : "18px 32px",
          textAlign: "center",
          fontSize: 12,
          color: "#999",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: isMobile ? 8 : 4,
            alignItems: "center",
          }}
        >
          <span>© 2026 3Arrow. All rights reserved.</span>
          {[
            { to: "/privacy-policy", label: "Privacy Policy" },
            { to: "/refund-policy", label: "Refund Policy" },
            { to: "/cancellation-policy", label: "Cancellation Policy" },
            { to: "/terms-and-conditions", label: "Terms of Service" },
          ].map(({ to, label }) => (
            <React.Fragment key={to}>
              {!isMobile && <span>&nbsp;|&nbsp;</span>}
              <Link
                to={to}
                style={{ color: "#5CB74B", textDecoration: "none" }}
              >
                {label}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
