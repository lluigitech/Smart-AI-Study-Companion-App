"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  IoMailOutline,
  IoArrowBack,
  IoLibrary,
  IoCheckmarkCircleOutline,
  IoArrowForward,
} from "react-icons/io5"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowWidth < 768

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      // Palitan ang URL base sa iyong backend route
      const res = await axios.post("http://localhost:5000/api/forgot-password", { email })
      setMessage("Reset link sent! Please check your email inbox.")
      setIsSuccess(true)
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong. Please try again.")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.authCard,
          width: isMobile ? "100%" : "480px",
          minHeight: isMobile ? "100vh" : "auto",
          borderRadius: isMobile ? "0" : "24px",
          padding: isMobile ? "40px 20px" : "50px",
        }}
      >
        <button onClick={() => navigate("/login")} style={styles.backBtn}>
          <IoArrowBack size={20} />
          <span>Back to Login</span>
        </button>

        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <IoLibrary size={32} color="#047857" />
          </div>
          <h2 style={styles.title}>Forgot Password?</h2>
          <p style={styles.subtitle}>
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        {isSuccess ? (
          <div style={styles.successState}>
            <IoCheckmarkCircleOutline size={60} color="#059669" />
            <p style={styles.successText}>{message}</p>
            <button onClick={() => navigate("/login")} style={styles.loginBtn}>
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <div style={styles.inputContainer}>
                <IoMailOutline style={styles.inputIcon} size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  style={styles.inputField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {message && <div style={styles.errorBox}>{message}</div>}

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
              {!loading && <IoArrowForward size={20} />}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
  },
  authCard: {
    backgroundColor: "#fff",
    boxShadow: "0 20px 60px rgba(4, 120, 87, 0.1)",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "0",
    marginBottom: "32px",
    width: "fit-content",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  iconCircle: {
    width: "64px",
    height: "64px",
    background: "#f0fdf4",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px auto",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
    maxWidth: "320px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    letterSpacing: "0.5px",
  },
  inputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "18px",
    color: "#94a3b8",
  },
  inputField: {
    width: "100%",
    padding: "16px 18px 16px 52px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: "500",
  },
  submitBtn: {
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #047857 0%, #059669 100%)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(4, 120, 87, 0.2)",
  },
  successState: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  successText: {
    fontSize: "16px",
    color: "#065f46",
    fontWeight: "600",
    lineHeight: "1.5",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #047857",
    background: "#fff",
    color: "#047857",
    fontWeight: "700",
    cursor: "pointer",
  },
  errorBox: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "14px",
    textAlign: "center",
    border: "1px solid #fecaca",
  },
}