// import { useState } from "react";

// import "./App.css";

// import { Routes, Route } from "react-router-dom";
// import { Outlet } from "react-router-dom";
// import DeliveryPartner from "./page/DeliveryPartner";
// import Navbar from "./component/navbar";
// import DeliveryDashboard from "./page/DeliveryDashboard";
// function MainLayout() {
//   return (
//     <>
//       <Outlet />
//     </>
//   );
// }

// function App() {
//   return (
//     <Routes>
//       <Route element={<MainLayout />}>
//         <Route path="/" element={<DeliveryPartner />} />
//         <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
//       </Route>
//     </Routes>
//   );
// }

// export default App;
import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const DeliveryPartner = lazy(() => import("./page/DeliveryPartner"));
const DeliveryDashboard = lazy(() => import("./page/DeliveryDashboard"));

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
  return <Outlet />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DeliveryPartner />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
