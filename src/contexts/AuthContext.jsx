// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, role }
  const [token, setToken] = useState(localStorage.getItem("access") || null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
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

  // Buyer/Admin Login
  const handleLogin = async (username, password, role) => {
    try {
      const url =
        role.toLowerCase() === "admin"
          ? "http://127.0.0.1:8000/api/accounts/admin-login/"
           : "http://127.0.0.1:8000/api/accounts/login/";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        // Save tokens & role
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
      "http://127.0.0.1:8000/api/accounts/register/",
      { username, email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Registration successful:", response.data);
    return true; // success
  } catch (error) {
    console.error("❌ Registration error:", error.response?.data || error.message);

    // Optional: Show readable error
    if (error.response?.data?.username) {
      alert("Username: " + error.response.data.username[0]);
    } else if (error.response?.data?.email) {
      alert("Email: " + error.response.data.email[0]);
    } else {
      alert("Registration failed. Try again.");
    }

    return false; // failed
  }
};

  // Logout
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

// Custom hook for easier usage
export const useAuth = () => useContext(AuthContext);
