import React, { useState } from "react";
import LoginModal from "../LoginModal";
import Navbar from "../navbar/Navbar";
const Hero = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="bg-[#9fc0af] min-h-screen relative">
      {/* HERO CONTENT */}
      <div className="flex flex-col md:flex-row min-h-screen items-center justify-between px-6 md:px-16 py-10">
        <div className="mt-10 max-w-xl">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            Your Products<span className="text-green-600">.</span> <br />
            Delivered<span className="text-green-600">.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-800 leading-relaxed">
            Offer customers the delight of your products and the convenience of
            doorstep deliveries. Sign up and start selling!
          </p>

          <button
            onClick={() => setOpenModal(true)}
            className="mt-6 bg-[#299E60]  hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition duration-300"
          >
            Sell on 3arrow
          </button>
        </div>
      </div>
      <div className="bg-[#f3f7f4] py-16 px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-[#d9eadf] rounded-3xl p-10 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Reach your customers <br /> where they are
            </h2>
            <p className="text-gray-700 text-lg">
              We deliver your product through our dense network of
              <span className="font-semibold"> 1500+ dark stores</span>
            </p>

            {/* Decorative Dots */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-green-200 opacity-40 rounded-full blur-2xl"></div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#d9eadf] rounded-3xl p-10 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exponential growth <br /> opportunity
            </h2>
            <p className="text-gray-700 text-lg">
              List your products on India’s fastest-growing retail channel and
              grow with us
            </p>

            <div className="absolute bottom-4 right-4 w-28 h-28 bg-green-300 opacity-40 rounded-full blur-2xl"></div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#d9eadf] rounded-3xl p-10 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Expand your reach
            </h2>
            <p className="text-gray-700 text-lg">
              Your products can now reach millions of customers in
              <span className="font-semibold"> 25+ major cities</span>
            </p>

            <div className="absolute top-6 right-6 w-24 h-24 bg-green-200 opacity-40 rounded-full blur-2xl"></div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#d9eadf] rounded-3xl p-10 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              It’s simple and easy
            </h2>
            <p className="text-gray-700 text-lg">
              Onboard your products in minutes and manage your business
              effortlessly
            </p>

            <div className="absolute bottom-6 right-6 w-24 h-24 bg-green-300 opacity-40 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
      <div className="bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto text-center text-gray-700">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            #1 Instant Delivery Service in India
          </h2>

          <p className="text-sm md:text-base leading-relaxed">
            Shop on the go and get anything delivered to your doorstep. Buy
            everything from groceries to fresh fruits & vegetables, cakes and
            bakery items, meats & seafood, cosmetics, mobiles & accessories,
            electronics, baby care products and much more. We deliver safely and
            quickly — right to your doorstep.
          </p>
        </div>
      </div>

      <div className="bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto text-center text-gray-700">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Single app for all your daily needs
          </h2>

          <p className="text-sm md:text-base leading-relaxed">
            Order thousands of products at just a tap – milk, eggs, bread,
            cooking oil, ghee, atta, rice, fresh fruits & vegetables, spices,
            chocolates, chips, biscuits, Maggi, cold drinks, shampoos, soaps,
            body wash, pet food, diapers, electronics, other organic and gourmet
            products from your neighbourhood stores and a lot more.
          </p>
        </div>
      </div>
      <div className="bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto text-center text-gray-700">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Order Online on 3arrow to Enjoy Instant Delivery Magic
          </h2>

          <p className="text-sm md:text-base leading-relaxed">
            We currently serve: Delhi, Gurugram, Kolkata, Lucknow, Mumbai,
            Bengaluru, Ahmedabad, Noida, Ghaziabad, Faridabad, Hyderabad,
            Jaipur, Pune, Chennai, Chandigarh, Ludhiana, Vadodara, Meerut,
            Kanpur, Panchkula, Kharar, Amritsar, Bhopal, Indore, Zirakpur,
            Jalandhar, Dehradun, Agra, Mohali, Goa, Patiala, Sonipat, Bhiwadi,
            Kota, Rohtak, Bahadurgarh, Haridwar, Bathinda, Kochi, Jodhpur and
            Jammu.
          </p>
        </div>
      </div>

      {/* MODAL */}
      {openModal && <LoginModal setOpenModal={setOpenModal} />}
    </div>
  );
};

export default Hero;
