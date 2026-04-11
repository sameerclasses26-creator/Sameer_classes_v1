import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import sameerLogo from "../sameer.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Gallery", to: "/gallery" },
  { label: "Results", to: "/results" },
  { label: "Contact", to: "/contact" },
];

export default function MainLayout() {
  const { user, token, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const avatarFallback = useMemo(() => {
    const seed = encodeURIComponent(user?.email || user?.name || "student");
    const hashBase = (user?.email || "student")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomMaleIndex = (hashBase % 99) + 1;
    if (user?.profileImage) return user.profileImage;
    return `https://randomuser.me/api/portraits/men/${randomMaleIndex}.jpg?seed=${seed}`;
  }, [user?.email, user?.name, user?.profileImage]);

  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/dashboard/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [token, user]);

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  const markNotificationsRead = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/dashboard/notifications/read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          readAt: item.readAt || new Date().toISOString(),
        }))
      );
    } catch {
      // no-op
    }
  };

  const clearNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/dashboard/notifications", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      setNotifications([]);
      setShowNotifications(false);
    } catch {
      setNotifications([]);
    }
  };

  const toggleNotifications = async () => {
    if (!showNotifications) {
      setShowNotifications(true);
      await markNotificationsRead();
      return;
    }
    setShowNotifications(false);
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">
            <img src={sameerLogo} alt="Sameer Classes logo" />
          </span>
          Sameer Classes
        </NavLink>

        <nav className="nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="notification-wrap">
                <button className="ghost-button notification-button" type="button" onClick={toggleNotifications}>
                  <span aria-hidden="true">🔔</span>
                  {unreadCount > 0 ? <span className="notification-count">{unreadCount}</span> : null}
                </button>
                {showNotifications ? (
                  <article className="notification-panel">
                    <div className="card-topline">
                      <strong>Notifications</strong>
                      <button className="ghost-button" type="button" onClick={clearNotifications}>
                        Clear
                      </button>
                    </div>
                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                      {notifications.length ? (
                        notifications.slice(0, 8).map((item) => (
                          <p key={item._id || `${item.type}-${item.createdAt}`}>{item.message}</p>
                        ))
                      ) : (
                        <p>No notifications.</p>
                      )}
                    </div>
                  </article>
                ) : null}
              </div>
              {user.role !== "admin" && (
                <>
                  <NavLink className="profile-avatar-link" to="/profile" title="Profile">
                    <img src={avatarFallback} alt={`${user.name} profile`} />
                  </NavLink>
                  <NavLink className="ghost-button" to="/dashboard">
                    Dashboard
                  </NavLink>
                </>
              )}
              {user.role === "admin" ? (
                <NavLink className="ghost-button" to="/admin">
                  Admin Dashboard
                </NavLink>
              ) : null}
              <button className="solid-button" onClick={logout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="ghost-button" to="/login">
                Login
              </NavLink>
              <NavLink className="solid-button" to="/register">
                Enroll Now
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
