import { useEffect, useState } from "react";
import { API_BASE } from "../api";

export default function NotificationList({ token, userRole }) {
  const [notifications, setNotifications] = useState([]);
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
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [token]);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
        <p>No notifications at this time.</p>
      </div>
    );
  }

  const getTypeColor = (type) => {
    const colors = {
      announcement: "#e3f2fd",
      alert: "#ffebee",
      success: "#e8f5e9",
      reminder: "#fff3e0",
    };
    return colors[type] || "#f5f5f5";
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "#ff6b6b",
      medium: "#ffa500",
      low: "#51cf66",
    };
    return colors[priority] || "#999";
  };

  return (
    <div style={{ display: "grid", gap: "12px", maxHeight: "600px", overflowY: "auto" }}>
      {notifications.map((notification) => (
        <div
          key={notification._id}
          style={{
            padding: "16px",
            backgroundColor: getTypeColor(notification.type),
            borderLeft: `4px solid ${getPriorityBadge(notification.priority)}`,
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600" }}>
              {notification.title}
            </h4>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#666" }}>
              {notification.message}
            </p>
            <small style={{ color: "#999" }}>
              {new Date(notification.createdAt).toLocaleDateString()} at{" "}
              {new Date(notification.createdAt).toLocaleTimeString()}
            </small>
          </div>
          <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "500",
                textTransform: "capitalize",
              }}
            >
              {notification.type}
            </span>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                backgroundColor: getPriorityBadge(notification.priority),
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "500",
                textTransform: "capitalize",
                color: "white",
              }}
            >
              {notification.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
