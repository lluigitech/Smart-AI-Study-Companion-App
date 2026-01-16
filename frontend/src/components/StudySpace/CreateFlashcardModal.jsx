"use client"

import { useState, useEffect } from "react"
import { IoClose, IoAdd, IoTrash, IoSave } from "react-icons/io5"

export default function CreateFlashcardModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("")
  const [cards, setCards] = useState([{ front: "", back: "" }])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }])
  }

  const removeCard = (index) => {
    setCards(cards.filter((_, i) => i !== index))
  }

  const updateCard = (index, field, value) => {
    const updated = [...cards]
    updated[index][field] = value
    setCards(updated)
  }

  const handleSave = () => {
    if (!title.trim()) return alert("Please enter a title")
    if (cards.some((c) => !c.front.trim() || !c.back.trim())) return alert("All cards must have front and back text")

    onSave({ type: "deck", title, data: cards })
    setTitle("")
    setCards([{ front: "", back: "" }])
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#166534" }}>Create Flashcard Deck</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#16a34a",
              padding: "5px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", flex: 1, background: "#fff" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#16a34a",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Deck Title
            </label>
            <input
              type="text"
              placeholder="e.g. Biology Chapter 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "2px solid #bbf7d0",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4ade80")}
              onBlur={(e) => (e.target.style.borderColor = "#bbf7d0")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {cards.map((card, index) => (
              <div
                key={index}
                style={{
                  background: "#f0fdf4",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "2px solid #bbf7d0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#16a34a",
                      textTransform: "uppercase",
                    }}
                  >
                    Card {index + 1}
                  </span>
                  {cards.length > 1 && (
                    <button
                      onClick={() => removeCard(index)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "5px",
                        display: "flex",
                      }}
                    >
                      <IoTrash size={18} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 300px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#16a34a",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      FRONT (Question)
                    </span>
                    <textarea
                      placeholder="Term or Question"
                      value={card.front}
                      onChange={(e) => updateCard(index, "front", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        minHeight: "100px",
                        fontSize: "15px",
                        resize: "vertical",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ flex: "1 1 300px", minWidth: "0" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#16a34a",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      BACK (Answer)
                    </span>
                    <textarea
                      placeholder="Definition or Answer"
                      value={card.back}
                      onChange={(e) => updateCard(index, "back", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid #a7f3d0",
                        background: "#ecfdf5",
                        minHeight: "100px",
                        fontSize: "15px",
                        resize: "vertical",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addCard}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "24px",
              border: "2px dashed #86efac",
              background: "transparent",
              color: "#16a34a",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f0fdf4"
              e.target.style.borderColor = "#4ade80"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent"
              e.target.style.borderColor = "#86efac"
            }}
          >
            <IoAdd size={18} /> Add Another Card
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            background: "#fff",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "12px 28px",
              border: "none",
              background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
              color: "white",
              fontWeight: "600",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
            }}
          >
            <IoSave size={16} /> Save Deck
          </button>
        </div>
      </div>
    </div>
  )
}
