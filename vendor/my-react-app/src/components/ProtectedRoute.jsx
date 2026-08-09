// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Adjust this to however you store auth — localStorage, context, redux, etc.
  const token = localStorage.getItem("accessToken"); // or from context/redux

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
