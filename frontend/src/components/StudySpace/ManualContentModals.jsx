"use client"

import { useState } from "react"
import { IoClose, IoAdd, IoTrash, IoSave, IoLibrary, IoHelpCircle, IoDocumentText } from "react-icons/io5"

// ==========================================
// 1. CREATE FLASHCARD DECK MODAL
// ==========================================
// ==========================================
// 1. CREATE FLASHCARD DECK MODAL
// ==========================================
export function CreateDeckModal({ isOpen, onClose, onSave }) {
  const [deckTitle, setDeckTitle] = useState("")
  const [cards, setCards] = useState([
    { front: "", back: "" },
    { front: "", back: "" },
  ])

  if (!isOpen) return null

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }])
  }

  const removeCard = (index) => {
    if (cards.length <= 1) return
    setCards(cards.filter((_, i) => i !== index))
  }

  const updateCard = (index, field, value) => {
    const updated = [...cards]
    updated[index][field] = value
    setCards(updated)
  }

  const handleSave = () => {
    if (!deckTitle.trim()) {
      alert("Please enter a deck title")
      return
    }

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim())
    if (validCards.length === 0) {
      alert("Please add at least one card with both front and back")
      return
    }

    onSave({
      type: "deck",
      title: deckTitle,
      content: validCards,
    })

    // Reset
    setDeckTitle("")
    setCards([{ front: "", back: "" }, { front: "", back: "" }])
    onClose()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...styles.iconCircle, background: "#ede9fe" }}>
              <IoLibrary size={20} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={styles.heading}>Create Flashcard Deck</h3>
              <p style={styles.subHeading}>Build your own study cards from scratch</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <IoClose size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Deck Title */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>Deck Title</label>
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 5 - Cell Division"
              style={styles.input}
            />
          </div>

          {/* Cards */}
          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Flashcards ({cards.length})</label>
          </div>

          <div style={styles.cardsContainer}>
            {cards.map((card, index) => (
              <div key={index} style={styles.cardItem}>
                <div style={styles.cardNumber}>Card {index + 1}</div>
                <div style={styles.cardInputs}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.smallLabel}>Front (Question)</label>
                    <textarea
                      value={card.front}
                      onChange={(e) => updateCard(index, "front", e.target.value)}
                      placeholder="What is mitosis?"
                      style={styles.textarea}
                      rows={2}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.smallLabel}>Back (Answer)</label>
                    <textarea
                      value={card.back}
                      onChange={(e) => updateCard(index, "back", e.target.value)}
                      placeholder="The process of cell division..."
                      style={styles.textarea}
                      rows={2}
                    />
                  </div>
                </div>
                {cards.length > 1 && (
                  <button onClick={() => removeCard(index)} style={styles.removeBtn}>
                    <IoTrash size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={addCard} style={styles.addBtn}>
            <IoAdd size={20} /> Add Another Card
          </button>
        </div>

        <div style={styles.footer}>
          <button onClick={handleSave} style={styles.saveBtn}>
            <IoSave size={20} /> Save Deck ({cards.filter((c) => c.front.trim() && c.back.trim()).length} cards)
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. CREATE QUIZ MODAL
// ==========================================
export function CreateQuizModal({ isOpen, onClose, onSave }) {
  const [quizTitle, setQuizTitle] = useState("")
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ])

  if (!isOpen) return null

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }])
  }

  const removeQuestion = (index) => {
    if (questions.length <= 1) return
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
    if (!quizTitle.trim()) {
      alert("Please enter a quiz title")
      return
    }

    const validQuestions = questions.filter(
      (q) => q.question.trim() && q.options.every((opt) => opt.trim()) && q.correctAnswer.trim()
    )

    if (validQuestions.length === 0) {
      alert("Please add at least one complete question")
      return
    }

    onSave({
      type: "quiz",
      title: quizTitle,
      content: validQuestions,
    })

    // Reset
    setQuizTitle("")
    setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "" }])
    onClose()
  }

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, maxWidth: "800px" }}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...styles.iconCircle, background: "#fce7f3" }}>
              <IoHelpCircle size={20} color="#ec4899" />
            </div>
            <div>
              <h3 style={styles.heading}>Create Quiz</h3>
              <p style={styles.subHeading}>Make multiple-choice questions</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <IoClose size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Quiz Title */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>Quiz Title</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g., History Midterm Practice Quiz"
              style={styles.input}
            />
          </div>

          {/* Questions */}
          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Questions ({questions.length})</label>
          </div>

          <div style={styles.cardsContainer}>
            {questions.map((q, qIndex) => (
              <div key={qIndex} style={styles.quizItem}>
                <div style={styles.cardNumber}>Question {qIndex + 1}</div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={styles.smallLabel}>Question</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                    placeholder="What year did World War II end?"
                    style={styles.textarea}
                    rows={2}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={styles.smallLabel}>Options</label>
                  <div style={styles.optionsGrid}>
                    {q.options.map((opt, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        style={styles.optionInput}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={styles.smallLabel}>Correct Answer</label>
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Select correct answer...</option>
                    {q.options.map((opt, optIndex) => (
                      <option key={optIndex} value={opt} disabled={!opt.trim()}>
                        {opt.trim() ? `${String.fromCharCode(65 + optIndex)}: ${opt}` : `Option ${String.fromCharCode(65 + optIndex)} (empty)`}
                      </option>
                    ))}
                  </select>
                </div>

                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIndex)} style={styles.removeBtn}>
                    <IoTrash size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={addQuestion} style={styles.addBtn}>
            <IoAdd size={20} /> Add Another Question
          </button>
        </div>

        <div style={styles.footer}>
          <button onClick={handleSave} style={styles.saveBtn}>
            <IoSave size={20} /> Save Quiz (
            {questions.filter((q) => q.question.trim() && q.options.every((o) => o.trim()) && q.correctAnswer.trim()).length}{" "}
            questions)
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. CREATE NOTE MODAL
// ==========================================
export function CreateNoteModal({ isOpen, onClose, onSave }) {
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  if (!isOpen) return null

  const handleSave = () => {
    if (!noteTitle.trim()) {
      alert("Please enter a note title")
      return
    }

    if (!noteContent.trim()) {
      alert("Please write some content for your note")
      return
    }

    onSave({
      type: "note",
      title: noteTitle,
      content: noteContent,
    })

    // Reset
    setNoteTitle("")
    setNoteContent("")
    onClose()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...styles.iconCircle, background: "#dbeafe" }}>
              <IoDocumentText size={20} color="#3b82f6" />
            </div>
            <div>
              <h3 style={styles.heading}>Create Note</h3>
              <p style={styles.subHeading}>Write your own study notes</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <IoClose size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Note Title */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>Note Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g., Key Concepts - Photosynthesis"
              style={styles.input}
            />
          </div>

          {/* Note Content */}
          <div style={{ marginBottom: "24px" }}>
            <label style={styles.label}>Content</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your notes here...&#10;&#10;• Use bullet points&#10;• Add important definitions&#10;• Include key formulas or concepts"
              style={{
                ...styles.textarea,
                minHeight: "300px",
                fontFamily: "inherit",
              }}
              rows={12}
            />
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleSave} style={styles.saveBtn}>
            <IoSave size={20} /> Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    padding: "20px",
    overflowY: "auto",
  },
  modal: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "1px solid #f1f5f9",
  },
  header: {
    padding: "24px 30px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" },
  subHeading: { margin: 0, fontSize: "13px", color: "#64748b" },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    padding: 5,
  },
  body: {
    padding: "30px",
    overflowY: "auto",
    flex: 1,
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "8px",
  },
  smallLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    transition: "border-color 0.2s",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "20px",
  },
  cardItem: {
    padding: "20px",
    background: "#f9fafb",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    position: "relative",
  },
  quizItem: {
    padding: "24px",
    background: "#f9fafb",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    position: "relative",
  },
  cardNumber: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
  },
  cardInputs: {
    display: "flex",
    gap: "16px",
    flexDirection: "column",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  optionInput: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
  },
  removeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: "100%",
    padding: "14px",
    background: "#f3f4f6",
    color: "#374151",
    border: "2px dashed #d1d5db",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
  },
  footer: {
    padding: "20px 30px",
    borderTop: "1px solid #f1f5f9",
    background: "#fafafa",
    flexShrink: 0,
  },
  saveBtn: {
    width: "100%",
    padding: "16px",
    border: "none",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    fontWeight: "700",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "16px",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
  },
}