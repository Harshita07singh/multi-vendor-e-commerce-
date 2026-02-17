import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MobileStepper = ({ steps, currentStep }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="bg-gray-100">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        {/* Hamburger Icon */}
        <button onClick={() => setOpenMenu(!openMenu)}>
          {openMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Dropdown Menu */}
      {openMenu && (
        <div className="bg-white shadow-md p-4 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}

      {/* Stepper */}
      <div className="flex overflow-x-auto p-4 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <div
              className={`w-4 h-4 rounded-full ${
                index === currentStep ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileStepper;
