import { useState } from "react";
import {
  Bell,
  Mail,
  MessageCircle,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Lock,
  Menu,
} from "lucide-react";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  //"super-admin": "Super Admin",
  admin: "Admin Management",
  vendor: "Vendor Management",
  user: "User Management",
  delivery: "Delivery Management",
  reports: "Reports",
  settings: "Settings",
};

const NOTIFICATIONS = [
  { msg: "New booking received", time: "2 min ago", color: "#3B82F6" },
  { msg: "Admin added successfully", time: "1 hr ago", color: "#10B981" },
  { msg: "Revenue report ready", time: "3 hr ago", color: "#F59E0B" },
  { msg: "New vendor registered", time: "5 hr ago", color: "#8B5CF6" },
];

const MAILS = [
  {
    from: "System",
    subject: "Monthly revenue report is ready",
    time: "Just now",
    read: false,
  },
  {
    from: "Support Team",
    subject: "New support ticket #4821",
    time: "10 min ago",
    read: false,
  },
  {
    from: "Admin Alert",
    subject: "Server backup completed successfully",
    time: "1 hr ago",
    read: true,
  },
  {
    from: "Finance",
    subject: "Invoice #2024-09 has been generated",
    time: "3 hr ago",
    read: true,
  },
];

const MESSAGES = [
  {
    name: "Alice Johnson",
    msg: "New order placed! Need help",
    time: "Just now",
    avatar: "A",
    color: "#6366F1",
  },
  {
    name: "Bob Williams",
    msg: "Payment issue on order #882",
    time: "5 min ago",
    avatar: "B",
    color: "#299E60",
  },
  {
    name: "Carol Davis",
    msg: "When will my order arrive?",
    time: "20 min ago",
    avatar: "C",
    color: "#F59E0B",
  },
  {
    name: "David Brown",
    msg: "Thanks for the quick response",
    time: "1 hr ago",
    avatar: "D",
    color: "#EF4444",
  },
];

function IconBtn({ icon: Icon, badge, active, onClick, color = "#3B82F6" }) {
  return (
    <button
      onClick={onClick}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all border"
      style={{
        background: active ? color + "12" : "#F8FAFC",
        borderColor: active ? color + "40" : "#E2E8F0",
      }}
    >
      <Icon size={17} style={{ color: active ? color : "#64748B" }} />
      {badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full text-white font-bold flex items-center justify-center px-1"
          style={{ background: color, fontSize: 9 }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function DropMenu({ children, width = 300 }) {
  return (
    <div
      className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
      style={{
        width,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        maxWidth: "90vw",
      }}
    >
      {children}
    </div>
  );
}

// setMobileOpen comes from SuperAdmin.jsx (parent)
const SuperAdminHeader = ({ active = "dashboard", setMobileOpen }) => {
  const [search, setSearch] = useState("");
  const [openDrop, setOpenDrop] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const toggle = (name) => setOpenDrop((prev) => (prev === name ? null : name));
  const close = () => setOpenDrop(null);

  const unreadMails = MAILS.filter((m) => !m.read).length;
  const unreadMessages = MESSAGES.length;
  const unreadNotifs = NOTIFICATIONS.length;

  return (
    <>
      {/* <header className="bg-white px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between sticky top-10 z-40  border-b border-gray-100"  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}> */}
      <header className="bg-white px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between fixed top-10 left-0 right-0 w-full z-40 border-b border-gray-100">
        {/* ── LEFT: Hamburger (mobile) + Title ── */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburger — mobile only, opens sidebar via parent state */}
          <button
            onClick={() => setMobileOpen && setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page icon + title */}
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "#299E60" }}
          >
            {PAGE_TITLES[active]?.[0] || "D"}
          </div>
          <h1 className="font-bold text-gray-800 text-sm md:text-base truncate">
            {PAGE_TITLES[active] || "Dashboard"}
          </h1>
        </div>
      </header>
    </>
  );
};

export default SuperAdminHeader;
