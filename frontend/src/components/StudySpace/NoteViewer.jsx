"use client"

import { useState, useEffect, useRef } from "react"
import { IoArrowUndo, IoTime, IoSparkles, IoCreate, IoSave, IoDocumentText, IoChevronBack } from "react-icons/io5"

const THEME = {
  primary: "#15803d",
  primaryGradient: "linear-gradient(135deg, #15803d, #16a34a)",
  text: "#064e3b",
  subText: "#059669",
  accent: "#10b981",
  bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #6ee7b7 50%, #d1fae5 75%, #f0fdf4 100%)",
}

export default function NoteViewer({ activeMaterial, studyTime, formatTimer, onBack, onAIRequest, onSaveEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(activeMaterial?.content || "")
  const [headerShadow, setHeaderShadow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const contentRef = useRef(null)

  // 🔥 HIDE BOTTOM NAV WHEN THIS COMPONENT MOUNTS
  useEffect(() => {
    localStorage.setItem('isStudySessionActive', 'true')
    
    return () => {
      // Show bottom nav again when component unmounts
      localStorage.setItem('isStudySessionActive', 'false')
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setEditedContent(activeMaterial?.content || "")
  }, [activeMaterial])

  const handleSave = () => {
    if (activeMaterial?.id) {
      onSaveEdit(activeMaterial.id, editedContent)
    }
    setIsEditing(false)
  }

  const handleScroll = () => {
    if (contentRef.current) {
      const scrollTop = contentRef.current.scrollTop
      setHeaderShadow(scrollTop > 10)
    }
  }

  const renderContent = (content) => {
    if (!content) return <p style={getStyles(isMobile).emptyState}>No content available. Click "Edit" to start writing!</p>
    
    const lines = content.split('\n')
    const elements = []
    let currentParagraph = []
    let listItems = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={getStyles(isMobile).paragraph}>
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
        
        const text = trimmed.substring(1).trim()
        if (text) {
          listItems.push(
            <li key={`li-${index}`} style={getStyles(isMobile).listItem}>
              {text}
            </li>
          )
        }
      }
      else if (trimmed.endsWith(':') && trimmed.length > 3 && trimmed.length < 50) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`ul-${index}`} style={getStyles(isMobile).list}>
              {listItems}
            </ul>
          )
          listItems = []
        }
        
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={getStyles(isMobile).paragraph}>
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
        
        elements.push(
          <h3 key={`h-${index}`} style={getStyles(isMobile).heading}>
            {trimmed}
          </h3>
        )
      }
      else if (trimmed) {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`ul-${index}`} style={getStyles(isMobile).list}>
              {listItems}
            </ul>
          )
          listItems = []
        }
        
        currentParagraph.push(trimmed)
      }
      else {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`p-${index}`} style={getStyles(isMobile).paragraph}>
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
      }
    })
    
    if (listItems.length > 0) {
      elements.push(
        <ul key="ul-final" style={getStyles(isMobile).list}>
          {listItems}
        </ul>
      )
    }
    if (currentParagraph.length > 0) {
      elements.push(
        <p key="p-final" style={getStyles(isMobile).paragraph}>
          {currentParagraph.join(' ')}
        </p>
      )
    }
    
    return elements.length > 0 ? elements : <p style={getStyles(isMobile).paragraph}>{content}</p>
  }

  const styles = getStyles(isMobile)

  return (
    <div style={styles.container}>
      {/* FIXED HEADER */}
      <div style={{
        ...styles.headerContainer,
        boxShadow: headerShadow ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "none"
      }}>
        {/* TOP ROW */}
        <div style={styles.topRow}>
          <button onClick={onBack} style={styles.backButton}>
            <IoChevronBack size={isMobile ? 18 : 22} />
            <span>Back</span>
          </button>
          
          <div style={styles.timerContainer}>
            <div style={styles.timerIcon}>
              <IoTime size={isMobile ? 14 : 16} />
            </div>
            <span style={styles.timerText}>{formatTimer?.(studyTime) || "00:00"}</span>
          </div>
        </div>

        {/* TITLE ROW */}
        <div style={styles.titleRow}>
          <div style={styles.titleSection}>
            <div style={styles.iconTitle}>
              <div style={styles.iconCircle}>
                <IoDocumentText size={isMobile ? 18 : 22} color="white" />
              </div>
              <div style={styles.titleTexts}>
                <h1 style={styles.documentTitle}>
                  {activeMaterial?.title || "Untitled Note"}
                </h1>
                {!isMobile && (
                  <div style={styles.documentMeta}>
                    <span style={styles.documentType}>
                      {activeMaterial?.type === "summary" ? "📄 AI Summary" : "📝 Personal Notes"}
                    </span>
                    <span style={styles.documentSeparator}>•</span>
                    <span style={styles.documentStatus}>🟢 Active Session</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.actionButtons}>
            {activeMaterial?.type !== "summary" && (
              <>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={styles.editButton}
                    title="Edit note"
                  >
                    <IoCreate size={isMobile ? 16 : 18} />
                    {!isMobile && <span>Edit</span>}
                  </button>
                ) : (
                  <button 
                    onClick={handleSave} 
                    style={styles.saveButton}
                    title="Save changes"
                  >
                    <IoSave size={isMobile ? 16 : 18} />
                    {!isMobile && <span>Save</span>}
                  </button>
                )}
                
                <button 
                  onClick={onAIRequest} 
                  style={styles.aiButton}
                  title="Generate AI summary"
                >
                  <IoSparkles size={isMobile ? 16 : 18} />
                  {!isMobile && <span>AI Summary</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div 
        ref={contentRef}
        style={styles.contentContainer}
        onScroll={handleScroll}
      >
        <div style={styles.contentInner}>
          {isEditing ? (
            <textarea
              style={styles.editArea}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              autoFocus
              placeholder={isMobile ? "Start typing..." : `Start typing your notes here...

Use • or - for bullet points
End lines with : to create headings

Example:
Key Topics:
• First important point
• Second important point`}
            />
          ) : (
            <div style={styles.noteContent}>
              <div style={styles.documentPaper}>
                {renderContent(editedContent)}
              </div>
              
              {/* FOOTER */}
              <div style={styles.contentFooter}>
                <div style={styles.divider} />
                <div style={styles.footerText}>
                  <span style={styles.pageIndicator}>Page 1 of 1</span>
                  {!isMobile && (
                    <>
                      <span style={styles.footerSeparator}>•</span>
                      <span>Keep studying to earn more points! 📚</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getStyles(isMobile) {
  return {
    container: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #6ee7b7 50%, #d1fae5 75%, #f0fdf4 100%)",
      backgroundSize: "400% 400%",
      animation: "gradientShift 15s ease infinite",
      overflow: "hidden",
    },
    
    headerContainer: {
      position: "sticky",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: isMobile ? "12px 12px 10px 12px" : "16px 24px 12px 24px",
      borderBottom: "1px solid rgba(167, 243, 208, 0.4)",
      transition: "box-shadow 0.3s ease",
    },
    
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isMobile ? "10px" : "16px",
      gap: "8px",
    },
    
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "4px" : "8px",
      background: "rgba(240, 253, 244, 0.9)",
      border: "1px solid rgba(167, 243, 208, 0.6)",
      color: THEME.primary,
      padding: isMobile ? "6px 10px" : "8px 16px 8px 12px",
      borderRadius: isMobile ? "10px" : "12px",
      fontSize: isMobile ? "12px" : "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(21, 128, 61, 0.1)",
      whiteSpace: "nowrap",
    },
    
    timerContainer: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "4px" : "8px",
      background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
      padding: isMobile ? "6px 10px" : "8px 16px",
      borderRadius: isMobile ? "10px" : "12px",
      border: "1px solid rgba(167, 243, 208, 0.6)",
      boxShadow: "0 2px 8px rgba(21, 128, 61, 0.15)",
    },
    
    timerIcon: {
      color: THEME.primary,
    },
    
    timerText: {
      fontSize: isMobile ? "12px" : "14px",
      fontWeight: "700",
      color: THEME.text,
      fontFeatureSettings: '"tnum"',
    },
    
    titleRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: isMobile ? "8px" : "20px",
    },
    
    titleSection: {
      flex: 1,
      minWidth: 0,
    },
    
    iconTitle: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "10px" : "16px",
    },
    
    iconCircle: {
      width: isMobile ? "36px" : "48px",
      height: isMobile ? "36px" : "48px",
      borderRadius: isMobile ? "10px" : "14px",
      background: THEME.primaryGradient,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 4px 16px rgba(21, 128, 61, 0.25)",
    },
    
    titleTexts: {
      flex: 1,
      minWidth: 0,
    },
    
    documentTitle: {
      fontSize: isMobile ? "16px" : "22px",
      fontWeight: "800",
      color: THEME.text,
      margin: "0 0 4px 0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      letterSpacing: "-0.3px",
    },
    
    documentMeta: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: THEME.subText,
      fontWeight: "500",
    },
    
    documentType: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    
    documentSeparator: {
      opacity: 0.6,
    },
    
    documentStatus: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    
    actionButtons: {
      display: "flex",
      gap: isMobile ? "6px" : "12px",
      flexShrink: 0,
    },
    
    editButton: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "0" : "6px",
      background: "rgba(255, 255, 255, 0.95)",
      border: "1px solid rgba(167, 243, 208, 0.6)",
      color: THEME.text,
      padding: isMobile ? "8px" : "10px 18px",
      borderRadius: isMobile ? "10px" : "12px",
      fontSize: isMobile ? "12px" : "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(21, 128, 61, 0.1)",
    },
    
    saveButton: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "0" : "6px",
      background: THEME.accent,
      border: "none",
      color: "white",
      padding: isMobile ? "8px" : "10px 18px",
      borderRadius: isMobile ? "10px" : "12px",
      fontSize: isMobile ? "12px" : "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 12px rgba(16, 185, 129, 0.3)",
    },
    
    aiButton: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "0" : "6px",
      background: THEME.primaryGradient,
      border: "none",
      color: "white",
      padding: isMobile ? "8px" : "10px 18px",
      borderRadius: isMobile ? "10px" : "12px",
      fontSize: isMobile ? "12px" : "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 12px rgba(21, 128, 61, 0.3)",
    },
    
    contentContainer: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      padding: isMobile ? "16px 12px" : "24px",
      position: "relative",
    },
    
    contentInner: {
      maxWidth: isMobile ? "100%" : "900px",
      margin: "0 auto",
      width: "100%",
    },
    
    editArea: {
      width: "100%",
      minHeight: "calc(100vh - 200px)",
      background: "rgba(255, 255, 255, 0.95)",
      border: "2px solid rgba(167, 243, 208, 0.5)",
      borderRadius: isMobile ? "12px" : "16px",
      padding: isMobile ? "20px" : "32px",
      fontSize: isMobile ? "14px" : "16px",
      lineHeight: "1.8",
      color: "#065f46",
      fontFamily: "inherit",
      resize: "vertical",
      outline: "none",
      boxShadow: "0 4px 24px rgba(21, 128, 61, 0.1)",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    },
    
    noteContent: {
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: isMobile ? "12px" : "20px",
      padding: isMobile ? "24px 20px" : "40px 48px",
      boxShadow: "0 8px 32px rgba(21, 128, 61, 0.08)",
      border: "1px solid rgba(167, 243, 208, 0.3)",
      minHeight: "calc(100vh - 220px)",
      boxSizing: "border-box",
    },
    
    documentPaper: {
      maxWidth: "100%",
    },
    
    heading: {
      fontSize: isMobile ? "16px" : "20px",
      fontWeight: "700",
      color: THEME.primary,
      marginTop: isMobile ? "20px" : "32px",
      marginBottom: isMobile ? "12px" : "16px",
      lineHeight: "1.4",
      letterSpacing: "-0.2px",
    },
    
    paragraph: {
      fontSize: isMobile ? "14px" : "16px",
      lineHeight: isMobile ? "1.7" : "1.8",
      color: "#065f46",
      marginBottom: isMobile ? "16px" : "20px",
      textAlign: isMobile ? "left" : "justify",
      fontWeight: "400",
      letterSpacing: "0.01em",
    },
    
    list: {
      margin: isMobile ? "12px 0 20px 0" : "16px 0 24px 0",
      padding: isMobile ? "0 0 0 16px" : "0 0 0 24px",
      listStyle: "none",
    },
    
    listItem: {
      fontSize: isMobile ? "14px" : "16px",
      lineHeight: isMobile ? "1.7" : "1.8",
      color: "#065f46",
      marginBottom: isMobile ? "10px" : "12px",
      paddingLeft: isMobile ? "8px" : "12px",
      position: "relative",
      fontWeight: "400",
      '::before': {
        content: '"•"',
        position: "absolute",
        left: "-8px",
        color: THEME.accent,
        fontWeight: "700",
      },
    },
    
    emptyState: {
      fontSize: isMobile ? "14px" : "16px",
      lineHeight: "1.8",
      color: "#6ee7b7",
      fontStyle: "italic",
      textAlign: "center",
      padding: isMobile ? "30px 15px" : "40px 20px",
    },
    
    contentFooter: {
      marginTop: isMobile ? "40px" : "60px",
    },
    
    divider: {
      height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(167, 243, 208, 0.6), transparent)",
      margin: isMobile ? "30px 0 20px 0" : "40px 0 24px 0",
    },
    
    footerText: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: isMobile ? "8px" : "12px",
      fontSize: isMobile ? "12px" : "14px",
      color: THEME.subText,
      fontWeight: "500",
      textAlign: "center",
      padding: "8px 0",
    },
    
    pageIndicator: {
      fontWeight: "600",
      color: THEME.primary,
    },
    
    footerSeparator: {
      opacity: 0.5,
    },
  }
}