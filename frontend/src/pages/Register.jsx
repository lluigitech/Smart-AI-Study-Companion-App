"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoCalendarOutline,
  IoLibrary,
  IoArrowForward,
  IoArrowBack,
  IoSparkles,
  IoCheckmarkCircle,
  IoLogoGoogle,
  IoTerminal,
  IoFlashOutline,
} from "react-icons/io5"

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"

function GoogleRegisterButton({ setLoading, setMessage, navigate }) {
  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setMessage("")
      try {
        const res = await axios.post("http://localhost:5000/api/google-login", {
          access_token: tokenResponse.access_token,
        })
        localStorage.setItem("user", JSON.stringify(res.data.user))
        localStorage.setItem("userId", res.data.user.id)
        navigate("/dashboard")
      } catch (err) {
        setMessage(err.response?.data?.message || "Google registration failed.")
      } finally {
        setLoading(false)
      }
    },
    onError: () => setMessage("Google Authentication Error"),
  })

  return (
    <button type="button" style={styles.googleBtn} onClick={() => registerWithGoogle()}>
      <IoLogoGoogle size={20} color="#4285F4" /> Continue with Google
    </button>
  )
}

function RegisterForm({ 
  step, 
  setStep, 
  formData, 
  handleChange, 
  handleSubmit, 
  loading, 
  message, 
  navigate, 
  setLoading, 
  setMessage,
  isMobileView = false 
}) {
  return (
    <>
      <div style={styles.header}>
        <h2 style={{ ...styles.title, fontSize: isMobileView ? "22px" : "26px" }}>
          {step === 1 ? "Create Account" : "Complete Profile"}
        </h2>
        <p style={styles.subtitle}>
          {step === 1 ? "Let's get started with your basic info" : "Set up your account security"}
        </p>
      </div>

      {message && <div style={styles.errorBox}>{message}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {step === 1 ? (
          <>
            <div style={{ ...styles.inputRow, flexDirection: isMobileView ? "column" : "row" }}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>FIRST NAME</label>
                <div style={styles.inputContainer}>
                  <IoPersonOutline style={styles.inputIcon} size={18} />
                  <input
                    name="first_name"
                    placeholder="Juan"
                    style={styles.input}
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>LAST NAME</label>
                <div style={styles.inputContainer}>
                  <IoPersonOutline style={styles.inputIcon} size={18} />
                  <input
                    name="last_name"
                    placeholder="Dela Cruz"
                    style={styles.input}
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                MIDDLE NAME <span style={styles.optional}>(Optional)</span>
              </label>
              <div style={styles.inputContainer}>
                <IoPersonOutline style={styles.inputIcon} size={18} />
                <input
                  name="middle_name"
                  placeholder="Santos"
                  style={styles.input}
                  value={formData.middle_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>BIRTHDAY</label>
              <div style={styles.inputContainer}>
                <IoCalendarOutline style={styles.inputIcon} size={18} />
                <input
                  name="birthday"
                  type="date"
                  style={styles.dateInput}
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="button" style={styles.submitBtn} onClick={() => setStep(2)}>
              Continue <IoArrowForward size={18} />
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>OR</span>
              <div style={styles.dividerLine}></div>
            </div>

            <GoogleRegisterButton setLoading={setLoading} setMessage={setMessage} navigate={navigate} />
          </>
        ) : (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <div style={styles.inputContainer}>
                <IoMailOutline style={styles.inputIcon} size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  style={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>PASSWORD</label>
              <div style={styles.inputContainer}>
                <IoLockClosedOutline style={styles.inputIcon} size={18} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  style={styles.input}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={styles.hint}>At least 8 characters recommended</div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>CONFIRM PASSWORD</label>
              <div style={styles.inputContainer}>
                <IoLockClosedOutline style={styles.inputIcon} size={18} />
                <input
                  name="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  style={styles.input}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button type="button" style={styles.backBtn} onClick={() => setStep(1)}>
                <IoArrowBack size={18} />
              </button>
              <button type="submit" style={styles.submitBtnFlex} disabled={loading}>
                {loading ? "Creating..." : "Create Account"} {!loading && <IoCheckmarkCircle size={18} />}
              </button>
            </div>
          </>
        )}
      </form>

      <div style={styles.footer}>
        Already have an account?{" "}
        <span style={styles.signInLink} onClick={() => navigate("/login")}>
          Sign In
        </span>
      </div>
    </>
  )
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    birthday: "",
    email: "",
    password: "",
    confirm_password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200)
  const navigate = useNavigate()

  const googleClientId = "972820786656-hdl7scf0j1r83fv7gh4pg7o6q8lph5of.apps.googleusercontent.com"

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowWidth < 768
  const isIPad = windowWidth >= 768 && windowWidth < 1024
  const isDesktop = windowWidth >= 1024

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (formData.password !== formData.confirm_password) {
      setMessage("Passwords do not match!")
      return
    }

    setLoading(true)
    try {
      const autoUsername = (formData.first_name + Math.floor(Math.random() * 1000)).toLowerCase().replace(/\s/g, "")
      const payload = { ...formData, username: autoUsername }
      await axios.post("http://localhost:5000/api/register", payload)
      alert("Registration Successful! Please Login.")
      navigate("/login")
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div style={styles.container}>
        {/* Interactive Background */}
        <div style={styles.meshGradient}></div>
        <div style={styles.gridOverlay}></div>

        {/* Animated blobs */}
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
        <div style={styles.blob4}></div>

        {/* Floating orbs */}
        <div style={styles.orb1}></div>
        <div style={styles.orb2}></div>
        <div style={styles.orb3}></div>
        <div style={styles.orb4}></div>
        <div style={styles.orb5}></div>

        {isDesktop && (
          <div style={styles.desktopWrapper}>
            {/* Sidebar - dark green theme */}
            <div style={styles.sidebar}>
              <div style={styles.sidebarInner}>
                {/* Brand */}
                <div style={styles.brand}>
                  <div style={styles.logoBox}>
                    <IoLibrary size={24} color="#fff" />
                  </div>
                  <div>
                    <div style={styles.brandName}>Smart AI</div>
                    <div style={styles.brandTag}>Study Companion</div>
                  </div>
                </div>

                {/* Hero Text */}
                <div style={styles.heroSection}>
                  <h1 style={styles.heroTitle}>
                    Transform Your
                    <br />
                    Learning <span style={styles.heroHighlight}>Experience.</span>
                  </h1>
                  <p style={styles.heroDesc}>Join thousands of students using AI to study smarter, not harder.</p>
                </div>

                {/* Features */}
                <div style={styles.features}>
                  <div style={styles.featureItem}>
                    <IoSparkles size={18} color="#66bb6a" />
                    <span>AI Summary Tools</span>
                  </div>
                  <div style={styles.featureItem}>
                    <IoTerminal size={18} color="#66bb6a" />
                    <span>Task Automation</span>
                  </div>
                  <div style={styles.featureItem}>
                    <IoFlashOutline size={18} color="#66bb6a" />
                    <span>Smart Flashcards</span>
                  </div>
                </div>

                {/* Step Progress */}
                <div style={styles.stepProgress}>
                  <div style={styles.stepLabel}>STEP {step} OF 2</div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: step === 1 ? "50%" : "100%" }}></div>
                  </div>
                </div>

                {/* Footer */}
                <div style={styles.sidebarFooter}>© 2026 Smart AI Study Companion</div>
              </div>
            </div>

            {/* Form Side - white background */}
            <div style={styles.formSide}>
              <div style={styles.formBox}>
                <RegisterForm 
                  step={step}
                  setStep={setStep}
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  message={message}
                  navigate={navigate}
                  setLoading={setLoading}
                  setMessage={setMessage}
                />
              </div>
            </div>
          </div>
        )}

        {(isMobile || isIPad) && (
          <div style={styles.mobileWrapper}>
            {/* Floating logo pill */}
            <div
              style={{
                ...styles.mobileLogo,
                marginBottom: isMobile ? "20px" : "28px",
              }}
            >
              <div style={styles.mobileLogoBox}>
                <IoLibrary size={isMobile ? 22 : 26} color="#fff" />
              </div>
              <div>
                <div style={{ ...styles.mobileLogoName, fontSize: isMobile ? "16px" : "18px" }}>Smart AI</div>
                <div style={styles.mobileLogoTag}>Study Companion</div>
              </div>
            </div>

            {/* Step badge for mobile/iPad */}
            <div style={styles.stepBadge}>Step {step} of 2</div>

            {/* Form Card */}
            <div
              style={{
                ...styles.mobileCard,
                padding: isMobile ? "24px 20px" : "32px 28px",
                maxWidth: isMobile ? "360px" : "440px",
              }}
            >
              <RegisterForm 
                step={step}
                setStep={setStep}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                message={message}
                navigate={navigate}
                setLoading={setLoading}
                setMessage={setMessage}
                isMobileView={isMobile}
              />
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

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
    maxHeight: "680px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 25px 80px rgba(46, 125, 50, 0.2)",
    position: "relative",
    zIndex: 1,
  },

  sidebar: {
    width: "420px",
    background: "linear-gradient(180deg, #1b5e20 0%, #2e7d32 100%)",
    padding: "40px 36px",
    display: "flex",
    flexDirection: "column",
  },
  sidebarInner: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "40px",
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

  heroSection: {
    marginBottom: "32px",
  },
  heroTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.2",
    letterSpacing: "-1px",
    marginBottom: "14px",
  },
  heroHighlight: {
    color: "#a5d6a7",
  },
  heroDesc: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: "1.6",
    maxWidth: "280px",
  },

  features: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "auto",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "500",
  },

  stepProgress: {
    marginTop: "24px",
  },
  stepLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: "1px",
    marginBottom: "8px",
  },
  progressBar: {
    height: "4px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #66bb6a 0%, #a5d6a7 100%)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },

  sidebarFooter: {
    marginTop: "24px",
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.5)",
  },

  formSide: {
    flex: 1,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    overflowY: "auto",
  },
  formBox: {
    width: "100%",
    maxWidth: "380px",
  },

  // Mobile/iPad wrapper
  mobileWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: "20px",
    position: "relative",
    zIndex: 1,
  },
  mobileLogo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 18px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(46, 125, 50, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
  mobileLogoBox: {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
  },
  mobileLogoName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1b5e20",
  },
  mobileLogoTag: {
    fontSize: "11px",
    color: "#2e7d32",
    fontWeight: "500",
  },

  stepBadge: {
    padding: "6px 14px",
    background: "rgba(46, 125, 50, 0.1)",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: "16px",
  },

  mobileCard: {
    width: "100%",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(46, 125, 50, 0.18), 0 8px 24px rgba(46, 125, 50, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    maxHeight: "calc(100vh - 160px)",
    overflowY: "auto",
  },

  // Form styles
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#666",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    marginBottom: "14px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputRow: {
    display: "flex",
    gap: "14px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#666",
    letterSpacing: "0.5px",
  },
  optional: {
    fontWeight: "400",
    color: "#999",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    background: "#f8f9fa",
    border: "1.5px solid #e9ecef",
    borderRadius: "10px",
    padding: "0 12px",
    transition: "all 0.2s ease",
  },
  inputIcon: {
    color: "#999",
    marginRight: "10px",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "14px",
    color: "#1b5e20",
    outline: "none",
  },
  dateInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "14px",
    color: "#1b5e20",
    outline: "none",
    cursor: "pointer",
    colorScheme: "light",
    fontFamily: "inherit",
  },
  select: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "14px",
    color: "#1b5e20",
    outline: "none",
    cursor: "pointer",
  },
  hint: {
    fontSize: "10px",
    color: "#999",
    marginTop: "2px",
  },

  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(46, 125, 50, 0.3)",
    transition: "all 0.2s ease",
    marginTop: "4px",
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "4px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    background: "#f8f9fa",
    border: "1.5px solid #e9ecef",
    borderRadius: "10px",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  submitBtnFlex: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(46, 125, 50, 0.3)",
    transition: "all 0.2s ease",
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
    background: "#e9ecef",
  },
  dividerText: {
    fontSize: "11px",
    color: "#999",
    fontWeight: "500",
  },

  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px",
    background: "#fff",
    border: "1.5px solid #e9ecef",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#333",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "13px",
    color: "#666",
  },
  signInLink: {
    color: "#2e7d32",
    fontWeight: "600",
    cursor: "pointer",
  },
}
