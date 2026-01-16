"use client"

import { useState, useEffect } from "react"
import { IoText } from "react-icons/io5"

export default function CreateNoteModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

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

  const handleSave = () => {
    if (!title.trim()) return alert("Please add a note title.")

    onSave({ type: "note", title, data: body })
    setTitle("")
    setBody("")
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "700px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          position: "relative",
          zIndex: 999999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IoText size={20} color="#059669" />
            </div>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>New Note</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                padding: "8px 12px",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "white",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                padding: "8px 20px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(5, 150, 105, 0.2)",
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          <input
            type="text"
            placeholder="Title"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "24px",
              fontWeight: "700",
              color: "#1e293b",
              marginBottom: "16px",
              background: "transparent",
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <textarea
            style={{
              width: "100%",
              flex: 1,
              minHeight: "200px",
              border: "none",
              outline: "none",
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#334155",
              resize: "none",
              background: "transparent",
              fontFamily: "inherit",
            }}
            placeholder="Type something..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
