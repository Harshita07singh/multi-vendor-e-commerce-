import { useState } from "react";

import "./App.css";

import { Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import DeliveryPartner from "./page/DeliveryPartner";
import Navbar from "./component/navbar";
import DeliveryDashboard from "./page/DeliveryDashboard";
function MainLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DeliveryPartner />} />
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
