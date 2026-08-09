// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />; // redirect unauthorized users to home
  }

  return <Outlet />;
};

export default ProtectedRoute;
