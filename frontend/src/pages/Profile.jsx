"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
// Icons
import {
  IoSettingsOutline,
  IoPersonCircleOutline,
  IoMedalOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoChevronForwardOutline,
  IoCameraOutline,
  IoFlash,
  IoFlame,
  IoTrophyOutline,
  IoAt,
} from "react-icons/io5"

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState({
    id: null,
    first_name: "Student",
    last_name: "",
    username: "student_user",
    profile_pic: null,
  })
  const [stats, setStats] = useState({ points: 0, streak: 0, totalHours: "0.0", totalMinutes: 0 })

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser((prev) => ({ ...prev, ...parsedUser }))

      // Fetch latest data from DB
      axios
        .get(`http://localhost:5000/api/study/stats/${parsedUser.id}`)
        .then((res) => {
          if (res.data.profile_pic) {
            setUser((prev) => ({ ...prev, profile_pic: res.data.profile_pic }))
          }
          if (res.data.username) {
            setUser((prev) => ({ ...prev, username: res.data.username }))
          }

          const todaySeconds = res.data.today_seconds || 0
          const hours = Math.floor(todaySeconds / 3600)
          const minutes = Math.floor((todaySeconds % 3600) / 60)

          setStats({
            points: res.data.points || 0,
            streak: res.data.streak || 0,
            totalHours: hours.toString(),
            totalMinutes: minutes,
          })
        })
        .catch((err) => console.error("Error fetching profile data:", err))
    }
  }, [])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Please choose an image under 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Image = reader.result
      try {
        await axios.put(`http://localhost:5000/api/users/update-avatar/${user.id}`, { profile_pic: base64Image })

        setUser((prev) => ({ ...prev, profile_pic: base64Image }))

        const storedUser = JSON.parse(localStorage.getItem("user"))
        if (storedUser) {
          storedUser.profile_pic = base64Image
          localStorage.setItem("user", JSON.stringify(storedUser))
        }

        alert("Profile picture updated!")
      } catch (error) {
        console.error("Upload failed:", error)
        alert("Failed to update profile picture.")
      }
    }
    reader.readAsDataURL(file)
  }

  const formatStudyTime = () => {
    const hours = Number.parseInt(stats.totalHours)
    const minutes = stats.totalMinutes

    if (hours === 0 && minutes === 0) return "0m"
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.backgroundGradient} />

      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>My Profile</h2>
          <button onClick={() => navigate("/settings")} style={styles.iconButton} title="Settings">
            <IoSettingsOutline size={22} color="#15803d" />
          </button>
        </div>

        <div style={styles.profileBox}>
          <div style={styles.avatarWrapper}>
            {user.profile_pic ? (
              <img src={user.profile_pic || "/placeholder.svg"} alt="Profile" style={styles.profileImg} />
            ) : (
              <div style={styles.placeholderAvatar}>
                <IoPersonCircleOutline size={80} color="#a7f3d0" />
              </div>
            )}
            <label style={styles.uploadLabel}>
              <IoCameraOutline size={16} color="white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </label>
          </div>

          <div style={styles.textInfo}>
            <h3 style={styles.name}>
              {user.first_name} {user.last_name}
            </h3>
            <div style={styles.usernameTag}>
              <IoAt size={16} color="#15803d" />
              <span>{user.username || "username"}</span>
            </div>
          </div>
        </div>

        <div style={styles.statsRow}>
          <div
            style={styles.statCard}
            onClick={() => navigate("/leaderboard")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(245, 158, 11, 0.25), 0 4px 8px rgba(0,0,0,0.08)"
              e.currentTarget.style.cursor = "pointer"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(21, 128, 61, 0.1), 0 2px 4px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ ...styles.statIconBg, background: "#fef3c7" }}>
              <IoFlash color="#f59e0b" size={24} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statVal}>{stats.points}</span>
              <span style={styles.statLabel}>POINTS</span>
            </div>
            <IoChevronForwardOutline color="#f59e0b" size={18} style={{ marginLeft: "auto", opacity: 0.6 }} />
          </div>

          <div
            style={styles.statCard}
            onClick={() => navigate("/progress")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(239, 68, 68, 0.25), 0 4px 8px rgba(0,0,0,0.08)"
              e.currentTarget.style.cursor = "pointer"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(21, 128, 61, 0.1), 0 2px 4px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ ...styles.statIconBg, background: "#fee2e2" }}>
              <IoFlame color="#ef4444" size={24} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statVal}>{stats.streak}</span>
              <span style={styles.statLabel}>STREAK</span>
            </div>
            <IoChevronForwardOutline color="#ef4444" size={18} style={{ marginLeft: "auto", opacity: 0.6 }} />
          </div>

          <div
            style={styles.statCard}
            onClick={() => navigate("/progress")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(46, 125, 50, 0.25), 0 4px 8px rgba(0,0,0,0.08)"
              e.currentTarget.style.cursor = "pointer"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(21, 128, 61, 0.1), 0 2px 4px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ ...styles.statIconBg, background: "#e8f5e9" }}>
              <IoTimeOutline color="#2e7d32" size={24} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statVal}>{formatStudyTime()}</span>
              <span style={styles.statLabel}>STUDIED TODAY</span>
            </div>
            <IoChevronForwardOutline color="#2e7d32" size={18} style={{ marginLeft: "auto", opacity: 0.6 }} />
          </div>
        </div>

        <div style={styles.menuGrid}>
          <div style={styles.menuItem} onClick={() => navigate("/leaderboard")}>
            <div style={styles.menuLeft}>
              <div style={{ ...styles.iconBg, background: "#fff7ed" }}>
                <IoMedalOutline color="#ea580c" size={24} />
              </div>
              <div style={styles.menuTextContainer}>
                <span style={styles.menuTitle}>Badges & Achievements</span>
                <span style={styles.menuSubtitle}>View your rewards</span>
              </div>
            </div>
            <IoChevronForwardOutline color="#a7f3d0" />
          </div>

          <div style={styles.menuItem} onClick={() => navigate("/progress")}>
            <div style={styles.menuLeft}>
              <div style={{ ...styles.iconBg, background: "#e8f5e9" }}>
                <IoTrophyOutline color="#2e7d32" size={24} />
              </div>
              <div style={styles.menuTextContainer}>
                <span style={styles.menuTitle}>Overall Learning Progress</span>
                <span style={styles.menuSubtitle}>Track your growth</span>
              </div>
            </div>
            <IoChevronForwardOutline color="#a7f3d0" />
          </div>

          <div style={styles.menuItem} onClick={() => navigate("/wellbeing")}>
            <div style={styles.menuLeft}>
              <div style={{ ...styles.iconBg, background: "#f0fdf4" }}>
                <IoHeartOutline color="#16a34a" size={24} />
              </div>
              <div style={styles.menuTextContainer}>
                <span style={styles.menuTitle}>Personal Wellbeing Logs</span>
                <span style={styles.menuSubtitle}>Check your mood history</span>
              </div>
            </div>
            <IoChevronForwardOutline color="#a7f3d0" />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    width: "100%",
    paddingBottom: "100px",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  backgroundGradient: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 25%, #a5d6a7 50%, #c8e6c9 75%, #e8f5e9 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    zIndex: 0,
  },
  container: {
    width: "100%",
    padding: "24px 30px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,
  },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#064e3b",
    letterSpacing: "-0.5px",
    textShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },

  iconButton: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "14px",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  },

  profileBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 8px 24px rgba(21, 128, 61, 0.12), 0 4px 8px rgba(0,0,0,0.06)",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "25px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
  avatarWrapper: { position: "relative", width: "110px", height: "110px", flexShrink: 0 },
  profileImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.15)",
  },
  placeholderAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "rgba(209, 250, 229, 0.5)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.15)",
  },

  uploadLabel: {
    position: "absolute",
    bottom: "0",
    right: "0",
    background: "linear-gradient(135deg, #15803d, #16a34a)",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.4), 0 2px 4px rgba(0,0,0,0.1)",
  },

  textInfo: { display: "flex", flexDirection: "column", gap: "6px" },
  name: {
    fontSize: "24px",
    fontWeight: "800",
    margin: 0,
    color: "#064e3b",
    letterSpacing: "-0.5px",
  },

  usernameTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#15803d",
    fontSize: "15px",
    fontWeight: "600",
    background: "rgba(209, 250, 229, 0.6)",
    backdropFilter: "blur(10px)",
    padding: "6px 14px",
    borderRadius: "20px",
    width: "fit-content",
    border: "1px solid rgba(167, 243, 208, 0.4)",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "24px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 16px rgba(21, 128, 61, 0.1), 0 2px 4px rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
    position: "relative",
  },
  statIconBg: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  statContent: { display: "flex", flexDirection: "column" },
  statVal: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#064e3b",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: "1px",
    marginTop: "2px",
  },

  menuGrid: { display: "flex", flexDirection: "column", gap: "15px" },
  menuItem: {
    padding: "20px 24px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 16px rgba(21, 128, 61, 0.1), 0 2px 4px rgba(0,0,0,0.04)",
  },
  menuLeft: { display: "flex", alignItems: "center", gap: "18px" },
  iconBg: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  menuTextContainer: { display: "flex", flexDirection: "column", gap: "2px" },
  menuTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#064e3b",
  },
  menuSubtitle: {
    fontSize: "13px",
    color: "#6b7280",
  },
}

if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0]
  try {
    styleSheet.insertRule(
      `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `,
      styleSheet.cssRules.length,
    )
  } catch (e) {
    // Animation already defined
  }
}
