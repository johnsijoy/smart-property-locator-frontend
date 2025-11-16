// src/App.js
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Common/Navbar";
import Footer from "./components/Common/Footer";
import Home from "./pages/Home";
import PropertyListings from "./pages/PropertyListings";
import PropertyDetail from "./pages/PropertyDetail";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminLogin from "./pages/Auth/AdminLogin";
import UserDashboardPage from "./pages/UserDashboard";
import PostProperties from "./pages/postproperties";
import FavoritesPage from "./pages/FavoritesPage";
import ContactUs from "./pages/ContactUs";
import Query from "./pages/Querypage";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import { Box, Typography, Container } from "@mui/material";


/* ------------------------------------------------------------------
   PrivateRouteWrapper with role support
------------------------------------------------------------------- */
const PrivateRouteWrapper = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/* ------------------------------------------------------------------
   App Component - routes and layout
------------------------------------------------------------------- */
function App() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AuthProvider>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Shared Routes (Buyer + Admin) */}
            <Route
              path="/properties"
              element={
                <PrivateRouteWrapper roles={["buyer", "admin"]}>
                  <PropertyListings />
                </PrivateRouteWrapper>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <PrivateRouteWrapper roles={["buyer", "admin"]}>
                  <PropertyDetail />
                </PrivateRouteWrapper>
              }
            />

            {/* Admin Only */}
            <Route
              path="/post-property"
              element={
                <PrivateRouteWrapper roles={["admin"]}>
                  <PostProperties />
                </PrivateRouteWrapper>
              }
            />
           
            <Route
              path="/queries"
              element={
                <PrivateRouteWrapper roles={["admin"]}>
                  <Query />
                </PrivateRouteWrapper>
              }
            />

            {/* Buyer/Owner Only */}
            <Route
              path="/dashboard"
              element={
                <PrivateRouteWrapper roles={["owner"]}>
                  <UserDashboardPage />
                </PrivateRouteWrapper>
              }
            />

            {/* Favourites (Buyer + Admin) */}
            <Route
              path="/favourites"
              element={
                <PrivateRouteWrapper roles={["buyer", "admin"]}>
                  <FavoritesPage />
                </PrivateRouteWrapper>
              }
            />
            <Route path="/favorites" element={<Navigate to="/favourites" replace />} />

            {/* Unauthorized */}
            <Route
              path="/unauthorized"
              element={
                <Container sx={{ textAlign: "center", mt: 8 }}>
                  <Typography variant="h4" color="error">
                    Unauthorized Access
                  </Typography>
                  <Typography variant="body1" mt={2}>
                    You do not have permission to view this page.
                  </Typography>
                </Container>
              }
            />

          
          </Routes>
        </Box>
        <Footer />
      </AuthProvider>
    </Box>
  );
}

export default App;
