import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AITips() {
  const navigate = useNavigate();

  const tipsList = [
    "🧠 Break your study sessions into 25–30 min blocks for better focus.",
    "🐸 Start with the hardest task first — the brain is freshest then (Eat the Frog).",
    "⚡ Take 5–10 min breaks every hour to maintain energy.",
    "📝 Keep a small notebook to jot down quick ideas or questions.",
    "🗣️ Use active recall — quiz yourself instead of just reading.",
    "🎯 Set clear daily goals to track progress efficiently.",
    "💧 Stay hydrated and keep your study space organized.",
    "🤔 Reflect at the end of the day: what went well? What can improve?",
  ];

  const [currentTip, setCurrentTip] = useState(tipsList[0]);

  const showRandomTip = () => {
    // Generate random index
    const randomIndex = Math.floor(Math.random() * tipsList.length);
    setCurrentTip(tipsList[randomIndex]);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🧠 AI Study Tips</h1>
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.backButton}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tip Card */}
        <div style={styles.card}>
            <div style={styles.iconContainer}>💡</div>
            <h2 style={styles.cardHeader}>Tip of the Moment</h2>
            <p style={styles.tipText}>{currentTip}</p>
          
            <button
                onClick={showRandomTip}
                style={styles.actionButton}
            >
                Generate New Tip
            </button>
        </div>

        {/* Motivation Box */}
        <div style={styles.motivationBox}>
          <h3 style={styles.motivationTitle}>✨ Motivation</h3>
          <p style={styles.motivationText}>
            Keep going! Every small step counts toward your learning goals.
            You are doing great!
          </p>
        </div>

      </div>
    </div>
  );
}

// STYLES - Matching your Dashboard Theme
const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6", // Same gray background as dashboard
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "500px", // Mas maliit ng konti para focus sa tip
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#6366f1", // Matching blue/purple theme
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  // Main Card Style
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "40px 30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  iconContainer: {
    fontSize: "40px",
    marginBottom: "15px",
    backgroundColor: "#fffbeb", // Light yellow circle background
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeader: {
    fontSize: "18px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 15px 0",
    fontWeight: "600",
  },
  tipText: {
    fontSize: "20px",
    color: "#374151",
    lineHeight: "1.6",
    fontWeight: "500",
    marginBottom: "30px",
    minHeight: "80px", // Para hindi gumalaw yung button pag maikli text
  },
  actionButton: {
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
    boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)",
  },
  // Motivation Box at the bottom
  motivationBox: {
    backgroundColor: "#ecfdf5", // Light green background
    border: "1px solid #d1fae5",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
  },
  motivationTitle: {
    color: "#047857",
    margin: "0 0 5px 0",
    fontSize: "16px",
    fontWeight: "700",
  },
  motivationText: {
    color: "#065f46",
    fontSize: "14px",
    margin: 0,
  }
};