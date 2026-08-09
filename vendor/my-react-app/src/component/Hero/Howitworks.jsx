import React, { useEffect, useRef, useState } from "react";

/* ─── Step Data ─────────────────────────────────────────────── */
const steps = [
  {
    number: "01",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect
          x="4"
          y="8"
          width="32"
          height="24"
          rx="4"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="M4 14h32" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="10" cy="11" r="1.5" fill="currentColor" />
        <circle cx="16" cy="11" r="1.5" fill="currentColor" />
        <circle cx="22" cy="11" r="1.5" fill="currentColor" />
        <path
          d="M10 22h8M10 27h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Register & Sign In",
    subtitle: "Create Your Account",
    description:
      "Sign up as a vendor on the 3arrow platform using your business details — GST, PAN, and store info. Existing vendors log in directly to their dashboard.",
    features: [
      "Business verification",
      "Secure OTP login",
      "GST & PAN onboarding",
    ],
    color: "#45AB75",
    lightColor: "#e8f8ef",
  },
  {
    number: "02",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path
          d="M20 4L4 12v8c0 8.836 6.863 17.115 16 19 9.137-1.885 16-10.164 16-19v-8L20 4z"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M13 20l5 5 9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Get Approved",
    subtitle: "Onboarding Review",
    description:
      "Our team reviews your documents and store details within 24–48 hours. Once approved, you get full access to the vendor portal and can start adding your catalog.",
    features: [
      "24–48 hr review",
      "Document verification",
      "Dedicated onboarding support",
    ],
    color: "#FB8107",
    lightColor: "#fff5e8",
  },
  {
    number: "03",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect
          x="5"
          y="5"
          width="30"
          height="30"
          rx="4"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="M5 15h30M15 15v20" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M22 22h8M22 27h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Add Categories & Products",
    subtitle: "Build Your Catalog",
    description:
      "Organize your store by adding product categories and listing items with images, descriptions, and prices. Bulk upload is supported for large catalogs.",
    features: [
      "Unlimited categories",
      "Bulk product upload",
      "Rich media support",
    ],
    color: "#45AB75",
    lightColor: "#e8f8ef",
  },
  {
    number: "04",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path
          d="M8 10h24l-3 15H11L8 10z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 10L6 4H3"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="14"
          cy="32"
          r="2.5"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle
          cx="26"
          cy="32"
          r="2.5"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M11 19h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Manage Orders",
    subtitle: "Fulfill & Track",
    description:
      "Receive real-time order notifications. Accept, process, and hand off to our delivery network — all from one clean dashboard. Track every order's status live.",
    features: [
      "Real-time alerts",
      "Order accept / reject",
      "Live delivery tracking",
    ],
    color: "#FB8107",
    lightColor: "#fff5e8",
  },
  {
    number: "05",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path
          d="M6 20c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14S6 27.732 6 20z"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M20 12v8l5 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 24h4M26 24h-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Add Coupons & Offers",
    subtitle: "Boost Your Sales",
    description:
      "Create time-limited discount coupons, flash deals, and BOGO offers to attract more customers and increase repeat purchases directly from your dashboard.",
    features: [
      "Custom discount codes",
      "Flash sale scheduler",
      "Min-order conditions",
    ],
    color: "#45AB75",
    lightColor: "#e8f8ef",
  },
  {
    number: "06",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path
          d="M6 32V16l14-10 14 10v16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect
          x="15"
          y="22"
          width="10"
          height="10"
          rx="1"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M20 22v10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 20h3M25 20h3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Manage Inventory",
    subtitle: "Stay in Control",
    description:
      "Set stock levels, get low-stock alerts, and update availability in real time. Never miss a sale due to stockouts with our smart inventory management tools.",
    features: ["Live stock updates", "Low-stock alerts", "Bulk edit support"],
    color: "#FB8107",
    lightColor: "#fff5e8",
  },
  {
    number: "07",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect
          x="5"
          y="8"
          width="30"
          height="24"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="M5 16h30" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M13 24h4v4h-4zM23 24h4v4h-4z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M20 12v4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Track Payments & Analytics",
    subtitle: "Grow Smarter",
    description:
      "View your earnings, payout history, and performance analytics on a powerful dashboard. Understand which products sell best and where your growth opportunities lie.",
    features: ["Weekly payouts", "Revenue analytics", "Top product insights"],
    color: "#45AB75",
    lightColor: "#e8f8ef",
  },
];

/* ─── Single Step Card ──────────────────────────────────────── */
const StepCard = ({ step, index, isLast }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16 md:mb-24 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{
        transitionDelay: `${index * 60}ms`,
        flexDirection: isEven ? "row" : "row-reverse",
      }}
    >
      {/* ── Content Side ── */}
      <div className="flex-1 w-full">
        <div
          className="relative bg-white rounded-2xl p-7 md:p-9 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-500 overflow-hidden"
          style={{ "--accent": step.color, "--light": step.lightColor }}
        >
          {/* Accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ background: step.color }}
          />

          {/* Tag */}
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: step.lightColor, color: step.color }}
          >
            {step.subtitle}
          </span>

          {/* Title row */}
          <div className="flex items-start gap-4 mb-3">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: step.lightColor, color: step.color }}
            >
              {step.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight pt-1">
              {step.title}
            </h3>
          </div>

          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-5">
            {step.description}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {step.features.map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: step.color + "40",
                  color: step.color,
                  backgroundColor: step.lightColor,
                }}
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path
                    d="M10 3L5 8.5 2 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step Number / Connector ── */}
      <div className="flex-shrink-0 flex flex-col items-center z-10">
        {/* Circle */}
        <div
          className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-extrabold text-base md:text-lg shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
          }}
        >
          {step.number}
        </div>
        {/* Vertical line */}
        {!isLast && (
          <div
            className="w-0.5 mt-4 hidden md:block"
            style={{
              height: "calc(100% + 6rem)",
              background: `linear-gradient(to bottom, ${step.color}80, transparent)`,
              position: "absolute",
              top: "4rem",
            }}
          />
        )}
      </div>

      {/* ── Visual Side (decorative stat card) ── */}
      <div className="flex-1 w-full hidden md:flex items-center justify-center">
        <div
          className="rounded-2xl p-6 text-center w-full max-w-xs"
          style={{ backgroundColor: step.lightColor }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: step.color + "20", color: step.color }}
          >
            {step.icon}
          </div>
          <div
            className="text-4xl font-extrabold mb-1"
            style={{ color: step.color }}
          >
            {["↗", "✓", "∞", "⚡", "%", "📦", "₹"][index]}
          </div>
          <p className="text-gray-600 text-sm font-medium">{step.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Section ──────────────────────────────────────────── */
const HowItWorks = ({ onOpenModal }) => {
  const titleRef = useRef(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setTitleVisible(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="bg-[#f3f7f4] py-16 md:py-24 px-5 sm:px-8 md:px-16 lg:px-20 scroll-mt-[60px]"
    >
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div
          ref={titleRef}
          className={`text-center mb-16 md:mb-20 transition-all duration-700 ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Pill label */}
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Vendor Journey
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            How It{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            From signing up to growing your business — here's your complete
            journey as a 3arrow vendor, step by step.
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === 0 ? "28px" : "8px",
                  height: "8px",
                  backgroundColor: s.color,
                  opacity: i === 0 ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Steps ── */}
        <div className="relative">
          {/* Vertical timeline line (desktop only) */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px hidden md:block"
            style={{
              background:
                "linear-gradient(to bottom, #299E6020, #299E6060, #299E6020)",
            }}
          />

          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* ── CTA Banner ── */}
        <div className="mt-8 md:mt-12 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl md:rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Start Your Journey?
          </h3>
          <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto mb-7 leading-relaxed">
            Join 10,000+ vendors already growing on 3arrow. Onboard in minutes,
            start selling today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onOpenModal}
              className="bg-white text-green-700 px-7 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-300 text-sm md:text-base shadow-md"
            >
              Start Selling Now
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("partner");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="border border-white/50 text-white px-7 py-3 rounded-xl font-semibold hover:bg-white/10 transition duration-300 text-sm md:text-base"
            >
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
