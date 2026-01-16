"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { IoTrophy, IoPersonCircle, IoRibbon, IoTime, IoClose, IoCalendar, IoStar } from "react-icons/io5"
import { GiImperialCrown, GiPartyPopper } from "react-icons/gi"
import confetti from "canvas-confetti"

export default function Leaderboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  // History States
  const [showHistory, setShowHistory] = useState(false)
  const [historyLogs, setHistoryLogs] = useState([])

  // Rank Up Notification State
  const [showRankUpModal, setShowRankUpModal] = useState(false)
  const [newRankDetails, setNewRankDetails] = useState(null)

  const currentUserId = Number.parseInt(localStorage.getItem("userId"))

  const getRankTier = (points) => {
    if (points >= 100000)
      return { label: "CELESTIAL", color: "#7c3aed", icon: "🌌", bg: "#f3e8ff", desc: "God of Knowledge" }
    if (points >= 50000) return { label: "LEGEND", color: "#db2777", icon: "🏆", bg: "#fce7f3", desc: "Living Legend" }
    if (points >= 25000)
      return { label: "GRANDMASTER", color: "#dc2626", icon: "👹", bg: "#fee2e2", desc: "Top 1% Elite" }
    if (points >= 10000)
      return { label: "MASTER", color: "#d97706", icon: "🔥", bg: "#fef3c7", desc: "Master of Study" }
    if (points >= 5000) return { label: "ELITE", color: "#2563eb", icon: "⚔️", bg: "#dbeafe", desc: "Elite Student" }
    if (points >= 1000)
      return { label: "SCHOLAR", color: "#059669", icon: "📘", bg: "#d1fae5", desc: "Dedicated Learner" }
    return { label: "ROOKIE", color: "#64748b", icon: "🌱", bg: "#f1f5f9", desc: "Just Started" }
  }

  useEffect(() => {
    if (showHistory || showRankUpModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showHistory, showRankUpModal])

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaderboard")
      setStudents(res.data)

      const myData = res.data.find((s) => s.id === currentUserId)
      if (myData) {
        const currentTier = getRankTier(myData.points)
        const savedTierLabel = localStorage.getItem("userRankLabel")

        if (savedTierLabel && savedTierLabel !== currentTier.label) {
          setNewRankDetails(currentTier)
          setShowRankUpModal(true)
          triggerConfetti()
        }

        localStorage.setItem("userRankLabel", currentTier.label)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      setLoading(false)
    }
  }

  const triggerConfetti = () => {
    if (typeof confetti === "function") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }

  const handleOpenHistory = async () => {
    setShowHistory(true)
    if (currentUserId) {
      try {
        const res = await axios.get(`http://localhost:5000/api/points/history/${currentUserId}`)
        setHistoryLogs(res.data)
      } catch (error) {
        console.error("Error fetching history:", error)
      }
    }
  }

  const currentUserIndex = students.findIndex((s) => s.id === currentUserId)
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : "-"

  const currentUser = students[currentUserIndex] || {
    username: "You",
    points: 0,
    avatar_url: null,
  }

  const rankedStudents = students.map((s, index) => ({ ...s, rank: index + 1 }))
  const top1 = rankedStudents[0]
  const top2 = rankedStudents[1]
  const top3 = rankedStudents[2]

  const myTier = getRankTier(currentUser.points)

  const UserAvatar = ({ url, size = 40, borderColor = "transparent", glow = false }) => {
    const shadow = glow ? `0 0 20px ${borderColor}, 0 0 40px ${borderColor}50` : "0 4px 10px rgba(0,0,0,0.1)"
    if (url && url !== "null") {
      return (
        <img
          src={url || "/placeholder.svg"}
          alt="user"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${borderColor}`,
            boxShadow: shadow,
          }}
        />
      )
    }
    return (
      <IoPersonCircle
        size={size}
        color="#cbd5e1"
        style={{ background: "#fff", borderRadius: "50%", border: `3px solid ${borderColor}`, boxShadow: shadow }}
      />
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " • " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading)
    return (
      <div style={{ ...styles.container, justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.2)",
            borderTopColor: "#15803d",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={styles.headerIconBox}>
            <IoTrophy size={24} color="#15803d" />
          </div>
          <div>
            <h2 style={styles.headerTitle}>Leaderboard</h2>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Global Ranking</span>
          </div>
        </div>
        <button onClick={handleOpenHistory} style={styles.iconBtn}>
          <IoTime size={22} color="#15803d" />
        </button>
      </div>

      {/* PODIUM SECTION */}
      <div style={styles.podiumContainer}>
        {/* RANK 2 */}
        <div style={{ ...styles.podiumItem, zIndex: 2, margin: "0 16px" }}>
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle, rgba(148, 163, 184, 0.3) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(30px)",
              zIndex: -1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -25,
              animation: "float 3s ease-in-out infinite 0.5s",
              filter: "drop-shadow(0 6px 16px rgba(148, 163, 184, 0.4))",
            }}
          >
            <GiImperialCrown size={44} color="#94a3b8" />
          </div>
          <div style={styles.avatarWrapper}>
            <UserAvatar url={top2?.avatar_url} size={70} borderColor="#94a3b8" />
            <div style={{ ...styles.rankBadge, background: "linear-gradient(135deg, #94a3b8, #cbd5e1)" }}>2</div>
          </div>
          <span style={styles.podiumName}>{top2?.username || "-"}</span>
          {top2 && (
            <div style={{ ...styles.tierBadgeSmall, background: getRankTier(top2.points).color, color: "#fff" }}>
              {getRankTier(top2.points).icon} <span style={{ fontWeight: 900 }}>{getRankTier(top2.points).label}</span>
            </div>
          )}
          <span style={styles.podiumPoints}>{top2?.points || 0} pts</span>
          <div
            style={{
              ...styles.bar,
              height: "120px",
              background: "linear-gradient(180deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
              }}
            />
          </div>
        </div>

        {/* RANK 1 */}
        <div style={{ ...styles.podiumItem, zIndex: 10, margin: "0 16px" }}>
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(40px)",
              zIndex: -1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -30,
              animation: "float 3s ease-in-out infinite",
              filter: "drop-shadow(0 8px 20px rgba(251, 191, 36, 0.5))",
            }}
          >
            <GiImperialCrown size={48} color="#fbbf24" />
          </div>
          <div style={{ ...styles.avatarWrapper, marginTop: 20 }}>
            <UserAvatar url={top1?.avatar_url} size={100} borderColor="#fbbf24" glow={true} />
            <div
              style={{
                ...styles.rankBadge,
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                width: 34,
                height: 34,
                fontSize: 18,
                bottom: -14,
                boxShadow: "0 6px 20px rgba(251, 191, 36, 0.4)",
              }}
            >
              1
            </div>
          </div>
          <span style={{ ...styles.podiumName, fontSize: 19, marginTop: 20 }}>{top1?.username || "-"}</span>
          {top1 && (
            <div
              style={{
                ...styles.tierBadgeSmall,
                background: getRankTier(top1.points).color,
                color: "#fff",
                fontSize: 11,
              }}
            >
              {getRankTier(top1.points).icon} <span style={{ fontWeight: 900 }}>{getRankTier(top1.points).label}</span>
            </div>
          )}
          <span style={{ ...styles.podiumPoints, color: "#fcd34d", fontSize: 16, fontWeight: 700 }}>
            {top1?.points || 0} pts
          </span>
          <div
            style={{
              ...styles.bar,
              height: "170px",
              background: "linear-gradient(180deg, #fde68a 0%, #fbbf24 30%, #f59e0b 70%, #d97706 100%)",
              boxShadow: "0 10px 40px -10px rgba(251, 191, 36, 0.6)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                animation: "shine 3s infinite",
              }}
            />
          </div>
        </div>

        {/* RANK 3 */}
        <div style={{ ...styles.podiumItem, zIndex: 2, margin: "0 16px" }}>
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle, rgba(217, 119, 6, 0.3) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(30px)",
              zIndex: -1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -25,
              animation: "float 3s ease-in-out infinite 1s",
              filter: "drop-shadow(0 4px 12px rgba(217, 119, 6, 0.4))",
            }}
          >
            <GiImperialCrown
              size={44}
              color="#d97706"
              style={{ filter: "drop-shadow(0 4px 12px rgba(217, 119, 6, 0.4))" }}
            />
          </div>
          <div style={styles.avatarWrapper}>
            <UserAvatar url={top3?.avatar_url} size={70} borderColor="#d97706" />
            <div style={{ ...styles.rankBadge, background: "linear-gradient(135deg, #d97706, #b45309)" }}>3</div>
          </div>
          <span style={styles.podiumName}>{top3?.username || "-"}</span>
          {top3 && (
            <div style={{ ...styles.tierBadgeSmall, background: getRankTier(top3.points).color, color: "#fff" }}>
              {getRankTier(top3.points).icon} <span style={{ fontWeight: 900 }}>{getRankTier(top3.points).label}</span>
            </div>
          )}
          <span style={styles.podiumPoints}>{top3?.points || 0} pts</span>
          <div
            style={{
              ...styles.bar,
              height: "100px",
              background: "linear-gradient(180deg, #fbbf24 0%, #d97706 50%, #92400e 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* LIST SECTION */}
      <div style={styles.listContainer}>
        <div style={styles.dragHandle}></div>
        <div
          style={{
            padding: "0 24px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IoRibbon size={22} color="#15803d" />
            <h3 style={styles.listTitle}>Top Learners</h3>
          </div>
        </div>

        <div style={styles.scrollArea}>
          {/* YOU CARD (Static at Top) */}
          <div style={styles.yourRankCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #15803d, #16a34a)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: 16,
                  boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
                }}
              >
                {currentUserRank}
              </div>

              <UserAvatar url={currentUser.avatar_url} size={48} borderColor="#15803d" />

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>You</span>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    color: myTier.color,
                    background: myTier.bg,
                    padding: "3px 10px",
                    borderRadius: "8px",
                    width: "fit-content",
                    border: `1.5px solid ${myTier.color}30`,
                  }}
                >
                  {myTier.icon} {myTier.label}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "18px", fontWeight: "900", color: "#15803d" }}>{currentUser.points}</span>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, letterSpacing: 0.5 }}>POINTS</div>
            </div>
          </div>

          <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0 20px 0" }}></div>

          {/* OTHER STUDENTS */}
          {rankedStudents.slice(3).map((student) => {
            const tier = getRankTier(student.points)
            const isCurrentUser = student.id === currentUserId
            return (
              <div
                key={student.id}
                style={{
                  ...styles.listItem,
                  background: isCurrentUser ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "white",
                  border: isCurrentUser ? "2px solid #22c55e50" : "1px solid #f1f5f9",
                  transform: isCurrentUser ? "scale(1.01)" : "scale(1)",
                }}
              >
                <span style={{ ...styles.rankNum, color: isCurrentUser ? "#15803d" : "#64748b" }}>{student.rank}</span>
                <div style={{ marginRight: 16 }}>
                  <UserAvatar
                    url={student.avatar_url}
                    size={48}
                    borderColor={isCurrentUser ? "#15803d" : "transparent"}
                  />
                </div>
                <div style={styles.info}>
                  <span style={{ ...styles.name, color: isCurrentUser ? "#0f172a" : "#334155" }}>
                    {student.username}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: tier.color,
                        background: tier.bg,
                        padding: "3px 10px",
                        borderRadius: "8px",
                        border: `1.5px solid ${tier.color}30`,
                      }}
                    >
                      {tier.icon} {tier.label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ ...styles.points, color: isCurrentUser ? "#15803d" : "#6366f1" }}>
                    {student.points}
                  </span>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.3 }}>PTS</div>
                </div>
              </div>
            )
          })}
          <div style={{ height: 120 }}></div>
        </div>
      </div>

      {/* ACTIVITY LOG MODAL */}
      {showHistory && (
        <div style={styles.modalOverlay} onClick={() => setShowHistory(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={styles.modalIconBox}>
                  <IoTime size={22} color="#15803d" />
                </div>
                <span style={styles.modalTitle}>Activity Log</span>
              </div>
              <button onClick={() => setShowHistory(false)} style={styles.modalCloseBtn}>
                <IoClose size={22} color="#64748b" />
              </button>
            </div>
            <div style={styles.modalBody}>
              {historyLogs.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <IoCalendar size={36} color="#cbd5e1" />
                  </div>
                  <p style={{ fontWeight: 800, color: "#94a3b8", margin: "12px 0 4px 0" }}>No history yet</p>
                  <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>
                    Complete tasks to earn points!
                  </span>
                </div>
              ) : (
                historyLogs.map((log, i) => (
                  <div key={i} style={styles.modalItem}>
                    <div style={styles.itemLeft}>
                      <div style={styles.itemIcon}>
                        <IoStar size={18} color="#ffffff" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={styles.itemReason} title={log.reason}>
                          {log.reason}
                        </span>
                        <span style={styles.itemDate}>{formatDate(log.created_at)}</span>
                      </div>
                    </div>
                    <span style={styles.itemPoints}>+{log.points}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* RANK UP CONGRATULATIONS MODAL */}
      {showRankUpModal && newRankDetails && (
        <div style={styles.modalOverlay} onClick={() => setShowRankUpModal(false)}>
          <div
            style={{
              ...styles.modalCard,
              textAlign: "center",
              alignItems: "center",
              paddingTop: 50,
              paddingBottom: 40,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 24, animation: "float 3s infinite" }}>
              <GiPartyPopper
                size={90}
                color={newRankDetails.color}
                style={{ filter: `drop-shadow(0 8px 30px ${newRankDetails.color}40)` }}
              />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0 }}>Rank Up!</h2>
            <p style={{ color: "#64748b", fontSize: 15, marginTop: 8, fontWeight: 600 }}>
              Congratulations! You reached a new tier.
            </p>

            <div
              style={{
                marginTop: 28,
                marginBottom: 32,
                padding: "20px 40px",
                background: newRankDetails.bg,
                borderRadius: 24,
                border: `3px solid ${newRankDetails.color}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: `0 8px 30px ${newRankDetails.color}30`,
              }}
            >
              <span style={{ fontSize: 36, marginBottom: 8 }}>{newRankDetails.icon}</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: newRankDetails.color, letterSpacing: 1 }}>
                {newRankDetails.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: newRankDetails.color, opacity: 0.8, marginTop: 4 }}>
                {newRankDetails.desc}
              </span>
            </div>

            <button
              onClick={() => setShowRankUpModal(false)}
              style={{
                background: "linear-gradient(135deg, #15803d, #16a34a)",
                color: "white",
                border: "none",
                padding: "14px 50px",
                borderRadius: "14px",
                fontWeight: "900",
                fontSize: 17,
                cursor: "pointer",
                width: "80%",
                boxShadow: "0 10px 30px -5px rgba(21, 128, 61, 0.5)",
                transition: "transform 0.2s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-12px); } 
        }
        @keyframes popIn { 
          0% { transform: scale(0.9); opacity: 0; } 
          100% { transform: scale(1); opacity: 1; } 
        }
        @keyframes shine { 
          0% { left: "-100%"; } 
          100% { left: "100%"; } 
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 50%, #d1fae5 100%)",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },

  header: {
    padding: "24px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
  },
  headerIconBox: {
    background: "white",
    padding: "12px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(21, 128, 61, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    background: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(21, 128, 61, 0.1)",
    transition: "transform 0.2s",
  },
  headerTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },

  podiumContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: "120px",
    paddingBottom: "40px",
    zIndex: 2,
    height: 320,
    position: "relative",
  },
  podiumItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "110px",
    position: "relative",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  rankBadge: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    fontSize: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  podiumName: {
    fontSize: "15px",
    marginBottom: "6px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    textAlign: "center",
  },
  tierBadgeSmall: {
    fontSize: "10px",
    fontWeight: "900",
    padding: "4px 10px",
    borderRadius: "10px",
    marginBottom: "8px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    border: "2px solid white",
  },
  podiumPoints: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "10px",
    fontWeight: "700",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    opacity: 0.95,
  },

  listContainer: {
    background: "white",
    flex: 1,
    borderTopLeftRadius: "32px",
    borderTopRightRadius: "32px",
    paddingTop: "16px",
    color: "#0f172a",
    boxShadow: "0 -10px 40px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 10,
  },
  dragHandle: {
    width: "45px",
    height: "5px",
    background: "#cbd5e1",
    borderRadius: "10px",
    margin: "12px auto 24px auto",
  },
  listTitle: {
    fontSize: "20px",
    color: "#0f172a",
    margin: 0,
    fontWeight: "900",
    letterSpacing: "-0.5px",
  },
  scrollArea: {
    overflowY: "auto",
    padding: "0 24px",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    padding: "18px 20px",
    marginBottom: "14px",
    borderRadius: "20px",
    background: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
  },
  rankNum: {
    width: "30px",
    fontWeight: "800",
    color: "#64748b",
    textAlign: "center",
    fontSize: "15px",
  },
  info: {
    flex: 1,
  },
  name: {
    display: "block",
    fontWeight: "800",
    fontSize: "16px",
    marginBottom: "2px",
    letterSpacing: "-0.2px",
  },
  points: {
    fontWeight: "900",
    color: "#6366f1",
    fontSize: "17px",
  },

  yourRankCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px",
    marginBottom: "14px",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    borderRadius: "20px",
    boxShadow: "0 6px 20px rgba(21, 128, 61, 0.15)",
    border: "2px solid #22c55e50",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modalCard: {
    background: "white",
    width: "100%",
    maxWidth: "420px",
    maxHeight: "65vh",
    borderRadius: "28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: "popIn 0.3s ease-out",
  },
  modalHeader: {
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9",
  },
  modalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: "-0.3px",
  },
  modalCloseBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  modalBody: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    overscrollBehavior: "contain",
  },

  emptyState: {
    textAlign: "center",
    padding: "50px 0",
  },
  emptyIcon: {
    background: "#f8fafc",
    width: 70,
    height: 70,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  modalItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    paddingBottom: "18px",
    borderBottom: "1px dashed #f1f5f9",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: "linear-gradient(135deg, #15803d, #16a34a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
  },
  itemReason: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
    maxWidth: "200px",
  },
  itemDate: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 600,
    marginTop: 2,
  },
  itemPoints: {
    fontSize: 16,
    fontWeight: "900",
    color: "#16a34a",
  },
}
