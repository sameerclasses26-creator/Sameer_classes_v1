import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("sameer-classes-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("sameer-classes-token"));
  const [loading, setLoading] = useState(true);
  const hydrateAttempted = useRef(false);

  // Persist user data to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("sameer-classes-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("sameer-classes-user");
    }
  }, [user]);

  useEffect(() => {
    const hydrate = async () => {
      // Prevent multiple hydration attempts
      if (hydrateAttempted.current) {
        return;
      }

      if (!token) {
        setLoading(false);
        hydrateAttempted.current = true;
        return;
      }

      // Don't re-fetch if we already have user data
      if (user) {
        setLoading(false);
        return;
      }

      hydrateAttempted.current = true;

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
        setLoading(false);
      } catch (error) {
        // Only clear auth data if token is invalid
        localStorage.removeItem("sameer-classes-token");
        localStorage.removeItem("sameer-classes-user");
        setToken(null);
        setUser(null);
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

const { token: newToken, ...userData } = data;
  localStorage.setItem("sameer-classes-token", newToken);
  setToken(newToken);
  setUser(userData); // ← only store user fields, not the token
  // ===== CHANGE END =====
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
    localStorage.removeItem("sameer-classes-user");
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
