"use client"

import { useState, useEffect } from "react"
import { IoClose, IoAdd, IoTrash, IoSave, IoCheckmarkCircle } from "react-icons/io5"

export default function CreateQuizModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState([{ q: "", options: ["", "", "", ""], correct: 0 }])

  useEffect(() => {
    if (isOpen) {
      document.body.style.position = "fixed"
      document.body.style.top = "0"
      document.body.style.left = "0"
      document.body.style.right = "0"
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const addQuestion = () => {
    setQuestions([...questions, { q: "", options: ["", "", "", ""], correct: 0 }])
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions]
    updated[qIndex].options[optIndex] = value
    setQuestions(updated)
  }

  const handleSave = () => {
    if (!title.trim()) return alert("Please enter a title")
    if (questions.some((q) => !q.q.trim() || q.options.some((opt) => !opt.trim())))
      return alert("All questions and options must be filled")

    onSave({ type: "quiz", title, data: questions })
    setTitle("")
    setQuestions([{ q: "", options: ["", "", "", ""], correct: 0 }])
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
        zIndex: 2147483647,
        padding: "20px",
        overflow: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "900px",
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
            background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "white" }}>Create Quiz</h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              color: "white",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
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
                color: "#10b981",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Quiz Title
            </label>
            <input
              type="text"
              placeholder="e.g. Math Reviewer, Science Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "2px solid #d1fae5",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                style={{
                  background: "#f0fdf4",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid #d1fae5",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)",
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
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#10b981", textTransform: "uppercase" }}>
                    Question {qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      style={{
                        border: "none",
                        background: "#fee2e2",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      <IoTrash size={16} /> Remove
                    </button>
                  )}
                </div>

                <textarea
                  placeholder="Type your question here..."
                  value={question.q}
                  onChange={(e) => updateQuestion(qIndex, "q", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "2px solid #d1fae5",
                    minHeight: "80px",
                    fontSize: "15px",
                    resize: "vertical",
                    marginBottom: "15px",
                    fontWeight: "500",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#64748b",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    Options (Click checkmark to set correct answer)
                  </span>
                  {question.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        border: question.correct === optIndex ? "2px solid #10b981" : "2px solid #e5e7eb",
                        background: question.correct === optIndex ? "#ecfdf5" : "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <button
                        onClick={() => updateQuestion(qIndex, "correct", optIndex)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          flexShrink: 0,
                          color: question.correct === optIndex ? "#10b981" : "#cbd5e1",
                        }}
                      >
                        <IoCheckmarkCircle size={24} />
                      </button>
                      <input
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        style={{
                          flex: 1,
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          fontSize: "14px",
                          minWidth: 0,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "24px",
              border: "2px dashed #10b981",
              background: "transparent",
              color: "#10b981",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
              fontSize: "15px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f0fdf4"
              e.target.style.borderColor = "#059669"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent"
              e.target.style.borderColor = "#10b981"
            }}
          >
            <IoAdd size={18} /> Add Question
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
              borderRadius: "12px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "12px 28px",
              border: "none",
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              color: "white",
              fontWeight: "600",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)"
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)"
            }}
          >
            <IoSave size={16} /> Save Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
