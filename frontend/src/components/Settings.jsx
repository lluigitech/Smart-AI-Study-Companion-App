"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  IoArrowBack,
  IoMoon,
  IoSunny,
  IoNotifications,
  IoLogOut,
  IoBook,
  IoKey,
  IoMail,
  IoColorPalette,
  IoAt,
  IoSave,
  IoPerson,
} from "react-icons/io5"

export default function Settings({ isDarkMode, onToggle }) {
  const navigate = useNavigate()

  // --- STATE ---
  const [user, setUser] = useState({
    id: null,
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    profile_pic: null,
  })

  const [settings, setSettings] = useState({
    studyGoal: 60,
    studyTime: "Morning",
    notifications: true,
  })

  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser(parsed)
      setSettings({
        studyGoal: parsed.study_goal || 60,
        studyTime: parsed.preferred_time || "Morning",
        notifications: parsed.notifications === 1,
      })
    }
  }, [])

  // --- 2. AUTO-SAVE PREFERENCES ---
  useEffect(() => {
    if (user.id) {
      const updatedUser = {
        ...user,
        study_goal: settings.studyGoal,
        preferred_time: settings.studyTime,
        notifications: settings.notifications ? 1 : 0,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }, [settings])

  // --- 3. MANUAL SAVE PROFILE ---
  const handleUpdateProfile = async () => {
    setIsSavingProfile(true)
    try {
      await axios.put("http://localhost:5000/api/users/update-profile", {
        userId: user.id,
        username: user.username,
        email: user.email,
      })
      localStorage.setItem("user", JSON.stringify(user))
      alert("✅ Profile updated successfully!")
    } catch (error) {
      console.error("Update failed", error)
      if (error.response && error.response.data && error.response.data.error) {
        alert("❌ " + error.response.data.error)
      } else {
        alert("❌ Update failed. Please try again.")
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear()
      navigate("/login")
    }
  }

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const theme = isDarkMode
    ? {
        bg: "linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 50%, #065f46 75%, #064e3b 100%)",
        card: "rgba(255, 255, 255, 0.08)",
        text: "#f0fdf4",
        subText: "#86efac",
        border: "rgba(255, 255, 255, 0.1)",
        inputBg: "rgba(255, 255, 255, 0.05)",
        accent: "#16a34a",
        accentHover: "#15803d",
        danger: "#ef4444",
      }
    : {
        bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #6ee7b7 50%, #a7f3d0 75%, #d1fae5 100%)",
        card: "rgba(255, 255, 255, 0.9)",
        text: "#064e3b",
        subText: "#047857",
        border: "rgba(255, 255, 255, 0.5)",
        inputBg: "rgba(255, 255, 255, 0.6)",
        accent: "#15803d",
        accentHover: "#166534",
        danger: "#dc2626",
      }

  return (
    <div
      style={{
        ...styles.container,
        background: theme.bg,
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        color: theme.text,
      }}
    >
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              onClick={() => navigate("/profile")}
              style={{
                ...styles.backButton,
                backgroundColor: theme.card,
                backdropFilter: "blur(20px)",
                borderColor: theme.border,
                color: theme.text,
                boxShadow: "0 8px 32px rgba(21, 128, 61, 0.15)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <IoArrowBack size={22} />
            </button>
            <h1 style={{ ...styles.title, color: theme.text }}>Settings</h1>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={styles.gridContainer}>
          {/* LEFT COLUMN: ACCOUNT */}
          <div
            style={{
              ...styles.card,
              backgroundColor: theme.card,
              backdropFilter: "blur(20px)",
              borderColor: theme.border,
              boxShadow: "0 20px 60px rgba(21, 128, 61, 0.2)",
            }}
          >
            <div style={styles.cardHeader}>
              <IoPerson size={20} color={theme.accent} />
              <span style={{ ...styles.cardTitle, color: theme.text }}>Account</span>
            </div>

            <div style={styles.profileSection}>
              {user.profile_pic ? (
                <img src={user.profile_pic || "/placeholder.svg"} alt="Profile" style={styles.avatarImg} />
              ) : (
                <div
                  style={{
                    ...styles.avatarPlaceholder,
                    background: `linear-gradient(135deg, ${theme.accent}, #16a34a)`,
                    boxShadow: "0 8px 24px rgba(21, 128, 61, 0.3)",
                  }}
                >
                  {user.first_name[0]}
                </div>
              )}
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    wordBreak: "break-word",
                    color: theme.text,
                  }}
                >
                  {user.first_name} {user.last_name}
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: theme.subText }}>Student Account</p>
              </div>
            </div>

            <div style={{ ...styles.divider, backgroundColor: theme.border }}></div>

            {/* Inputs */}
            <div style={styles.formStack}>
              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, color: theme.subText }}>Username</label>
                <div
                  style={{
                    ...styles.inputContainer,
                    backgroundColor: theme.inputBg,
                    backdropFilter: "blur(10px)",
                    borderColor: theme.border,
                  }}
                >
                  <IoAt size={18} color={theme.subText} />
                  <input
                    type="text"
                    value={user.username || ""}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    style={{ ...styles.input, color: theme.text }}
                    placeholder="username"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, color: theme.subText }}>Email Address</label>
                <div
                  style={{
                    ...styles.inputContainer,
                    backgroundColor: theme.inputBg,
                    backdropFilter: "blur(10px)",
                    borderColor: theme.border,
                  }}
                >
                  <IoMail size={18} color={theme.subText} />
                  <input
                    type="email"
                    value={user.email || ""}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    style={{ ...styles.input, color: theme.text }}
                    placeholder="name@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleUpdateProfile}
                style={{
                  ...styles.primaryBtn,
                  background: `linear-gradient(135deg, ${theme.accent}, #16a34a)`,
                  boxShadow: "0 8px 24px rgba(21, 128, 61, 0.3)",
                }}
                disabled={isSavingProfile}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {isSavingProfile ? (
                  "Saving..."
                ) : (
                  <>
                    <IoSave size={18} /> Save Changes
                  </>
                )}
              </button>
              <button
                style={{
                  ...styles.secondaryBtn,
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.inputBg,
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <IoKey size={18} /> Change Password
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PREFERENCES & SYSTEM */}
          <div style={styles.columnStack}>
            {/* Preferences Card */}
            <div
              style={{
                ...styles.card,
                backgroundColor: theme.card,
                backdropFilter: "blur(20px)",
                borderColor: theme.border,
                boxShadow: "0 20px 60px rgba(21, 128, 61, 0.2)",
              }}
            >
              <div style={styles.cardHeader}>
                <IoBook size={20} color={theme.accent} />
                <span style={{ ...styles.cardTitle, color: theme.text }}>Study Preferences</span>
              </div>

              <div style={styles.formStack}>
                <div style={styles.inputGroup}>
                  <label style={{ ...styles.label, color: theme.subText }}>Daily Goal (Minutes)</label>
                  <input
                    type="number"
                    value={settings.studyGoal}
                    onChange={(e) => updateSetting("studyGoal", e.target.value)}
                    style={{
                      ...styles.inputContainer,
                      ...styles.input,
                      backgroundColor: theme.inputBg,
                      backdropFilter: "blur(10px)",
                      borderColor: theme.border,
                      color: theme.text,
                      width: "100%",
                    }}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={{ ...styles.label, color: theme.subText }}>Preferred Time</label>
                  <select
                    value={settings.studyTime}
                    onChange={(e) => updateSetting("studyTime", e.target.value)}
                    style={{
                      ...styles.inputContainer,
                      ...styles.input,
                      backgroundColor: theme.inputBg,
                      backdropFilter: "blur(10px)",
                      borderColor: theme.border,
                      color: theme.text,
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Night</option>
                  </select>
                </div>
              </div>
            </div>

            {/* System Card */}
            <div
              style={{
                ...styles.card,
                backgroundColor: theme.card,
                backdropFilter: "blur(20px)",
                borderColor: theme.border,
                boxShadow: "0 20px 60px rgba(21, 128, 61, 0.2)",
              }}
            >
              <div style={styles.cardHeader}>
                <IoColorPalette size={20} color={theme.accent} />
                <span style={{ ...styles.cardTitle, color: theme.text }}>Appearance & System</span>
              </div>

              <div style={styles.toggleRow}>
                <div style={styles.toggleLabel}>
                  <div
                    style={{
                      ...styles.iconBox,
                      background: isDarkMode ? "rgba(22, 163, 74, 0.2)" : "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {isDarkMode ? <IoMoon color="#86efac" size={18} /> : <IoSunny color="#15803d" size={18} />}
                  </div>
                  <span style={{ color: theme.text }}>Dark Mode</span>
                </div>
                <button
                  onClick={onToggle}
                  style={{
                    ...styles.switchBase,
                    backgroundColor: isDarkMode ? theme.accent : "#cbd5e1",
                  }}
                >
                  <div
                    style={{ ...styles.switchThumb, transform: isDarkMode ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              <div style={{ ...styles.divider, backgroundColor: theme.border }}></div>

              <div style={styles.toggleRow}>
                <div style={styles.toggleLabel}>
                  <div
                    style={{
                      ...styles.iconBox,
                      background: settings.notifications ? "rgba(22, 163, 74, 0.2)" : "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <IoNotifications color={settings.notifications ? theme.accent : "#94a3b8"} size={18} />
                  </div>
                  <span style={{ color: theme.text }}>Notifications</span>
                </div>
                <button
                  onClick={() => updateSetting("notifications", !settings.notifications)}
                  style={{
                    ...styles.switchBase,
                    backgroundColor: settings.notifications ? theme.accent : "#cbd5e1",
                  }}
                >
                  <div
                    style={{
                      ...styles.switchThumb,
                      transform: settings.notifications ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutBtn,
            color: theme.danger,
            backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.15)" : "rgba(254, 226, 226, 0.8)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <IoLogOut size={20} /> Log Out
        </button>

        <p style={{ textAlign: "center", marginTop: "30px", color: theme.subText, fontSize: "12px", opacity: 0.7 }}>
          Smart Study Companion v1.2
        </p>
      </div>
    </div>
  )
}

// --- RESPONSIVE STYLES ---
const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    paddingBottom: "60px",
    fontFamily: "'Inter', sans-serif",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  wrapper: {
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    padding: "10px 0",
  },
  backButton: {
    background: "transparent",
    border: "1px solid",
    borderRadius: "16px",
    width: "44px",
    height: "44px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-0.5px",
  },

  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    alignItems: "start",
    width: "100%",
  },
  columnStack: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  card: {
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
    width: "100%",
    boxSizing: "border-box",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  cardTitle: {
    fontWeight: "700",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    opacity: 0.8,
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  avatarPlaceholder: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "28px",
    flexShrink: 0,
  },
  avatarImg: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    objectFit: "cover",
    flexShrink: 0,
  },

  formStack: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.85rem", fontWeight: "600", marginLeft: "4px" },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "16px",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
    width: "100%",
    boxSizing: "border-box",
  },
  input: {
    background: "transparent",
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "0.95rem",
    fontWeight: "500",
    fontFamily: "inherit",
    minWidth: 0,
  },

  divider: { height: "1px", margin: "20px 0", width: "100%" },

  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" },
  toggleLabel: { display: "flex", alignItems: "center", gap: "15px", fontWeight: "600", fontSize: "0.95rem" },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  switchBase: {
    width: "48px",
    height: "28px",
    borderRadius: "30px",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  switchThumb: {
    width: "20px",
    height: "20px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },

  primaryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    color: "white",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "transform 0.1s ease",
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "transform 0.1s ease",
  },
  logoutBtn: {
    width: "100%",
    padding: "18px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px",
    transition: "all 0.2s ease",
  },
}
