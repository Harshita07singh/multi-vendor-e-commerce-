import React, { useState } from "react";
import LoginModal from "../LoginModal";
import Navbar from "../navbar/Navbar";
import delivery from "../../assets/delivery.avif";
import growthImage from "../../assets/expogrowth.jpeg";
import reachImage from "../../assets/reach.webp";
import easyImage from "../../assets/easy.webp";
import bike from "../../assets/bike.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const Hero = () => {
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    AOS.init({
      once: true,
    });
  }, []);

  return (
    <div>
      <Navbar />

      <div className="bg-[#9fc0af] min-h-screen relative overflow-hidden">
        {/* ================= MARQUEE BAR ================= */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white mt-15 h-12 mb-0 py-2 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee text-sm md:text-base font-medium tracking-wide">
            <span className="mx-8">
              🚀 Now onboarding sellers across 40+ cities
            </span>
            <span className="mx-8">
              ⚡ 1500+ Dark Stores Powering Deliveries
            </span>
            <span className="mx-8">
              📦 India’s Fastest Growing Instant Commerce Platform
            </span>
            <span className="mx-8">💚 Join 10,000+ Local Sellers Today</span>
          </div>
        </div>
        {/* HERO CONTENT */}
        <div className="relative min-h-screen bg-white overflow-hidden">
          {/* RIGHT SIDE IMAGE (Desktop Only) */}
          <img
            src={bike}
            alt="Delivery Illustration"
            className="hidden md:block absolute right-0 top-0 h-full w-1/2 object-contain pointer-events-none float-animation"
          />

          {/* MOBILE IMAGE */}
          <img
            src={bike}
            alt="Delivery Illustration"
            className="md:hidden w-full max-h-[250px] object-contain mt-0 px-6"
          />

          {/* CONTENT */}
          <div className="relative z-10 flex flex-col md:flex-row min-h-screen items-center justify-start px-6 md:px-16 py-4">
            <div className=" md:ml-20 max-w-xl text-center md:text-left">
              <h1 className="text-2xl sm:text-5xl md:text-4xl font-extrabold leading-tight">
                Your Products<span className="text-green-600">.</span> <br />
                Delivered<span className="text-green-600">.</span>
              </h1>

              <p
                className="mt-6 text-lg sm:text-xl md:text-2xl  text-gray-700 leading-relaxed soft-glow"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                Offer customers the delight of your products{" "}
                <br className="hidden md:block" />
                and the convenience of doorstep deliveries. Sign up and start
                selling!
              </p>

              <button
                onClick={() => setOpenModal(true)}
                className="mt-6 soft-glow bg-[#299E60] hover:bg-green-700 text-white px-8 md:px-6 py-3 md:py-3 rounded-lg text-lg md:text-2xl font-medium transition duration-300 w-full sm:w-auto"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                Sell on 3arrow
              </button>
            </div>
          </div>
        </div>

        {/* ================= FEATURES SECTION ================= */}
        <div className="bg-[#f3f7f4] py-16 px-4 md:px-20">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-md transition duration-500 hover:shadow-[0_0_40px_rgba(41,158,96,0.3)]"
              data-aos="fade-up"
            >
              <div className="md:w-1/2 bg-white p-6 flex items-center justify-center">
                <img
                  src={delivery}
                  alt="Delivery"
                  className="max-h-60 md:max-h-80 w-auto object-contain"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold glow-text text-gray-900 mb-4">
                  Reach your customers <br className="hidden md:block" /> where
                  they are
                </h2>
                <p className="text-gray-700 text-base md:text-lg">
                  We deliver your product through our dense network of
                  <span className="font-semibold"> 1500+ dark stores</span>
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-md transition duration-500 hover:shadow-[0_0_40px_rgba(41,158,96,0.3)]"
              data-aos="fade-up"
            >
              <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold glow-text text-gray-900 mb-4">
                  Exponential growth <br className="hidden md:block" />{" "}
                  opportunity
                </h2>
                <p className="text-gray-700 text-base md:text-lg">
                  List your products on India’s fastest-growing retail channel
                  and grow with us
                </p>
              </div>
              <div className="md:w-1/2 h-60 md:h-auto flex items-center justify-center p-6">
                <img
                  src={growthImage}
                  alt="Growth"
                  className="max-w-full max-h-60 md:max-h-full object-contain"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-md transition duration-500 hover:shadow-[0_0_40px_rgba(41,158,96,0.3)]"
              data-aos="fade-up"
            >
              <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold glow-text text-gray-900 mb-4">
                  Expand your reach
                </h2>
                <p className="text-gray-700 text-base md:text-lg">
                  Your products can now reach millions of customers in
                  <span className="font-semibold"> 25+ major cities</span>
                </p>
              </div>
              <div className="md:w-1/2 h-60 md:h-auto">
                <img
                  src={reachImage}
                  alt="Expand Reach"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Card 4 */}
            <div
              className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-md transition duration-500 hover:shadow-[0_0_40px_rgba(41,158,96,0.3)]"
              data-aos="fade-up"
            >
              <div className="md:w-1/2 h-60 md:h-auto">
                <img
                  src={easyImage}
                  alt="Simple and Easy"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative text-center md:text-left">
                <h2 className="glow-text text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  It’s simple and easy
                </h2>
                <p className="text-gray-700 text-base md:text-lg">
                  Onboard your products in minutes and manage your business
                  effortlessly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= REST OF YOUR PAGE ================= */}
        {/* (Seller Reviews, Mission, Story, Partners, CTA etc.) */}
        {/* I did not remove or modify structure. Only responsive text sizes and paddings were improved exactly as above. */}
        {/* ================= ABOUT SECTION ================= */}
        <div className="bg-white py-24 px-6 md:px-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            {/* LEFT – IMAGE */}
            <div className="relative group" data-aos="fade-right">
              <img
                src={growthImage} // you can change image if needed
                alt="About 3arrow"
                className="rounded-3xl shadow-xl w-full h-[400px] object-cover transition duration-500 group-hover:scale-105"
              />

              {/* Decorative Glow */}
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-green-200 opacity-30 rounded-full blur-3xl group-hover:opacity-50 transition duration-500"></div>
            </div>

            {/* RIGHT – TEXT */}
            <div data-aos="fade-left">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
                About 3arrow
              </h2>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                3arrow is India’s fast-growing instant commerce platform built
                to empower local businesses and transform the way customers
                shop.
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                We connect neighbourhood stores, emerging brands, and trusted
                logistics partners through a powerful digital ecosystem that
                ensures seamless onboarding, real-time inventory management, and
                ultra-fast deliveries.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Our vision is simple — make local commerce smarter, faster, and
                more accessible for everyone.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#f3f7f4] py-20 px-6 md:px-20">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold glow-text soft-glow mb-4">
              What Our Sellers Say
            </h2>
            <p className="text-gray-600 text-lg">
              Thousands of vendors are growing with 3arrow every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Review Card 1 */}
            <div
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-[0_0_35px_rgba(41,158,96,0.3)] transition duration-500 transform hover:-translate-y-3"
              data-aos="zoom-in"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4 text-[#299E60]">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                “3arrow increased my monthly sales by 3x in just 6 months. The
                onboarding was smooth and the dashboard is very easy to use.”
              </p>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900">Rajesh Kumar</h4>
                <p className="text-sm text-[#299E60]">Grocery Store Owner</p>
              </div>
            </div>

            {/* Review Card 2 */}
            <div
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-[0_0_35px_rgba(41,158,96,0.3)] transition duration-500 transform hover:-translate-y-3"
              data-aos="zoom-in"
            >
              <div className="flex justify-center gap-1 mb-4 text-[#299E60]">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                “The best decision for my business. 3arrow handles logistics
                while I focus on product quality.”
              </p>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900">Priya Singh</h4>
                <p className="text-sm text-[#299E60]">Food Products Vendor</p>
              </div>
            </div>

            {/* Review Card 3 */}
            <div
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-[0_0_35px_rgba(41,158,96,0.3)] transition duration-500 transform hover:-translate-y-3"
              data-aos="zoom-in"
            >
              <div className="flex justify-center gap-1 mb-4 text-[#299E60]">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                “Reaching customers across multiple cities was never this easy.
                Highly recommended for growing brands!”
              </p>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900">Amit Patel</h4>
                <p className="text-sm text-[#299E60]">Electronics Retailer</p>
              </div>
            </div>
          </div>
        </div>

        {/* MISSION SECTION */}
        <div className="bg-[#f3f7f4] py-20 px-6 md:px-20" data-aos="fade-up">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* LEFT SIDE – TEXT */}
            <div
              className="transition duration-500 transform hover:-translate-y-2"
              data-aos="fade-right"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
                Our Mission<span className="text-green-600">.</span>
              </h2>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Our mission is to empower local sellers and brands by providing
                a seamless digital platform that connects them directly to
                millions of customers.
              </p>

              <p className="text-gray-600 leading-relaxed">
                We aim to simplify commerce, enable faster deliveries, and
                create exponential growth opportunities for businesses of all
                sizes across India.
              </p>

              {/* CTA */}
              <button
                onClick={() => setOpenModal(true)}
                className="mt-8 bg-[#299E60] hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Start Selling Today
              </button>
            </div>

            {/* RIGHT SIDE – IMAGE */}
            <div
              className="relative group transition duration-500"
              data-aos="fade-left"
            >
              <img
                src={delivery}
                alt="Our Mission"
                className="rounded-3xl shadow-xl w-full h-[400px] object-cover transition duration-500 group-hover:scale-105"
              />

              {/* Decorative glow */}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-green-300 opacity-30 rounded-full blur-3xl group-hover:opacity-50 transition duration-500"></div>
            </div>
          </div>
        </div>
        <div className="bg-[#f3f7f4] py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className="text-center mb-20 relative"
              data-aos="zoom-in"
              data-aos-duration="1000"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-green-200 opacity-20 rounded-full blur-3xl"></div>

              {/* Animated Heading */}
              <h2 className="text-4xl md:text-5xl font-extrabold glow-text soft-glow mb-6">
                <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                  Our Story
                </span>

                {/* Animated underline */}
                {/* <span className="absolute left-0 -bottom-2 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400 animate-pulse rounded-full"></span> */}
              </h2>

              {/* Paragraph */}
              <p
                className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-6"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                From a small idea to a fast-growing retail ecosystem,{" "}
                <span className="font-semibold text-green-600">3arrow</span> is
                redefining instant commerce across India.
                <br />
                <br />
                Built with a simple mission — to connect{" "}
                <span className="font-semibold">local businesses</span> with
                customers in the{" "}
                <span className="font-semibold">fastest and most reliable</span>{" "}
                way possible. We saw neighbourhood stores struggling to go
                digital and customers waiting days for essentials. So we decided
                to change that.
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div data-aos="fade-up" data-aos-delay="100">
                <h3 className="text-4xl font-bold text-green-600 animate-pulse">
                  1500+
                </h3>
                <p className="text-gray-600 mt-2">Dark Stores</p>
              </div>

              <div data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-4xl font-bold text-green-600 animate-pulse">
                  40+
                </h3>
                <p className="text-gray-600 mt-2">Cities Served</p>
              </div>

              <div data-aos="fade-up" data-aos-delay="300">
                <h3 className="text-4xl font-bold text-green-600 animate-pulse">
                  1M+
                </h3>
                <p className="text-gray-600 mt-2">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
        {/* ================= PARTNERS SECTION ================= */}
        <div className="bg-white py-24 px-6 md:px-20">
          <div className="max-w-6xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl md:text-5xl font-extrabold glow-text mb-4">
                Our Growing Partner Network
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                We proudly collaborate with thousands of local vendors, brands,
                distributors, and logistics partners to power instant commerce
                across India.
              </p>
            </div>

            {/* Partner Categories */}
            <div className="grid md:grid-cols-3 gap-10">
              {/* Local Sellers */}
              <div
                className="bg-[#f3f7f4] rounded-2xl p-8 shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  10,000+ Local Sellers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  From neighbourhood grocery stores to emerging D2C brands, we
                  help local businesses digitize and scale faster than ever.
                </p>
              </div>

              {/* Logistics */}
              <div
                className="bg-[#f3f7f4] rounded-2xl p-8 shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  Trusted Logistics Network
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Our delivery ecosystem ensures ultra-fast fulfillment with
                  safe and reliable last-mile operations across cities.
                </p>
              </div>

              {/* Brands */}
              <div
                className="bg-[#f3f7f4] rounded-2xl p-8 shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  Leading & Emerging Brands
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We collaborate with FMCG, electronics, beauty, and essential
                  goods brands to expand their reach instantly.
                </p>
              </div>
            </div>

            {/* Bottom Info Section */}
            <div
              className="mt-20 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-3xl p-12 text-center shadow-xl"
              data-aos="zoom-in"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Partner With 3arrow Today
              </h3>

              <p className="max-w-2xl mx-auto text-lg leading-relaxed">
                Whether you're a small retailer, a large distributor, or a
                growing brand, 3arrow provides the digital infrastructure,
                logistics support, and customer reach to accelerate your growth.
              </p>

              <button
                onClick={() => setOpenModal(true)}
                className="mt-8 bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
        {openModal && <LoginModal setOpenModal={setOpenModal} />}
      </div>
    </div>
  );
};

export default Hero;
