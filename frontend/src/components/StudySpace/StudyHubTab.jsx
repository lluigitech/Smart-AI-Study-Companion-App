"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { IoClose, IoTime, IoCheckmarkCircle, IoArrowUndo } from "react-icons/io5"

// Import Components
import QuizFlashcard from "./QuizFlashcard"
import DocumentViewer from "./DocumentViewer"
import StudyDashboard from "./StudyDashboard"
import SubjectView from "./SubjectView"
import QuizGame from "./QuizGame"
import NoteViewer from "./NoteViewer"
import { CreateDeckModal, CreateQuizModal, CreateNoteModal } from "./ManualContentModals"

const THEME = {
  bg: "#d1fae5",
  card: "#ffffff",
  text: "#064e3b",
  subText: "#059669",
  border: "#a7f3d0",
  primary: "#15803d",
  accent: "#a3e635",
  success: "#10b981",
  danger: "#ef4444",
}

const API_URL = "http://localhost:5000"

export default function StudyHubTab() {
  const [view, setView] = useState("dashboard")
  const [userId, setUserId] = useState(null)
  const [subjects, setSubjects] = useState([])

  // --- INITIAL LOAD ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUserId(parsed.id)
        fetchSubjects(parsed.id)
      } catch (e) {
        console.error(e)
      }
    }
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }
  }, [])

  const fetchSubjects = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/study-hub/subjects/${id}`)
      const mapped = res.data.map((sub) => ({
        id: sub.id,
        title: sub.subject_name,
        color: sub.color_theme || "#15803d",
        materials: [],
      }))
      setSubjects(mapped)
    } catch (err) {
      console.error("Fetch Error:", err)
    }
  }

  const fetchMaterials = async (subject) => {
    try {
      const res = await axios.get(`${API_URL}/api/study-hub/materials/${subject.id}`)
      const processedMaterials = res.data.map((mat) => {
        if ((mat.type === "deck" || mat.type === "quiz") && typeof mat.content === "string") {
          try {
            return { ...mat, content: JSON.parse(mat.content) }
          } catch (e) {
            return { ...mat, content: [] }
          }
        }
        return mat
      })
      setActiveSubject({ ...subject, materials: processedMaterials })
    } catch (err) {
      console.error("Err", err)
    }
  }

  const [activeSubject, setActiveSubject] = useState(null)
  const [activeMaterial, setActiveMaterial] = useState(null)

  // UI STATES
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState("CLOSED")

  // Manual Modal States
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false)
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false)
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false)
  // Forms
  const [subjectForm, setSubjectForm] = useState({ id: null, title: "", desc: "", color: "#15803d" })
  const [isEditingSubject, setIsEditingSubject] = useState(false)

  const fileInputRef = useRef(null)

  // Session Logic
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [studyTime, setStudyTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [fileUrl, setFileUrl] = useState(null)

  const [sessionResults, setSessionResults] = useState({ pointsEarned: 0, timeSpent: 0, message: "" })

  // Activity tracking states for anti-cheat system
  const [isActive, setIsActive] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showInactiveWarning, setShowInactiveWarning] = useState(false)
  const INACTIVITY_THRESHOLD = 30000 // 30 seconds

  useEffect(() => {
    if (!isTimerRunning) return

    const handleActivity = () => {
      setLastActivity(Date.now())
      setIsActive(true)
      setShowInactiveWarning(false)
      if (!isTimerRunning) setIsTimerRunning(true)
    }

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"]
    events.forEach((event) => window.addEventListener(event, handleActivity))

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
    }
  }, [isTimerRunning])

  useEffect(() => {
    if (!isTimerRunning) return

    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity
      if (timeSinceLastActivity >= INACTIVITY_THRESHOLD) {
        setIsActive(false)
        setIsTimerRunning(false)
        setShowInactiveWarning(true)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Study Session Paused", {
            body: "You're not focusing! No activity detected for 30 seconds.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          })
        }
      }
    }, 1000)

    return () => clearInterval(checkInactivity)
  }, [lastActivity, isTimerRunning])

  useEffect(() => {
    if (!isTimerRunning) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTimerRunning(false)
        setShowInactiveWarning(true)
        setIsActive(false)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Study Session Paused", {
            body: "You switched tabs! Your timer has been paused.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          })
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isTimerRunning])

  const resumeStudy = () => {
    setShowInactiveWarning(false)
    setLastActivity(Date.now())
    setIsActive(true)
    setIsTimerRunning(true)
  }

  // TIMER
  useEffect(() => {
    let interval = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime((prevTime) => prevTime + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTimer = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`
  
  const toggleMenu = (id, e) => {
    if (e) e.stopPropagation()
    setActiveMenuId((prev) => (prev === id ? "CLOSED" : id))
  }
  
  const closeAllMenus = () => {
    setActiveMenuId("CLOSED")
  }

  // --- DATABASE HANDLERS ---
  const handleSaveSubject = async (e) => {
    e.preventDefault()
    if (!subjectForm.title || !userId) return
    try {
      const endpoint = isEditingSubject ? `update/${subjectForm.id}` : `add`
      const method = isEditingSubject ? axios.put : axios.post
      await method(`${API_URL}/api/study-hub/subjects/${endpoint}`, {
        user_id: userId,
        subject_name: subjectForm.title,
        color_theme: subjectForm.color,
      })
      fetchSubjects(userId)
      setShowSubjectModal(false)
      setSubjectForm({ id: null, title: "", desc: "", color: "#15803d" })
      setIsEditingSubject(false)
    } catch (err) {
      alert("Failed")
    }
  }

  const deleteSubject = async (id) => {
    if (window.confirm("Delete subject?"))
      try {
        await axios.delete(`${API_URL}/api/study-hub/subjects/${id}`)
        fetchSubjects(userId)
      } catch (err) {}
  }

  const openSubject = (sub) => {
    setActiveSubject(sub)
    fetchMaterials(sub)
    setView("subject_content")
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    formData.append("user_id", userId)
    formData.append("subject_id", activeSubject.id)
    formData.append("type", "file")
    formData.append("title", file.name)
    try {
      await axios.post(`${API_URL}/api/study-hub/materials/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      fetchMaterials(activeSubject)
      alert("Success!")
    } catch (err) {
      alert("Upload Failed.")
    }
  }

  const addMaterialDB = async (type, title, content) => {
    try {
      const contentStr = typeof content === "object" ? JSON.stringify(content) : content

      const formData = new FormData()
      formData.append("user_id", userId)
      formData.append("subject_id", activeSubject.id)
      formData.append("type", type)
      formData.append("title", title)
      formData.append("content", contentStr)

      await axios.post(`${API_URL}/api/study-hub/materials/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      fetchMaterials(activeSubject)
    } catch (err) {
      alert("Save failed.")
    }
  }

  const handleSaveNoteEdit = async (noteId, newContent) => {
    try {
      await axios.put(`${API_URL}/api/study-hub/materials/update/${noteId}`, { content: newContent })
      fetchMaterials(activeSubject)
    } catch (err) {
      alert("Failed to save changes.")
    }
  }

  const handleSaveManualContent = async (data) => {
    await addMaterialDB(data.type, data.title, data.content)
    alert("Content saved successfully!")
  }

  const deleteMaterial = async (mat) => {
    if (window.confirm("Delete item?"))
      try {
        await axios.delete(`${API_URL}/api/study-hub/materials/${mat.id}`)
        fetchMaterials(activeSubject)
      } catch (err) {}
  }

  // ✅ Handle menu actions from SubjectView
  const handleMenuAction = async (action, config, callback) => {
  closeAllMenus()
  
  switch (action) {
    case "upload":
      fileInputRef.current.click()
      break
      
    case "manual_deck":
      setShowCreateDeckModal(true)
      break
      
    case "manual_quiz":
      setShowCreateQuizModal(true)
      break
      
    case "ai_generate_execute":
  try {
    const fileUsed =
      activeSubject.materials.find((m) => m.id == config.fileId)?.title ||
      "General";

    const res = await axios.post(`${API_URL}/api/ai/generate`, {
      topic: fileUsed,
      type: config.type,
      count: parseInt(config.count),
      difficulty: config.difficulty,
    });

    console.log("AI Response:", res.data);

    let contentToSave = null;

    // 🔹 UNIVERSAL RESPONSE HANDLER
    if (res.data?.success && res.data?.data) {
      // New standardized format
      contentToSave = res.data.data;
    } else if (config.type === "summary") {
      // Summary-specific fallback
      contentToSave = res.data.summary || res.data;
    } else if (config.type === "deck") {
      // Flashcards fallback
      contentToSave =
        res.data.cards ||
        res.data.flashcards ||
        res.data.data ||
        res.data;
    } else if (config.type === "quiz") {
      // Quiz fallback
      contentToSave =
        res.data.questions ||
        res.data.quiz ||
        res.data.data ||
        res.data;
    } else if (Array.isArray(res.data)) {
      // Old format
      contentToSave = res.data;
    }

    console.log("Content to save:", contentToSave);

    // 🛑 SAFETY CHECK
    if (!contentToSave || contentToSave.length === 0) {
      throw new Error("AI generated empty content");
    }

    const title = `AI ${
      config.type === "deck"
        ? "Flashcards"
        : config.type === "quiz"
        ? "Quiz"
        : "Summary"
    } - ${fileUsed}`;

    await addMaterialDB(config.type, title, contentToSave);

    if (callback) callback();
    alert("Generated successfully!");
  } catch (error) {
    console.error("AI Generation Failed:", error);
    if (callback) callback();
    alert(`AI Generation Failed: ${error.message}`);
  }
  break;

    default:
      console.log("Unknown action:", action)
  }
}
  
   // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
  const openMaterial = (mat) => {
  console.log("Opening material:", mat)
  
  // ✅ FOR FILES (PDF, Images, etc.) - No content validation needed
  if (mat.type === "file") {
    if (!mat.file_path) {
      alert("⚠️ File path is missing!")
      return
    }
    
    setActiveMaterial(mat)
    setFileUrl(mat.file_path)
    setStudyTime(0)
    setIsTimerRunning(true)
    setView("study_document")
    return  // ← Exit early for files
  }
  
  // ✅ FOR NOTES and SUMMARY - Plain text content
  if (mat.type === "note" || mat.type === "summary") {
    if (!mat.content || mat.content.trim().length === 0) {
      alert("⚠️ This material has no content!")
      return
    }
    
    setActiveMaterial(mat)
    setStudyTime(0)
    setIsTimerRunning(true)
    
    // For summary, use study_note view din
    setView("study_note")
    return
  }
  
  // ✅ FOR DECKS & QUIZZES - JSON content
  let contentToUse = mat.content
  
  // Parse content if it's a string
  if (typeof contentToUse === "string") {
    try {
      contentToUse = JSON.parse(contentToUse)
    } catch (e) {
      console.error("Failed to parse content:", e)
      contentToUse = []
    }
  }
  
  // Check if content is valid
  if (!contentToUse || (Array.isArray(contentToUse) && contentToUse.length === 0)) {
    alert("⚠️ This material has no content!")
    return
  }
  
  // ✨ SHUFFLE QUESTIONS/FLASHCARDS
  if (Array.isArray(contentToUse)) {
    contentToUse = shuffleArray(contentToUse)
    console.log("Shuffled content:", contentToUse)
  }
  
  setActiveMaterial({ ...mat, content: contentToUse })
  setCurrentCardIndex(0)
  setStudyTime(0)
  setIsTimerRunning(true)
  setView(mat.type === "deck" ? "study_flashcards" : "study_quiz")
}

  const endSession = async (isManualExit = false) => {
    setIsTimerRunning(false)
    if (fileUrl) {
      setFileUrl(null)
    }
    const MIN_TIME_THRESHOLD = 600
    let earnedPoints = 0

    if (studyTime >= MIN_TIME_THRESHOLD) {
      earnedPoints = 50
    }

    if (userId) {
      try {
        await axios.post(`${API_URL}/api/study/log`, {
          user_id: userId,
          duration_seconds: studyTime,
          subject: activeSubject.title,
          activity_type: activeMaterial.type,
        })
        if (earnedPoints > 0)
          await axios.post(`${API_URL}/api/points/add`, {
            userId,
            points: earnedPoints,
            reason: `Studied ${activeSubject.title}`,
          })
      } catch (e) {}
    }

    if (isManualExit && studyTime < 60) {
      setView("subject_content")
      return
    }
    setSessionResults({ pointsEarned: earnedPoints, timeSpent: studyTime, message: "Session Done" })
    setView("session_summary")
  }

  const nextCard = () => {
    if (currentCardIndex < activeMaterial.content.length - 1) setCurrentCardIndex((prev) => prev + 1)
    else endSession(false)
  }

  useEffect(() => {
    if (showSubjectModal) {
      document.body.style.overflow = "hidden"
      document.body.style.height = "100vh"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
    } else {
      document.body.style.overflow = ""
      document.body.style.height = ""
      document.body.style.position = ""
      document.body.style.width = ""
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.height = ""
      document.body.style.position = ""
      document.body.style.width = ""
    }
  }, [showSubjectModal])

  return (
    <div style={styles.container} onClick={closeAllMenus}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".pdf,.ppt,.pptx,.doc,.docx,image/*"
      />

      {view === "dashboard" && (
        <StudyDashboard
          subjects={subjects}
          openSubject={openSubject}
          toggleMenu={toggleMenu}
          activeMenuId={activeMenuId}
          onAddSubject={() => setShowSubjectModal(true)}
          onEditSubject={(sub) => {
            setSubjectForm({ id: sub.id, title: sub.title, color: sub.color })
            setIsEditingSubject(true)
            setShowSubjectModal(true)
          }}
          onDeleteSubject={deleteSubject}
        />
      )}

      {view === "subject_content" && activeSubject && (
        <SubjectView
          activeSubject={activeSubject}
          onBack={() => setView("dashboard")}
          toggleMenu={toggleMenu}
          activeMenuId={activeMenuId}
          handleMenuAction={handleMenuAction}
          openMaterial={openMaterial}
          deleteMaterial={deleteMaterial}
          onAddMaterial={addMaterialDB}
        />
      )}

      {view === "study_note" && activeMaterial && (
        <NoteViewer
          activeMaterial={activeMaterial}
          studyTime={studyTime}
          formatTimer={formatTimer}
          onBack={() => endSession(true)}
          onAIRequest={() => alert("🤖 AI Summary coming soon!")}
          onSaveEdit={handleSaveNoteEdit}
        />
      )}

      {(view === "study_flashcards" || view === "study_quiz") && (
        <div style={styles.studyContainer}>
          {showInactiveWarning && (
            <div style={styles.inactiveOverlay}>
              <div style={styles.inactiveCard}>
                <div style={styles.inactiveIcon}>⚠️</div>
                <h2 style={styles.inactiveTitle}>You're Not Focusing!</h2>
                <p style={styles.inactiveText}>
                  We detected no activity for 30 seconds or you switched tabs. Your timer has been paused.
                </p>
                <button onClick={resumeStudy} style={styles.resumeBtn}>
                  Resume Studying
                </button>
              </div>
            </div>
          )}
          <div style={styles.headerRow}>
            <button onClick={() => endSession(true)} style={styles.backBtn}>
              <IoArrowUndo /> Back
            </button>
            <div style={styles.timerBadge}>
              <IoTime size={14} /> {formatTimer(studyTime)}
            </div>
          </div>
          {view === "study_flashcards" ? (
            <div style={styles.flashcardWrapper}>
              <QuizFlashcard
                question={
                  activeMaterial.content[currentCardIndex]?.q || activeMaterial.content[currentCardIndex]?.front
                }
                answer={activeMaterial.content[currentCardIndex]?.a || activeMaterial.content[currentCardIndex]?.back}
                onNext={nextCard}
              />
            </div>
          ) : (
            <QuizGame activeMaterial={activeMaterial} onComplete={() => endSession(false)} />
          )}
        </div>
      )}

      {view === "study_document" && (
        <DocumentViewer
          activeMaterial={activeMaterial}
          fileUrl={fileUrl}
          studyTime={studyTime}
          formatTimer={formatTimer}
          endSession={() => endSession(true)}
          onAIRequest={() => alert("🤖 AI Summary coming soon!")}
        />
      )}

      {view === "study_note" && showInactiveWarning && (
        <div style={styles.inactiveOverlay}>
          <div style={styles.inactiveCard}>
            <div style={styles.inactiveIcon}>⚠️</div>
            <h2 style={styles.inactiveTitle}>You're Not Focusing!</h2>
            <p style={styles.inactiveText}>
              We detected no activity for 30 seconds or you switched tabs. Your timer has been paused.
            </p>
            <button onClick={resumeStudy} style={styles.resumeBtn}>
              Resume Studying
            </button>
          </div>
        </div>
      )}

      {view === "session_summary" && (
        <div style={styles.summaryCard}>
          <IoCheckmarkCircle size={60} color={THEME.success} style={{ marginBottom: 15 }} />
          <h2 style={{ color: THEME.text, margin: 0 }}>{sessionResults.message}</h2>
          <div style={styles.rewardBox}>
            <p style={{ fontSize: "14px", color: THEME.subText, marginBottom: "10px" }}>Time Studied</p>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: THEME.text }}>
              {formatTimer(sessionResults.timeSpent)}
            </div>
          </div>
          <button style={styles.finishBtn} onClick={() => setView("subject_content")}>
            Back to Folder
          </button>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {showSubjectModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ color: THEME.text, margin: 0, fontSize: "20px", fontWeight: "700" }}>
                {isEditingSubject ? "Edit Subject" : "Create Subject"}
              </h3>
              <button
                onClick={() => setShowSubjectModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                <IoClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} style={styles.form}>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: THEME.text,
                    marginBottom: "8px",
                    display: "block",
                    letterSpacing: "0.5px",
                  }}
                >
                  Subject Name
                </label>
                <input
                  style={{
                    ...styles.input,
                    fontSize: "15px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    transition: "all 0.2s ease",
                  }}
                  value={subjectForm.title}
                  onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  required
                  placeholder="e.g. Mathematics, Physics, History"
                  onFocus={(e) => {
                    e.target.style.borderColor = THEME.primary
                    e.target.style.boxShadow = `0 0 0 3px ${THEME.primary}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: THEME.text,
                    marginBottom: "12px",
                    display: "block",
                    letterSpacing: "0.5px",
                  }}
                >
                  Choose Color Theme
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "10px",
                    padding: "4px",
                  }}
                >
                  {[
                    "#ef4444",
                    "#f97316",
                    "#f59e0b",
                    "#eab308",
                    "#84cc16",
                    "#22c55e",
                    "#10b981",
                    "#14b8a6",
                    "#06b6d4",
                    "#3b82f6",
                    "#6366f1",
                    "#8b5cf6",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSubjectForm({ ...subjectForm, color })}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        backgroundColor: color,
                        border: subjectForm.color === color ? "3px solid #1f2937" : "2px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: subjectForm.color === color ? "scale(1.15)" : "scale(1)",
                        boxShadow:
                          subjectForm.color === color
                            ? `0 8px 20px ${color}60, 0 0 0 4px ${color}20`
                            : "0 2px 6px rgba(0, 0, 0, 0.1)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        if (subjectForm.color !== color) {
                          e.currentTarget.style.transform = "scale(1.1)"
                          e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (subjectForm.color !== color) {
                          e.currentTarget.style.transform = "scale(1)"
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)"
                        }
                      }}
                    >
                      {subjectForm.color === color && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                style={{
                  ...styles.saveBtn,
                  background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.success} 100%)`,
                  fontSize: "15px",
                  fontWeight: "600",
                  padding: "14px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.3s ease",
                  letterSpacing: "0.5px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)"
                }}
              >
                {isEditingSubject ? "Update Subject" : "Create Subject"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL CONTENT MODALS */}
      <CreateDeckModal
        isOpen={showCreateDeckModal}
        onClose={() => setShowCreateDeckModal(false)}
        onSave={handleSaveManualContent}
      />

      <CreateQuizModal
        isOpen={showCreateQuizModal}
        onClose={() => setShowCreateQuizModal(false)}
        onSave={handleSaveManualContent}

      
      />

      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        onSave={handleSaveManualContent}
      />
    </div>
  )
}

const styles = {
  container: {
    paddingBottom: "100px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)",
    backgroundSize: "200% 200%",
    animation: "gradientShift 15s ease infinite",
  },
  studyContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "0 20px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
  },
  flashcardWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  backBtn: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(167, 243, 208, 0.3)",
    color: THEME.primary,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "600",
    padding: "10px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  },
  timerBadge: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    padding: "10px 20px",
    borderRadius: "20px",
    color: THEME.primary,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 5,
    border: "1px solid rgba(167, 243, 208, 0.3)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  summaryCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    padding: "80px 40px",
    borderRadius: "32px",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    maxWidth: "800px",
    width: "90%",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid rgba(167, 243, 208, 0.3)",
  },
  rewardBox: {
    margin: "30px 0",
    padding: "30px",
    background: "rgba(209, 250, 229, 0.5)",
    borderRadius: "24px",
    border: "1px solid rgba(167, 243, 208, 0.5)",
    width: "100%",
    maxWidth: "500px",
  },
  finishBtn: {
    background: THEME.primary,
    color: "white",
    padding: "20px 40px",
    borderRadius: "16px",
    border: "none",
    fontWeight: "800",
    width: "100%",
    maxWidth: "400px",
    cursor: "pointer",
    fontSize: "18px",
    boxShadow: "0 10px 20px rgba(21, 128, 61, 0.3)",
    transition: "all 0.3s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    backdropFilter: "blur(20px)",
    overflow: "hidden",
  },
  modal: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    padding: "30px",
    borderRadius: "24px",
    width: "90%",
    maxWidth: "380px",
    maxHeight: "90vh",
    overflowY: "auto",
    border: "1px solid rgba(167, 243, 208, 0.3)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    position: "relative",
    zIndex: 1000000,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #a7f3d0",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    transition: "all 0.3s ease",
    background: "rgba(255, 255, 255, 0.9)",
  },
  saveBtn: {
    background: THEME.primary,
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
    transition: "all 0.3s ease",
  },
  inactiveOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  inactiveCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "40px",
    maxWidth: "440px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  inactiveIcon: {
    fontSize: "64px",
    animation: "pulse 2s infinite",
  },
  inactiveTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ef4444",
    margin: 0,
  },
  inactiveText: {
    fontSize: "15px",
    color: "#6b7280",
    lineHeight: "1.6",
    margin: 0,
  },
  resumeBtn: {
    background: "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
    transition: "all 0.3s ease",
    width: "100%",
  },
}