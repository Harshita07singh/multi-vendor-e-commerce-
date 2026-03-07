import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Outlet } from "react-router-dom";
import "./App.css";
import Navbar from "./component/navbar/Navbar";
import Hero from "./component/Hero/Hero";
import Footer from "./component/footer/Footer";
import { Routes, Route } from "react-router-dom";
import LoginSuccess from "./Page/LoginSuccess";
import VendorOnboarding from "./Page/VendorOnboarding/VendorOnboarding";
import VendorDashboard from "./Page/VendorDashboard";
import { useLocation } from "react-router-dom";
import Home from "./Page/Home";
// import ProductDetails from "./Page/ProductDetails";
// import CreateProduct from "./Page/Admin/CreateProduct";

function MainLayout() {
  const location = useLocation();

  // const hideFooter = location.pathname === "/vendor/onboarding";
  // const hideHeader = location.pathname === "/product/home";
  // const hideNavbar = location.pathname === "/product/home";
  return (
    // <>
    //   {!hideNavbar && <Navbar />}
    
    //   {!hideFooter && <Footer />}
    // </>
    <>  <Outlet /></>
  );
}

function App() {
  return (
    <Routes>
      {/* Main layout routes with Navbar and Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Hero />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
        <Route path="/product/home" element={<Home />} />
      </Route>

      {/* Onboarding route without main layout */}
    </Routes>
  );
}

export default App;
