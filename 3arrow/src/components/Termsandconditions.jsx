import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  Mail,
  Phone,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const lastUpdated = "March 2026";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    content: `By accessing, browsing, or using the 3Arrow platform — including our website, mobile application, or any related service — you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, along with our Privacy Policy and Refund & Return Policy, which are incorporated herein by reference. If you do not agree with any part of these terms, you must discontinue use of our platform immediately.

These Terms constitute a legally binding agreement between you ("User", "Customer", or "you") and 3Arrow ("we", "us", or "our"), a company duly incorporated and operating under the laws of India. We reserve the right to update, amend, or replace any part of these Terms at our sole discretion. Your continued use of the platform following the posting of any changes constitutes acceptance of those changes. It is your responsibility to review these Terms periodically.`,
  },
  {
    id: "eligibility",
    number: "02",
    title: "Eligibility & Account Registration",
    content: `To use our platform, you must be at least 18 years of age or the age of legal majority in your jurisdiction. By creating an account, you represent and warrant that all information you provide is accurate, current, and complete, and that you will maintain and promptly update your information to keep it accurate and complete. Users between the ages of 13 and 17 may use the platform only under the supervision of a parent or legal guardian who agrees to be bound by these Terms on their behalf.

You are responsible for maintaining the confidentiality of your account credentials, including your password. You agree to notify 3Arrow immediately of any unauthorised use of your account or any other breach of security. 3Arrow will not be liable for any loss or damage arising from your failure to protect your account credentials. Each user may maintain only one active account; duplicate accounts may be suspended or terminated without notice.`,
  },
  {
    id: "products",
    number: "03",
    title: "Products, Pricing & Availability",
    content: `3Arrow strives to display product information, images, and pricing as accurately as possible. However, we do not warrant that product descriptions, pricing, or any other content on the platform is error-free, complete, or current. In the event a product is listed at an incorrect price due to a typographical error or system error, we reserve the right to refuse or cancel any orders placed at the incorrect price, regardless of whether the order has been confirmed or payment has been processed.

All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated. Product availability is subject to change without notice. We reserve the right to limit the quantity of any product purchased per order, per account, or per household, and to discontinue any product at any time. Promotional prices, discounts, and offers are valid only for the specified period and cannot be combined with other offers unless explicitly stated.`,
  },
  {
    id: "orders",
    number: "04",
    title: "Orders & Payment",
    content: `Placing an order on 3Arrow constitutes an offer to purchase the selected product(s) at the listed price. An order is confirmed only upon receipt of our order confirmation email or notification. We reserve the right to refuse or cancel any order at any time for reasons including but not limited to product unavailability, inaccuracies in product or pricing information, suspected fraudulent activity, or failure to meet eligibility requirements.

Payment must be completed at the time of order placement. We accept major payment methods including UPI, net banking, credit and debit cards, popular digital wallets, and Cash on Delivery (COD) where available. All online transactions are processed through secure, PCI-DSS certified payment gateways. 3Arrow does not store your full card details on its servers. In the event of a payment dispute or chargeback, 3Arrow reserves the right to suspend your account pending resolution.`,
  },
  {
    id: "delivery",
    number: "05",
    title: "Delivery & Shipping",
    content: `3Arrow aims to deliver all orders within the estimated delivery window communicated at the time of order placement. Delivery timelines are indicative and may vary due to factors beyond our reasonable control, including weather conditions, public holidays, logistics disruptions, or force majeure events. We are not liable for delays caused by third-party delivery partners, incorrect addresses provided by the customer, or circumstances outside our control.

Delivery is available to serviceable pin codes only. It is your responsibility to ensure that someone is available at the delivery address to receive the order. In the event of a failed delivery attempt, our logistics partner will make a reasonable number of re-attempts before the order is returned to our warehouse. Additional re-delivery charges may apply. Title and risk of loss for products pass to you upon delivery to the specified address.`,
  },
  {
    id: "returns",
    number: "06",
    title: "Returns, Refunds & Cancellations",
    content: `Our return and refund process is governed by our Refund & Return Policy, which forms an integral part of these Terms. In summary, eligible items may be returned within 7 days of delivery, provided they are in their original, unused condition with all original packaging, tags, accessories, and invoices intact. Certain categories of products, including perishable items, personal care products once opened, digital goods, and items explicitly marked as non-returnable, are not eligible for return.

Order cancellations are permitted before the order has been dispatched. Once dispatched, the order cannot be cancelled and must instead follow the return process. Refunds for eligible returns will be processed to the original payment method within the timelines specified in our Refund Policy. 3Arrow reserves the right to assess the condition of returned goods and reject returns that do not meet the stipulated criteria.`,
  },
  {
    id: "intellectual",
    number: "07",
    title: "Intellectual Property",
    content: `All content available on the 3Arrow platform — including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software — is the property of 3Arrow or its content suppliers and is protected by applicable Indian and international intellectual property laws. The compilation of all content on this platform is the exclusive property of 3Arrow.

You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of the platform or its content without express written permission from 3Arrow. Unauthorised use of our trademarks, trade names, logos, or any other proprietary information is strictly prohibited and may result in legal action. Any feedback, suggestions, or ideas you submit to us may be used by 3Arrow without any obligation to compensate you or maintain confidentiality.`,
  },
  {
    id: "conduct",
    number: "08",
    title: "User Conduct & Prohibited Activities",
    content: `You agree to use the 3Arrow platform solely for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the platform. You must not engage in any conduct that is harmful, abusive, harassing, defamatory, obscene, fraudulent, or otherwise objectionable. You are prohibited from attempting to gain unauthorised access to any part of the platform, its servers, or any systems or networks connected to it.

Specifically, you may not use the platform to: distribute unsolicited commercial communications (spam); impersonate any person or entity; interfere with or disrupt the integrity or performance of the platform; harvest or collect personal information of other users without consent; engage in any activity that could harm minors; or circumvent, disable, or otherwise interfere with security-related features of the platform. 3Arrow reserves the right to terminate your account and pursue legal remedies for any violations of this section.`,
  },
  {
    id: "liability",
    number: "09",
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by applicable law, 3Arrow, its directors, employees, partners, agents, suppliers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the platform; any conduct or content of any third party on the platform; any products obtained through the platform; or unauthorised access, use, or alteration of your transmissions or content.

Our total liability to you for any claim arising out of or relating to these Terms or your use of the platform shall not exceed the amount paid by you to 3Arrow in the twelve (12) months preceding the event giving rise to such claim, or INR 5,000, whichever is greater. Some jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, so the above limitation may not apply to you.`,
  },
  {
    id: "disclaimer",
    number: "10",
    title: "Disclaimer of Warranties",
    content: `The 3Arrow platform and all products and services offered through it are provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. 3Arrow expressly disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that the platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components.

3Arrow does not warrant the accuracy, completeness, or reliability of any content, product descriptions, or user-generated content on the platform. Any reliance you place on such information is strictly at your own risk. We reserve the right to modify, suspend, or discontinue the platform (or any part thereof) at any time without notice or liability.`,
  },
  {
    id: "thirdparty",
    number: "11",
    title: "Third-Party Links & Services",
    content: `The 3Arrow platform may contain links to third-party websites, services, or resources that are not owned or controlled by us. These links are provided for your convenience only. 3Arrow has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We do not endorse or assume any responsibility for any such third-party sites, information, materials, products, or services.

If you access a third-party website from our platform, you do so at your own risk and subject to that website's terms and conditions. We strongly encourage you to review the terms and privacy policy of every website you visit. Our platform may also integrate third-party services such as payment gateways and logistics providers; your use of such services is governed by their respective terms and policies.`,
  },
  {
    id: "governing",
    number: "12",
    title: "Governing Law & Dispute Resolution",
    content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or in connection with these Terms, including any question regarding their existence, validity, or termination, shall first be attempted to be resolved through good-faith negotiation between the parties.

If a dispute cannot be resolved through negotiation within 30 days, it shall be referred to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 (as amended). The seat of arbitration shall be Bengaluru, Karnataka, India, and proceedings shall be conducted in English. For matters not subject to arbitration, the courts of Bengaluru, Karnataka shall have exclusive jurisdiction. You waive any objection to the laying of venue of any such proceeding in Bengaluru.`,
  },
  {
    id: "termination",
    number: "13",
    title: "Termination",
    content: `3Arrow reserves the right to suspend or terminate your account and access to the platform at any time, with or without cause, and with or without notice, including if we believe that you have violated these Terms. Upon termination, your right to use the platform will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.

You may also terminate your account at any time by contacting our support team. Upon account termination at your request, we will handle your personal data in accordance with our Privacy Policy. Termination does not relieve you of any obligations incurred prior to termination, including payment obligations for completed orders.`,
  },
  {
    id: "miscellaneous",
    number: "14",
    title: "Miscellaneous",
    content: `These Terms, together with our Privacy Policy and Refund & Return Policy, constitute the entire agreement between you and 3Arrow with respect to your use of the platform and supersede all prior agreements, understandings, and communications, whether written or oral. If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.

Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. We may assign our rights and obligations under these Terms to a third party without your consent in connection with a merger, acquisition, or sale of all or substantially all of our assets. You may not assign your rights under these Terms without our prior written consent. These Terms do not confer any third-party beneficiary rights.`,
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

export default function TermsAndConditions() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeId, setActiveId] = useState("acceptance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveId(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <FileText size={34} color="#fff" />
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
          Terms & Conditions
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
          Please read these terms carefully before using the 3Arrow platform.
          They govern your access to and use of our services.
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
              icon: FileText,
              label: "14 Sections",
              sub: "Comprehensive coverage",
            },
            {
              icon: ShieldCheck,
              label: "Your Protection",
              sub: "Rights clearly outlined",
            },
            {
              icon: Clock,
              label: "Effective Immediately",
              sub: "Upon using our platform",
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

      {/* ── MAIN LAYOUT: SIDEBAR + CONTENT ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "24px 16px 48px" : "40px 24px 60px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "260px 1fr",
          gap: 36,
          alignItems: "start",
        }}
      >
        {/* ── SIDEBAR (mobile: collapsible accordion, desktop: sticky) ── */}
        {isMobile ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e8f5e2",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                color: "#1a1a1a",
              }}
            >
              <span>Table of Contents</span>
              {sidebarOpen ? (
                <ChevronUp size={18} color="#5CB74B" />
              ) : (
                <ChevronUp
                  size={18}
                  color="#5CB74B"
                  style={{ transform: "rotate(180deg)" }}
                />
              )}
            </button>
            {sidebarOpen && (
              <div style={{ borderTop: "1px solid #e8f5e2" }}>
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => {
                      setActiveId(sec.id);
                      setSidebarOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 20px",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: activeId === sec.id ? 700 : 500,
                      color: activeId === sec.id ? "#5CB74B" : "#555",
                      background:
                        activeId === sec.id ? "#edfce8" : "transparent",
                      borderLeft: `3px solid ${activeId === sec.id ? "#5CB74B" : "transparent"}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: activeId === sec.id ? "#5CB74B" : "#bbb",
                        minWidth: 22,
                      }}
                    >
                      {sec.number}
                    </span>
                    {sec.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <aside
            style={{
              position: "sticky",
              top: 24,
              background: "#fff",
              border: "1.5px solid #e8f5e2",
              borderRadius: 16,
              padding: "20px 0",
              boxShadow: "0 2px 12px rgba(92,183,75,0.07)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#999",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0 20px 14px",
                borderBottom: "1px solid #e8f5e2",
                marginBottom: 8,
              }}
            >
              Table of Contents
            </div>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveId(sec.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 20px",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: activeId === sec.id ? 700 : 500,
                  color: activeId === sec.id ? "#5CB74B" : "#555",
                  background: activeId === sec.id ? "#edfce8" : "transparent",
                  borderLeft: `3px solid ${activeId === sec.id ? "#5CB74B" : "transparent"}`,
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: activeId === sec.id ? "#5CB74B" : "#bbb",
                    minWidth: 22,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {sec.number}
                </span>
                {sec.title}
              </a>
            ))}
          </aside>
        )}

        {/* ── CONTENT ── */}
        <main>
          {/* Intro note */}
          <div
            style={{
              background: "#fffbea",
              border: "1.5px solid #ffe082",
              borderRadius: 14,
              padding: "16px 22px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              marginBottom: 40,
            }}
          >
            <AlertCircle
              size={20}
              color="#f59e0b"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.65 }}>
              <strong>Please read carefully.</strong> By using the 3Arrow
              platform you agree to all terms below. If you have any questions,
              contact us before placing an order.
            </div>
          </div>

          {/* Sections */}
          {sections.map((sec, idx) => (
            <section
              id={sec.id}
              key={sec.id}
              style={{ marginBottom: 40, scrollMarginTop: 28 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #5CB74B, #3d9e2e)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    borderRadius: 10,
                    minWidth: 40,
                    height: 40,
                    letterSpacing: "0.02em",
                    flexShrink: 0,
                  }}
                >
                  {sec.number}
                </span>
                <h2
                  style={{
                    fontSize: isMobile ? 17 : 20,
                    fontWeight: 800,
                    margin: 0,
                    color: "#1a1a1a",
                  }}
                >
                  {sec.title}
                </h2>
              </div>
              <div
                style={{
                  width: 36,
                  height: 3,
                  background: "#5CB74B",
                  borderRadius: 2,
                  marginBottom: 16,
                  marginLeft: 54,
                }}
              />
              <div
                style={{
                  background: "#fff",
                  border: "1.5px solid #e8f5e2",
                  borderRadius: 16,
                  padding: isMobile ? "20px 18px" : "28px 32px",
                  boxShadow: "0 2px 12px rgba(92,183,75,0.05)",
                }}
              >
                {sec.content.split("\n\n").map((para, pi) => (
                  <p
                    key={pi}
                    style={{
                      fontSize: isMobile ? 13.5 : 14.5,
                      color: "#444",
                      lineHeight: 1.85,
                      margin: pi === 0 ? "0 0 16px" : "0",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
              {idx < sections.length - 1 && (
                <div
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(to right, #e8f5e2, transparent)",
                    marginTop: 40,
                  }}
                />
              )}
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
              marginBottom: 48,
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
                Entire Agreement
              </div>
              <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.65 }}>
                These Terms & Conditions, together with the{" "}
                <Link
                  to="/privacy"
                  style={{ color: "#5CB74B", fontWeight: 600 }}
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  to="/refund-policy"
                  style={{ color: "#5CB74B", fontWeight: 600 }}
                >
                  Refund & Return Policy
                </Link>
                , constitute the entire agreement between you and 3Arrow. In
                case of any conflict between documents, these Terms shall
                prevail unless otherwise specified.
              </div>
            </div>
          </div>

          {/* ── CONTACT CTA ── */}
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
                Have questions about these Terms?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                Our team is available 7 days a week to assist you.
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
                href="mailto:legal@3arrow.com"
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
                <Mail size={16} /> Email Legal Team
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
        </main>
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

      {/* ── SCROLL TO TOP ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            background: "linear-gradient(135deg, #5CB74B, #3d9e2e)",
            border: "none",
            borderRadius: "50%",
            width: 46,
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(92,183,75,0.4)",
            zIndex: 999,
          }}
        >
          <ChevronUp size={22} color="#fff" />
        </button>
      )}
    </div>
  );
}
