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

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
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
      </Route>

      {/* Onboarding route without main layout */}
      <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
    </Routes>
  );
}

export default App;
