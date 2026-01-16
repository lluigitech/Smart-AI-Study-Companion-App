"use client"

import { useState, useEffect } from "react"
import { IoCheckmarkCircle, IoCloseCircle, IoHelpCircle, IoExitOutline, IoTrophy, IoWarning } from "react-icons/io5"

const THEME = {
  primary: "#14b8a6",
  primaryDark: "#0d9488",
  primaryLight: "#ccfbf1",
  subText: "#64748b",
  bg: "#f8fafc",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
}

export default function QuizGame({ activeMaterial, onComplete }) {
  const [questions, setQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [error, setError] = useState(null)
  
  // Sa simula ng component, kasama ng ibang useState
useEffect(() => {
  localStorage.setItem('isStudySessionActive', 'true')
  return () => {
    localStorage.setItem('isStudySessionActive', 'false')
  }
}, [])

  useEffect(() => {
    setError(null)
    setQuestions([])

    if (!activeMaterial) {
      setError("No material selected. Please select a quiz to play.")
      return
    }

    if (!activeMaterial.content) {
      setError("This quiz has no content. Please edit the quiz and add questions.")
      return
    }

    let rawQuestions = []
    try {
      const content = activeMaterial.content

      if (typeof content === "string") {
        if (!content || content === "undefined" || content === "null" || content.trim() === "") {
          setError("Quiz content is empty or invalid. Please edit and add questions.")
          return
        }
        rawQuestions = JSON.parse(content)
      } else if (Array.isArray(content)) {
        rawQuestions = content
      } else if (typeof content === "object") {
        rawQuestions = JSON.parse(JSON.stringify(content))
      }
    } catch (e) {
      console.error("Error parsing content", e)
      setError("Failed to load quiz. The content format is invalid.")
      return
    }

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      setError("No questions found in this quiz. Please add some questions first.")
      return
    }

    const shuffled = rawQuestions.sort(() => Math.random() - 0.5)

    const processed = shuffled.map((q) => {
      const questionText = q.q || q.question || q.front || "No Question"

      let rawOptions = q.options || []
      let correctAnswerIndex = q.answer !== undefined ? q.answer : q.correct !== undefined ? q.correct : 0

      if (rawOptions.length === 0 && (q.a || q.back)) {
        const correctAns = q.a || q.back
        const distractors = shuffled
          .filter((item) => (item.a || item.back) !== correctAns)
          .map((item) => item.a || item.back)
          .slice(0, 3)

        rawOptions = [correctAns, ...distractors]
        correctAnswerIndex = 0
      }

      const optionsWithIndex = rawOptions.map((opt, i) => ({
        txt: opt,
        originalIdx: i,
        isCorrect: i === Number.parseInt(correctAnswerIndex),
      }))

      const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5)
      const newAnswerIndex = shuffledOptions.findIndex((o) => o.isCorrect)

      return {
        q: questionText,
        options: shuffledOptions.map((o) => o.txt),
        answer: newAnswerIndex,
      }
    })

    setQuestions(processed)
  }, [activeMaterial])

  const handleSelect = (qIndex, optIndex) => {
    if (isSubmitted) return
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
  }

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < questions.length) {
      if (!window.confirm("You have unanswered questions. Submit anyway?")) return
    }

    let calculatedScore = 0
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) calculatedScore++
    })

    setScore(calculatedScore)
    setIsSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getOptionStyle = (qIndex, optIndex, correctAnswer) => {
    const isSelected = userAnswers[qIndex] === optIndex
    const isCorrect = optIndex === correctAnswer
    const style = { ...styles.optionBtn }

    if (!isSubmitted) {
      if (isSelected) {
        style.borderColor = THEME.primary
        style.background = THEME.primaryLight
        style.color = THEME.primaryDark
        style.fontWeight = "bold"
        style.transform = "scale(1.01)"
        style.boxShadow = "0 2px 4px rgba(20, 184, 166, 0.15)"
      }
    } else {
      if (isCorrect) {
        style.borderColor = THEME.success
        style.background = "#dcfce7"
        style.color = "#166534"
        style.fontWeight = "bold"
      } else if (isSelected && !isCorrect) {
        style.borderColor = THEME.error
        style.background = "#fee2e2"
        style.color = "#991b1b"
      } else {
        style.opacity = 0.5
      }
    }
    return style
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <IoWarning size={48} color={THEME.warning} />
        <h3 style={styles.errorTitle}>Cannot Load Quiz</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={() => onComplete(0)} style={styles.backBtn}>
          Go Back
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading quiz...</div>
  }

  return (
    <div style={styles.container}>
      {isSubmitted && (
        <div style={styles.scoreCard}>
          <IoTrophy
            size={40}
            color={score > questions.length / 2 ? THEME.warning : "#cbd5e1"}
            style={{ marginBottom: 10 }}
          />
          <h2 style={{ margin: 0, fontSize: 14, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
            Quiz Result
          </h2>
          <div style={{ fontSize: 48, fontWeight: "800", color: THEME.primary, lineHeight: 1.2, margin: "5px 0" }}>
            {score} <span style={{ fontSize: 20, color: "#94a3b8", fontWeight: 600 }}>/ {questions.length}</span>
          </div>
          <div
            style={{
              fontSize: 16,
              color: score > questions.length / 2 ? THEME.success : THEME.error,
              fontWeight: "bold",
            }}
          >
            {score > questions.length / 2 ? "Great Job!" : "Keep Practicing"}
          </div>
        </div>
      )}

      <div style={styles.listContainer}>
        {questions.map((q, qIndex) => (
          <div key={qIndex} style={styles.questionCard}>
            <div style={{ marginBottom: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={styles.qNumber}>Question {qIndex + 1}</span>
              {isSubmitted &&
                (userAnswers[qIndex] === q.answer ? (
                  <span style={styles.badgeCorrect}>
                    <IoCheckmarkCircle /> Correct
                  </span>
                ) : (
                  <span style={styles.badgeWrong}>
                    <IoCloseCircle /> Wrong
                  </span>
                ))}
            </div>

            <h3 style={styles.questionText}>{q.q}</h3>

            <div style={styles.optionsGrid}>
              {q.options.map((opt, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => handleSelect(qIndex, optIndex)}
                  disabled={isSubmitted}
                  style={getOptionStyle(qIndex, optIndex, q.answer)}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "2px solid",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: "bold",
                      borderColor: isSubmitted
                        ? optIndex === q.answer
                          ? THEME.success
                          : userAnswers[qIndex] === optIndex
                            ? THEME.error
                            : "#cbd5e1"
                        : userAnswers[qIndex] === optIndex
                          ? THEME.primary
                          : "#cbd5e1",
                      background: isSubmitted
                        ? optIndex === q.answer
                          ? THEME.success
                          : userAnswers[qIndex] === optIndex
                            ? THEME.error
                            : "transparent"
                        : userAnswers[qIndex] === optIndex
                          ? THEME.primary
                          : "transparent",
                      color:
                        (isSubmitted && (optIndex === q.answer || userAnswers[qIndex] === optIndex)) ||
                        (!isSubmitted && userAnswers[qIndex] === optIndex)
                          ? "white"
                          : "#94a3b8",
                    }}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <span style={{ fontSize: 15, lineHeight: 1.4 }}>{opt}</span>
                </button>
              ))}
            </div>

            {isSubmitted && userAnswers[qIndex] !== q.answer && (
              <div style={styles.correctionBox}>
                <IoHelpCircle size={20} color={THEME.primary} style={{ flexShrink: 0 }} />
                <span>
                  Correct answer: <strong>{q.options[q.answer]}</strong>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.bottomBar}>
        {!isSubmitted ? (
          <button onClick={handleSubmit} style={styles.submitBtn}>
            Submit Quiz
          </button>
        ) : (
          <button onClick={() => onComplete(score)} style={styles.exitBtn}>
            <IoExitOutline size={20} /> Finish Review & Exit
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    paddingBottom: "100px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  scoreCard: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    marginBottom: "30px",
    border: "1px solid #e2e8f0",
  },
  questionCard: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.2s",
  },
  qNumber: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    background: "#f8fafc",
    padding: "6px 10px",
    borderRadius: "8px",
  },
  questionText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
    lineHeight: "1.6",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  optionBtn: {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "14px",
    border: "2px solid #f1f5f9",
    background: "white",
    color: "#475569",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  badgeCorrect: {
    color: "#10b981",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#dcfce7",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: 13,
  },
  badgeWrong: {
    color: "#ef4444",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#fee2e2",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: 13,
  },
  correctionBox: {
    marginTop: "20px",
    padding: "16px",
    background: "#ccfbf1",
    borderRadius: "12px",
    color: "#0d9488",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #99f6e4",
  },
  bottomBar: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
    padding: "0 20px",
  },
  submitBtn: {
    background: "#14b8a6",
    color: "white",
    padding: "16px 40px",
    borderRadius: "50px",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(20, 184, 166, 0.3)",
    width: "100%",
    maxWidth: "350px",
    transition: "transform 0.2s",
  },
  exitBtn: {
    background: "#334155",
    color: "white",
    padding: "16px 40px",
    borderRadius: "50px",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(51, 65, 85, 0.3)",
    width: "100%",
    maxWidth: "350px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
    minHeight: "300px",
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "16px 0 8px 0",
  },
  errorMessage: {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: "24px",
    maxWidth: "400px",
  },
  backBtn: {
    background: "#14b8a6",
    color: "white",
    padding: "12px 32px",
    borderRadius: "50px",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
}
