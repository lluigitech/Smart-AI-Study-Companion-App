"use client"
import { IoAdd, IoFolderOpen, IoEllipsisHorizontal, IoPencil, IoTrash, IoBookOutline } from "react-icons/io5"

const THEME = {
  primary: "#15803d",
  subText: "#059669",
  danger: "#ef4444",
  bg: "#f0fdf4",
  card: "#ffffff",
}

export default function StudyDashboard({
  subjects,
  openSubject,
  toggleMenu,
  activeMenuId,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}) {
  return (
    <div style={styles.container}>
      <div style={styles.gridContainer}>
        <div style={styles.addCard} onClick={onAddSubject}>
          <div style={styles.addIconBg}>
            <IoAdd size={32} color="white" />
          </div>
          <span style={styles.addText}>Create New Subject</span>
        </div>

        {subjects.map((sub) => (
          <div
            key={sub.id}
            style={{ ...styles.subjectCard, borderTop: `4px solid ${sub.color}` }}
            onClick={() => openSubject(sub)}
          >
            <div style={styles.cardHeader}>
              <div style={{ ...styles.folderIcon, background: `${sub.color}15`, color: sub.color }}>
                <IoFolderOpen size={24} />
              </div>

              <div style={{ position: "relative" }}>
                <button style={styles.iconBtn} onClick={(e) => toggleMenu(sub.id, e)}>
                  <IoEllipsisHorizontal size={20} color="#059669" />
                </button>

                {activeMenuId === sub.id && (
                  <div style={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.menuItem} onClick={() => onEditSubject(sub)}>
                      <IoPencil size={16} /> Edit Subject
                    </div>
                    <div style={{ ...styles.menuItem, color: THEME.danger }} onClick={() => onDeleteSubject(sub.id)}>
                      <IoTrash size={16} /> Delete
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.subjectTitle}>{sub.title}</h3>
              <div style={styles.metaInfo}>
                <IoBookOutline size={14} color={THEME.subText} />
                <span style={{ fontSize: "12px", color: THEME.subText }}>Click to view materials</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: "30px", width: "100%", boxSizing: "border-box" },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "25px",
    width: "100%",
  },

  addCard: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))",
    borderRadius: "20px",
    border: "2px dashed #4ade80",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "190px",
    cursor: "pointer",
    gap: "15px",
    transition: "transform 0.2s, border-color 0.2s",
    boxShadow: "0 4px 16px rgba(21, 128, 61, 0.1), 0 2px 4px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  addIconBg: {
    background: "linear-gradient(135deg, #15803d, #16a34a)",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
  },
  addText: { fontWeight: "700", color: THEME.primary, fontSize: "15px" },

  subjectCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 4px 16px rgba(21, 128, 61, 0.08), 0 2px 4px rgba(0,0,0,0.04)",
    cursor: "pointer",
    height: "190px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "start" },
  folderIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    borderRadius: "50%",
    transition: "background 0.2s",
  },

  cardBody: { display: "flex", flexDirection: "column", gap: "8px" },
  subjectTitle: { margin: 0, fontSize: "18px", color: "#064e3b", fontWeight: "800", letterSpacing: "-0.5px" },
  metaInfo: { display: "flex", alignItems: "center", gap: "6px" },

  dropdownMenu: {
    position: "absolute",
    top: "40px",
    right: -10,
    width: "160px",
    background: "rgba(255, 255, 255, 0.98)",
    borderRadius: "12px",
    boxShadow: "0 10px 25px -5px rgba(21, 128, 61, 0.2), 0 4px 6px rgba(0,0,0,0.05)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    zIndex: 50,
    overflow: "hidden",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
  menuItem: {
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#064e3b",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #f0fdf4",
    transition: "background 0.1s",
  },
}
