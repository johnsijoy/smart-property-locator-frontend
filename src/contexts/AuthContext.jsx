// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE = "https://smart-property-locator-backend-2.onrender.com/api/accounts/";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

  // Login (Buyer / Admin)
  const handleLogin = async (username, password, role) => {
    try {
      const url =
        role.toLowerCase() === "admin"
          ? `${API_BASE}admin-login/`
          : `${API_BASE}login/`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("role", data.role || role.toLowerCase());
        localStorage.setItem("username", username);

        setUser({ username, role: data.role || role.toLowerCase() });
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

  // Buyer Registration
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
      console.error("Registration error:", error.response?.data || error.message);

      if (error.response?.data?.username) {
        alert("Username: " + error.response.data.username[0]);
      } else if (error.response?.data?.email) {
        alert("Email: " + error.response.data.email[0]);
      } else {
        alert("Registration failed. Try again.");
      }
      return false;
    }
  };

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
