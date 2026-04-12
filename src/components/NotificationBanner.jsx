import { useEffect, useState } from "react";
import { API_BASE } from "../api";

export default function NotificationBanner({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data.filter((n) => n.isActive).slice(0, 5) : []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (isLoading || notifications.length === 0) return null;

  const current = notifications[currentIndex];
  const typeColors = {
    announcement: "#0066cc",
    alert: "#ff6b6b",
    success: "#51cf66",
    reminder: "#ffa500",
  };

  const nextNotification = () => {
    setCurrentIndex((prev) => (prev + 1) % notifications.length);
  };

  return (
  <div
    style={{
      backgroundColor: typeColors[current.type] || "#0066cc",
      color: "white",
      padding: "12px 0",
      overflow: "hidden",
      whiteSpace: "nowrap",
      position: "relative",
    }}
  >
    {/* Marquee Content */}
    <div
      style={{
        display: "inline-block",
        paddingLeft: "100%",
        animation: "marquee 15s linear infinite",
      }}
    >
      {notifications.map((n, index) => (
        <span key={n._id} style={{ marginRight: "60px" }}>
          🔔 <strong>{n.title}</strong> — {n.message}
        </span>
      ))}
    </div>

    {/* CSS Animation */}
    <style>
      {`
        @keyframes marquee {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}
    </style>
  </div>
);
}
