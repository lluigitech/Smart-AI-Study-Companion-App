"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline,
  IoLibrary, IoArrowForward, IoSparkles, IoLogoGoogle, IoTerminal,
  IoArrowBackOutline, IoFlashOutline,
} from "react-icons/io5"
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"

// --- 1. ILABAS ANG COMPONENTS SA MAIN FUNCTION PARA HINDI MAWALA ANG FOCUS ---

function GoogleLoginButton({ setLoading, setMessage, navigate }) {
  const login = useGoogleLogin({
    ux_mode: "redirect",
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const res = await axios.post("http://localhost:5000/api/google-login", {
          access_token: tokenResponse.access_token,
        })
        localStorage.setItem("user", JSON.stringify(res.data.user))
        localStorage.setItem("userId", res.data.user.id)
        navigate("/dashboard")
      } catch (err) {
        setMessage(err.response?.data?.message || "Google Login failed.")
      } finally {
        setLoading(false)
      }
    },
    onError: () => setMessage("Google Authentication Error. Please try again."),
  })

  return (
    <button type="button" style={styles.googleBtn} onClick={() => login()}>
      <IoLogoGoogle size={20} color="#4285F4" /> Continue with Google
    </button>
  )
}

// Inilabas ang LoginForm para manatili ang cursor focus
const LoginForm = ({ 
  view, setView, email, setEmail, password, setPassword, 
  showPassword, setShowPassword, handleLogin, handleForgotPassword,
  loading, message, isMobile, navigate, setLoading, setMessage 
}) => (
  <>
    <div style={styles.header}>
      <h2 style={{ ...styles.title, fontSize: isMobile ? "24px" : "28px" }}>
        {view === "login" ? "Welcome back" : "Reset Password"}
      </h2>
      <p style={styles.subtitle}>
        {view === "login" ? "Sign in to continue your journey" : "Enter your email for the reset link"}
      </p>
    </div>

    {message && <div style={styles.errorBox}>{message}</div>}

    {view === "login" ? (
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>EMAIL</label>
          <div style={styles.inputContainer}>
            <IoMailOutline style={styles.inputIcon} size={18} />
            <input
              type="email"
              autoComplete="off" // PARA HINDI MAG-AUTOFILL
              placeholder="email@student.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div style={styles.inputGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>PASSWORD</label>
            <span style={styles.forgotLink} onClick={() => setView("forgot")}>
              Forgot password?
            </span>
          </div>
          <div style={styles.inputContainer}>
            <IoLockClosedOutline style={styles.inputIcon} size={18} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password" // PARA TANGGALIN ANG SAVED PASSWORD
              placeholder="••••••••••••••••"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"} {!loading && <IoArrowForward size={18} />}
        </button>
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine}></div>
        </div>
        <GoogleLoginButton setLoading={setLoading} setMessage={setMessage} navigate={navigate} />
      </form>
    ) : (
      <form onSubmit={handleForgotPassword} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>REGISTERED EMAIL</label>
          <div style={styles.inputContainer}>
            <IoMailOutline style={styles.inputIcon} size={18} />
            <input
              type="email"
              placeholder="your@email.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>
        <button type="button" onClick={() => setView("login")} style={styles.backBtn}>
          <IoArrowBackOutline size={18} /> Back to Login
        </button>
      </form>
    )}

    {view === "login" && (
      <div style={styles.footer}>
        Don't have an account?{" "}
        <span style={styles.signUpLink} onClick={() => navigate("/register")}>
          Sign up
        </span>
      </div>
    )}
  </>
);

// --- 2. MAIN COMPONENT ---

export default function Login() {
  const [view, setView] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const navigate = useNavigate()

  const googleClientId = "972820786656-hdl7scf0j1r83fv7gh4pg7o6q8lph5of.apps.googleusercontent.com"

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isDesktop = windowWidth >= 1024

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password })
      localStorage.setItem("user", JSON.stringify(res.data.user))
      localStorage.setItem("userId", res.data.user.id)
      navigate("/dashboard")
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      await axios.post("http://localhost:5000/api/forgot-password", { email })
      setMessage("Success! Reset link sent to your email.")
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset link.")
    } finally {
      setLoading(false)
    }
  }

  // Ginawang Memoized ang background para hindi mag-lag ang GPU
  const AnimatedBG = useMemo(() => (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <div style={styles.meshGradient}></div>
      <div style={styles.gridOverlay}></div>
      <div style={{...styles.blob1, transform: 'translateZ(0)'}}></div>
      <div style={{...styles.blob2, transform: 'translateZ(0)'}}></div>
      <div style={{...styles.blob3, transform: 'translateZ(0)'}}></div>
      <div style={{...styles.blob4, transform: 'translateZ(0)'}}></div>
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>
    </div>
  ), []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div style={styles.container}>
        {AnimatedBG}

        <div style={isDesktop ? styles.desktopWrapper : styles.mobileWrapper}>
          {isDesktop && (
            <div style={styles.sidebar}>
               <div style={styles.brand}>
                  <div style={styles.logoBox}><IoLibrary size={24} color="#fff" /></div>
                  <div>
                    <div style={styles.brandName}>Smart AI</div>
                    <div style={styles.brandTag}>Study Companion</div>
                  </div>
                </div>
                <div style={styles.heroSection}>
                  <h1 style={styles.heroTitle}>Focus more,<br />study <span style={styles.heroHighlight}>Smarter.</span></h1>
                  <p style={styles.heroDesc}>Eliminate academic stress with AI-powered tools designed for modern students.</p>
                </div>
                <div style={styles.features}>
                  <div style={styles.featureItem}><IoSparkles size={18} color="#66bb6a" /><span>AI Summary Tools</span></div>
                  <div style={styles.featureItem}><IoTerminal size={18} color="#66bb6a" /><span>Task Automation</span></div>
                </div>
                <div style={styles.sidebarFooter}>© 2026 Smart AI Study Companion</div>
            </div>
          )}

          <div style={isDesktop ? styles.formSide : styles.mobileCard}>
            <div style={styles.formBox}>
              <LoginForm 
                view={view} setView={setView} email={email} setEmail={setEmail}
                password={password} setPassword={setPassword} showPassword={showPassword}
                setShowPassword={setShowPassword} handleLogin={handleLogin}
                handleForgotPassword={handleForgotPassword} loading={loading}
                message={message} isMobile={!isDesktop} navigate={navigate}
                setLoading={setLoading} setMessage={setMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

// ... (retain your styles exactly as they are)

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    background: "#e8f5e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  meshGradient: {
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(102, 187, 106, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(165, 214, 167, 0.5) 0%, transparent 50%),
      radial-gradient(ellipse at 40% 80%, rgba(129, 199, 132, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 70%, rgba(200, 230, 201, 0.6) 0%, transparent 50%),
      linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)
    `,
    pointerEvents: "none",
  },

  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(46, 125, 50, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(46, 125, 50, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },

  blob1: {
    position: "absolute",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(102, 187, 106, 0.25) 0%, rgba(102, 187, 106, 0.05) 50%, transparent 70%)",
    top: "-200px",
    right: "-150px",
    animation: "float 15s ease-in-out infinite",
    pointerEvents: "none",
    filter: "blur(40px)",
  },
  blob2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.05) 50%, transparent 70%)",
    bottom: "-150px",
    left: "-100px",
    animation: "float 18s ease-in-out infinite reverse",
    pointerEvents: "none",
    filter: "blur(30px)",
  },
  blob3: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(129, 199, 132, 0.3) 0%, transparent 60%)",
    top: "50%",
    left: "10%",
    transform: "translateY(-50%)",
    animation: "float 12s ease-in-out infinite 2s",
    pointerEvents: "none",
    filter: "blur(50px)",
  },
  blob4: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(165, 214, 167, 0.35) 0%, transparent 60%)",
    top: "20%",
    right: "20%",
    animation: "float 20s ease-in-out infinite 4s",
    pointerEvents: "none",
    filter: "blur(35px)",
  },

  orb1: {
    position: "absolute",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "rgba(67, 160, 71, 0.6)",
    boxShadow: "0 0 20px rgba(67, 160, 71, 0.4), 0 0 40px rgba(67, 160, 71, 0.2)",
    top: "15%",
    left: "20%",
    animation: "pulse 4s ease-in-out infinite, float 8s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "rgba(102, 187, 106, 0.7)",
    boxShadow: "0 0 15px rgba(102, 187, 106, 0.5), 0 0 30px rgba(102, 187, 106, 0.3)",
    top: "70%",
    right: "15%",
    animation: "pulse 5s ease-in-out infinite 1s, float 10s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "rgba(46, 125, 50, 0.5)",
    boxShadow: "0 0 12px rgba(46, 125, 50, 0.4)",
    bottom: "25%",
    left: "70%",
    animation: "pulse 6s ease-in-out infinite 2s, float 12s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb4: {
    position: "absolute",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "rgba(129, 199, 132, 0.6)",
    boxShadow: "0 0 18px rgba(129, 199, 132, 0.5)",
    top: "40%",
    left: "8%",
    animation: "pulse 7s ease-in-out infinite 3s, float 14s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  orb5: {
    position: "absolute",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "rgba(76, 175, 80, 0.65)",
    boxShadow: "0 0 14px rgba(76, 175, 80, 0.4)",
    top: "25%",
    right: "30%",
    animation: "pulse 5s ease-in-out infinite 1.5s, float 9s ease-in-out infinite",
    pointerEvents: "none",
  },

  // Desktop layout
  desktopWrapper: {
    display: "flex",
    width: "100%",
    maxWidth: "1000px",
    height: "auto",
    maxHeight: "650px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 25px 80px rgba(46, 125, 50, 0.2)",
    position: "relative",
    zIndex: 1,
  },

  sidebar: {
    width: "420px",
    background: "linear-gradient(180deg, #1b5e20 0%, #2e7d32 100%)",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
  },
  sidebarInner: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  // Brand
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "48px",
  },
  logoBox: {
    width: "48px",
    height: "48px",
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  brandTag: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#a5d6a7",
    marginTop: "2px",
  },

  // Hero section
  heroSection: {
    marginBottom: "40px",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.2",
    letterSpacing: "-1px",
    marginBottom: "16px",
  },
  heroHighlight: {
    color: "#a5d6a7",
  },
  heroDesc: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: "1.6",
    maxWidth: "300px",
  },

  // Features
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "auto",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
  },
  sidebarFooter: {
    marginTop: "32px",
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.5)",
  },

  formSide: {
    flex: 1,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
  },
  formBox: {
    width: "100%",
    maxWidth: "340px",
  },

  // Mobile wrapper
  mobileWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: "24px",
    position: "relative",
    zIndex: 1,
  },
  mobileLogo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 20px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(46, 125, 50, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
  mobileLogoBox: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
  },
  mobileLogoName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1b5e20",
  },
  mobileLogoTag: {
    fontSize: "12px",
    color: "#2e7d32",
    fontWeight: "500",
  },
  mobileCard: {
    width: "100%",
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 20px 60px rgba(46, 125, 50, 0.18), 0 8px 24px rgba(46, 125, 50, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
  },

  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#666",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "16px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#666",
    letterSpacing: "0.5px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    fontSize: "12px",
    color: "#2e7d32",
    cursor: "pointer",
    fontWeight: "500",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    background: "#f5f5f5",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    padding: "0 14px",
    transition: "all 0.2s ease",
  },
  inputIcon: {
    color: "#888",
    marginRight: "10px",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "14px 0",
    fontSize: "14px",
    color: "#333",
  },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "4px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e0e0e0",
  },
  dividerText: {
    fontSize: "11px",
    color: "#999",
    fontWeight: "500",
  },
  googleBtn: {
    width: "100%",
    padding: "14px",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    color: "#333",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s ease",
  },
  backBtn: {
    width: "100%",
    padding: "14px",
    background: "transparent",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    color: "#666",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "13px",
    color: "#666",
  },
  signUpLink: {
    color: "#2e7d32",
    fontWeight: "600",
    cursor: "pointer",
  },
}
