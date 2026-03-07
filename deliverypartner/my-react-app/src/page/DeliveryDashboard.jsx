import React, { useEffect, useState } from "react";

const DeliveryDashboard = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("deliveryUser")),
  );
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/delivery/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        // Update localStorage and state
        localStorage.setItem("deliveryUser", JSON.stringify(data));
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) {
    return <h2 className="p-10">Please login first</h2>;
  }

  // 🎨 Status Badge Color
  const getStatusStyle = () => {
    if (user.status === "approved") return "bg-green-100 text-green-700";
    if (user.status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 mt-5 p-10">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>

        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle()}`}
        >
          {user.status.toUpperCase()}
        </span>
      </div>

      {/* Pending View */}
      {user.status === "pending" && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-bold text-yellow-600 mb-2">
            Account Under Review
          </h2>
          <p className="text-gray-600">
            Your account is waiting for admin approval.
          </p>
        </div>
      )}

      {/* Rejected View */}
      {user.status === "rejected" && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Account Rejected
          </h2>
          <p className="text-gray-600">
            Please contact admin for more details.
          </p>
        </div>
      )}

      {/* Approved View */}
      {user.status === "approved" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Delivery Dashboard</h3>

          <ul className="list-disc ml-6 space-y-2">
            <li>Assigned Orders</li>
            <li>Earnings</li>
            <li>Delivery History</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
