"use client"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Document, Page, pdfjs } from "react-pdf"
import {
  IoArrowUndo,
  IoTime,
  IoSparkles,
  IoCheckmarkCircle,
  IoDocumentText,
  IoClose,
  IoSend,
  IoOpen,
  IoDownload,
  IoTrophy,
  IoWarning,
} from "react-icons/io5"

import { API_BASE_URL } from "../../config"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function DocumentViewer({ activeMaterial, fileUrl, studyTime, formatTimer, endSession }) {
  // --- STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm ready to analyze this document. Ask me anything! 🧠" },
  ])
  const [isSending, setIsSending] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024)

  // MODAL STATES
  const [showSummary, setShowSummary] = useState(false)
  const [finalTime, setFinalTime] = useState(0)

  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)

  const [isPaused, setIsPaused] = useState(false)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const lastActivityRef = useRef(Date.now())
  const inactivityTimerRef = useRef(null)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isChatOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isChatOpen])

  useEffect(() => {
    const resetActivity = () => {
      lastActivityRef.current = Date.now()
      if (isPaused && isTabVisible) {
        setIsPaused(false)
      }
    }

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      window.addEventListener(event, resetActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetActivity)
      })
    }
  }, [isPaused, isTabVisible])

  useEffect(() => {
    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current
      // If no activity for 30 seconds (30000ms), pause
      if (timeSinceLastActivity > 30000 && !isPaused && isTabVisible) {
        setIsPaused(true)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Study Session Paused", {
            body: "You're not focusing! No activity detected for 30 seconds.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          })
        }
      }
    }

    inactivityTimerRef.current = setInterval(checkInactivity, 1000)

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current)
      }
    }
  }, [isPaused, isTabVisible])

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      setIsTabVisible(isVisible)

      if (!isVisible) {
        // Tab is hidden, pause immediately
        setIsPaused(true)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Study Session Paused", {
            body: "You switched tabs! Your timer has been paused.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          })
        }
      } else {
        // Tab is visible again, reset activity
        lastActivityRef.current = Date.now()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleResume = () => {
    lastActivityRef.current = Date.now()
    setIsPaused(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userMsg = { sender: "user", text: chatInput }
    setMessages((prev) => [...prev, userMsg])
    setChatInput("")
    setIsSending(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/chat`, { message: userMsg.text })
      setMessages((prev) => [...prev, { sender: "ai", text: res.data.reply }])
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "ai", text: "Connection error." }])
    } finally {
      setIsSending(false)
    }
  }

  const handleDoneClick = () => {
    setFinalTime(studyTime)
    setShowSummary(true)
  }

  const confirmExit = () => {
    endSession(true)
  }

  const previousPage = () => {
    setPageNumber((prevPageNumber) => prevPageNumber - 1)
  }

  const nextPage = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1)
  }

  const isImage = activeMaterial?.title?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null
  const isPdf = activeMaterial?.title?.match(/\.(pdf)$/i) != null

  return (
    <div className="viewer-wrapper">
      <style>{`
                :root { --primary: #16a34a; --bg: #f8fafc; --text: #1e293b; --border: #e2e8f0; }
                .viewer-wrapper { position: fixed; inset: 0; background: var(--bg); display: flex; flex-direction: column; z-index: 9000; font-family: sans-serif; overflow: hidden; }

                /* HEADER */
                .header { height: 64px; background: white; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; z-index: 20; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .header-left { display: flex; align-items: center; gap: 12px; overflow: hidden; }
                .title-block h4 { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }
                .title-block span { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
                .header-right { display: flex; align-items: center; gap: 10px; }

                /* BUTTONS */
                .header-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
                .header-btn:active { transform: scale(0.95); }
                .btn-icon-only { background: none; color: #64748b; font-size: 24px; padding: 4px; }
                .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid var(--border); text-decoration: none; }
                .btn-primary { 
                    background: linear-gradient(135deg, #dcfce7, #bbf7d0); 
                    color: #15803d; 
                    border: 1px solid #86efac;
                    position: relative;
                    overflow: hidden;
                }

                .btn-primary::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transition: left 0.5s;
                }

                .btn-primary:hover::before {
                    left: 100%;
                }

                .btn-primary.active { 
                    background: linear-gradient(135deg, #15803d, #16a34a); 
                    color: white; 
                    border-color: #15803d;
                    box-shadow: 0 0 20px rgba(22, 163, 74, 0.5), 0 0 40px rgba(22, 163, 74, 0.3);
                }

                .btn-success { background: linear-gradient(135deg, #15803d, #16a34a); color: white; box-shadow: 0 2px 5px rgba(22,163,74,0.3); }
                .timer-pill { background: #f8fafc; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 6px; border: 1px solid var(--border); }

                /* BODY */
                .body-layout { flex: 1; display: flex; position: relative; overflow: hidden; width: 100%; height: 100%; }
                .doc-view { flex: 1; height: 100%; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); display: flex; justify-content: center; position: relative; transition: margin-right 0.3s ease; }
                .doc-scroll { width: 100%; height: 100%; overflow-y: auto; padding: 30px; box-sizing: border-box; display: flex; justify-content: center; }
                .paper { background: white; padding: 40px; width: 100%; max-width: 900px; min-height: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }

                /* CHAT */
                .chat-container { position: absolute; right: 0; top: 0; bottom: 0; width: 400px; background: white; border-left: 1px solid var(--border); z-index: 50; display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s ease; }
                .chat-container.open { transform: translateX(0); }
                .doc-view.shrink { margin-right: 400px; } 

                .chat-header { 
                    padding: 18px; 
                    border-bottom: 1px solid #f8fafc; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    box-shadow: 0 4px 15px rgba(22, 163, 74, 0.25);
                }

                .chat-header span {
                    color: white;
                }

                .chat-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; background: #fff; }
                .chat-input-area { padding: 15px; border-top: 1px solid var(--border); background: white; }
                .bubble { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
                .user { align-self: flex-end; background: linear-gradient(135deg, #15803d, #16a34a); color: white; }
                .ai { align-self: flex-start; background: #f1f5f9; color: var(--text); }
                .input-box { display: flex; align-items: center; background: #f8fafc; border: 1px solid var(--border); border-radius: 30px; padding: 5px 15px; }
                .input-field { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; padding: 8px 0; }
                .send-btn { 
                    background: linear-gradient(135deg, #15803d, #16a34a); 
                    color: white; 
                    border: none; 
                    border-radius: 50%; 
                    width: 36px; 
                    height: 36px; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
                    transition: all 0.2s;
                }

                .send-btn:hover {
                    transform: scale(1.08);
                    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.5);
                }

                .send-btn:active {
                    transform: scale(0.95);
                }

                .ai-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                /* Added pause overlay styling */
                .pause-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .pause-content {
                    background: white;
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 450px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .pause-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fef3c7, #fde68a);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
                    50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
                }

                .pause-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0 0 12px 0;
                }

                .pause-message {
                    font-size: 15px;
                    color: #64748b;
                    margin: 0 0 28px 0;
                    line-height: 1.6;
                }

                .resume-btn {
                    background: linear-gradient(135deg, #15803d, #16a34a);
                    color: white;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(22, 163, 74, 0.4);
                    transition: all 0.2s;
                }

                .resume-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(22, 163, 74, 0.5);
                }

                .resume-btn:active {
                    transform: translateY(0);
                }

                .pause-status {
                    display: inline-block;
                    padding: 6px 14px;
                    background: #fef3c7;
                    color: #92400e;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }

                /* MOBILE */
                @media (max-width: 1024px) {
                    .header { padding: 0 10px; height: 56px; }
                    .title-block h4 { font-size: 14px; max-width: 120px; }
                    .title-block span { display: none; }
                    .btn-text { display: none; }
                    .header-btn { padding: 0; width: 36px; height: 36px; justify-content: center; border-radius: 8px; }
                    .timer-pill { font-size: 12px; padding: 4px 8px; }

                    .doc-scroll { padding: 0 !important; }
                    .paper { padding: 15px !important; margin: 0 !important; width: 100% !important; max-width: none !important; box-shadow: none !important; border-radius: 0 !important; min-height: auto; }
                    .doc-view.shrink { margin-right: 0 !important; width: 100% !important; }

                    .chat-container { width: 100%; height: 60vh; top: auto; bottom: 0; left: 0; right: 0; border-left: none; border-top: 1px solid var(--border); border-radius: 20px 20px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.2); transform: translateY(100%); }
                    .chat-container.open { transform: translateY(0); }
                    .mobile-only-btn { display: flex !important; }

                    .pause-content {
                        max-width: 90%;
                        padding: 30px 20px;
                    }

                    .pause-icon {
                        width: 70px;
                        height: 70px;
                    }

                    .pause-title {
                        font-size: 20px;
                    }
                }

                /* PDF Navigation Controls */
                .pdf-controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); border-radius: 30px; padding: 8px 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.1); z-index: 10; }
                .pdf-nav-btn { background: none; border: none; color: #16a34a; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; transition: all 0.2s; }
                .pdf-nav-btn:hover:not(:disabled) { background: #dcfce7; }
                .pdf-nav-btn:disabled { color: #cbd5e1; cursor: not-allowed; }
                .pdf-page-info { font-size: 14px; font-weight: 600; color: #1e293b; white-space: nowrap; }
                
                .pdf-scroll-container { width: 100%; height: 100%; overflow-y: auto; display: flex; align-items: flex-start; justify-content: center; padding: 30px 0; box-sizing: border-box; }
                .pdf-page-wrapper { background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.2); margin-bottom: 20px; border-radius: 4px; overflow: hidden; }
            `}</style>

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-content">
            <div className="pause-icon">
              <IoWarning size={40} color="#f59e0b" />
            </div>
            <div className="pause-status">{!isTabVisible ? "TAB SWITCHED" : "INACTIVE"}</div>
            <h2 className="pause-title">You're Not Focusing!</h2>
            <p className="pause-message">
              {!isTabVisible
                ? "Your study session is paused because you switched to another tab or app. Come back to continue earning your progress!"
                : "No activity detected for 30 seconds. Your timer is paused to ensure accurate study tracking. Move your mouse or interact to resume."}
            </p>
            <button onClick={handleResume} className="resume-btn">
              Resume Studying
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="header">
        <div className="header-left">
          <button onClick={() => endSession(false)} className="header-btn btn-icon-only">
            <IoArrowUndo />
          </button>
          <div className="title-block">
            <h4>{activeMaterial.title}</h4>
            <span>Focus Mode</span>
          </div>
        </div>

        <div className="header-right">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="header-btn btn-secondary mobile-only-btn"
          >
            <IoOpen size={18} /> <span className="btn-text">Open</span>
          </a>
          <div className="timer-pill">
            <IoTime size={16} style={{ color: "#16a34a" }} /> {formatTimer(studyTime)}
          </div>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`header-btn btn-primary ${isChatOpen ? "active" : ""}`}
          >
            <IoSparkles size={18} /> <span className="btn-text">{isChatOpen ? "Close AI" : "AI Assist"}</span>
          </button>
          <button onClick={handleDoneClick} className="header-btn btn-success">
            <IoCheckmarkCircle size={20} /> <span className="btn-text">Done</span>
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="body-layout">
        <div className={`doc-view ${isChatOpen && !isMobile ? "shrink" : ""}`}>
          <div className="doc-scroll">
            {(() => {
              if (activeMaterial.type === "note") {
                return (
                  <div className="paper">
                    <h2 style={{ fontSize: 22, marginBottom: 15, fontWeight: 800 }}>{activeMaterial.title}</h2>
                    <div style={{ lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#334155", fontSize: 16 }}>
                      {activeMaterial.content}
                    </div>
                  </div>
                )
              }
              if (isImage) {
                return (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={fileUrl || "/placeholder.svg"}
                      alt="Doc"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                )
              }
              if (isPdf && fileUrl) {
                return (
                  <div className="pdf-scroll-container">
                    <div>
                      <Document
                        file={fileUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        loading={<div style={{ color: "#1e293b", fontSize: 16 }}>Loading PDF...</div>}
                        error={<div style={{ color: "#dc2626", fontSize: 16 }}>Failed to load PDF</div>}
                      >
                        {Array.from(new Array(numPages), (el, index) => (
                          <div key={`page_${index + 1}`} className="pdf-page-wrapper">
                            <Page
                              pageNumber={index + 1}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              width={Math.min(window.innerWidth * 0.85, 850)}
                            />
                          </div>
                        ))}
                      </Document>
                    </div>
                  </div>
                )
              }
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#94a3b8",
                  }}
                >
                  <IoDocumentText size={60} />
                  <p style={{ marginTop: 15, marginBottom: 15 }}>Preview not supported.</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="header-btn btn-success"
                    style={{ textDecoration: "none" }}
                  >
                    <IoDownload size={18} /> <span style={{ marginLeft: 5 }}>Open File</span>
                  </a>
                </div>
              )
            })()}
          </div>
        </div>

        {isMobile && isChatOpen && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
            onClick={() => setIsChatOpen(false)}
          />
        )}

        <div className={`chat-container ${isChatOpen ? "open" : ""}`}>
          <div className="chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="ai-icon-wrapper">
                <IoSparkles color="white" size={20} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "bold", color: "white", fontSize: "15px" }}>SmartBuddy AI</span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.85)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      background: "#86efac",
                      borderRadius: "50%",
                      boxShadow: "0 0 8px #86efac",
                    }}
                  ></div>
                  Online
                </span>
              </div>
            </div>
            {isMobile && (
              <button onClick={() => setIsChatOpen(false)} className="btn-icon-only" style={{ color: "white" }}>
                <IoClose size={24} />
              </button>
            )}
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`bubble ${msg.sender === "user" ? "user" : "ai"}`}>
                {msg.text}
              </div>
            ))}
            {isSending && <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <form onSubmit={handleSendMessage} className="input-box">
              <input
                type="text"
                className="input-field"
                placeholder="Ask AI..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isSending}
              />
              <button type="submit" className="send-btn" disabled={isSending}>
                <IoSend size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SESSION SUMMARY MODAL */}
      {showSummary && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 40,
              maxWidth: 450,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <IoTrophy size={40} color="#15803d" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Great Job!</h2>
            <p style={{ fontSize: 15, color: "#64748b", marginBottom: 25 }}>
              You studied <strong>{activeMaterial.title}</strong> for {formatTimer(finalTime)}
            </p>
            <button onClick={confirmExit} className="header-btn btn-success" style={{ width: "100%" }}>
              Finish Session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
