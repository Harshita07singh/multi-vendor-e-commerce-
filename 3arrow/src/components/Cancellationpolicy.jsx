import React, { useState, useEffect } from "react";
import {
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Package,
  Ban,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

const lastUpdated = "March 2026";

const steps = [
  {
    icon: Package,
    title: "Go to My Orders",
    desc: "Log in to your 3Arrow account and navigate to 'My Orders' from your profile menu.",
    color: "#5CB74B",
  },
  {
    icon: XCircle,
    title: "Select 'Cancel Order'",
    desc: "Find the order you wish to cancel and click the 'Cancel Order' button next to it.",
    color: "#3da32e",
  },
  {
    icon: CheckCircle,
    title: "Choose a Reason",
    desc: "Select a cancellation reason from the dropdown and confirm your cancellation request.",
    color: "#5CB74B",
  },
  {
    icon: CreditCard,
    title: "Refund Initiated",
    desc: "Once confirmed, your refund will be processed to the original payment method automatically.",
    color: "#3da32e",
  },
];

const canCancel = [
  "Orders not yet dispatched from our warehouse",
  "Orders placed within the last 24 hours (subject to dispatch status)",
  "Pre-order items before the dispatch date",
  "Subscription orders before the next billing cycle",
  "Bulk or business orders within 12 hours of placement",
];

const cannotCancel = [
  "Orders already dispatched or out for delivery",
  "Orders marked as 'Delivered' in the system",
  "Perishable or fresh produce orders once confirmed",
  "Flash sale or special event orders after the sale ends",
  "Partially delivered orders (use Return process instead)",
  "Orders processed under a promotional coupon after use",
];

const refundTimeline = [
  {
    method: "UPI / Net Banking",
    time: "3–5 business days",
    icon: CreditCard,
    note: "Credited directly to source account",
  },
  {
    method: "Credit / Debit Card",
    time: "5–7 business days",
    icon: ShieldCheck,
    note: "Subject to your bank's processing time",
  },
  {
    method: "Digital Wallets",
    time: "1–3 business days",
    icon: RefreshCw,
    note: "Returned to the wallet used at checkout",
  },
  {
    method: "Cash on Delivery",
    time: "1–2 business days",
    icon: Package,
    note: "Credited to your 3Arrow Wallet",
  },
];

const faqs = [
  {
    q: "Can I cancel an order after it has been dispatched?",
    a: "Unfortunately, once an order has been dispatched from our warehouse, it cannot be cancelled. You may refuse the delivery at the door, after which the item will be returned to us and a refund will be processed as per our Refund Policy.",
  },
  {
    q: "How will I know my cancellation was successful?",
    a: "You will receive a cancellation confirmation via email and SMS within a few minutes of successfully cancelling your order. The order status in 'My Orders' will also update to 'Cancelled'.",
  },
  {
    q: "What if I accidentally cancelled my order?",
    a: "Cancellations cannot be reversed once confirmed. If the cancellation was accidental, you are welcome to place a new order. If the item is no longer available, please contact our support team and we will do our best to assist.",
  },
  {
    q: "Will I get a full refund on cancellation?",
    a: "Yes, cancellations made before dispatch are eligible for a full refund including any delivery charges paid. However, convenience fees charged by payment gateways may not be refundable in all cases.",
  },
  {
    q: "Can I cancel only part of my order?",
    a: "Yes, partial cancellation is supported for multi-item orders. Navigate to 'My Orders', select the specific item(s) you wish to cancel, and follow the cancellation steps. Items already dispatched cannot be partially cancelled.",
  },
  {
    q: "Is there a cancellation fee?",
    a: "3Arrow does not charge any cancellation fee for orders cancelled before dispatch. Repeated or suspicious cancellation activity may result in account review.",
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

export default function CancellationPolicy() {
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
          <XCircle size={34} color="#fff" />
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
          Cancellation Policy
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
          Changed your mind? No worries. Cancel your order before dispatch and
          get a full refund — no questions asked.
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
              icon: XCircle,
              label: "Free Cancellation",
              sub: "Before dispatch, always free",
            },
            {
              icon: RefreshCw,
              label: "Instant Processing",
              sub: "Refund initiated immediately",
            },
            {
              icon: CreditCard,
              label: "Full Refund",
              sub: "100% back to original method",
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
        {/* ── HOW TO CANCEL ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
              color: "#1a1a1a",
            }}
          >
            How to Cancel Your Order
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Four simple steps to cancel and get your refund
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

        {/* ── CAN vs CANNOT ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Cancellation Eligibility
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Check whether your order qualifies for cancellation
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
                  Can Be Cancelled
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
                {canCancel.map((item, i) => (
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
                  Cannot Be Cancelled
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
                {cannotCancel.map((item, i) => (
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
                      <XCircle size={11} color="#e53e3e" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── REFUND TIMELINE ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Refund Timeline After Cancellation
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Refunds are credited to the original payment method used at checkout
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: 20,
            }}
          >
            {refundTimeline.map((m, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1.5px solid #e8f5e2",
                  borderRadius: 16,
                  padding: isMobile ? 16 : 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "#edfce8",
                    borderRadius: 12,
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <m.icon size={22} color="#5CB74B" />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: isMobile ? 13 : 15,
                    color: "#1a1a1a",
                  }}
                >
                  {m.method}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>{m.note}</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#5CB74B",
                    fontWeight: 600,
                    background: "#edfce8",
                    borderRadius: 8,
                    padding: "5px 10px",
                    width: "fit-content",
                  }}
                >
                  <Clock size={12} /> {m.time}
                </div>
              </div>
            ))}
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
              Important Note
            </div>
            <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
              Cancellations are only possible{" "}
              <strong>before the order is dispatched</strong>. Once the order
              status changes to "Shipped" or "Out for Delivery", cancellation is
              no longer available. In such cases, you may refuse delivery and
              initiate a return as per our{" "}
              <Link
                to="/refund-policy"
                style={{ color: "#5CB74B", fontWeight: 600 }}
              >
                Refund & Return Policy
              </Link>
              . Repeated or suspicious cancellation activity may result in
              account review.
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
            Everything you need to know about cancellations.
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
                Need help with a cancellation?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                Our support team is available 7 days a week to assist you.
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
