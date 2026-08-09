import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Package,
  CreditCard,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Truck,
  Ban,
} from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "How long does the refund take to reflect in my account?",
    a: "Once your return is received and inspected, refunds are processed within 5–7 business days. It may take an additional 2–3 business days depending on your bank or payment provider.",
  },
  {
    q: "Can I return a product after 7 days?",
    a: "Returns are accepted within 7 days of delivery. After this window, we are unable to process a return unless the product is defective or damaged.",
  },
  {
    q: "What if I received a wrong or damaged item?",
    a: "We sincerely apologize for the inconvenience. Please contact our support team within 48 hours of delivery with photos of the wrong/damaged item. We'll arrange a replacement or full refund at no extra cost.",
  },
  {
    q: "Are there any products that cannot be returned?",
    a: "Yes. Perishable goods (food items, dairy), personal care products once opened, digital downloads, and items marked 'non-returnable' on the product page are not eligible for returns.",
  },
  {
    q: "Will I get a refund on the delivery charges?",
    a: "Delivery charges are non-refundable unless the return is due to our error (wrong/damaged item). In such cases, we also cover the return shipping cost.",
  },
  {
    q: "Can I exchange instead of getting a refund?",
    a: "Yes! You can choose a direct exchange for the same product in a different size/colour or a different product of equal value. Exchanges are processed at no extra shipping charge.",
  },
];

const steps = [
  {
    icon: Phone,
    title: "Initiate Return",
    desc: "Contact support or go to My Orders and select 'Return Item' within 7 days of delivery.",
    color: "#5CB74B",
  },
  {
    icon: Package,
    title: "Pack & Ship",
    desc: "Pack the item securely in its original packaging. Our team will schedule a pickup.",
    color: "#3da32e",
  },
  {
    icon: ShieldCheck,
    title: "Inspection",
    desc: "Once received, our quality team inspects the item within 2 business days.",
    color: "#5CB74B",
  },
  {
    icon: CreditCard,
    title: "Refund Issued",
    desc: "Approved refunds are credited to your original payment method within 5–7 days.",
    color: "#3da32e",
  },
];

const eligibleItems = [
  "Items in original, unused condition with tags intact",
  "Products with manufacturing defects",
  "Wrong item delivered",
  "Damaged during shipping (report within 48 hrs)",
  "Item significantly different from description",
];

const nonEligibleItems = [
  "Perishable food, dairy & fresh produce",
  "Opened personal care or hygiene products",
  "Digital goods and gift cards",
  "Items marked 'Non-Returnable' on product page",
  "Customised or personalised products",
  "Products without original packaging or tags",
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

export default function RefundPolicy() {
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
      {/* ── HERO BANNER ── */}
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
          <RefreshCw size={34} color="#fff" />
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
          Refund & Return Policy
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
          We want you to love every purchase. If something isn't right, we've
          got you covered with a hassle-free return process.
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
          <Clock size={15} /> Last updated: March 2026
        </div>
      </div>

      {/* ── QUICK HIGHLIGHTS ── */}
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
              icon: RefreshCw,
              label: "7-Day Returns",
              sub: "Easy return window",
            },
            {
              icon: Truck,
              label: "Free Pickup",
              sub: "We collect from your door",
            },
            {
              icon: CreditCard,
              label: "Quick Refund",
              sub: "5–7 business days",
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
        {/* ── HOW IT WORKS ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
              color: "#1a1a1a",
            }}
          >
            How It Works
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Four simple steps to get your refund
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

        {/* ── ELIGIBLE / NOT ELIGIBLE ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Return Eligibility
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            What can and cannot be returned
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
                  Eligible for Return
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
                {eligibleItems.map((item, i) => (
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
                  Not Eligible for Return
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
                {nonEligibleItems.map((item, i) => (
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

        {/* ── REFUND TIMELINE ── */}
        <section style={{ marginBottom: 52 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Refund Timeline
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
            {[
              {
                icon: CreditCard,
                title: "UPI / Net Banking",
                detail: "Fastest refund option",
                time: "3–5 business days",
              },
              {
                icon: ShieldCheck,
                title: "Credit / Debit Card",
                detail: "Subject to bank processing",
                time: "5–7 business days",
              },
              {
                icon: RefreshCw,
                title: "Digital Wallets",
                detail: "Returned to wallet",
                time: "1–3 business days",
              },
              {
                icon: Package,
                title: "Cash on Delivery",
                detail: "Credited to 3Arrow Wallet",
                time: "1–2 business days",
              },
            ].map((m, i) => (
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
                <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>{m.detail}</div>
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
              All returns must be initiated within <strong>7 days</strong> of
              the delivery date. Items must be returned in their original
              packaging with all accessories, tags, and invoices included.
              3Arrow reserves the right to reject returns that do not meet these
              conditions. In case of dispute, 3Arrow's decision shall be final.
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
            Got a question? We probably have the answer.
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

        {/* ── CONTACT SUPPORT ── */}
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
                Still have questions?
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

      {/* ── FOOTER NOTE ── */}
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
