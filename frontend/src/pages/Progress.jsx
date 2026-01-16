"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts"
import { IoFlame, IoBulb, IoMedal, IoTrophy, IoFlash, IoGift } from "react-icons/io5"

const THEME = {
  light: {
    bg: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 50%, #ecfccb 100%)",
    card: "rgba(255, 255, 255, 0.9)",
    text: "#064e3b",
    subText: "#15803d",
    border: "rgba(21, 128, 61, 0.15)",
    accent: "#15803d",
    success: "#16a34a",
    warning: "#f59e0b",
    danger: "#ef4444",
    progressBg: "rgba(21, 128, 61, 0.1)",
    gridLine: "rgba(21, 128, 61, 0.15)",
  },
  dark: {
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
    card: "rgba(255, 255, 255, 0.08)",
    text: "#f0fdf4",
    subText: "#a3e635",
    border: "rgba(163, 230, 53, 0.2)",
    accent: "#a3e635",
    success: "#22c55e",
    warning: "#fbbf24",
    danger: "#f87171",
    progressBg: "rgba(163, 230, 53, 0.1)",
    gridLine: "rgba(163, 230, 53, 0.15)",
  },
}

export default function Progress({ isDarkMode = false }) {
  const theme = isDarkMode ? THEME.dark : THEME.light
  const navigate = useNavigate()

  // --- STATE ---
  const [weeklyData, setWeeklyData] = useState([])
  const [subjectData, setSubjectData] = useState([])
  const [moodData, setMoodData] = useState([])
  const [streak, setStreak] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [todaySeconds, setTodaySeconds] = useState(0)
  const [userId, setUserId] = useState(null)
  const [claimedMilestones, setClaimedMilestones] = useState([])

  const [yAxisTicks, setYAxisTicks] = useState([0, 0.25, 0.5, 0.75, 1])
  const [yAxisMax, setYAxisMax] = useState(1)

  const [weeklyObjective, setWeeklyObjective] = useState({
    currentSeconds: 0,
    targetHours: 5.0,
    percentage: 0,
    completed: false,
  })

  const [dominantMood, setDominantMood] = useState("Neutral")
  const [aiInsight, setAiInsight] = useState("AI is analyzing your study patterns...")
  const [chartReady, setChartReady] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const DAILY_GOAL_SECONDS = 600

  // --- SAVE BONUS POINTS ---
  const saveBonusPoints = async () => {
    if (!userId) return

    try {
      await axios.put(`http://localhost:5000/api/users/add-points/${userId}`, {
        points: 10,
      })
      console.log("[v0] Bonus points saved successfully")
    } catch (error) {
      console.error("[v0] Failed to save bonus points:", error)
      // Don't show error to user, fail silently since this is a bonus feature
    }
  }

  // --- MILESTONE CHECKER ---
  useEffect(() => {
    if (!userId || streak === 0) return

    if (streak >= 1000) saveBonusPoints(userId, 10000, "streak_1000")
    else if (streak >= 100) saveBonusPoints(userId, 1000, "streak_100")
    else if (streak >= 50) saveBonusPoints(userId, 500, "streak_50")
    else if (streak >= 20) saveBonusPoints(userId, 200, "streak_20")
  }, [streak, userId, claimedMilestones])

  // --- STREAK CONFIGURATION ---
  const getStreakConfig = () => {
    if (streak === 0) {
      return {
        bg: isDarkMode
          ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
          : "linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)",
        icon: IoBulb,
        title: "START",
        textCol: isDarkMode ? "#94a3b8" : "#6b7280",
        barBg: isDarkMode ? "#334155" : "#e5e7eb",
        barFill: isDarkMode ? "#94a3b8" : "#9ca3af",
        accentColor: "#94a3b8",
        flameColor: "#94a3b8",
      }
    }

    const config = { textCol: "#fff", barBg: "rgba(255,255,255,0.25)", barFill: "#fff" }

    if (streak < 20) {
      config.bg = "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)"
      config.icon = IoFlame
      config.title = "ON FIRE"
      config.accentColor = "#FF4B2B"
      config.flameColor = "#FF4B2B"
    } else if (streak < 50) {
      config.bg = "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)"
      config.icon = IoFlame
      config.title = "BLAZING"
      config.accentColor = "#FFD200"
      config.flameColor = "#FFD200"
    } else if (streak < 100) {
      config.bg = "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)"
      config.icon = IoTrophy
      config.title = "MASTER"
      config.accentColor = "#8E2DE2"
      config.flameColor = "#8E2DE2"
    } else if (streak < 1000) {
      config.bg = "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)"
      config.icon = IoFlash
      config.title = "LEGEND"
      config.accentColor = "#00c6ff"
      config.flameColor = "#00c6ff"
    } else {
      config.bg = "linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)"
      config.icon = IoMedal
      config.title = "MYTHIC"
      config.textCol = "#1e293b"
      config.barBg = "rgba(0,0,0,0.1)"
      config.barFill = "#2563eb"
      config.accentColor = "#2563eb"
      config.flameColor = "#2563eb"
    }
    return config
  }

  const streakCfg = getStreakConfig()

  // --- TIME HELPERS ---
  const formatTimeHuman = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return "0m"
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m}m`
  }

  const formatYAxis = (val) => {
    if (val === 0) return "0"
    if (Math.abs(val - Math.round(val)) < 0.01) return `${Math.round(val)}h`
    const decimalPart = val % 1
    if (Math.abs(decimalPart - 0.25) < 0.01) return "15m"
    if (Math.abs(decimalPart - 0.5) < 0.01) return "30m"
    if (Math.abs(decimalPart - 0.75) < 0.01) return "45m"
    return ""
  }

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    const timer = setTimeout(() => setChartReady(true), 150)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timer)
    }
  }, [])

  const isMobile = windowWidth < 1024

  // --- LOAD DATA ---
  const loadData = async () => {
    const userString = localStorage.getItem("user")
    if (!userString) return
    const user = JSON.parse(userString)
    setUserId(user.id)

    try {
      const statsRes = await axios.get(`http://localhost:5000/api/study/stats/${user.id}`)
      const data = statsRes.data

      setStreak(data.streak || 0)
      setEarnedPoints(data.points || 0)
      setTodaySeconds(data.today_seconds || 0)

      if (data.claimed_milestones) {
        setClaimedMilestones(data.claimed_milestones)
      }

      // Weekly Data
      let maxVal = 0
      const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const filledWeekly = daysOrder.map((day) => {
        const found = (data.weekly || []).find((d) => d.day === day)
        const seconds = found ? found.total_seconds : 0
        const decimalHours = Number.parseFloat((seconds / 3600).toFixed(4))
        if (decimalHours > maxVal) maxVal = decimalHours
        return { day: day, decimalHours: decimalHours, seconds: seconds }
      })
      setWeeklyData(filledWeekly)

      // Y-Axis
      let ceiling = Math.max(maxVal, 1)
      ceiling = Math.ceil(ceiling * 4) / 4
      setYAxisMax(ceiling)
      const newTicks = []
      for (let i = 0; i <= ceiling + 0.001; i += 0.25) newTicks.push(i)
      setYAxisTicks(newTicks)

      // --- Subjects Logic (Your working logic) ---
      const rawFocus = data.focus || []
      const grandTotal = rawFocus.reduce((acc, curr) => acc + curr.total_seconds, 0)

      // Updated COLORS to match green aesthetic
      const COLORS = ["#15803d", "#a3e635", "#16a34a", "#84cc16", "#22c55e", "#4ade80"]
      const processedFocus = rawFocus
        .map((item, index) => ({
          subject: item.subject,
          value: grandTotal > 0 ? Number.parseFloat(((item.total_seconds / grandTotal) * 100).toFixed(1)) : 0,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)

      setSubjectData(processedFocus)

      // Objective
      const totalWeeklySeconds = filledWeekly.reduce((acc, curr) => acc + curr.seconds, 0)
      const percent = Math.min((totalWeeklySeconds / (5 * 3600)) * 100, 100).toFixed(1)
      setWeeklyObjective({
        currentSeconds: totalWeeklySeconds,
        targetHours: 5.0,
        percentage: percent,
        completed: percent >= 100,
      })

      // Mood
      const moodRes = await axios.get(`http://localhost:5000/api/mood-logs/${user.id}`)
      const moodLogs = moodRes.data
      if (moodLogs.length > 0) {
        const moodMap = {}
        moodLogs.forEach((l) => (moodMap[l.mood] = (moodMap[l.mood] || 0) + 1))
        // Updated mood colors to match green aesthetic
        const pMoods = Object.keys(moodMap).map((k) => ({
          name: k,
          value: Number.parseFloat(((moodMap[k] / moodLogs.length) * 100).toFixed(1)),
          color: k === "Great" ? "#16a34a" : k === "Tired" ? "#94a3b8" : k === "Bad" ? "#ef4444" : "#84cc16",
        }))
        setMoodData(pMoods)
        setDominantMood(moodLogs[0].mood)
      } else {
        // Updated default mood color for empty state
        setMoodData([
          { name: "No Data", value: 100, color: isDarkMode ? "rgba(163, 230, 53, 0.2)" : "rgba(21, 128, 61, 0.1)" },
        ])
        setDominantMood("Neutral")
      }

      // --- NEW: AI INTEGRATION FOR INSIGHT ---
      const statsForAI = {
        streak: data.streak || 0,
        points: data.points || 0,
        total_weekly_hours: (totalWeeklySeconds / 3600).toFixed(1),
        focus: processedFocus,
      }

      const aiRes = await axios.post("http://localhost:5000/api/ai/get-insight", {
        stats: statsForAI,
        userName: user.name,
      })

      if (aiRes.data && aiRes.data.insight) {
        setAiInsight(aiRes.data.insight)
      }
    } catch (error) {
      console.error("Error loading progress data:", error)
    }
  }

  useEffect(() => {
    loadData()
  }, [isDarkMode])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      return (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "14px 18px",
            borderRadius: "14px",
            border: "1px solid rgba(21, 128, 61, 0.2)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#064e3b" }}>{label}</p>
          <p style={{ margin: 0, fontSize: "14px", color: "#15803d", fontWeight: "600", marginTop: "4px" }}>
            {formatTimeHuman(data.seconds)}
          </p>
        </div>
      )
    }
    return null
  }

  const dailyProgressPercent = Math.min((todaySeconds / DAILY_GOAL_SECONDS) * 100, 100)

  const styles = {
    wrapper: {
      minHeight: "100vh",
      width: "100%",
      paddingBottom: "80px",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      background: theme.bg,
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.4,
      background: `
        radial-gradient(circle at 20% 30%, rgba(21, 128, 61, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(163, 230, 53, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(22, 163, 74, 0.1) 0%, transparent 50%)
      `,
      animation: "moveBackground 20s ease infinite",
      pointerEvents: "none",
    },
    container: {
      width: "100%",
      padding: isMobile ? "20px" : "36px 48px",
      boxSizing: "border-box",
      flex: 1,
      position: "relative",
      zIndex: 1,
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "32px",
    },
    pageTitle: {
      margin: 0,
      fontSize: isMobile ? "28px" : "40px",
      fontWeight: "900",
      color: theme.text,
      letterSpacing: "-1px",
      textShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(12, 1fr)",
      gap: "28px",
      width: "100%",
    },
    card: {
      background: theme.card,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: `1px solid ${theme.border}`,
      borderRadius: "24px",
      padding: "28px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      overflow: "hidden",
      height: "100%",
      minHeight: "220px",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    },

    streakCard: {
      background: streakCfg.bg,
      borderRadius: "28px",
      padding: "32px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "320px",
      position: "relative",
      overflow: "hidden",
      boxShadow:
        streak === 0
          ? "0 8px 24px rgba(0,0,0,0.08)"
          : `0 24px 60px -12px ${streakCfg.accentColor}70, 0 8px 24px rgba(0,0,0,0.1)`,
      border: streak === 0 ? `1px solid ${theme.border}` : "none",
      color: streakCfg.textCol,
      minWidth: 0,
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    chartWrapper: {
      width: "100%",
      height: "320px",
      minHeight: "320px",
      marginTop: "12px",
      position: "relative",
    },
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.backgroundPattern} />

      <style>{`
        @keyframes moveBackground {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes floatFlame {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Progress Tracker</h1>
        </div>

        <div style={styles.grid}>
          <div style={{ ...styles.streakCard, gridColumn: isMobile ? "span 1" : "span 4" }}>
            {streak > 0 && (
              <>
                {/* Large flame decoration - right side */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-40px",
                    transform: "translateY(-50%)",
                    opacity: 0.25,
                    animation: "floatFlame 3s ease-in-out infinite",
                    zIndex: 1,
                  }}
                >
                  <IoFlame size={160} color={streakCfg.flameColor} />
                </div>

                {/* Medium flame decoration - left side */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20%",
                    left: "-30px",
                    opacity: 0.2,
                    animation: "floatFlame 4s ease-in-out infinite",
                    animationDelay: "1s",
                    zIndex: 1,
                  }}
                >
                  <IoFlame size={120} color={streakCfg.flameColor} />
                </div>

                {/* Small flame decoration - top left */}
                <div
                  style={{
                    position: "absolute",
                    top: "15%",
                    left: "10%",
                    opacity: 0.15,
                    animation: "floatFlame 2.5s ease-in-out infinite",
                    animationDelay: "0.5s",
                    zIndex: 1,
                  }}
                >
                  <IoFlame size={80} color={streakCfg.flameColor} />
                </div>

                {/* Gradient overlay for depth */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              </>
            )}

            <div
              style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div
                    style={{
                      border: streak === 0 ? `1.5px solid ${theme.subText}` : "1.5px solid rgba(255,255,255,0.6)",
                      padding: "10px 18px",
                      borderRadius: "28px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12px",
                      fontWeight: "800",
                      marginBottom: "16px",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <streakCfg.icon size={18} color={streakCfg.flameColor} /> {streakCfg.title}
                  </div>
                  <h2
                    style={{
                      fontSize: "84px",
                      fontWeight: "900",
                      margin: "0",
                      lineHeight: 0.9,
                      letterSpacing: "-5px",
                      textShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    {streak}
                  </h2>
                  <div
                    style={{
                      fontSize: "16px",
                      opacity: 0.95,
                      fontWeight: "700",
                      marginTop: "4px",
                      letterSpacing: "0.8px",
                    }}
                  >
                    DAYS STREAK
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "900",
                      lineHeight: 1,
                      textShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {earnedPoints}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.9,
                      fontWeight: "700",
                      letterSpacing: "1.2px",
                      marginBottom: "10px",
                      marginTop: "2px",
                    }}
                  >
                    POINTS
                  </div>

                  {streak >= 20 && streak < 21 && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.3)",
                        backdropFilter: "blur(12px)",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        display: "inline-flex",
                        alignments: "center",
                        gap: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      <IoGift size={14} /> BONUS UNLOCKED
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    marginBottom: "10px",
                    fontWeight: "700",
                    opacity: 0.95,
                  }}
                >
                  <span>Daily Goal</span>
                  <span>{Math.round(dailyProgressPercent)}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    background: streakCfg.barBg,
                    height: "12px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "inset 0 3px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      width: `${dailyProgressPercent}%`,
                      background: streakCfg.barFill,
                      height: "100%",
                      borderRadius: "16px",
                      transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 0 16px rgba(255,255,255,0.6)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, gridColumn: isMobile ? "span 1" : "span 8" }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}
            >
              <h3
                style={{ fontSize: "20px", fontWeight: "800", color: theme.text, margin: 0, letterSpacing: "-0.5px" }}
              >
                Weekly Objective
              </h3>
              <div
                style={{
                  background: weeklyObjective.completed
                    ? "rgba(234, 179, 8, 0.18)"
                    : isDarkMode
                      ? "rgba(163, 230, 53, 0.15)"
                      : "rgba(21, 128, 61, 0.12)",
                  padding: "12px",
                  borderRadius: "14px",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                }}
              >
                <IoMedal size={24} color={weeklyObjective.completed ? "#eab308" : theme.accent} />
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: isMobile ? "42px" : "54px",
                    fontWeight: "900",
                    color: theme.text,
                    letterSpacing: "-2px",
                  }}
                >
                  {formatTimeHuman(weeklyObjective.currentSeconds)}
                </span>
                <span style={{ fontSize: "18px", color: theme.subText, fontWeight: "600" }}>
                  of {weeklyObjective.targetHours}h
                </span>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    marginBottom: "10px",
                    color: theme.subText,
                    fontWeight: "600",
                  }}
                >
                  <span>Progress</span>
                  <span style={{ color: weeklyObjective.completed ? "#eab308" : theme.accent, fontWeight: "700" }}>
                    {weeklyObjective.percentage}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "14px",
                    background: theme.progressBg,
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: `${weeklyObjective.percentage}%`,
                      height: "100%",
                      background: weeklyObjective.completed
                        ? "linear-gradient(90deg, #eab308 0%, #facc15 100%)"
                        : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.success} 100%)`,
                      borderRadius: "16px",
                      transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: `0 0 20px ${weeklyObjective.completed ? "#eab30860" : theme.accent}40`,
                    }}
                  />
                </div>
              </div>

              {weeklyObjective.completed && (
                <div
                  style={{
                    background: "rgba(234, 179, 8, 0.12)",
                    border: "1.5px solid rgba(234, 179, 8, 0.3)",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#854d0e",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <IoTrophy size={20} color="#eab308" /> Goal Achieved! Great work!
                </div>
              )}
            </div>
          </div>

          <div style={{ ...styles.card, gridColumn: isMobile ? "span 1" : "span 8" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: theme.text,
                marginBottom: "20px",
                letterSpacing: "-0.5px",
              }}
            >
              Weekly Performance
            </h3>
            {chartReady && weeklyData.length > 0 && (
              <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.gridLine} vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.subText, fontSize: 13, fontWeight: 600 }}
                    />
                    <YAxis
                      ticks={yAxisTicks}
                      domain={[0, yAxisMax]}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatYAxis}
                      tick={{ fill: theme.subText, fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.progressBg, radius: [8, 8, 0, 0] }} />
                    <Bar dataKey="decimalHours" fill={theme.accent} radius={[10, 10, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={{ ...styles.card, gridColumn: isMobile ? "span 1" : "span 4" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: theme.text,
                marginBottom: "20px",
                letterSpacing: "-0.5px",
              }}
            >
              Subject Focus
            </h3>
            {subjectData.length > 0 && subjectData[0].subject !== "No Data" && (
              <div style={{ marginTop: "24px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {subjectData.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            background: item.color,
                            boxShadow: `0 0 12px ${item.color}60`,
                          }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: "600", color: theme.text }}>{item.subject}</span>
                      </div>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: theme.accent }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ ...styles.card, gridColumn: isMobile ? "span 1" : "span 4" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: theme.text,
                marginBottom: "20px",
                letterSpacing: "-0.5px",
              }}
            >
              Mood Distribution
            </h3>
            {moodData.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {moodData.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            background: item.color,
                            boxShadow: `0 0 12px ${item.color}60`,
                          }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: "600", color: theme.text }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: theme.accent }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ ...styles.card, gridColumn: isMobile ? "span 1" : "span 8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div
                style={{
                  background: isDarkMode ? "rgba(163, 230, 53, 0.15)" : "rgba(21, 128, 61, 0.12)",
                  padding: "12px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <IoBulb size={24} color={theme.accent} />
              </div>
              <h3
                style={{ fontSize: "20px", fontWeight: "800", color: theme.text, margin: 0, letterSpacing: "-0.5px" }}
              >
                AI Insight
              </h3>
            </div>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: theme.subText,
                fontWeight: "500",
                margin: 0,
                padding: "16px 20px",
                background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                borderRadius: "14px",
                borderLeft: `4px solid ${theme.accent}`,
              }}
            >
              {aiInsight}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
