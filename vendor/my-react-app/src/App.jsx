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
// import { Provider } from "react-redux";
// import { store } from "./redux/store";
import VendorOnboarding from "./Page/VendorOnboarding/VendorOnboarding";

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
    // <Provider store={store}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Hero />} />
      </Route>
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
    </Routes>
    // </Provider>
  );
}

export default App;
