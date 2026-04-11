import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL + "/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("sameer-classes-token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        localStorage.removeItem("sameer-classes-token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const authRequest = async (endpoint, payload) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    localStorage.setItem("sameer-classes-token", data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const updateProfile = async (payload) => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to update profile");
    }

    setUser(data);
    return data;
  };

  const login = (payload) => authRequest("/auth/login", payload);
  const register = (payload) => authRequest("/auth/register", payload);

  const logout = () => {
    localStorage.removeItem("sameer-classes-token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
