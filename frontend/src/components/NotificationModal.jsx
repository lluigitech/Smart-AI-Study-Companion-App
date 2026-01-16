"use client"
import { IoClose, IoNotifications, IoTime, IoCheckmarkDone, IoCheckmark } from "react-icons/io5"

export default function NotificationModal({ isOpen, onClose, notifications = [], onMarkAsRead, onMarkAllAsRead }) {
  if (!isOpen) return null

  const handleNotificationClick = (notif) => {
    if (notif.unread && onMarkAsRead) {
      onMarkAsRead(notif.id)
    }
  }

  const handleMarkAllClick = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead()
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IoNotifications size={22} color="#1b5e20" />
            <h3 style={{ margin: 0, fontSize: "18px", color: "#1b5e20" }}>Notifications</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <IoClose size={24} />
          </button>
        </div>

        {/* List */}
        <div style={styles.list}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <IoNotifications size={40} color="#ddd" />
              <p style={{ marginTop: "10px", fontSize: "14px" }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  ...styles.card,
                  background: notif.unread ? "#f1f8e9" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)"
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)"
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <span style={styles.notifTitle}>{notif.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {notif.unread && <div style={styles.unreadDot} />}
                    {!notif.unread && <IoCheckmark size={16} color="#4caf50" />}
                  </div>
                </div>
                <p style={styles.notifBody}>{notif.body}</p>
                <div style={styles.notifTime}>
                  <IoTime size={12} /> {notif.time}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && notifications.some((n) => n.unread) && (
          <div style={styles.footer}>
            <button style={styles.markReadBtn} onClick={handleMarkAllClick}>
              <IoCheckmarkDone size={16} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  modal: {
    width: "min(400px, 90vw)",
    background: "white",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  header: {
    padding: "20px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#757575" },
  list: { padding: "10px", maxHeight: "400px", overflowY: "auto" },
  card: {
    padding: "15px",
    borderRadius: "16px",
    marginBottom: "10px",
    border: "1px solid #eee",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  unreadDot: { width: "8px", height: "8px", background: "#4caf50", borderRadius: "50%" },
  notifTitle: { fontWeight: "700", fontSize: "14px", color: "#333" },
  notifBody: { fontSize: "13px", color: "#666", margin: "4px 0" },
  notifTime: { fontSize: "11px", color: "#999", display: "flex", alignItems: "center", gap: "4px" },
  footer: { padding: "15px", textAlign: "center", borderTop: "1px solid #eee" },
  markReadBtn: {
    background: "none",
    border: "none",
    color: "#2e7d32",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },
}
