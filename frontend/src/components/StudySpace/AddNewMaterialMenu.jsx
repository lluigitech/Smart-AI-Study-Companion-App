"use client"
import { IoCloudUpload, IoDocument, IoLibrary, IoHelpCircle, IoSparkles } from "react-icons/io5"

const AddNewMaterialMenu = ({ isOpen, onAction }) => {
  if (!isOpen) return null

  // 1. Safety wrapper function
  const handleAction = (type) => {
    if (typeof onAction === 'function') {
      onAction(type);
    } else {
      console.warn(`Action "${type}" triggered, but onAction prop is missing!`);
    }
  };

  return (
    <div style={menuStyles.container} onClick={(e) => e.stopPropagation()}>
      <div style={menuStyles.headerLabel}>Create New</div>

      <div style={menuStyles.list}>
        <MenuItem
          icon={<IoCloudUpload />}
          color="#0ea5e9"
          bg="#e0f2fe"
          title="Upload File"
          desc="PDF, Docx, or Images"
          onClick={() => handleAction("upload")} // Gamitin ang wrapper
        />

        <MenuItem
          icon={<IoDocument />}
          color="#f59e0b"
          bg="#fef3c7"
          title="Create Note"
          desc="Write from scratch"
          onClick={() => handleAction("create_note")}
        />

        <MenuItem
          icon={<IoLibrary />}
          color="#8b5cf6"
          bg="#ede9fe"
          title="Flashcard Deck"
          desc="Review materials"
          onClick={() => handleAction("manual_deck")}
        />

        <MenuItem
          icon={<IoHelpCircle />}
          color="#ec4899"
          bg="#fce7f3"
          title="Multiple Choice"
          desc="Test your knowledge"
          onClick={() => handleAction("manual_quiz")}
        />
      </div>

      <div style={menuStyles.divider} />

      <div style={{ padding: "0 8px 8px" }}>
        <button
          style={menuStyles.aiButton}
          onClick={() => handleAction("ai_generate")} // Gamitin ang wrapper
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div style={menuStyles.aiIconBox}>
            <IoSparkles />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontWeight: "700", fontSize: "14px" }}>AI Generator</span>
            <span style={{ fontSize: "10px", opacity: 0.9, fontWeight: "400" }}>Auto-generate items</span>
          </div>
        </button>
      </div>
    </div>
  )
}

const MenuItem = ({ icon, color, bg, title, desc, onClick }) => (
  <div
    style={menuStyles.item}
    onClick={onClick}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <div style={{ ...menuStyles.iconBox, color: color, background: bg }}>{icon}</div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={menuStyles.itemTitle}>{title}</span>
      <span style={menuStyles.itemDesc}>{desc}</span>
    </div>
  </div>
)

// Inilipat ko lang ang styles sa baba para mas malinis basahin ang logic
const menuStyles = {
  container: {
    position: "absolute",
    top: "120%",
    right: 0,
    width: "260px",
    background: "rgba(255, 255, 255, 0.98)",
    borderRadius: "16px",
    boxShadow: "0 20px 40px -5px rgba(21, 128, 61, 0.2), 0 0 0 1px rgba(22, 163, 74, 0.1)",
    zIndex: 100,
    overflow: "hidden",
  },
  headerLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#059669",
    textTransform: "uppercase",
    padding: "12px 16px 8px",
    letterSpacing: "0.5px",
    background: "#f0fdf4",
    borderBottom: "1px solid #d1fae5",
  },
  list: {
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  item: {
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    borderRadius: "10px",
    transition: "background 0.2s",
    background: "transparent",
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  itemTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#064e3b",
  },
  itemDesc: {
    fontSize: "11px",
    color: "#059669",
    lineHeight: "1.2",
    opacity: 0.8,
  },
  divider: {
    height: "1px",
    background: "#d1fae5",
    margin: "0 0 8px 0",
  },
  aiButton: {
    width: "100%",
    border: "none",
    padding: "10px 12px",
    background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
    color: "white",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.4)",
    transition: "transform 0.1s",
  },
  aiIconBox: {
    background: "rgba(255,255,255,0.2)",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}

export default AddNewMaterialMenu