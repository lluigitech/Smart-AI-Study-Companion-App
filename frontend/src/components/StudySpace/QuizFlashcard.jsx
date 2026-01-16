"use client"

import { useState, useEffect } from "react"
import { FiCheck, FiX, FiEye, FiArrowRight, FiAward, FiZap, FiRefreshCw } from "react-icons/fi"

const QuizFlashcard = ({ question, answer, onNext }) => {
  const [userAnswer, setUserAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [shake, setShake] = useState(false)
// 🔥 HIDE BOTTOM NAV WHEN THIS COMPONENT MOUNTS
  useEffect(() => {
    localStorage.setItem('isStudySessionActive', 'true')
    
    return () => {
      // Show bottom nav again when component unmounts
      localStorage.setItem('isStudySessionActive', 'false')
    }
  }, [])
  useEffect(() => {
    setUserAnswer("")
    setShowAnswer(false)
    setFeedback(null)
    setHasAnswered(false)
    setShake(false)
  }, [question, answer])

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setFeedback({
        type: "empty",
        message: "🤔 Oops! Don't forget to type your answer first!",
      })
      return
    }

    const normalize = (str) => str.toLowerCase().trim().replace(/[.,!?;]/g, "")
    const userNormalized = normalize(userAnswer)
    const correctNormalized = normalize(answer)
    const similarity = calculateSimilarity(userNormalized, correctNormalized)

    if (similarity > 0.8 || userNormalized === correctNormalized) {
      const messages = [
        "🎉 Fantastic! You absolutely nailed it!",
        "✨ Brilliant! That's spot on!",
        "🌟 Incredible! You're on fire!",
        "🎯 Perfect answer! Keep crushing it!",
        "💯 Outstanding work! You got this!",
      ]
      setFeedback({
        type: "correct",
        message: messages[Math.floor(Math.random() * messages.length)],
      })
      setHasAnswered(true)
    } else if (similarity > 0.5) {
      setFeedback({
        type: "close",
        message: "🤔 You're really close! Just need a bit more detail. Try again or peek at the answer!",
      })
    } else {
      const messages = [
        "❌ Not quite there yet! But hey, mistakes help us learn. Give it another shot!",
        "💭 Hmm, that's not it. Take your time and think it through!",
        "🔄 Oops! Not the right answer, but don't worry—you've got this!",
        "🎓 Not correct this time, but every try gets you closer!",
      ]
      setFeedback({
        type: "wrong",
        message: messages[Math.floor(Math.random() * messages.length)],
      })
    }
  }

  const calculateSimilarity = (str1, str2) => {
    const words1 = str1.split(" ")
    const words2 = str2.split(" ")
    let matches = 0

    words1.forEach((word) => {
      if (words2.includes(word) && word.length > 2) {
        matches++
      }
    })

    return matches / Math.max(words1.length, words2.length)
  }

  const handleRevealAnswer = () => {
    setShowAnswer(true)
    setFeedback({
      type: "revealed",
      message: "💡 No worries! Here's the answer. Study it and you'll remember next time!",
    })
  }

  const handleNextCard = () => {
    setUserAnswer("")
    setShowAnswer(false)
    setFeedback(null)
    setHasAnswered(false)
    setShake(false)
    if (onNext) onNext()
  }

  if (!question || !answer) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIconWrapper}>
          <FiX size={48} />
        </div>
        <h2 style={styles.errorTitle}>Card Error</h2>
        <p style={styles.errorText}>Missing question or answer data</p>
        <button onClick={handleNextCard} style={styles.skipButton}>
          Skip Card
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header Badge */}
      <div style={styles.headerBadge}>
        <div style={styles.badgeIcon}>
          <FiZap size={16} />
        </div>
        <span style={styles.badgeText}>Active Learning Mode</span>
      </div>

      {/* Main Card */}
      <div style={shake ? { ...styles.mainCard, animation: "shake 0.5s" } : styles.mainCard}>
        {/* Question Section */}
        <div style={styles.questionSection}>
          <div style={styles.questionHeader}>
            <span style={styles.questionLabel}>QUESTION</span>
            <div style={styles.questionDots}>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
            </div>
          </div>
          <h2 style={styles.questionText}>{question}</h2>
        </div>

        {/* Answer Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputHeader}>
            <label style={styles.inputLabel}>Your Answer:</label>
            {userAnswer && !hasAnswered && !showAnswer && (
              <span style={styles.charCount}>{userAnswer.length} characters</span>
            )}
          </div>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                checkAnswer()
              }
            }}
            placeholder="Type your answer here... (Press Enter to submit)"
            disabled={hasAnswered || showAnswer}
            style={{
              ...styles.textarea,
              borderColor: feedback?.type === "correct"
                ? "#10b981"
                : feedback?.type === "wrong"
                  ? "#ef4444"
                  : feedback?.type === "close"
                    ? "#f59e0b"
                    : "#e5e7eb",
              background: hasAnswered || showAnswer ? "#f9fafb" : "white",
            }}
          />
        </div>

        {/* Feedback Box */}
        {feedback && (
          <div
            style={{
              ...styles.feedbackBox,
              background:
                feedback.type === "correct"
                  ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                  : feedback.type === "wrong"
                    ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
                    : feedback.type === "close"
                      ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                      : "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
              borderColor:
                feedback.type === "correct"
                  ? "#10b981"
                  : feedback.type === "wrong"
                    ? "#ef4444"
                    : feedback.type === "close"
                      ? "#f59e0b"
                      : "#6366f1",
            }}
          >
            <div style={styles.feedbackIcon}>
              {feedback.type === "correct" ? (
                <FiCheck size={24} color="#059669" />
              ) : feedback.type === "wrong" ? (
                <FiX size={24} color="#dc2626" />
              ) : feedback.type === "close" ? (
                <FiRefreshCw size={24} color="#d97706" />
              ) : (
                <FiEye size={24} color="#4f46e5" />
              )}
            </div>
            <p style={styles.feedbackText}>{feedback.message}</p>
          </div>
        )}

        {/* Revealed Answer */}
        {showAnswer && (
          <div style={styles.revealedAnswer}>
            <div style={styles.answerHeader}>
              <div style={styles.answerIconWrapper}>
                <FiAward size={20} />
              </div>
              <span style={styles.answerLabel}>Correct Answer</span>
            </div>
            <p style={styles.answerText}>{answer}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        {!hasAnswered && !showAnswer ? (
          <>
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              style={{
                ...styles.primaryButton,
                opacity: !userAnswer.trim() ? 0.5 : 1,
                cursor: !userAnswer.trim() ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (userAnswer.trim()) {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.35)"
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(16, 185, 129, 0.25)"
              }}
            >
              <div style={styles.buttonIcon}>
                <FiCheck size={20} />
              </div>
              <span>Check Answer</span>
            </button>

            <button
              onClick={handleRevealAnswer}
              style={styles.secondaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white"
              }}
            >
              <FiEye size={20} />
              <span>Reveal Answer</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleNextCard}
            style={styles.nextButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.35)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(16, 185, 129, 0.25)"
            }}
          >
            <span>{hasAnswered ? "Next Card" : "Continue"}</span>
            <div style={styles.buttonIcon}>
              <FiArrowRight size={20} />
            </div>
          </button>
        )}
      </div>

      {/* Hint */}
      <div style={styles.hintBox}>
        <div style={styles.hintIcon}>💡</div>
        <span style={styles.hintText}>
          Press <kbd style={styles.kbd}>Enter</kbd> to submit • Click Reveal if you need help
        </span>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "650px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  headerBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    borderRadius: "50px",
    border: "2px solid #bbf7d0",
    alignSelf: "center",
  },

  badgeIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },

  badgeText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#059669",
    letterSpacing: "0.5px",
  },

  mainCard: {
    background: "white",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f3f4f6",
  },

  questionSection: {
    marginBottom: "32px",
  },

  questionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },

  questionLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#10b981",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  questionDots: {
    display: "flex",
    gap: "6px",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#d1fae5",
  },

  questionText: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: "1.4",
    margin: 0,
  },

  inputSection: {
    marginBottom: "24px",
  },

  inputHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  inputLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },

  charCount: {
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: "500",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "16px 20px",
    borderRadius: "16px",
    border: "2px solid",
    fontSize: "16px",
    fontFamily: "inherit",
    lineHeight: "1.6",
    resize: "vertical",
    outline: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxSizing: "border-box",
  },

  feedbackBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "20px 24px",
    borderRadius: "16px",
    border: "2px solid",
    marginBottom: "20px",
    animation: "slideIn 0.3s ease",
  },

  feedbackIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  feedbackText: {
    flex: 1,
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: "1.6",
  },

  revealedAnswer: {
    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    padding: "24px",
    borderRadius: "16px",
    border: "2px solid #10b981",
    marginTop: "20px",
  },

  answerHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  answerIconWrapper: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#10b981",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  answerLabel: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  answerText: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#065f46",
    lineHeight: "1.6",
  },

  actionButtons: {
    display: "flex",
    gap: "12px",
  },

  primaryButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "18px 28px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  secondaryButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "18px 28px",
    borderRadius: "16px",
    border: "2px solid #e5e7eb",
    background: "white",
    color: "#374151",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  nextButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "18px 28px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  buttonIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  hintBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px 20px",
    background: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  hintIcon: {
    fontSize: "18px",
  },

  hintText: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },

  kbd: {
    padding: "2px 8px",
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },

  errorContainer: {
    background: "white",
    borderRadius: "24px",
    padding: "48px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
    maxWidth: "400px",
    border: "1px solid #fee2e2",
  },

  errorIconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#ef4444",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },

  errorTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#374151",
    margin: "0 0 8px",
  },

  errorText: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },

  skipButton: {
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
}

// Add animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
  if (!document.querySelector("style[data-flashcard-animations]")) {
    styleSheet.setAttribute("data-flashcard-animations", "true")
    document.head.appendChild(styleSheet)
  }
}

export default QuizFlashcard