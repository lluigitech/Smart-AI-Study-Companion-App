"use client"
import { useNavigate, useLocation } from "react-router-dom"
import { IoHome, IoStatsChart, IoTrophy, IoPerson, IoBook } from "react-icons/io5"
import { useState, useEffect } from "react"

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [pressedItem, setPressedItem] = useState(null)
  const [shouldHide, setShouldHide] = useState(false)

  // 🔥 LISTEN FOR STUDY SESSION CHANGES
  useEffect(() => {
    const checkStudySession = () => {
      const isInSession = localStorage.getItem('isStudySessionActive') === 'true'
      setShouldHide(isInSession)
    }

    // Check immediately
    checkStudySession()
    
    // Check every 100ms for changes
    const interval = setInterval(checkStudySession, 100)

    return () => clearInterval(interval)
  }, [])

  // 🔥 IF STUDY SESSION IS ACTIVE, HIDE THE NAV
  if (shouldHide) {
    return null
  }

  const navItems = [
    { label: "Home", icon: <IoHome size={24} />, path: "/dashboard" },
    { label: "Progress", icon: <IoStatsChart size={24} />, path: "/progress" },

    {
      label: "Leaderboard",
      icon: <IoTrophy size={28} />,
      path: "/leaderboard",
      isFloating: true,
    },

    { label: "Study Space", icon: <IoBook size={24} />, path: "/study-space" },
    { label: "Profile", icon: <IoPerson size={24} />, path: "/profile" },
  ]

  const handlePress = (item) => {
    setPressedItem(item.path)
    setTimeout(() => {
      setPressedItem(null)
      navigate(item.path)
    }, 150)
  }

  return (
    <div style={styles.navWrapper}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        const isPressed = pressedItem === item.path

        if (item.isFloating) {
          return (
            <div
              key={item.label}
              style={{
                ...styles.floatingContainer,
                transform: isPressed ? "scale(0.85)" : "scale(1)",
              }}
              onClick={() => handlePress(item)}
              onMouseDown={() => setPressedItem(item.path)}
              onMouseUp={() => setPressedItem(null)}
              onMouseLeave={() => setPressedItem(null)}
            >
              <div
                style={{
                  ...styles.floatingButton,
                  transform: isPressed ? "scale(0.9) translateY(2px)" : "scale(1)",
                  boxShadow: isPressed
                    ? "0 4px 12px rgba(21, 128, 61, 0.3), 0 2px 6px rgba(22, 163, 74, 0.2)"
                    : "0 8px 24px rgba(21, 128, 61, 0.4), 0 4px 12px rgba(22, 163, 74, 0.3)",
                }}
              >
                {item.icon}
              </div>
            </div>
          )
        }

        return (
          <div
            key={item.label}
            style={{
              ...styles.navItem,
              transform: isPressed ? "scale(0.9)" : "scale(1)",
              backgroundColor: isPressed ? "rgba(209, 250, 229, 0.5)" : "transparent",
              borderRadius: "12px",
            }}
            onClick={() => handlePress(item)}
            onMouseDown={() => setPressedItem(item.path)}
            onMouseUp={() => setPressedItem(null)}
            onMouseLeave={() => setPressedItem(null)}
          >
            <span
              style={{
                color: isActive ? "#15803d" : "#9ca3af",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isActive ? "scale(1.1)" : "scale(1)",
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                ...styles.label,
                color: isActive ? "#15803d" : "#9ca3af",
                fontWeight: isActive ? "700" : "600",
              }}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  navWrapper: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "70px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 15px",
    boxShadow: "0 -4px 20px rgba(21, 128, 61, 0.08), 0 -2px 8px rgba(0,0,0,0.04)",
    zIndex: 1000,
    borderTop: "1px solid rgba(209, 250, 229, 0.6)",
  },
  navItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    height: "100%",
    gap: "4px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    padding: "8px",
  },
  floatingContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    top: "-25px",
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  floatingButton: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #15803d, #16a34a)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 8px 24px rgba(21, 128, 61, 0.4), 0 4px 12px rgba(22, 163, 74, 0.3)",
    border: "4px solid #ffffff",
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  label: {
    fontSize: "10px",
    fontWeight: "600",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
}