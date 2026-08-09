import React, { useState, useEffect, useRef } from "react";
import LoginModal from "../LoginModal";
import delivery from "../../assets/delivery.avif";
import growthImage from "../../assets/expogrowth.jpeg";
import reachImage from "../../assets/reach.webp";
import easyImage from "../../assets/easy.webp";
import bike from "../../assets/Vendor.webp";
import Arrow from "../../assets/3Arrow.png";
import Mobilevendor from "../../assets/Mobile vendor banner.jpg.jpeg";
import AOS from "aos";
import "aos/dist/aos.css";
import HowItWorks from "./Howitworks";
/* ─── Inline Navbar ─────────────────────────────────────────── */
const NavbarInline = ({ onOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const sections = ["home", "about", "partner", "blog"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.35 },
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  // const navLinks = [
  //   { id: "home", label: "Home" },
  //   { id: "about", label: "About" },
  //   { id: "partner", label: "Partner" },
  //   { id: "blog", label: "Blog" },
  // ];

  return (
    <nav
      className={`hidden md:block w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-16 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          className="cursor-pointer flex-shrink-0"
          onClick={() => scrollTo("home")}
        >
          <img
            className="h-9 sm:h-11 md:h-13 lg:h-14 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
            src={Arrow}
            alt="3arrow logo"
          />
        </div>

        {/* Desktop Links */}
        {/* <ul className="hidden md:flex gap-6 lg:gap-8 text-sm lg:text-base font-medium text-green-900">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollTo(link.id)}
                className={`relative pb-1 transition-all duration-200 hover:text-green-600 ${
                  activeSection === link.id
                    ? "text-green-700 font-semibold"
                    : "text-gray-700 opacity-80"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-green-500 rounded-full transition-all duration-300 ${
                    activeSection === link.id ? "w-full" : "w-0"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul> */}

        {/* Desktop CTA */}
        <button
          onClick={onOpenModal}
          className="hidden md:block bg-[#f8aa5c] text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-[#e69848] transition duration-300 shadow-sm"
        >
          Start Selling
        </button>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700 text-2xl focus:outline-none p-1"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="bg-white border-t border-gray-100 shadow-lg px-6 pb-5 pt-3 space-y-3 font-medium">
          {/* {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollTo(link.id)}
                className={`w-full text-left text-base transition-all py-1 ${
                  activeSection === link.id
                    ? "text-green-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </button>
            </li>
          ))} */}
          <li>
            <button
              onClick={() => {
                onOpenModal();
                setIsOpen(false);
              }}
              className="w-full text-center bg-[#299E60] text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-green-700 transition"
            >
              Start Selling
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

/* ─── Main Hero Component ────────────────────────────────────── */
const Hero = () => {
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    AOS.init({ once: true, duration: 700 });
  }, []);

  return (
    <div style={{ overflowX: "clip" }}>
      <NavbarInline onOpenModal={() => setOpenModal(true)} />

      <div className="bg-white">
        {/* ═══════════════════════════════════
            HOME SECTION
        ════════════════════════════════════ */}
        <section id="home" className="relative overflow-hidden">
          {/* ── MOBILE HERO: true full-screen with overlay content ── */}
          <div className="md:hidden relative h-screen w-full">
            <img
              src={Mobilevendor}
              alt="Delivery Illustration"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* gradient so text pops */}
            <div className="absolute top-5 left-0 right-0 z-10 px-6 pb-10">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#076807] drop-shadow-md">
                Your Products<span className="text-green-400">.</span>
                <br />
                Delivered<span className="text-green-400">.</span>
              </h1>
              <p className="mt-3 text-sm text-[#073607] leading-relaxed">
                Turn your store into a powerful online business. Offer customers
                the delight of your products and the convenience of doorstep
                deliveries.
              </p>
            </div>
            {/* Bottom content */}
            <div className=" absolute bottom-9 left-0 right-0 z-10 px-6 pb-10">
              <button
                onClick={() => setOpenModal(true)}
                className="mt-0 w-full bg-[#299E60] hover:bg-green-700 active:scale-95 text-white py-4 rounded-2xl text-base font-bold shadow-xl transition-all duration-300"
              >
                Sell on 3arrow
              </button>
            </div>
          </div>

          {/* ── DESKTOP HERO ── */}
          {/* ── DESKTOP HERO ── */}
          <div className="hidden md:block relative h-screen pt-[64px] overflow-hidden">
            <img
              src={bike}
              alt="Delivery Illustration"
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            />
            <div className="relative z-10 flex h-full items-center justify-start px-16 lg:px-24">
              <div
                className="max-w-lg lg:max-w-xl text-left"
                data-aos="fade-right"
              >
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
                  Your Products<span className="text-green-500">.</span>
                  <br />
                  Delivered<span className="text-green-500">.</span>
                </h1>
                <p
                  className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-md"
                  data-aos="fade-up"
                  data-aos-delay="150"
                >
                  Turn your store into a powerful online business. Offer
                  customers the delight of your products and the convenience of
                  doorstep deliveries.
                </p>
                <div data-aos="fade-up" data-aos-delay="300">
                  <button
                    onClick={() => setOpenModal(true)}
                    className="mt-8 inline-block bg-[#299E60] hover:bg-green-700 active:scale-95 text-white px-8 py-3.5 rounded-xl text-lg font-semibold shadow-lg hover:shadow-green-200 hover:shadow-xl transition-all duration-300"
                  >
                    Sell on 3arrow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FEATURES SECTION
        ════════════════════════════════════ */}
        <div className="bg-[#f3f7f4] py-14 md:py-20 px-5 sm:px-8 md:px-16 lg:px-20">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-6 md:gap-8">
            {/* Card 1 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-[0_0_40px_rgba(41,158,96,0.2)] transition duration-500"
              data-aos="fade-up"
            >
              <div className="sm:w-5/12 bg-[#f9fafb] flex items-center justify-center p-5">
                <img
                  src={delivery}
                  alt="Delivery"
                  className="max-h-48 md:max-h-56 w-auto object-contain"
                />
              </div>
              <div className="sm:w-7/12 p-6 md:p-8 flex flex-col justify-center text-center sm:text-left">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-snug">
                  Reach your customers where they are
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  We deliver your product through our dense network of{" "}
                  <span className="font-semibold text-green-600">
                    1500+ dark stores
                  </span>
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-[0_0_40px_rgba(41,158,96,0.2)] transition duration-500"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="sm:w-7/12 p-6 md:p-8 flex flex-col justify-center text-center sm:text-left order-2 sm:order-1">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-snug">
                  Exponential growth opportunity
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  List your products on India's fastest-growing retail channel
                  and grow with us
                </p>
              </div>
              <div className="sm:w-5/12 flex items-center justify-center p-5 order-1 sm:order-2 bg-[#f9fafb]">
                <img
                  src={growthImage}
                  alt="Growth"
                  className="max-h-48 md:max-h-56 w-auto object-contain"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-[0_0_40px_rgba(41,158,96,0.2)] transition duration-500"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="sm:w-7/12 p-6 md:p-8 flex flex-col justify-center text-center sm:text-left">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-snug">
                  Expand your reach
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Your products can now reach millions of customers in{" "}
                  <span className="font-semibold text-green-600">
                    25+ major cities
                  </span>
                </p>
              </div>
              <div className="sm:w-5/12 min-h-[160px] md:min-h-0 overflow-hidden">
                <img
                  src={reachImage}
                  alt="Expand Reach"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Card 4 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-[0_0_40px_rgba(41,158,96,0.2)] transition duration-500"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="sm:w-5/12 min-h-[160px] md:min-h-0 overflow-hidden order-1 sm:order-1">
                <img
                  src={easyImage}
                  alt="Simple and Easy"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="sm:w-7/12 p-6 md:p-8 flex flex-col justify-center text-center sm:text-left order-2 sm:order-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-snug">
                  It's simple and easy
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Onboard your products in minutes and manage your business
                  effortlessly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════
            ABOUT SECTION
        ════════════════════════════════════ */}
        <section
          id="about"
          className="bg-white py-16 md:py-24 px-5 sm:px-8 md:px-16 lg:px-20 scroll-mt-[60px]"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* LEFT – IMAGE */}
            <div className="relative group" data-aos="fade-right">
              <img
                src={growthImage}
                alt="About 3arrow"
                className="rounded-2xl shadow-lg w-full h-64 sm:h-80 md:h-[400px] object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-green-200 opacity-30 rounded-full blur-3xl"></div>
            </div>

            {/* RIGHT – TEXT */}
            <div data-aos="fade-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent leading-tight">
                About 3arrow
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                3arrow is India's fast-growing instant commerce platform built
                to empower local businesses and transform the way customers
                shop.
              </p>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                We connect neighbourhood stores, emerging brands, and trusted
                logistics partners through a powerful digital ecosystem that
                ensures seamless onboarding, real-time inventory management, and
                ultra-fast deliveries.
              </p>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Our vision is simple — make local commerce smarter, faster, and
                more accessible for everyone.
              </p>
            </div>
          </div>
        </section>
        <HowItWorks onOpenModal={() => setOpenModal(true)} />
        {/* Seller Reviews */}
        <div className="bg-[#f3f7f4] py-16 md:py-20 px-5 sm:px-8 md:px-16 lg:px-20">
          <div
            className="max-w-6xl mx-auto text-center mb-12"
            data-aos="fade-up"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              What Our Sellers Say
            </h2>
            <p className="text-gray-500 text-base md:text-lg">
              Thousands of vendors are growing with 3arrow every day
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                review:
                  "3arrow increased my monthly sales by 3x in just 6 months. The onboarding was smooth and the dashboard is very easy to use.",
                name: "Rajesh Kumar",
                role: "Grocery Store Owner",
              },
              {
                review:
                  "The best decision for my business. 3arrow handles logistics while I focus on product quality.",
                name: "Priya Singh",
                role: "Food Products Vendor",
              },
              {
                review:
                  "Reaching customers across multiple cities was never this easy. Highly recommended for growing brands!",
                name: "Amit Patel",
                role: "Electronics Retailer",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-[0_0_35px_rgba(41,158,96,0.2)] transition duration-500 transform hover:-translate-y-1 flex flex-col"
                data-aos="zoom-in"
                data-aos-delay={idx * 100}
              >
                <div className="flex gap-1 mb-4 text-[#299E60]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm md:text-base mb-5 leading-relaxed flex-1">
                  "{item.review}"
                </p>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                    {item.name}
                  </h4>
                  <p className="text-sm text-[#299E60]">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white py-16 md:py-20 px-5 sm:px-8 md:px-16 lg:px-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent leading-tight">
                Our Mission
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                Our mission is to empower local sellers and brands by providing
                a seamless digital platform that connects them directly to
                millions of customers.
              </p>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                We aim to simplify commerce, enable faster deliveries, and
                create exponential growth opportunities for businesses of all
                sizes across India.
              </p>
              <button
                onClick={() => setOpenModal(true)}
                className="mt-8 bg-[#299E60] hover:bg-green-700 active:scale-95 text-white px-7 py-3 rounded-xl text-base font-semibold shadow-md hover:shadow-green-200 hover:shadow-lg transition-all duration-300"
              >
                Start Selling Today
              </button>
            </div>
            <div className="relative group" data-aos="fade-left">
              <img
                src={delivery}
                alt="Our Mission"
                className="rounded-2xl shadow-lg w-full h-64 sm:h-80 md:h-[400px] object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-green-300 opacity-20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-[#f3f7f4] py-16 md:py-24 px-5 sm:px-8 md:px-16 lg:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 relative" data-aos="zoom-in">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">
                <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                  Our Story
                </span>
              </h2>
              <p
                className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                From a small idea to a fast-growing retail ecosystem,{" "}
                <span className="font-semibold text-green-600">3arrow</span> is
                redefining instant commerce across India.
                <br className="hidden md:block" />
                <br className="hidden md:block" />
                <span className="block mt-3 md:mt-0">
                  Built with a simple mission — to connect{" "}
                  <span className="font-semibold">local businesses</span> with
                  customers in the{" "}
                  <span className="font-semibold">
                    fastest and most reliable
                  </span>{" "}
                  way possible. We saw neighbourhood stores struggling to go
                  digital and customers waiting days for essentials. So we
                  decided to change that.
                </span>
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 text-center">
              {[
                { stat: "1500+", label: "Dark Stores", delay: 100 },
                { stat: "40+", label: "Cities Served", delay: 200 },
                { stat: "1M+", label: "Happy Customers", delay: 300 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl p-8 shadow-sm"
                  data-aos="fade-up"
                  data-aos-delay={item.delay}
                >
                  <h3 className="text-4xl md:text-5xl font-bold text-green-600">
                    {item.stat}
                  </h3>
                  <p className="text-gray-500 mt-2 text-sm md:text-base">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════
            PARTNER SECTION
        ════════════════════════════════════ */}
        <section
          id="partner"
          className="bg-white py-16 md:py-24 px-5 sm:px-8 md:px-16 lg:px-20 scroll-mt-[60px]"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Our Growing Partner Network
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-3xl mx-auto">
                We proudly collaborate with thousands of local vendors, brands,
                distributors, and logistics partners to power instant commerce
                across India.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {[
                {
                  title: "10,000+ Local Sellers",
                  desc: "From neighbourhood grocery stores to emerging D2C brands, we help local businesses digitize and scale faster than ever.",
                  delay: 100,
                },
                {
                  title: "Trusted Logistics Network",
                  desc: "Our delivery ecosystem ensures ultra-fast fulfillment with safe and reliable last-mile operations across cities.",
                  delay: 200,
                },
                {
                  title: "Leading & Emerging Brands",
                  desc: "We collaborate with FMCG, electronics, beauty, and essential goods brands to expand their reach instantly.",
                  delay: 300,
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-[#f3f7f4] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition duration-300 hover:-translate-y-1"
                  data-aos="fade-up"
                  data-aos-delay={card.delay}
                >
                  <h3 className="text-lg md:text-xl font-bold text-green-600 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-14 md:mt-20 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl md:rounded-3xl p-8 md:p-12 text-center shadow-xl"
              data-aos="zoom-in"
            >
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
                Partner With 3arrow Today
              </h3>
              <p className="max-w-2xl mx-auto text-sm md:text-base lg:text-lg leading-relaxed text-white/90">
                Whether you're a small retailer, a large distributor, or a
                growing brand, 3arrow provides the digital infrastructure,
                logistics support, and customer reach to accelerate your growth.
              </p>
              <button
                onClick={() => setOpenModal(true)}
                className="mt-7 bg-white text-green-700 px-7 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-300 text-sm md:text-base shadow-md"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            BLOG SECTION
        ════════════════════════════════════ */}
        <section
          id="blog"
          className="bg-[#f3f7f4] py-16 md:py-24 px-5 sm:px-8 md:px-16 lg:px-20 scroll-mt-[60px]"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                From the{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                  3arrow Blog
                </span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
                Tips, insights, and stories to help your business grow on
                India's fastest commerce platform.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  tag: "Seller Guide",
                  tagColor: "bg-green-100 text-green-700",
                  title: "How to List Your First Product in Under 5 Minutes",
                  desc: "A step-by-step walkthrough for new vendors setting up their catalog on 3arrow — from photos to pricing.",
                  date: "Jan 12, 2025",
                  //readTime: "3 min read",
                  delay: 100,
                },
                {
                  tag: "Growth",
                  tagColor: "bg-emerald-100 text-emerald-700",
                  title: "5 Strategies That Helped Sellers 3× Their Revenue",
                  desc: "Real sellers, real numbers. Discover the tactics that top-performing vendors use to scale faster on our platform.",
                  date: "Feb 4, 2025",
                  // readTime: "5 min read",
                  delay: 200,
                },
                {
                  tag: "Commerce Trends",
                  tagColor: "bg-teal-100 text-teal-700",
                  title: "The Rise of Quick Commerce in Tier-2 Cities",
                  desc: "India's next growth frontier is beyond metros. We explore how 3arrow is powering instant delivery in smaller cities.",
                  date: "Mar 1, 2025",
                  //readTime: "6 min read",
                  delay: 300,
                },
              ].map((post) => (
                <div
                  key={post.title}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_35px_rgba(41,158,96,0.2)] transition duration-500 transform hover:-translate-y-1 flex flex-col"
                  data-aos="fade-up"
                  data-aos-delay={post.delay}
                >
                  <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit ${post.tagColor}`}
                    >
                      {post.tag}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1">
                      {post.desc}
                    </p>
                    <div className="mt-5 flex items-center justify-between text-xs text-gray-400 border-t pt-4">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {openModal && <LoginModal setOpenModal={setOpenModal} />}
      </div>
    </div>
  );
};

export default Hero;
