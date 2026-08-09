import { useState } from "react";
import { HelpCircle, ChevronDown, User } from "lucide-react";
import { Link } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import SuperAdminDashboardContent from "./SuperAdminDashboardContent";
import SuperAdminChart from "./SuperAdminChart";
import Recentorder from "./Recentorder";
import SuperAdminManagement from "./All Management/SuperAdminManagement";
import AdminManagement from "./All Management/AdminManagement";
import VendorManagement from "./All Management/VendorManagement";
import UserManagement from "./All Management/UserManagement";
import DeliveryManagement from "./All Management/DeliveryManagement";
import Reports from "./All Management/Reports";
import Settings from "./All Management/Settings";
import CategoriesPage from "./All Management/Categoriespage";
import SubCategoriesPage from "./All Management/Subcategoriespage";
import ContactManagement from "./All Management/Contactmanagement"; // ← NEW
import toast from "react-hot-toast";

function PlaceholderPage({ icon, title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <h2 className="text-xl font-bold text-gray-700">{title}</h2>
        <p className="text-gray-400 text-sm mt-1">Page under construction</p>
      </div>
    </div>
  );
}

function showToast(message, type = "success") {
  if (type === "error") toast.error(message);
  else toast.success(message);
}

const SuperAdmin = () => {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [categories, setCategories] = useState([]);

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Green Top Bar Desktop ── */}
      <div
        className="hidden md:flex text-white py-2.5 px-6 text-sm fixed top-0 left-0 right-0 z-50 justify-between items-center shadow-none"
        style={{ backgroundColor: "#5CB74B", boxShadow: "none" }}
      >
        <span>Welcome to SuperAdmin Dashboard</span>
        <div className="flex items-center gap-6">
          <div
            className="relative flex items-center gap-1 cursor-pointer"
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
          >
            <HelpCircle size={14} />
            <span>Help Center</span>
            <ChevronDown size={14} />
            {showHelp && (
              <div className="absolute right-0 top-full mt-1 bg-white text-gray-700 rounded-md shadow-lg w-44 z-50">
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  📞 Call Center
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  💬 Live Chat
                </div>
              </div>
            )}
          </div>
          <span>|</span>
          <Link to="/" className="flex items-center gap-1 hover:underline">
            Home
          </Link>
          <Link to="/login" className="flex items-center gap-1 hover:underline">
            <User size={16} />
            <span>My Account</span>
          </Link>
        </div>
      </div>

      {/* ── Green Top Bar Mobile ── */}
      <div
        className="md:hidden text-white py-2 px-4 text-sm flex justify-between items-center fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: "#5CB74B" }}
      >
        <span>Help | Eng | USD</span>
        <Link to="/login" className="flex items-center gap-1">
          <User size={16} />
          <span>My Account</span>
        </Link>
      </div>

      {/* ── Layout ── */}
      <div className="pt-10 flex min-h-screen">
        <SuperAdminSidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            collapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="pt-16">
            <SuperAdminHeader active={active} setMobileOpen={setMobileOpen} />

            <main className="flex-1 bg-gray-50">
              {active === "dashboard" && (
                <>
                  <SuperAdminDashboardContent />
                  <SuperAdminChart />
                  <Recentorder />
                </>
              )}

              {active === "super-admin" && <SuperAdminManagement />}

              {active === "category" && (
                <CategoriesPage
                  categories={categories}
                  setCategories={setCategories}
                  showToast={showToast}
                />
              )}

              {active === "subcategory" && (
                <SubCategoriesPage
                  categories={categories}
                  showToast={showToast}
                />
              )}

              {active === "admin" && <AdminManagement />}
              {active === "vendor" && <VendorManagement />}
              {active === "user" && <UserManagement />}
              {active === "delivery" && <DeliveryManagement />}
              {active === "reports" && <Reports />}
              {active === "settings" && <Settings />}

              {/* ✅ NEW: Contact Queries tab */}
              {active === "contacts" && <ContactManagement />}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
