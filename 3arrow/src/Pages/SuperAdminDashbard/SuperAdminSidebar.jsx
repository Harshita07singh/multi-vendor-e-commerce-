import {
  LayoutDashboard,
  Shield,
  Users,
  Store,
  UserCircle,
  Truck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBasket,
} from "lucide-react";

function SuperAdminSidebar({
  active = "dashboard",
  setActive,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: ShoppingBasket, label: "Category", id: "category" },
    { icon: ShoppingBasket, label: "Subcategory", id: "subcategory" },
    // { icon: Shield, label: "Super Admin", id: "super-admin" },
    { icon: Users, label: "Admin Management", id: "admin" },
    { icon: Store, label: "Vendor Management", id: "vendor" },
    { icon: Users, label: "Contact Queries", id: "contacts" },
    { icon: UserCircle, label: "User Management", id: "user" },
    { icon: Truck, label: "Delivery Management", id: "delivery" },
    { icon: FileText, label: "Reports", id: "reports" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  const handleMenuClick = (id) => {
    setActive && setActive(id);
    setMobileOpen(false);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ minHeight: "64px" }}
      >
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">SuperAdmin</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        )}

        {/* Desktop: collapse button */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}

        {/* Mobile: close (X) button */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Need Help Footer */}
      {(!collapsed || isMobile) && (
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-1">
              Need Help?
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Contact our support team
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Get Support
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── MOBILE: Dark overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE: Slide-in sidebar ── */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent isMobile={true} />
      </div>

      {/* ── DESKTOP: Fixed sidebar ── */}
      <div
        className={`hidden md:flex flex-col ${
          collapsed ? "w-20" : "w-64"
        } bg-white shadow-xl transition-all duration-300 fixed left-0 top-10 z-40 h-[calc(100vh-40px)]`}
      >
        <SidebarContent isMobile={false} />
      </div>
    </>
  );
}

export default SuperAdminSidebar;
