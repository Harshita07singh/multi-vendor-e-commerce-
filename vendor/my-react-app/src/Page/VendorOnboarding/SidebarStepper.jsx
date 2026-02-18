import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SidebarStepper = ({ steps, currentStep }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });

      // Clear local storage if storing accessToken
      localStorage.removeItem("accessToken");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 ${
              index === currentStep
                ? "bg-green-400 border-green-400"
                : "border-gray-400"
            }`}
          ></div>
          <span
            className={`${
              index === currentStep ? "font-semibold" : "text-gray-300"
            }`}
          >
            {step}
          </span>
        </div>
      ))}

      <div className="px-6 mt-10">
        <button
          onClick={handleLogout}
          className="w-full bg-red-400 hover:bg-red-600 text-white py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarStepper;
