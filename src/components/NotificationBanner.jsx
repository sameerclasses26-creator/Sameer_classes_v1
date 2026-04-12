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
        padding: "16px 24px",
        textAlign: "center",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div style={{ flex: 1 }}>
        <strong>{current.title}</strong>
        <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>{current.message}</p>
      </div>
      {notifications.length > 1 && (
        <button
          onClick={nextNotification}
          style={{
            background: "rgba(255,255,255,0.3)",
            border: "none",
            color: "white",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            whiteSpace: "nowrap",
          }}
        >
          Next ({currentIndex + 1}/{notifications.length})
        </button>
      )}
    </div>
  );
}
