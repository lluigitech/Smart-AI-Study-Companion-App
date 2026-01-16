"use client"

import React, { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import NotificationModal from "../components/NotificationModal"
import axios from "axios"
// Icons (IO5)
import {
  IoBarChart,
  IoGameController,
  IoCalendar,
  IoHappy,
  IoBulb,
  IoFlash,
  IoCheckmarkCircle,
  IoFlame,
  IoChatbubbleEllipses,
  IoSend,
  IoClose,
  IoSparkles,
  IoTime,
  IoRocket,
  IoHandLeft,
  IoPieChart,
  IoThunderstorm,
  IoSad,
  IoPartlySunny,
  IoLeaf,
  IoAlertCircle,
  IoChevronForward,
  IoTrophy,
  IoNotifications,
} from "react-icons/io5"

export default function Dashboard() {
  const navigate = useNavigate()

  // --- STATES ---
  const [user, setUser] = useState({ id: null, first_name: "Student" })
  const [stats, setStats] = useState({
    points: 0,
    streak: 0,
    weeklySeconds: 0,
    focus: [],
  })
  const [currentRank, setCurrentRank] = useState({ label: "ROOKIE", color: "#475569", bg: "#f1f5f9" })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [aiTip, setAiTip] = useState("Loading plan...")
  const [dailyMissions, setDailyMissions] = useState([])
  const [loadingMissions, setLoadingMissions] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [currentMood, setCurrentMood] = useState({ label: "Neutral", color: "#9ca3af", icon: <IoHappy /> })

  // Chatbot - SIMPLIFIED
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState([{ sender: "ai", text: "Let's focus today! ⚡" }])
  const messagesEndRef = useRef(null)

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState(new Set())

  const weeklyFocus = "General Studies"

  // --- RANK SYSTEM ---
  const getRankTier = (points) => {
    if (points >= 100000) return { label: "CELESTIAL", color: "#7c3aed", bg: "#f3e8ff" }
    if (points >= 50000) return { label: "LEGEND", color: "#db2777", bg: "#fce7f3" }
    if (points >= 25000) return { label: "GRANDMASTER", color: "#dc2626", bg: "#fee2e2" }
    if (points >= 10000) return { label: "MASTER", color: "#d97706", bg: "#fef3c7" }
    if (points >= 5000) return { label: "ELITE", color: "#2563eb", bg: "#dbeafe" }
    if (points >= 1000) return { label: "SCHOLAR", color: "#059669", bg: "#d1fae5" }
    return { label: "ROOKIE", color: "#475569", bg: "#f1f5f9" }
  }

  // --- THEME CONFIG ---
  const theme = isDarkMode
    ? {
        bg: "#0f172a",
        text: "#f8fafc",
        subText: "#94a3b8",
        card: "#1e293b",
        cardBorder: "#334155",
        accent: "#6366f1",
        bannerBg: "#422006",
        bannerBorder: "#713f12",
        bannerText: "#fde047",
        progressBg: "#334155",
        taskBg: "#334155",
      }
    : {
        bg: "#f8fafc",
        text: "#1b293b",
        subText: "#64748b",
        card: "#ffffff",
        cardBorder: "#e2e8f0",
        accent: "#4f46e5",
        bannerBg: "#fffbeb",
        bannerBorder: "#fcd34d",
        bannerText: "#92400e",
        progressBg: "#f1f9f9",
        taskBg: "#f8fafc",
      }

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        fetchLiveData(parsedUser.id)
        fetchMissionsFromDB(parsedUser.id)
        fetchSchedules(parsedUser.id)
        fetchMoodFromDB(parsedUser.id)
        const savedTheme = localStorage.getItem("theme")
        setIsDarkMode(savedTheme === "dark")
      } catch (error) {
        navigate("/login")
      }
    } else {
      navigate("/login")
    }
  }, [navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // --- 2. FETCH DATA ---
  const fetchLiveData = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/study/stats/${userId}`)
      const data = res.data
      const totalSeconds = (data.weekly || []).reduce((acc, curr) => acc + curr.total_seconds, 0)
      const grandTotal = (data.focus || []).reduce((acc, curr) => acc + curr.total_seconds, 0)
      const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b"]
      const focusData = (data.focus || [])
        .map((item, index) => ({
          subject: item.subject,
          value: grandTotal > 0 ? Number.parseFloat(((item.total_seconds / grandTotal) * 100).toFixed(0)) : 0,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)

      setStats({
        points: data.points || 0,
        streak: data.streak || 0,
        weeklySeconds: totalSeconds,
        focus: focusData,
      })
      const rank = getRankTier(data.points || 0)
      setCurrentRank(rank)
    } catch (error) {
      console.error("Stats Error:", error)
    }
  }

  // --- 3. FETCH HELPERS ---
  const fetchMoodFromDB = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/mood-logs/${userId}`)
      if (res.data && res.data.length > 0) {
        const latest = res.data[0]
        let moodConfig = { label: "Neutral", color: "#9ca3af", icon: <IoHappy /> }
        switch (latest.mood) {
          case "Great":
            moodConfig = { label: "Great", color: "#22c55e", icon: <IoHappy /> }
            break
          case "Okay":
            moodConfig = { label: "Okay", color: "#eab308", icon: <IoPartlySunny /> }
            break
          case "Tired":
            moodConfig = { label: "Tired", color: "#64748b", icon: <IoThunderstorm /> }
            break
          case "Bad":
            moodConfig = { label: "Bad", color: "#ef4444", icon: <IoSad /> }
            break
          default:
            break
        }
        setCurrentMood(moodConfig)
      }
    } catch (e) {
      console.error("Mood DB Fetch Error", e)
    }
  }

  // --- HELPER: FIX DATE (SAME AS PLANNERTAB) ---
  const formatDateLocal = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const fetchSchedules = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${userId}`)
      const activeTasks = res.data.filter((t) => !t.is_completed)
      const formatted = activeTasks.map((t) => ({
        id: t.id,
        title: t.title,
        date: formatDateLocal(t.due_date), // ✅ GUMAMIT NG formatDateLocal
        type: t.type,
      }))
      setSchedules(formatted.sort((a, b) => new Date(a.date) - new Date(b.date)))
    } catch (error) {
      console.error("Planner Fetch Error:", error)
    }
  }
  const fetchMissionsFromDB = async (userId) => {
    setLoadingMissions(true)
    try {
      const res = await axios.get(`http://localhost:5000/api/missions/${userId}`)
      const formatted = res.data.map((m) => ({
        id: m.id,
        text: m.text,
        type: m.type,
        targetMinutes: m.target_minutes,
        completed: Boolean(m.is_completed),
      }))
      setDailyMissions(formatted)
      setAiTip(getDailyTip())
    } catch (error) {
      console.error("DB Fetch Error:", error)
    } finally {
      setLoadingMissions(false)
    }
  }

  const getDailyTip = () => {
    const tips = [
      "Spaced repetition helps you remember 80% more.",
      "Teaching a concept is the best way to learn it.",
      "Hydration improves focus by 14%. Drink water!",
      "Put your phone away to enter 'Deep Work' mode.",
      "Sleep consolidates memory. Get 8 hours!",
    ]
    const dayNum = new Date().getDate()
    return tips[dayNum % tips.length]
  }

  const formatTimeFull = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return "0h 0m"
    const minutes = Math.floor(totalSeconds / 60)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  const handleMissionClick = (task) => {
    if (task.completed) return
    navigate("/study-space")
  }

  // =============== WORKING CHAT FUNCTION ===============
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message immediately
    const userMsg = { sender: "user", text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSending(true);
    
    try {
      // SIMPLE REQUEST - just question
      const res = await axios.post(
        "http://localhost:5000/api/ai/chat",
        {
          question: chatInput  // Only send this field
        }
      );
      
      console.log("Full response:", res.data); // Debug
      
      // Handle different response formats
      let aiResponse = "I understand!";
      
      if (res.data.answer) {
        aiResponse = res.data.answer;
      } else if (res.data.response) {
        aiResponse = res.data.response;
      } else if (res.data.message) {
        aiResponse = res.data.message;
      } else if (typeof res.data === 'string') {
        aiResponse = res.data;
      } else if (res.data.success && res.data.answer) {
        aiResponse = res.data.answer;
      }
      
      setMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: aiResponse
        }
      ]);
      
    } catch (error) {
      console.error("Chat error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // FRONTEND-ONLY FALLBACK (NO BACKEND NEEDED)
      const fallbackResponses = [
        "👋 Hello! I'm SmartBuddy, your AI study assistant!",
        "Great question! As your study buddy, I'm here to help you learn better.",
        "Mabuti naitanong mo 'yan! Try asking about study techniques or explanations.",
        "I can help you with studying! Try: 'Explain photosynthesis' or 'Give study tips'",
        "Ready to learn? I recommend the Pomodoro technique: 25min study, 5min break! 💪"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      setMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: randomResponse
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const getPlannerStatus = () => {
    if (!schedules || schedules.length === 0)
      return { overdue: [], deadlinesToday: [], deadlinesTomorrow: [], upcoming: [] }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const today = new Date(now)
    const todayStr = today.toLocaleDateString("en-CA")

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toLocaleDateString("en-CA")

    const overdue = schedules.filter((s) => {
      const taskDate = new Date(s.date + "T00:00:00")
      return taskDate < today
    })

    const deadlinesToday = schedules.filter((s) => s.date === todayStr)
    const deadlinesTomorrow = schedules.filter((s) => s.date === tomorrowStr)

    const upcoming = schedules
      .filter((s) => {
        const taskDate = new Date(s.date + "T00:00:00")
        return taskDate > tomorrow
      })
      .slice(0, 3)

    return { overdue, deadlinesToday, deadlinesTomorrow, upcoming }
  }

  const { overdue, deadlinesToday, deadlinesTomorrow, upcoming } = getPlannerStatus()

  // STREAK CONFIG
  const getStreakConfig = () => {
    const streak = stats.streak
    if (streak === 0) return { icon: IoBulb, color: "#9ca3af", bg: "#f3f4f6" }
    if (streak < 20) return { icon: IoFlame, color: "#ef4444", bg: "#fee2e2" }
    if (streak < 50) return { icon: IoFlame, color: "#f59e0b", bg: "#fef3c7" }
    if (streak < 100) return { icon: IoTrophy, color: "#8b5cf6", bg: "#ede9fe" }
    return { icon: IoFlash, color: "#0ea5e9", bg: "#e0f2fe" }
  }
  const streakCfg = getStreakConfig()

  const generateNotifications = () => {
    const notifs = []
    let idCounter = 1

    if (overdue.length > 0) {
      const key = `overdue-${overdue.length}`
      notifs.push({
        id: idCounter++,
        title: "Overdue Tasks",
        body: `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}: ${overdue.map((t) => t.title).join(", ")}`,
        time: "Now",
        unread: !readNotifications.has(key),
        key,
      })
    }

    if (deadlinesToday.length > 0) {
      deadlinesToday.forEach((task) => {
        const key = `deadline-today-${task.id}`
        notifs.push({
          id: idCounter++,
          title: "Deadline Today",
          body: `Task '${task.title}' is due today. Don't forget to focus!`,
          time: "Today",
          unread: !readNotifications.has(key),
          key,
        })
      })
    }

    if (deadlinesTomorrow.length > 0) {
      deadlinesTomorrow.forEach((task) => {
        const key = `deadline-tomorrow-${task.id}`
        notifs.push({
          id: idCounter++,
          title: "Upcoming Deadline",
          body: `Task '${task.title}' is due tomorrow. Plan ahead!`,
          time: "1 day left",
          unread: !readNotifications.has(key),
          key,
        })
      })
    }

    const incompleteMissions = dailyMissions.filter((m) => !m.completed)
    if (incompleteMissions.length > 0) {
      const key = `missions-${incompleteMissions.length}`
      notifs.push({
        id: idCounter++,
        title: "Today's Missions",
        body: `You have ${incompleteMissions.length} mission${incompleteMissions.length > 1 ? "s" : ""} remaining today!`,
        time: "Today",
        unread: !readNotifications.has(key),
        key,
      })
    }

    if (stats.streak > 0 && stats.streak % 7 === 0) {
      const key = `streak-${stats.streak}`
      notifs.push({
        id: idCounter++,
        title: "Streak Milestone",
        body: `Amazing! You've maintained a ${stats.streak}-day streak. Keep it up!`,
        time: "Just now",
        unread: !readNotifications.has(key),
        key,
      })
    }

    return notifs
  }

  const handleMarkNotificationAsRead = (notifId) => {
    const notifications = generateNotifications()
    const notif = notifications.find((n) => n.id === notifId)
    if (notif && notif.key) {
      setReadNotifications((prev) => new Set([...prev, notif.key]))
    }
  }

  const handleMarkAllAsRead = () => {
    const notifications = generateNotifications()
    const allKeys = notifications.map((n) => n.key).filter(Boolean)
    setReadNotifications(new Set(allKeys))
  }

  const unreadCount = generateNotifications().filter((n) => n.unread).length

  return (
    <div
      style={{
        ...styles.container,
        background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 25%, #a5d6a7 50%, #c8e6c9 75%, #e8f5e9 100%)",
        backgroundSize: "400% 400%",
        color: theme.text,
      }}
    >
      <div style={styles.headerWrapper}>
        <div>
          <h1 style={{ ...styles.greeting, color: "#1b5e20" }}>
            Hi, {user.first_name}! <IoHandLeft color="#15803d" className="wave" />
          </h1>
          <p style={{ ...styles.subtitle, color: "#424242" }}>Ready to conquer {weeklyFocus}?</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{
              ...styles.notificationBtn,
              background: "#ffffff",
              border: "1px solid #e0e0e0",
            }}
            onClick={() => setIsNotificationModalOpen(true)}
          >
            <IoNotifications size={22} color="#2e7d32" />
            {unreadCount > 0 && <div style={styles.notificationBadge}>{unreadCount}</div>}
          </button>

          <div
            style={{
              ...styles.streakBox,
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ ...styles.streakIconBg, background: "#e8f5e9" }}>
              <streakCfg.icon color="#2e7d32" size={20} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
              <span style={{ ...styles.streakNum, color: "#1b5e20" }}>{stats.streak}</span>
              <span style={{ ...styles.streakLabel, color: "#616161" }}>Streak</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          ...styles.aiTipBanner,
          background: "#fff3e0",
          border: "1px solid #ffe0b2",
          color: "#e65100",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <IoBulb size={20} style={{ minWidth: "20px", color: "#f57c00" }} />
        <span style={{ fontStyle: "normal", fontWeight: 500 }}>{aiTip}</span>
      </div>

      <div
        style={{
          ...styles.sectionBox,
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={styles.missionHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ ...styles.flashIconBg, background: "#e8f5e9" }}>
              <IoFlash color="#2e7d32" size={20} />
            </div>
            <div>
              <h3 style={{ ...styles.sectionTitle, color: "#1b5e20" }}>Today's Missions</h3>
              <p style={{ ...styles.sectionSub, color: "#616161" }}>Your personalized plan.</p>
            </div>
          </div>
        </div>

        <div style={styles.missionGrid}>
          {loadingMissions ? (
            <div style={{ ...styles.loadingMission, color: "#2e7d32" }}>
              <IoSparkles className="spin" /> Syncing...
            </div>
          ) : (
            dailyMissions.map((task) => (
              <div
                key={task.id}
                onClick={() => handleMissionClick(task)}
                style={{
                  ...styles.missionCard,
                  background: task.completed ? "#f1f8e9" : "#ffffff",
                  borderColor: task.completed ? "#aed581" : "#e0e0e0",
                  opacity: task.completed ? 0.8 : 1,
                  cursor: task.completed ? "default" : "pointer",
                  boxShadow: task.completed ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%" }}>
                  {task.completed ? (
                    <IoCheckmarkCircle color="#66bb6a" size={28} />
                  ) : (
                    <div style={{ ...styles.circle, borderColor: "#2e7d32" }}></div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: task.completed ? "#66bb6a" : "#212121",
                        textDecoration: task.completed ? "line-through" : "none",
                      }}
                    >
                      {task.text}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      {task.type === "timer" && (
                        <span
                          style={{ fontSize: "12px", color: "#757575", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <IoTime size={14} /> {task.targetMinutes}m Goal
                        </span>
                      )}
                      {task.type === "quiz" && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#2e7d32",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <IoRocket size={14} /> Quiz Challenge
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.grid}>
        {/* 1. RANK CARD */}
        <div
          style={{
            ...styles.card,
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
          onClick={() => navigate("/leaderboard")}
        >
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, background: "#fff0e0" }}>
              <IoGameController size={22} color="#f57c00" />
            </div>
            <h3 style={{ ...styles.cardTitle, color: "#1b5e20" }}>My Rank</h3>
          </div>
          <div style={styles.gameContent}>
            <h1 style={{ ...styles.points, color: "#2e7d32" }}>{stats.points}</h1>
            <span style={{ ...styles.pointsLabel, color: "#757575" }}>Total Points</span>
            <div
              style={{
                ...styles.rankBadge,
                background: currentRank.bg,
                color: currentRank.color,
                border: `1px solid ${currentRank.color}20`,
              }}
            >
              {currentRank.label}
            </div>
          </div>
        </div>

        {/* 2. WEEKLY PROGRESS */}
        <div
          style={{
            ...styles.card,
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
          onClick={() => navigate("/progress")}
        >
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, background: "#e8f5e9" }}>
              <IoBarChart size={22} color="#2e7d32" />
            </div>
            <h3 style={{ ...styles.cardTitle, color: "#1b5e20" }}>Weekly Progress</h3>
          </div>
          <div style={{ marginTop: "15px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={styles.progressRow}>
              <span style={{ color: "#757575", fontSize: "13px" }}>Total Time:</span>
              <span style={{ fontWeight: "700", color: "#2e7d32", fontSize: "20px" }}>
                {formatTimeFull(stats.weeklySeconds)}
              </span>
            </div>
            <div
              style={{
                background: "#f1f8e9",
                padding: "12px",
                borderRadius: "10px",
                marginTop: "auto",
                borderLeft: "3px solid #66bb6a",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#33691e", fontStyle: "italic" }}>
                "Keep going! You've studied {formatTimeFull(stats.weeklySeconds)} this week."
              </p>
            </div>
          </div>
        </div>

        {/* 3. FOCUS DISTRIBUTION */}
        <div
          style={{
            ...styles.card,
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
          onClick={() => navigate("/progress")}
        >
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, background: "#fce4ec" }}>
              <IoPieChart size={22} color="#d81b60" />
            </div>
            <h3 style={{ ...styles.cardTitle, color: "#1b5e20" }}>Focus Dist.</h3>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
            {stats.focus.length > 0 ? (
              stats.focus.map((item, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "4px",
                      color: "#212121",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>{item.subject}</span>
                    <span style={{ color: "#757575" }}>{item.value}%</span>
                  </div>
                  <div style={{ width: "100%", background: "#f5f5f5", height: "6px", borderRadius: "10px" }}>
                    <div
                      style={{ width: `${item.value}%`, background: item.color, height: "100%", borderRadius: "10px" }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", fontSize: "12px", color: "#757575" }}>
                No study data yet.
                <br />
                Start a session in Study Space!
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 8px 32px rgba(46, 125, 50, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
            maxWidth: "100%",
            overflow: "hidden",
          }}
          onClick={() => navigate("/study-space")}
        >
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)" }}>
              <IoCalendar size={22} color="#f9a825" />
            </div>
            <h3 style={{ ...styles.cardTitle, color: "#1b5e20" }}>Planner</h3>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
            {overdue.length > 0 && (
              <div
                style={{
                  background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                  borderLeft: "4px solid #e57373",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(229, 115, 115, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <IoAlertCircle size={20} color="#e57373" />
                  <span style={{ color: "#c62828", fontWeight: "700", fontSize: "13px" }}>
                    {overdue.length} Overdue Task{overdue.length > 1 ? "s" : ""}
                  </span>
                </div>
                <IoChevronForward size={16} color="#e57373" />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "5px" }}>
              {deadlinesToday.slice(0, 2).map((task, index) => (
                <div
                  key={`today-${index}`}
                  style={{ ...styles.taskRow, background: "#f5f5f5", border: `1px solid #e0e0e0` }}
                >
                  <span style={{ ...styles.taskDateBadge, background: "#e3f2fd", color: "#1565c0" }}>TODAY</span>
                  <span style={{ ...styles.taskTitle, color: "#212121" }}>{task.title}</span>
                </div>
              ))}
              {deadlinesToday.length > 2 && (
                <div
                  style={{
                    ...styles.taskRow,
                    background: "#f5f5f5",
                    border: `1px solid #e0e0e0`,
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#757575", fontWeight: "600" }}>
                    +{deadlinesToday.length - 2} more deadline{deadlinesToday.length - 2 > 1 ? "s" : ""} today
                  </span>
                </div>
              )}

              {deadlinesTomorrow.slice(0, 2).map((task, index) => (
                <div
                  key={`tomorrow-${index}`}
                  style={{ ...styles.taskRow, background: "#f5f5f5", border: `1px solid #e0e0e0` }}
                >
                  <span style={{ ...styles.taskDateBadge, background: "#fff3e0", color: "#e65100" }}>TMRW</span>
                  <span style={{ ...styles.taskTitle, color: "#212121" }}>{task.title}</span>
                </div>
              ))}
              {deadlinesTomorrow.length > 2 && (
                <div
                  style={{
                    ...styles.taskRow,
                    background: "#f5f5f5",
                    border: `1px solid #e0e0e0`,
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#757575", fontWeight: "600" }}>
                    +{deadlinesTomorrow.length - 2} more deadline{deadlinesTomorrow.length - 2 > 1 ? "s" : ""} tomorrow
                  </span>
                </div>
              )}

              {upcoming.map((item, index) => (
                <div key={index} style={{ ...styles.taskRow, background: "#f5f5f5", border: `1px solid #e0e0e0` }}>
                  <span style={{ ...styles.taskDateBadge, background: "#fafafa", color: "#757575" }}>
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span style={{ ...styles.taskTitle, color: "#212121" }}>{item.title}</span>
                </div>
              ))}
              {deadlinesToday.length === 0 &&
                deadlinesTomorrow.length === 0 &&
                upcoming.length === 0 &&
                overdue.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#757575",
                      fontSize: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    <IoCheckmarkCircle size={24} style={{ marginBottom: "5px", opacity: 0.5 }} />
                    <br />
                    All clear! No tasks ahead.
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* 5. WELLNESS */}
        <div
          style={{
            ...styles.card,
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 8px 32px rgba(46, 125, 50, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
          onClick={() => navigate("/wellbeing")}
        >
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)" }}>
              <IoLeaf size={22} color="#2e7d32" />
            </div>
            <h3 style={{ ...styles.cardTitle, color: "#1b5e20" }}>Wellness</h3>
          </div>
          <div
            style={{
              ...styles.moodBox,
              background: currentMood.label === "Neutral" ? "#fafafa" : `${currentMood.color}20`,
              border: currentMood.label !== "Neutral" ? `1px solid ${currentMood.color}40` : `1px solid #e0e0e0`,
            }}
          >
            <div
              style={{
                padding: "10px",
                borderRadius: "50%",
                background: currentMood.label !== "Neutral" ? currentMood.color : "#bdbdbd",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {currentMood.label === "Neutral" ? (
                <IoHappy size={24} />
              ) : (
                React.cloneElement(currentMood.icon, { size: 24, color: "white" })
              )}
            </div>
            <div>
              <span style={{ display: "block", fontWeight: "bold", fontSize: "15px", color: "#212121" }}>
                {currentMood.label === "Neutral" ? "How are you?" : `Feeling ${currentMood.label}`}
              </span>
              <span style={{ fontSize: "12px", color: "#757575" }}>
                {currentMood.label === "Neutral" ? "Log your mood." : "Click to view history."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isChatOpen && (
        <div
          style={{
            ...styles.chatWindow,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 25px 50px -12px rgba(46, 125, 50, 0.3), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div style={{ ...styles.chatHeader, background: "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={styles.botAvatar}>
                <IoSparkles size={18} color="#a3e635" />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "800", color: "white", fontSize: "15px" }}>SmartBuddy</span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <div style={{ width: 6, height: 6, background: "#a3e635", borderRadius: "50%" }}></div> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} style={styles.chatCloseBtn}>
              <IoClose size={22} color="white" />
            </button>
          </div>

          <div style={styles.chatMessages}>
            <div style={{ textAlign: "center", padding: "20px 0", opacity: 0.6 }}>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Today</span>
            </div>

            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.msgBubble,
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background: msg.sender === "user" ? "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)" : "#f5f5f5",
                  color: msg.sender === "user" ? "white" : "#212121",
                  border: msg.sender === "ai" ? `1px solid #e0e0e0` : "none",
                  boxShadow: msg.sender === "ai" ? "0 1px 3px rgba(0,0,0,0.1)" : "0 2px 8px rgba(46, 125, 50, 0.3)",
                }}
              >
                {msg.text}
              </div>
            ))}
            {isSending && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#f5f5f5",
                  padding: "8px 16px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  color: "#757575",
                  border: `1px solid #e0e0e0`,
                }}
              >
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.chatInputArea}>
            <form onSubmit={handleSendMessage} style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Type a message..."
                style={{ ...styles.chatInput, color: "#212121" }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isSending}
              />
              <button type="submit" style={{ ...styles.sendBtn, background: "#2e7d32" }} disabled={isSending}>
                <IoSend size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        style={{
          ...styles.fabButton,
          background: "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 12px 28px rgba(46, 125, 50, 0.4), 0 4px 12px rgba(46, 125, 50, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        {isChatOpen ? <IoClose size={28} /> : <IoChatbubbleEllipses size={28} />}
      </button>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={generateNotifications()}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        [style*="cursor: pointer"]:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 40px rgba(46, 125, 50, 0.18) !important;
        }
        button[style*="position: fixed"]:hover {
          transform: scale(1.1) !important;
        }
        @media (min-width: 768px) {
          [style*="position: fixed"][style*="right: 24px"] {
            right: 32px !important;
          }
        }
        @media (max-width: 767px) {
          [style*="position: fixed"][style*="bottom: 180px"] {
            width: calc(100vw - 32px) !important;
            right: 16px !important;
            bottom: 160px !important;
          }
          [style*="position: fixed"][style*="bottom: 100px"] {
            right: 16px !important;
            bottom: 80px !important;
          }
        }
      `}</style>
    </div>
  )
}

// STYLES (same as before)
const styles = {
  container: {
    padding: "20px 24px",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    paddingBottom: "100px",
    maxWidth: "100%",
    boxSizing: "border-box",
    position: "relative",
    transition: "background 0.3s, color 0.3s",
    animation: "gradientShift 15s ease infinite",
  },
  headerWrapper: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  greeting: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  subtitle: { margin: 0, fontSize: "15px", fontWeight: "500" },

  notificationBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
  },

  streakBox: {
    padding: "10px 18px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    height: "48px",
    boxSizing: "border-box",
  },
  streakIconBg: { padding: "8px", borderRadius: "50%", transition: "background 0.3s" },
  streakNum: { fontSize: "22px", fontWeight: "800" },
  streakLabel: { fontSize: "12px", fontWeight: "600" },

  aiTipBanner: {
    padding: "14px 18px",
    borderRadius: "16px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
  },

  sectionBox: { borderRadius: "24px", padding: "24px", marginBottom: "30px" },
  missionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" },
  flashIconBg: { padding: "10px", borderRadius: "12px" },
  sectionTitle: { margin: 0, fontSize: "17px", fontWeight: "800" },
  sectionSub: { margin: 0, fontSize: "13px", fontWeight: "500" },

  missionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" },
  missionCard: {
    padding: "16px",
    borderRadius: "16px",
    border: "1.5px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  loadingMission: {
    padding: "20px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "500",
    gridColumn: "1/-1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  circle: { width: "24px", height: "24px", borderRadius: "50%", border: "2.5px solid" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
    maxWidth: "100%",
  },
  card: {
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    height: "260px",
    willChange: "transform",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" },
  iconBox: { padding: "12px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { margin: 0, fontSize: "16px", fontWeight: "800" },
  gameContent: { textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" },
  points: { fontSize: "40px", fontWeight: "800", margin: "0", lineHeight: 1 },
  pointsLabel: { fontSize: "13px", marginBottom: "10px", fontWeight: "500" },
  rankBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  progressRow: { display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" },
  moodBox: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "15px",
    flex: 1,
    transition: "all 0.3s ease",
  },

  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
  },
  taskDateBadge: {
    fontSize: "10px",
    fontWeight: "800",
    padding: "4px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
    minWidth: "45px",
    textAlign: "center",
  },
  taskTitle: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontWeight: "600",
    flex: 1,
  },

  fabButton: {
    position: "fixed",
    bottom: "100px",
    right: "24px",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    transition: "transform 0.2s, box-shadow 0.2s",
    willChange: "transform",
  },

  chatWindow: {
    position: "fixed",
    bottom: "180px",
    right: "24px",
    width: "min(380px, calc(100vw - 48px))",
    height: "min(540px, calc(100vh - 250px))",
    borderRadius: "28px",
    display: "flex",
    flexDirection: "column",
    zIndex: 9999,
    overflow: "hidden",
    animation: "slideUp 0.3s ease-out",
    fontFamily: "'Inter', sans-serif",
    maxHeight: "calc(100vh - 250px)",
  },
  chatHeader: {
    padding: "20px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 15px rgba(6, 78, 59, 0.2)",
  },
  botAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  chatCloseBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  chatMessages: {
    flex: 1,
    padding: "22px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  msgBubble: {
    maxWidth: "75%",
    padding: "13px 17px",
    borderRadius: "18px",
    fontSize: "14px",
    lineHeight: "1.5",
    wordWrap: "break-word",
    fontWeight: "500",
  },

  chatInputArea: {
    padding: "16px 22px 22px 22px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#f1f5f9",
    borderRadius: "30px",
    padding: "6px 6px 6px 18px",
    border: "1px solid #e2e8f0",
    transition: "border 0.2s",

  },
  chatInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "14px",
    paddingRight: "10px",
    fontWeight: "500",
  },
  sendBtn: {
    color: "white",
    border: "none",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(21, 128, 61, 0.4)",
    transition: "transform 0.1s, box-shadow 0.2s",
  },
}