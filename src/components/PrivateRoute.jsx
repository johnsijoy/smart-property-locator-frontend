// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./Common/LoadingSpinner";

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking auth status
  if (loading) return <LoadingSpinner />;

  // Not logged in → redirect to appropriate login page
  if (!isAuthenticated) {
    // Determine login page based on role requirement
    const loginPath = roles.includes("admin") ? "/admin-login" : "/login";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  // Check if user role matches allowed roles
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default PrivateRoute;
