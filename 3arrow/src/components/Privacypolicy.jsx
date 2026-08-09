import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Eye,
  Lock,
  UserCheck,
  Share2,
  Cookie,
  Bell,
  Trash2,
  Globe,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertCircle,
  FileText,
  Database,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

const lastUpdated = "March 2026";

const sections = [
  {
    id: "collection",
    icon: Database,
    title: "Information We Collect",
    color: "#5CB74B",
    content: [
      {
        subtitle: "Personal Information",
        items: [
          "Name, email address, phone number, and delivery address",
          "Payment information (processed securely; we do not store card details)",
          "Account credentials (username and hashed password)",
          "Date of birth for age-verification purposes",
        ],
      },
      {
        subtitle: "Usage & Behavioural Data",
        items: [
          "Pages visited, search queries, and products viewed",
          "Cart contents and purchase history",
          "Device type, browser, IP address, and operating system",
          "Referral source and time spent on pages",
        ],
      },
      {
        subtitle: "Communications",
        items: [
          "Messages sent to our customer support team",
          "Feedback, reviews, and survey responses",
          "Emails and notifications you opt into",
        ],
      },
    ],
  },
  {
    id: "use",
    icon: Eye,
    title: "How We Use Your Information",
    color: "#3da32e",
    content: [
      {
        subtitle: "Order & Account Management",
        items: [
          "Process orders, payments, and delivery logistics",
          "Send order confirmations, shipping updates, and invoices",
          "Manage your account and preferences",
          "Handle returns, refunds, and customer support requests",
        ],
      },
      {
        subtitle: "Personalisation & Marketing",
        items: [
          "Recommend products based on your browsing and purchase history",
          "Send promotional offers, newsletters, and personalised deals (with consent)",
          "Display relevant ads on third-party platforms (with consent)",
        ],
      },
      {
        subtitle: "Platform Improvement",
        items: [
          "Analyse usage patterns to improve site performance and UX",
          "Conduct A/B testing and product research",
          "Detect and prevent fraud, abuse, and security threats",
          "Comply with legal obligations and resolve disputes",
        ],
      },
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "Sharing Your Information",
    color: "#5CB74B",
    content: [
      {
        subtitle: "Service Providers",
        items: [
          "Delivery and logistics partners to fulfil your orders",
          "Payment gateways for secure transaction processing",
          "Cloud hosting providers to operate our platform",
          "Analytics tools to understand site performance",
        ],
      },
      {
        subtitle: "Legal & Safety",
        items: [
          "Law enforcement or regulators when required by law",
          "To protect the rights, property, or safety of 3Arrow, our users, or the public",
          "In connection with a merger, acquisition, or sale of business assets",
        ],
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Tracking",
    color: "#3da32e",
    content: [
      {
        subtitle: "Types of Cookies We Use",
        items: [
          "Essential cookies — required for the site to function (login sessions, cart)",
          "Analytics cookies — help us understand how visitors use the site",
          "Preference cookies — remember your language, currency, and layout choices",
          "Marketing cookies — used to serve relevant ads (only with your consent)",
        ],
      },
      {
        subtitle: "Managing Cookies",
        items: [
          "You can manage or disable cookies via your browser settings at any time",
          "Disabling essential cookies may affect site functionality",
          "Third-party cookies are governed by those parties' privacy policies",
        ],
      },
    ],
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "Your Rights",
    color: "#5CB74B",
    content: [
      {
        subtitle: "Access & Control",
        items: [
          "Right to access — request a copy of the personal data we hold about you",
          "Right to rectification — correct inaccurate or incomplete data",
          "Right to erasure — ask us to delete your personal data ('right to be forgotten')",
          "Right to restriction — limit how we process your data in certain circumstances",
        ],
      },
      {
        subtitle: "Portability & Objection",
        items: [
          "Right to data portability — receive your data in a structured, machine-readable format",
          "Right to object — opt out of direct marketing or profiling at any time",
          "Right to withdraw consent — where processing is based on consent, you may withdraw it at any time",
        ],
      },
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "Data Security",
    color: "#3da32e",
    content: [
      {
        subtitle: "Security Measures",
        items: [
          "TLS/SSL encryption for all data transmitted to and from our platform",
          "AES-256 encryption for sensitive data stored at rest",
          "Regular third-party security audits and penetration testing",
          "Strict access controls — only authorised personnel can access personal data",
          "Payment card data is handled exclusively by PCI-DSS certified partners",
        ],
      },
      {
        subtitle: "Incident Response",
        items: [
          "We maintain a documented incident response plan",
          "You will be notified without undue delay if a breach affects your data",
          "We cooperate fully with regulatory bodies in case of a data incident",
        ],
      },
    ],
  },
  {
    id: "retention",
    icon: Trash2,
    title: "Data Retention",
    color: "#5CB74B",
    content: [
      {
        subtitle: "Retention Periods",
        items: [
          "Account data — retained while your account is active and for up to 3 years after closure",
          "Order and transaction records — kept for 7 years to meet financial and legal obligations",
          "Marketing preferences and consent records — retained for the duration of the relationship",
          "Support communications — stored for 2 years after the last interaction",
        ],
      },
      {
        subtitle: "Deletion & Anonymisation",
        items: [
          "Data no longer required is securely deleted or anonymised",
          "You may request early deletion via our support team, subject to legal obligations",
          "Anonymised, aggregated data may be retained indefinitely for research purposes",
        ],
      },
    ],
  },
  {
    id: "children",
    icon: ShieldCheck,
    title: "Children's Privacy",
    color: "#3da32e",
    content: [
      {
        subtitle: "Age Requirements",
        items: [
          "Our platform is not intended for children under 13 years of age",
          "We do not knowingly collect personal information from children under 13",
          "If you believe a child has provided us data, please contact us for immediate removal",
          "Users aged 13–18 must have parental or guardian consent to use our services",
        ],
      },
    ],
  },
  {
    id: "updates",
    icon: RefreshCw,
    title: "Policy Updates",
    color: "#5CB74B",
    content: [
      {
        subtitle: "How We Notify You",
        items: [
          "We may update this policy periodically to reflect legal changes or new practices",
          "Significant changes will be communicated via email or a prominent site notice",
          "The 'Last updated' date at the top of this page reflects the most recent revision",
          "Continued use of our platform after updates constitutes acceptance of the revised policy",
        ],
      },
    ],
  },
];

const faqs = [
  {
    q: "Does 3Arrow sell my personal data to third parties?",
    a: "No. We never sell your personal data to third parties. We may share data with trusted service providers who help us operate our platform, but they are contractually bound to use your data only for the purposes we specify.",
  },
  {
    q: "How can I request deletion of my account and data?",
    a: "You can request account and data deletion by emailing privacy@3arrow.com or through the 'Delete Account' option in your profile settings. We will process your request within 30 days, subject to any legal retention obligations.",
  },
  {
    q: "Is my payment information stored on 3Arrow servers?",
    a: "No. We do not store your full card details. All payment transactions are handled by PCI-DSS certified payment gateways. We only retain masked card identifiers (last 4 digits) for your reference.",
  },
  {
    q: "Can I opt out of marketing communications?",
    a: "Yes. You can unsubscribe from marketing emails at any time using the 'Unsubscribe' link in any email we send, or by updating your notification preferences in your account settings.",
  },
  {
    q: "How do I know if there has been a data breach?",
    a: "If a breach occurs that affects your personal data, we will notify you via email without undue delay, and no later than 72 hours after becoming aware of the incident. We will also notify the relevant data protection authorities as required by law.",
  },
  {
    q: "Does 3Arrow use my data for targeted advertising?",
    a: "Only with your explicit consent. You can manage your advertising preferences and consent settings in your account under 'Privacy Settings'. Withdrawing consent will stop personalised ad targeting.",
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

export default function PrivacyPolicy() {
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
          <ShieldCheck size={34} color="#fff" />
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
          Privacy Policy
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
          Your privacy matters to us. Here's a clear, honest explanation of what
          data we collect, how we use it, and the rights you have.
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
              icon: Lock,
              label: "Data Encrypted",
              sub: "TLS & AES-256 at rest",
            },
            {
              icon: UserCheck,
              label: "Your Rights",
              sub: "Access, edit or delete anytime",
            },
            {
              icon: Globe,
              label: "No Data Selling",
              sub: "We never sell your data",
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
        {/* ── QUICK NAV ── */}
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              marginBottom: 6,
              color: "#1a1a1a",
            }}
          >
            Policy Overview
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
            Jump to the section most relevant to you
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
              gap: 14,
            }}
          >
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fff",
                  border: "1.5px solid #e8f5e2",
                  borderRadius: 12,
                  padding: "12px 16px",
                  textDecoration: "none",
                  color: "#333",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#5CB74B";
                  e.currentTarget.style.boxShadow =
                    "0 2px 12px rgba(92,183,75,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8f5e2";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    background: "#edfce8",
                    borderRadius: 8,
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <s.icon size={14} color="#5CB74B" />
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: isMobile ? "normal" : "nowrap",
                  }}
                >
                  {s.title}
                </span>
                <ArrowRight
                  size={12}
                  color="#5CB74B"
                  style={{ flexShrink: 0 }}
                />
              </a>
            ))}
          </div>
        </section>

        {/* ── POLICY SECTIONS ── */}
        {sections.map((sec) => (
          <section
            id={sec.id}
            key={sec.id}
            style={{ marginBottom: 48, scrollMarginTop: 24 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  background: "#edfce8",
                  borderRadius: 12,
                  padding: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <sec.icon size={20} color={sec.color} />
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {sec.title}
              </h2>
            </div>
            <div
              style={{
                width: 40,
                height: 3,
                background: "#5CB74B",
                borderRadius: 2,
                marginBottom: 24,
                marginLeft: 52,
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : sec.content.length === 1
                    ? "1fr"
                    : sec.content.length === 2
                      ? "1fr 1fr"
                      : "repeat(3, 1fr)",
                gap: 20,
              }}
            >
              {sec.content.map((block, bi) => (
                <div
                  key={bi}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e8f5e2",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 2px 12px rgba(92,183,75,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#2d7a21",
                      marginBottom: 16,
                      paddingBottom: 10,
                      borderBottom: "1px solid #e8f5e2",
                    }}
                  >
                    {block.subtitle}
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {block.items.map((item, ii) => (
                      <li
                        key={ii}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 13.5,
                          color: "#444",
                          lineHeight: 1.55,
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
              ))}
            </div>
          </section>
        ))}

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
              Important Note on Third-Party Links
            </div>
            <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
              Our platform may contain links to third-party websites and
              services. This Privacy Policy applies solely to 3Arrow. We are not
              responsible for the privacy practices of external sites and
              encourage you to review their policies independently. By using
              3Arrow, you agree to the collection and use of information as
              described in this policy.
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
              color: "#1a1a1a",
            }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
            Common privacy questions — answered clearly.
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
                Questions about your privacy?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                Our Data Protection team is here to help — reach out anytime.
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
                href="mailto:privacy@3arrow.com"
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
                <Mail size={16} /> Email Privacy Team
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
