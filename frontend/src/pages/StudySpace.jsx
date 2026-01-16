"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { IoCalendar, IoBook, IoSparkles } from "react-icons/io5"

// Import components
import PlannerTab from "../components/StudySpace/PlannerTab"
import StudyHubTab from "../components/StudySpace/StudyHubTab"

export default function StudySpace() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("planner")

  // STATE LIFTING: Task Data
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("myStudyTasks")
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "Thesis Chapter 2",
            priority: "high",
            completed: false,
            isOverdue: true,
            date: "2023-12-01",
            time: "23:59",
          },
          {
            id: 2,
            title: "Data Struct Review",
            priority: "medium",
            completed: false,
            isOverdue: false,
            date: new Date().toISOString().split("T")[0],
            time: "10:00",
          },
        ]
  })

  // THE "SMART SENSOR" (Workload Detection)
  useEffect(() => {
    const pendingCount = tasks.filter((t) => !t.completed).length
    const overdueCount = tasks.filter((t) => t.isOverdue).length

    let workloadLevel = "Low"

    if (overdueCount > 0 || pendingCount > 5) {
      workloadLevel = "High"
    } else if (pendingCount >= 3) {
      workloadLevel = "Medium"
    }

    localStorage.setItem("studyLoad", workloadLevel)
    localStorage.setItem("pendingCount", pendingCount)
    localStorage.setItem("myStudyTasks", JSON.stringify(tasks))
  }, [tasks])

  // 🔥 NEW: Listen for study session state changes
  useEffect(() => {
    const checkStudySession = () => {
      const isInSession = localStorage.getItem('isStudySessionActive') === 'true'
      // This will be picked up by BottomNav
    }
    
    // Check immediately and set up interval
    checkStudySession()
    const interval = setInterval(checkStudySession, 100)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient} />

      {/* HEADER & TABS */}
      <div style={styles.header}>
        <div style={styles.topRow}>
          <div style={styles.iconBox}>
            <IoBook style={styles.icon} />
          </div>
          <h1 style={styles.title}>Study Space</h1>
        </div>

        {/* Tab Container */}
        <div style={styles.tabContainer}>
          <div style={activeTab === "planner" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("planner")}>
            <IoCalendar style={styles.tabIcon} /> Planner
          </div>
          <div
            style={activeTab === "studyhub" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("studyhub")}
          >
            <IoSparkles style={styles.tabIcon} /> Study Hub
          </div>
        </div>
      </div>

      {/* CONTENT SWITCHER */}
      <div style={styles.contentFade}>
        {activeTab === "planner" ? <PlannerTab tasks={tasks} setTasks={setTasks} /> : <StudyHubTab />}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: "20px",
    background: "linear-gradient(to bottom, #b8e8dd 0%, #c5ede4 100%)",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    paddingBottom: "100px",
  },
  header: { marginBottom: "20px" },
  topRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
    marginTop: "10px",
    gap: "10px",
  },
  iconBox: {
    width: "42px",
    height: "42px",
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.35), 0 2px 4px rgba(0,0,0,0.1)",
  },
  icon: {
    color: "#ffffff",
    fontSize: "22px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    margin: 0,
    color: "#064e3b",
    letterSpacing: "-0.3px",
  },
  tabContainer: {
    display: "flex",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "5px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    gap: "4px",
  },
  activeTab: {
    flex: 1,
    padding: "11px 14px",
    fontWeight: "700",
    fontSize: "15px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    borderRadius: "9px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 3px 10px rgba(21, 128, 61, 0.35), 0 1px 3px rgba(0,0,0,0.1)",
  },
  tab: {
    flex: 1,
    padding: "11px 14px",
    fontSize: "15px",
    color: "#059669",
    cursor: "pointer",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    background: "transparent",
  },
  tabIcon: {
    fontSize: "18px",
  },
  contentFade: { animation: "fadeIn 0.3s ease-in-out" },
}