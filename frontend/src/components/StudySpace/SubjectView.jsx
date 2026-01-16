"use client"

import { useState } from "react"
import { IoArrowUndo, IoAdd, IoDocument, IoDocumentText, IoTrash, IoLibrary, IoHelpCircle } from "react-icons/io5"

// Import Components
import AddNewMaterialMenu from "./AddNewMaterialMenu"
import CreateFlashcardModal from "./CreateFlashcardModal"
import CreateQuizModal from "./CreateQuizModal"
import CreateNoteModal from "./CreateNoteModal"
import AIGeneratorModal from "./AIGeneratorModal"

const THEME = {
  text: "#064e3b",
  primary: "#15803d",
  danger: "#ef4444",
}

export default function SubjectView({
  activeSubject,
  onBack,
  toggleMenu,
  activeMenuId,
  handleMenuAction,
  openMaterial,
  deleteMaterial,
  onAddMaterial,
}) {
  // Modal states
  const [showFlashcardModal, setShowFlashcardModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)

  const handleLocalMenuAction = (actionType) => {
    toggleMenu(null)
    
    switch (actionType) {
      case "upload":
        handleMenuAction("upload")
        break
      case "create_note":
        setShowNoteModal(true)
        break
      case "manual_deck":
        setShowFlashcardModal(true)
        break
      case "manual_quiz":
        setShowQuizModal(true)
        break
      case "ai_generate":
        setShowAIModal(true)
        break
      default:
        console.log("Unknown action:", actionType)
    }
  }

  // Save handlers for each modal type
  const handleSaveFlashcard = (modalData) => {
    // modalData = { type: "deck", title: "...", data: [{front, back}] }
    // Convert to proper format for database
    const content = modalData.data || []
    console.log("Saving flashcard:", modalData.title, content)
    onAddMaterial("deck", modalData.title, content)
    setShowFlashcardModal(false)
  }

  const handleSaveQuiz = (modalData) => {
    // modalData = { type: "quiz", title: "...", data: [{q, options, correct}] }
    const content = modalData.data || []
    console.log("Saving quiz:", modalData.title, content)
    onAddMaterial("quiz", modalData.title, content)
    setShowQuizModal(false)
  }

  const handleSaveNote = (modalData) => {
    // modalData = { type: "note", title: "...", data: "text content" }
    const content = modalData.data || ""
    console.log("Saving note:", modalData.title, content)
    onAddMaterial("note", modalData.title, content)
    setShowNoteModal(false)
  }

  const handleAIGenerate = (config, callback) => {
    // Pass to parent's handleMenuAction or create handler
    handleMenuAction("ai_generate_execute", config, callback)
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <button onClick={onBack} style={styles.backBtn}>
          <IoArrowUndo /> Back
        </button>

        <div style={{ position: "relative" }}>
          <button
            style={styles.addNewBtn}
            onClick={(e) => {
              e.stopPropagation()
              toggleMenu("add_new", e)
            }}
          >
            <IoAdd size={18} /> New Material
          </button>

          <AddNewMaterialMenu isOpen={activeMenuId === "add_new"} onAction={handleLocalMenuAction} />
        </div>
      </div>

      {/* TITLE */}
      <h2 style={styles.titleText}>{activeSubject.title}</h2>

      {/* LIST */}
      <div style={styles.materialList}>
        {activeSubject.materials.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <IoDocumentText size={32} color="#cbd5e1" />
            </div>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "10px 0" }}>Folder is empty.</p>
            <button
              style={styles.emptyBtn}
              onClick={(e) => {
                e.stopPropagation()
                toggleMenu("add_new", e)
              }}
            >
              Create your first material
            </button>
          </div>
        )}

        {activeSubject.materials.map((item) => (
          <div key={item.id} style={styles.materialItem} onClick={() => openMaterial(item)}>
            <div
              style={{
                ...styles.itemIcon,
                background:
                  item.type === "deck"
                    ? "#eef2ff"
                    : item.type === "quiz"
                      ? "#fdf2f8"
                      : item.type === "note"
                        ? "#fef3c7"
                        : "#f0f9ff",
                color:
                  item.type === "deck"
                    ? "#6366f1"
                    : item.type === "quiz"
                      ? "#db2777"
                      : item.type === "note"
                        ? "#d97706"
                        : "#0ea5e9",
              }}
            >
              {item.type === "deck" ? (
                <IoLibrary />
              ) : item.type === "quiz" ? (
                <IoHelpCircle />
              ) : item.type === "note" ? (
                <IoDocumentText />
              ) : (
                <IoDocument />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={styles.itemTitle}>{item.title}</h4>
              <p style={styles.itemSub}>{item.type}</p>
            </div>

            <button
              style={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation()
                deleteMaterial(item)
              }}
            >
              <IoTrash size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* MODALS - Using YOUR existing components */}
      <CreateFlashcardModal 
        isOpen={showFlashcardModal} 
        onClose={() => setShowFlashcardModal(false)} 
        onSave={handleSaveFlashcard} 
      />

      <CreateQuizModal 
        isOpen={showQuizModal} 
        onClose={() => setShowQuizModal(false)} 
        onSave={handleSaveQuiz} 
      />

      <CreateNoteModal 
        isOpen={showNoteModal} 
        onClose={() => setShowNoteModal(false)} 
        onSave={handleSaveNote} 
      />

      <AIGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        files={activeSubject.materials.filter(m => m.type === "file")}
        onGenerate={handleAIGenerate}
      />
    </div>
  )
}

const styles = {
  titleText: {
    margin: "0 20px 25px",
    fontSize: "32px",
    color: THEME.text,
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "0 20px",
    marginTop: "10px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    padding: 0,
  },
  addNewBtn: {
    background: "linear-gradient(135deg, #15803d, #16a34a)",
    borderRadius: "12px",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.4), 0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.1s",
  },
  materialList: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "12px", 
    padding: "0 20px", 
    paddingBottom: "80px" 
  },
  materialItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.1), 0 2px 4px rgba(0,0,0,0.05)",
    transition: "transform 0.1s",
  },
  itemIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  itemTitle: { 
    margin: 0, 
    fontSize: "16px", 
    fontWeight: "700", 
    color: "#064e3b", 
    marginBottom: "2px" 
  },
  itemSub: { 
    margin: 0, 
    fontSize: "12px", 
    color: "#059669", 
    fontWeight: "500", 
    textTransform: "capitalize" 
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "10px",
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    borderRadius: "50%",
    transition: "color 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "2px dashed rgba(21, 128, 61, 0.3)",
  },
  emptyIcon: {
    width: "60px",
    height: "60px",
    background: "#d1fae5",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },
  emptyBtn: {
    marginTop: "10px",
    background: "none",
    border: "none",
    color: THEME.primary,
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },
}