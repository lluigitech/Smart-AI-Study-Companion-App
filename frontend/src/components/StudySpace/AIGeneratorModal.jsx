"use client"

import { useState, useEffect } from "react"
import { IoClose, IoSparkles, IoDocumentText, IoLibrary, IoHelpCircle, IoReader } from "react-icons/io5"

export default function AIGeneratorModal({ isOpen, onClose, files, onGenerate }) {
  const [config, setConfig] = useState({ fileId: "", type: "deck", count: 5, difficulty: "Medium" })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    if (files && files.length > 0 && !config.fileId) {
      setConfig((prev) => ({ ...prev, fileId: files[0].id }))
    }
  }, [files, isOpen])

  useEffect(() => {
    if (config.type === "summary") {
      setConfig((prev) => ({ ...prev, count: "Short", difficulty: "Bullets" }))
    } else {
      setConfig((prev) => ({ ...prev, count: 5, difficulty: "Medium" }))
    }
  }, [config.type])

  if (!isOpen) return null

  const handleGenerate = () => {
    if (!config.fileId) return alert("Please select a file first.")
    setIsGenerating(true)
    onGenerate(config, () => {
      setIsGenerating(false)
      onClose()
    })
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.iconCircle}>
              <IoSparkles size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={styles.heading}>AI Generator</h3>
              <p style={styles.subHeading}>Turn your documents into reviewers instantly.</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <IoClose size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* SECTION 1: SOURCE FILE SELECTION */}
          <div style={styles.section}>
            <label style={styles.label}>Select Source Material</label>
            {files.length > 0 ? (
              <div style={styles.selectWrapper}>
                <IoDocumentText size={18} color="#64748b" style={{ position: "absolute", left: 15 }} />
                <select
                  style={styles.selectInput}
                  value={config.fileId}
                  onChange={(e) => setConfig({ ...config, fileId: e.target.value })}
                >
                  {files.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={styles.emptyMsg}>No files uploaded yet. Please upload a PDF first.</div>
            )}
          </div>

          {/* SECTION 2: TYPE SELECTION WITH CARDS */}
          <div style={styles.section}>
            <label style={styles.label}>What to create?</label>
            <div style={styles.gridRow}>
              <button
                onClick={() => setConfig({ ...config, type: "deck" })}
                style={{
                  ...styles.typeCard,
                  borderColor: config.type === "deck" ? "#10b981" : "#e2e8f0",
                  background: config.type === "deck" ? "#d1fae5" : "white",
                }}
              >
                <div style={{ ...styles.typeIcon, background: "#d1fae5", color: "#10b981" }}>
                  <IoLibrary size={22} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <span style={styles.cardTitle}>Flashcards</span>
                  <span style={styles.cardDesc}>Memorization</span>
                </div>
              </button>

              <button
                onClick={() => setConfig({ ...config, type: "quiz" })}
                style={{
                  ...styles.typeCard,
                  borderColor: config.type === "quiz" ? "#10b981" : "#e2e8f0",
                  background: config.type === "quiz" ? "#d1fae5" : "white",
                }}
              >
                <div style={{ ...styles.typeIcon, background: "#d1fae5", color: "#10b981" }}>
                  <IoHelpCircle size={22} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <span style={styles.cardTitle}>Quiz</span>
                  <span style={styles.cardDesc}>Practice Test</span>
                </div>
              </button>

              <button
                onClick={() => setConfig({ ...config, type: "summary" })}
                style={{
                  ...styles.typeCard,
                  borderColor: config.type === "summary" ? "#10b981" : "#e2e8f0",
                  background: config.type === "summary" ? "#d1fae5" : "white",
                }}
              >
                <div style={{ ...styles.typeIcon, background: "#d1fae5", color: "#10b981" }}>
                  <IoReader size={22} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <span style={styles.cardTitle}>Summary</span>
                  <span style={styles.cardDesc}>Key Points</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: DYNAMIC OPTIONS (changes based on type) */}
          <div style={styles.gridRowSimple}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>{config.type === "summary" ? "Length" : "Items"}</label>
              <select
                style={styles.simpleSelect}
                value={config.count}
                onChange={(e) => setConfig({ ...config, count: e.target.value })}
              >
                {config.type === "summary" ? (
                  <>
                    <option value="Short">Short (Concise)</option>
                    <option value="Detailed">Detailed</option>
                  </>
                ) : (
                  <>
                    <option value="5">5 Items</option>
                    <option value="10">10 Items</option>
                    <option value="15">15 Items</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>{config.type === "summary" ? "Format" : "Difficulty"}</label>
              {config.type === "summary" ? (
                <select
                  style={styles.simpleSelect}
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                >
                  <option value="Bullets">Bullet Points</option>
                  <option value="Paragraph">Paragraph</option>
                </select>
              ) : (
                <select
                  style={styles.simpleSelect}
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleGenerate} disabled={isGenerating || files.length === 0} style={styles.generateBtn}>
            {isGenerating ? (
              <>
                Creating {config.type}... <span style={styles.spinner}>⏳</span>
              </>
            ) : (
              <>
                Generate Content <IoSparkles />
              </>
            )}
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
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    padding: "20px",
  },
  modal: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "650px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
  },
  header: {
    padding: "24px 30px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: "12px",
    background: "#d1fae5",
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
    borderRadius: "50%",
  },
  body: { padding: "30px", background: "#ffffff" },
  section: { marginBottom: "25px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  selectWrapper: { position: "relative", display: "flex", alignItems: "center" },
  selectInput: {
    width: "100%",
    padding: "14px 14px 14px 45px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    outline: "none",
    background: "white",
    cursor: "pointer",
    fontWeight: "500",
    color: "#334155",
  },
  emptyMsg: {
    padding: "15px",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px dashed #fcd34d",
  },
  gridRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "15px" },
  gridRowSimple: { display: "flex", gap: "20px" },
  typeCard: {
    padding: "16px",
    borderRadius: "16px",
    border: "2px solid",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "12px",
    transition: "all 0.2s ease",
    textAlign: "left",
    minHeight: "100px",
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5px",
  },
  cardTitle: { display: "block", fontWeight: "700", color: "#1e293b", fontSize: "14px" },
  cardDesc: { fontSize: "11px", color: "#64748b" },
  simpleSelect: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    background: "white",
  },
  footer: { padding: "24px 30px", borderTop: "1px solid #f1f5f9", background: "#fafafa" },
  generateBtn: {
    width: "100%",
    padding: "16px",
    border: "none",
    background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    color: "white",
    fontWeight: "700",
    borderRadius: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "16px",
    boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.4)",
  },
  spinner: { animation: "spin 1s linear infinite" },
}
