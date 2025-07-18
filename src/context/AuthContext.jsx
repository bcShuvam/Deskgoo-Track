import React, { createContext, useState } from "react";
import api from "../api";

export const AuthContext = createContext();
export const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const AuthProvider = ({ children }) => {
  // Load user and token from localStorage if available
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));

  // Loader context
  const { setLoading } = React.useContext(LoaderContext);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth", { email, password });
      if (res.status === 200) {
        setUser(res.data.user);
        setToken(res.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("accessToken", res.data.accessToken);
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setLoading(true);
    setTimeout(() => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      setLoading(false);
      window.location.href = "/auth";
    }, 500);
  };

  // Provide context value
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
