import React, { useState } from "react";
import LoginModal from "../LoginModal";
const Hero = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="bg-[#9fc0af] min-h-screen relative">
      {/* HERO CONTENT */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-10">
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

      {/* MODAL */}
      {openModal && <LoginModal setOpenModal={setOpenModal} />}
    </div>
  );
};

export default Hero;
