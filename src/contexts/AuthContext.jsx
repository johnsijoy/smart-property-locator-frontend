// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = "https://smart-property-locator-backend-2.onrender.com/api/accounts/";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, role }
  const [token, setToken] = useState(localStorage.getItem("access") || null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedUsername = localStorage.getItem("username");
    const savedToken = localStorage.getItem("access");

    if (savedRole && savedUsername && savedToken) {
      setUser({ username: savedUsername, role: savedRole });
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // --------------------------
  // Login (Buyer/Admin)
  // --------------------------
  const handleLogin = async (email, password, role) => {
  try {
    const url =
      role.toLowerCase() === "admin"
        ? `${API_BASE}admin-login/`
        : `${API_BASE}login/`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), // 👈 email
    });

    const data = await response.json();

    if (response.ok && data.access) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role || role.toLowerCase());
      localStorage.setItem("username", email); // store email if needed

      setUser({ username: email, role: data.role || role.toLowerCase() });
      setToken(data.access);
      return true;
    } else {
      console.error("Login failed:", data);
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};


  // --------------------------
  // Registration (Buyer only)
  // --------------------------
  const handleRegister = async (username, email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE}register/`,
        { username, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Registration success:", response.data);
      return true;
    } catch (error) {
      const err = error.response?.data;
      console.error("Registration error:", err || error.message);

      if (err?.username) alert("Username: " + err.username[0]);
      else if (err?.email) alert("Email: " + err.email[0]);
      else if (err?.password) alert("Password: " + err.password[0]);
      else alert("Registration failed. Try again.");

      return false;
    }
  };

  // --------------------------
  // Logout
  // --------------------------
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        handleLogin,
        handleRegister,
        handleLogout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
