
import { Bell, Check, X, PawPrint } from "lucide-react";

function NotificationPanel({
  notifications = [],
  onMarkRead,
  onClose,
}) {
  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Just now";

    return timestamp.toDate().toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "52px",
        width: "340px",
        maxWidth: "90vw",
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        zIndex: 1000,
        overflow: "hidden",
        color: "#333",
      }}
    >
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        <div>
          <strong>Notifications</strong>
          <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
            {unreadCount} unread notification(s)
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <X size={19} />
        </button>
      </div>

      <div style={{ maxHeight: "360px", overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div
            style={{
              padding: "30px 16px",
              textAlign: "center",
              color: "#777",
            }}
          >
            <Bell size={30} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "12px",
                padding: "14px",
                borderBottom: "1px solid #f1f1f1",
                background: item.read ? "#fff" : "#fff8fa",
              }}
            >
              <div style={{ color: "#d94b78" }}>
                <PawPrint size={21} />
              </div>

              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "13px" }}>
                  {item.title}
                </strong>

                <p
                  style={{
                    fontSize: "12px",
                    margin: "5px 0",
                    lineHeight: 1.5,
                  }}
                >
                  {item.message}
                </p>

                <small style={{ color: "#888" }}>
                  {formatDate(item.createdAt)}
                </small>

                {!item.read && (
                  <div style={{ marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => onMarkRead(item.id)}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "#d94b78",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "12px",
                        display: "flex",
                        gap: "5px",
                        alignItems: "center",
                      }}
                    >
                      <Check size={14} />
                      Mark as read
                    </button>
                  </div>
                )}
              </div>

              {!item.read && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#e34d79",
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
