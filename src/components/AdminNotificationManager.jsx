import { useEffect, useState } from "react";
import { API_BASE } from "../api";

export default function AdminNotificationManager({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement",
    priority: "medium",
    isActive: true,
  });
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormMessage("");

    if (!formData.title.trim() || !formData.message.trim()) {
      setFormError("Title and message are required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create notification");
      const newNotification = await response.json();
      setNotifications((prev) => [newNotification, ...prev]);
      setFormData({
        title: "",
        message: "",
        type: "announcement",
        priority: "medium",
        isActive: true,
      });
      setShowForm(false);
      setFormMessage("Notification created successfully!");
      setTimeout(() => setFormMessage(""), 3000);
    } catch (error) {
      setFormError(error.message || "Failed to create notification");
      console.error("Error:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const response = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete");
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setFormMessage("Notification deleted successfully!");
      setTimeout(() => setFormMessage(""), 3000);
    } catch (error) {
      setFormError(error.message || "Failed to delete notification");
    }
  };

  const handleDeactivateNotification = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to deactivate");
      const updated = await response.json();
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? updated : n))
      );
      setFormMessage("Notification deactivated successfully!");
      setTimeout(() => setFormMessage(""), 3000);
    } catch (error) {
      setFormError(error.message || "Failed to deactivate notification");
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      announcement: "#e3f2fd",
      alert: "#ffebee",
      success: "#e8f5e9",
      reminder: "#fff3e0",
    };
    return colors[type] || "#f5f5f5";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "#ff6b6b",
      medium: "#ffa500",
      low: "#51cf66",
    };
    return colors[priority] || "#999";
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Messages */}
      {formMessage && (
        <div style={{
          padding: "16px",
          backgroundColor: "#e8f5e9",
          border: "1px solid #51cf66",
          borderRadius: "8px",
          color: "#2e7d32",
          fontSize: "14px",
          fontWeight: "500",
        }}>
          ✓ {formMessage}
        </div>
      )}
      {formError && (
        <div style={{
          padding: "16px",
          backgroundColor: "#ffebee",
          border: "1px solid #ff6b6b",
          borderRadius: "8px",
          color: "#c62828",
          fontSize: "14px",
          fontWeight: "500",
        }}>
          ✕ {formError}
        </div>
      )}

      {/* Create Form Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "12px 20px",
          backgroundColor: "#0066cc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#0052a3"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#0066cc"}
      >
        {showForm ? "Cancel" : "+ Create Notification"}
      </button>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreateNotification}
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            display: "grid",
            gap: "14px",
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <label style={{ fontWeight: "600", fontSize: "14px" }}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Course Update Available"
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div style={{ display: "grid", gap: "6px" }}>
            <label style={{ fontWeight: "600", fontSize: "14px" }}>Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your notification message here..."
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                minHeight: "100px",
                fontFamily: "inherit",
              }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ display: "grid", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "14px" }}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="announcement">Announcement</option>
                <option value="alert">Alert</option>
                <option value="success">Success</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "14px" }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#51cf66",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Post Notification
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ddd",
                color: "#666",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notifications List */}
      <div style={{ display: "grid", gap: "14px" }}>
        <h3 style={{ margin: "12px 0 0 0", fontSize: "16px", fontWeight: "600" }}>
          All Notifications ({notifications.length})
        </h3>

        {loading ? (
          <p style={{ color: "#999" }}>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p style={{ color: "#999" }}>No notifications yet. Create one to get started!</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              style={{
                padding: "16px",
                backgroundColor: getTypeColor(notification.type),
                borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                borderRadius: "6px",
                display: "grid",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600" }}>
                    {notification.title}
                  </h4>
                  <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                    {notification.message}
                  </p>
                  <small style={{ color: "#999", fontSize: "12px" }}>
                    Created: {new Date(notification.createdAt).toLocaleString()}
                    {notification.expiresAt && (
                      <>
                        {" "}• Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                      </>
                    )}
                  </small>
                </div>
                <div style={{ display: "flex", gap: "6px", flexDirection: "column", flexShrink: 0 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      backgroundColor: "rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "500",
                      textTransform: "capitalize",
                      textAlign: "center",
                    }}
                  >
                    {notification.type}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      backgroundColor: getPriorityColor(notification.priority),
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "500",
                      textTransform: "capitalize",
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    {notification.priority}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      backgroundColor: notification.isActive ? "#e8f5e9" : "#ffebee",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "500",
                      textAlign: "center",
                      color: notification.isActive ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {notification.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {notification.isActive && (
                  <button
                    onClick={() => handleDeactivateNotification(notification._id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#ffa500",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    Deactivate
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification._id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
