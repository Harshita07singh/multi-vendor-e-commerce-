import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SidebarStepper = ({ steps, currentStep }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("accessToken");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col justify-between text-white h-full">
      {/* Steps Section */}
      <div className="space-y-4">{/* Steps will be rendered here */}</div>

      {/* 🔴 Logout */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 transition-all duration-200 text-white py-2 rounded-lg font-semibold shadow-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarStepper;
