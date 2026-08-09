// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/F.png";
// import { Outlet } from "react-router-dom";
// import "./App.css";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Hero from "./component/Hero/Hero";
// import Footer from "./component/footer/Footer";
// import { Routes, Route } from "react-router-dom";
// import LoginSuccess from "./Page/LoginSuccess";
// import VendorOnboarding from "./Page/VendorOnboarding/VendorOnboarding";
// import VendorDashboard from "./Page/VendorDashboard";
// import { useLocation } from "react-router-dom";
// import Home from "./Page/Home";

// // import ProductDetails from "./Page/ProductDetails";
// // import CreateProduct from "./Page/Admin/CreateProduct";

// function MainLayout() {
//   const location = useLocation();

//   // const hideFooter = location.pathname === "/vendor/onboarding";
//   // const hideHeader = location.pathname === "/product/home";
//   // const hideNavbar = location.pathname === "/product/home";
//   return (
//     <>
//       {" "}
//       <Outlet />
//     </>
//   );
// }

// function App() {
//   return (
//     <Routes>
//       <Route element={<MainLayout />}>
//         {/* ✅ Public routes */}
//         <Route path="/" element={<Hero />} />
//         <Route path="/login-success" element={<LoginSuccess />} />
//         <Route path="/login-success/*" element={<LoginSuccess />} />

//         {/* 🔒 Protected routes — must be logged in */}
//         <Route element={<ProtectedRoute />}>
//           <Route path="/dashboard" element={<VendorDashboard />} />
//           <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
//           <Route path="/product/home" element={<Home />} />
//         </Route>
//       </Route>
//     </Routes>
//   );
// }

// export default App;

import { lazy, Suspense } from "react";
import { Outlet, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Hero = lazy(() => import("./component/Hero/Hero"));
const Footer = lazy(() => import("./component/footer/Footer"));
const LoginSuccess = lazy(() => import("./Page/LoginSuccess"));
const VendorOnboarding = lazy(
  () => import("./Page/VendorOnboarding/VendorOnboarding"),
);
const VendorDashboard = lazy(() => import("./Page/VendorDashboard"));
const Home = lazy(() => import("./Page/Home"));

// ─── Fallback loader ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <span>Loading…</span>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function MainLayout() {
  const location = useLocation();
  return <Outlet />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          {/* ── Public ── */}
          <Route path="/" element={<Hero />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/login-success/*" element={<LoginSuccess />} />

          {/* ── Protected ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route path="/product/home" element={<Home />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
