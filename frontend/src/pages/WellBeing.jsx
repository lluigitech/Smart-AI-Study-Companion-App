"use client"

import { useState, useEffect } from "react"
// TAMA: Ginamit ang useNavigate mula sa react-router-dom para sa Vite
import { useNavigate } from "react-router-dom"; 
import { IoArrowBack, IoHappy, IoSad, IoPartlySunny, IoThunderstorm, IoBook, IoLeaf, IoTime, IoSparkles, IoCheckmarkCircle } from "react-icons/io5"

export default function WellBeing() {
  // TAMA: Ini-initialize ang navigate hook
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("checkin")
  const [history, setHistory] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const userString = localStorage.getItem("user")
    if (userString) {
      const user = JSON.parse(userString)
      setUserId(user.id)
      fetchHistory(user.id)
    }
  }, [])

  const fetchHistory = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/mood-logs/${id}`)
      const data = await res.json()
      setHistory(data)
    } catch (error) {
      console.error("Error fetching mood logs:", error)
    }
  }

  const [quote, setQuote] = useState("")
  useEffect(() => {
    const quotes = [
      "Believe you can and you're halfway there.",
      "Your mental health is a priority.",
      "It always seems impossible until it's done.",
      "Rest if you must, but don't you quit.",
    ]
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  // --- SUB-COMPONENTS ---

  // A. CHECK-IN FORM
  const CheckIn = () => {
    const [selectedMood, setSelectedMood] = useState(null)
    const [note, setNote] = useState("")

    const handleSave = async () => {
      if (!selectedMood) return alert("Please select a mood first.")
      if (!userId) return alert("User not logged in.")

      try {
        await fetch("http://localhost:5000/api/mood-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            mood: selectedMood.label,
            note: note,
          }),
        })

        fetchHistory(userId)
        setActiveTab("history")
      } catch (error) {
        console.error("Error saving mood:", error)
        alert("Failed to save entry. Check database connection.")
      }
    }

    const moods = [
      { label: "Great", icon: <IoHappy size={35} />, color: "#22c55e", bg: "#dcfce7" },
      { label: "Okay", icon: <IoPartlySunny size={35} />, color: "#eab308", bg: "#fef9c3" },
      { label: "Tired", icon: <IoThunderstorm size={35} />, color: "#64748b", bg: "#f1f5f9" },
      { label: "Bad", icon: <IoSad size={35} />, color: "#ef4444", bg: "#fee2e2" },
    ]

    return (
      <div style={styles.tabContent}>
        <div style={styles.quoteBox}>
          <div style={styles.quoteIcon}>✨</div>
          <p style={styles.quoteText}>"{quote}"</p>
        </div>

        <h3 style={styles.sectionTitle}>How are you feeling right now?</h3>
        <div style={styles.moodGrid}>
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m)}
              style={{
                ...styles.moodBtn,
                background: selectedMood?.label === m.label ? m.bg : "white",
                borderColor: selectedMood?.label === m.label ? m.color : "#e0e0e0",
                color: selectedMood?.label === m.label ? m.color : "#9ca3af",
                transform: selectedMood?.label === m.label ? "scale(1.02)" : "scale(1)",
              }}
            >
              {m.icon}
              <span style={{ ...styles.moodLabel, color: selectedMood?.label === m.label ? m.color : "#4b5563" }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Journal Entry (Optional)</label>
          <textarea
            style={styles.textArea}
            placeholder="Why do you feel this way? Write your thoughts here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button onClick={handleSave} style={styles.primaryBtn}>
          Save Entry
        </button>
      </div>
    )
  }

  // B. HISTORY LIST
  const History = () => {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    }

    return (
      <div style={styles.tabContent}>
        <h3 style={styles.sectionTitle}>Your Mood Log</h3>
        {history.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}><IoBook size={50} /></div>
            <h4 style={styles.emptyTitle}>No entries yet</h4>
            <p style={styles.emptyText}>Start tracking your mood to see your wellness journey</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} style={styles.historyCard}>
              <div style={styles.historyIcon}>
                {item.mood === "Great" ? (
                  <IoHappy color="#22c55e" size={22} />
                ) : item.mood === "Okay" ? (
                  <IoPartlySunny color="#eab308" size={22} />
                ) : item.mood === "Tired" ? (
                  <IoThunderstorm color="#64748b" size={22} />
                ) : (
                  <IoSad color="#ef4444" size={22} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.historyHeader}>
                  <span style={styles.historyMood}>{item.mood}</span>
                  <span style={styles.historyDate}>{formatDate(item.created_at)}</span>
                </div>
                {item.note && <p style={styles.historyNote}>{item.note}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  // C. BREATHING EXERCISE
  const Breathing = () => {
    const [step, setStep] = useState("Inhale")

    useEffect(() => {
      const interval = setInterval(() => {
        setStep((prev) => {
          if (prev === "Inhale") return "Hold"
          if (prev === "Hold") return "Exhale"
          if (prev === "Exhale") return "Inhale"
          return "Inhale"
        })
      }, 4000)
      return () => clearInterval(interval)
    }, [])

    const getCircleStyle = () => {
      let scale = 1
      let color = "#2e7d32"
      if (step === "Inhale") { scale = 1.5; color = "#43a047" }
      if (step === "Hold") { scale = 1.5; color = "#2e7d32" }
      if (step === "Exhale") { scale = 1.0; color = "#66bb6a" }

      return {
        ...styles.breathingCircle,
        transform: `scale(${scale})`,
        background: color,
      }
    }

    return (
      <div style={styles.breathingContainer}>
        <h3 style={styles.sectionTitle}>Guided Breathing</h3>
        <p style={styles.breathingSubtitle}>Sync your breath with the circle to reduce stress and anxiety</p>
        <div style={styles.breathingWrapper}>
          <div style={getCircleStyle()}>
            <span style={styles.breathText}>{step}</span>
          </div>
        </div>
        <div style={styles.breathingInfo}>
          <p style={styles.breathingInfoText}>
            <strong>4-7-8 Breathing Technique</strong>
            <br />A simple yet powerful method to calm your mind and body
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          // TAMA: Ginamit ang navigate('/dashboard') sa halip na router.push
          onClick={() => navigate("/dashboard")}
          style={styles.backBtn}
        >
          <IoArrowBack size={24} color="#1b5e20" />
        </button>
        <h2 style={styles.title}>Wellness Center</h2>
      </div>

      <div style={styles.tabBar}>
        <button onClick={() => setActiveTab("checkin")} style={activeTab === "checkin" ? styles.activeTab : styles.tab}>
          <IoBook size={18} /> Check-In
        </button>
        <button onClick={() => setActiveTab("history")} style={activeTab === "history" ? styles.activeTab : styles.tab}>
          <IoTime size={18} /> History
        </button>
        <button onClick={() => setActiveTab("relax")} style={activeTab === "relax" ? styles.activeTab : styles.tab}>
          <IoLeaf size={18} /> Relax
        </button>
      </div>

      {activeTab === "checkin" && <CheckIn />}
      {activeTab === "history" && <History />}
      {activeTab === "relax" && <Breathing />}
    </div>
  )
}

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9999,
    background: "linear-gradient(to bottom, #f3f4f6 0%, #e8f5e9 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "20px",
    paddingBottom: "80px",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  header: { display: "flex", alignItems: "center", marginBottom: "24px" },
  backBtn: {
    background: "white", border: "1px solid #e0e0e0", cursor: "pointer",
    marginRight: "15px", padding: "10px", borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex",
    alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
  },
  title: { margin: 0, fontSize: "24px", color: "#1b5e20", fontWeight: "800", letterSpacing: "-0.5px" },
  tabBar: { display: "flex", background: "white", padding: "6px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e0e0e0" },
  tab: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 12px", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af", fontWeight: "600", borderRadius: "12px", fontSize: "14px" },
  activeTab: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 12px", border: "none", background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)", cursor: "pointer", color: "#1b5e20", fontWeight: "700", borderRadius: "12px", fontSize: "14px", boxShadow: "0 2px 8px rgba(27, 94, 32, 0.15)" },
  tabContent: { animation: "fadeIn 0.4s ease-out", paddingBottom: "20px" },
  quoteBox: { background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)", padding: "28px 24px", borderRadius: "20px", color: "white", marginBottom: "28px", textAlign: "center", boxShadow: "0 8px 24px rgba(46, 125, 50, 0.35)", border: "1px solid rgba(255,255,255,0.2)", position: "relative" },
  quoteIcon: { fontSize: "28px", marginBottom: "12px", opacity: 0.9 },
  quoteText: { fontStyle: "italic", fontSize: "16px", fontWeight: "500", lineHeight: "1.6", margin: 0 },
  sectionTitle: { fontSize: "18px", color: "#1b5e20", marginBottom: "16px", fontWeight: "700" },
  moodGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" },
  moodBtn: { display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px", borderRadius: "16px", border: "2px solid", cursor: "pointer", transition: "all 0.2s ease", background: "white" },
  moodLabel: { marginTop: "10px", fontSize: "14px", fontWeight: "600" },
  inputGroup: { marginBottom: "24px" },
  inputLabel: { display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" },
  textArea: { width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid #e0e0e0", background: "white", minHeight: "130px", fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", fontSize: "14px" },
  primaryBtn: { width: "100%", padding: "18px", background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)", color: "white", border: "none", borderRadius: "16px", fontWeight: "700", fontSize: "16px", cursor: "pointer", boxShadow: "0 8px 20px rgba(46, 125, 50, 0.3)" },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { color: "#c8e6c9", marginBottom: "16px", display: "flex", justifyContent: "center" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#374151", margin: "0 0 8px 0" },
  emptyText: { fontSize: "14px", color: "#9ca3af", margin: 0 },
  historyCard: { background: "white", padding: "18px", borderRadius: "16px", marginBottom: "14px", display: "flex", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #e0e0e0" },
  historyIcon: { background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", height: "50px", width: "50px", minWidth: "50px", border: "1px solid #e5e7eb" },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  historyMood: { fontWeight: "700", color: "#1f2937", fontSize: "16px" },
  historyDate: { fontSize: "12px", color: "#9ca3af", fontWeight: "500" },
  historyNote: { fontSize: "14px", color: "#6b7280", margin: 0 },
  breathingContainer: { textAlign: "center", paddingBottom: "40px" },
  breathingSubtitle: { color: "#6b7280", marginBottom: "40px", fontSize: "14px" },
  breathingWrapper: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "280px", marginBottom: "40px" },
  breathingCircle: { width: "200px", height: "200px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "26px", fontWeight: "800", transition: "all 4s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 0 60px rgba(46, 125, 50, 0.5)", border: "3px solid rgba(255,255,255,0.3)" },
  breathText: { textTransform: "uppercase", letterSpacing: "4px" },
  breathingInfo: { background: "#fff3e0", border: "1px solid #ffe0b2", borderRadius: "16px", padding: "20px" },
  breathingInfoText: { fontSize: "14px", color: "#e65100", margin: 0 },
}