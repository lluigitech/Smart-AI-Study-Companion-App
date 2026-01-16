"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  IoCalendar,
  IoAdd,
  IoClose,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoTimeOutline,
  IoRefresh,
  IoBarChart,
  IoChevronForwardCircle,
  IoEllipsisHorizontal,
  IoPencil,
  IoTrash,
  IoAlertCircle,
  IoFlame,
  IoWarning,
  IoLeaf,
  IoSunny,
  IoFilter,
  IoRadioButtonOn,
  IoHappy,
} from "react-icons/io5"

export default function PlannerTab() {
  const navigate = useNavigate()
  const [plannerView, setPlannerView] = useState("assigned")

  // --- DATA STATE ---
  const [tasks, setTasks] = useState([])
  const [userId, setUserId] = useState(null)

  // --- DATE STATE ---
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // --- UI STATE ---
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // --- ZEN MODE STATE (UPDATED) ---
  const [currentMood, setCurrentMood] = useState("Neutral") // Default
  const [zenMode, setZenMode] = useState(false)

  // LIST OF MOODS THAT TRIGGER ZEN MODE OPTION
  const negativeMoods = ["Tired", "Bad", "Stressed", "Anxious", "Overwhelmed"]
  const isNegativeMood = negativeMoods.includes(currentMood)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUserId(parsed.id)
      fetchTasks(parsed.id)
      fetchMoodFromDB(parsed.id) // 🔥 FETCH MOOD FROM DB
    }
  }, [])

  // --- FETCH MOOD FROM DB (NEW) ---
  const fetchMoodFromDB = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/mood-logs/${uid}`)
      if (res.data && res.data.length > 0) {
        const latestMood = res.data[0].mood // Get most recent mood
        setCurrentMood(latestMood)

        // Auto-enable Zen Mode suggestion if mood is bad
        if (negativeMoods.includes(latestMood)) {
          // Optional: Auto-enable or just show the option
          // setZenMode(true);
        }
      }
    } catch (err) {
      console.error("Mood Fetch Error:", err)
    }
  }

  // --- HELPER: FIX DATE ---
  const formatDateLocal = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // --- API ---
  const fetchTasks = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${uid}`)
      const formatted = res.data.map((t) => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        type: t.type,
        date: formatDateLocal(t.due_date),
        time: t.due_time,
        priority: t.priority,
        description: t.description,
        completed: Boolean(t.is_completed),
        completedAt: t.completed_at ? formatDateLocal(t.completed_at) : null,
      }))
      setTasks(formatted)
    } catch (err) {
      console.error("Fetch Error:", err)
    }
  }

  const [newTask, setNewTask] = useState({
    id: null,
    title: "",
    subject: "",
    type: "task",
    time: "23:59",
    priority: "medium",
    description: "",
  })

  const calculateDailyProgress = () => {
    const todayStr = formatDateLocal(new Date())
    const currentTasks = tasks || []
    const relevantTasks = currentTasks.filter((t) => t.date === todayStr)
    const total = relevantTasks.length
    const completed = relevantTasks.filter((t) => t.completed).length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, percentage }
  }
  const dailyStats = calculateDailyProgress()

  // --- CALENDAR LOGIC ---
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // --- HANDLERS ---
  const handleSaveTask = async (e) => {
    e.preventDefault()
    if (!newTask.title || !userId) return
    const finalDate = newTask.date || formatDateLocal(selectedDate)
    try {
      await axios.post("http://localhost:5000/api/tasks/add", {
        user_id: userId,
        title: newTask.title,
        subject: newTask.subject,
        type: newTask.type,
        date: finalDate,
        time: newTask.time,
        priority: newTask.priority,
        description: newTask.description,
      })
      fetchTasks(userId)
    } catch (err) {
      alert("Failed to save task.")
    }
    setShowModal(false)
    setIsEditing(false)
    resetForm()
  }

  const openEditModal = (task) => {
    setNewTask(task)
    setIsEditing(true)
    setActiveMenuId(null)
    setShowModal(true)
  }

  const deleteTask = async (id) => {
    if (window.confirm("Delete?")) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`)
        setTasks(tasks.filter((t) => t.id !== id))
      } catch (err) {
        console.error(err)
      }
    }
    setActiveMenuId(null)
  }

  const resetForm = () =>
    setNewTask({ id: null, title: "", subject: "", type: "task", time: "23:59", priority: "medium", description: "" })

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id)
    const newStatus = !task.completed
    const completedDate = newStatus ? formatDateLocal(new Date()) : null
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: newStatus, completedAt: completedDate } : t)))
    try {
      await axios.put(`http://localhost:5000/api/tasks/toggle/${id}`, {
        is_completed: newStatus,
        date_completed: completedDate,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // --- FILTERING ---
  const baseAssigned = tasks ? tasks.filter((t) => !t.completed) : []

  // LOGIC: Zen Mode filtering only happens if Zen Mode is actually ON
  const assigned = zenMode
    ? baseAssigned.filter((t) => t.priority === "high" || t.date <= formatDateLocal(new Date()))
    : baseAssigned

  const done = tasks
    ? tasks.filter((t) => t.completed).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    : []

  const categorizeAssigned = () => {
    const cats = { overdue: [], today: [], tomorrow: [], thisWeek: [], nextWeek: [], later: [] }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = formatDateLocal(today)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const tomorrowStr = formatDateLocal(tomorrow)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
    const endOfWeekStr = formatDateLocal(endOfWeek)
    const endOfNextWeek = new Date(endOfWeek)
    endOfNextWeek.setDate(endOfWeek.getDate() + 7)
    const endOfNextWeekStr = formatDateLocal(endOfNextWeek)

    assigned.forEach((t) => {
      if (t.date < todayStr) cats.overdue.push({ ...t, isOverdue: true })
      else if (t.date === todayStr) cats.today.push(t)
      else if (t.date === tomorrowStr) cats.tomorrow.push(t)
      else if (t.date > tomorrowStr && t.date <= endOfWeekStr) cats.thisWeek.push(t)
      else if (t.date > endOfWeekStr && t.date <= endOfNextWeekStr) cats.nextWeek.push(t)
      else cats.later.push(t)
    })
    return cats
  }
  const assignedCats = categorizeAssigned()

  const groupDoneTasks = () => {
    const groups = { thisWeek: [], lastWeek: [], earlier: [] }
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDay())
    const startOfWeekStr = formatDateLocal(startOfWeek)
    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfWeek.getDate() - 7)
    const startOfLastWeekStr = formatDateLocal(startOfLastWeek)

    done.forEach((task) => {
      if (task.completedAt >= startOfWeekStr) groups.thisWeek.push(task)
      else if (task.completedAt >= startOfLastWeekStr) groups.lastWeek.push(task)
      else groups.earlier.push(task)
    })
    return groups
  }
  const doneGroups = groupDoneTasks()

  // --- RENDERERS ---
  const renderCalendarGrid = () => {
    const daysArray = []
    for (let i = 0; i < firstDayOfMonth; i++) daysArray.push(<div key={`empty-${i}`} style={styles.dayEmpty}></div>)
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDateObj = new Date(year, month, d)
      const cellDateStr = formatDateLocal(cellDateObj)
      const hasTask = assigned.some((t) => t.date === cellDateStr)
      const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === month
      daysArray.push(
        <div
          key={d}
          style={isSelected ? styles.dayActive : styles.dayCell}
          onClick={() => setSelectedDate(cellDateObj)}
        >
          <span style={{ fontWeight: "bold", zIndex: 2 }}>{d}</span>
          {hasTask && <div style={styles.dot}></div>}
        </div>,
      )
    }
    return daysArray
  }

  const formatTime = (t) => {
    if (!t) return ""
    const [h, m] = t.split(":")
    const hr = Number.parseInt(h)
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`
  }
  const getPriorityColor = (p) => (p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#10b981")

  // --- SUB-COMPONENTS ---
  const DailyWidget = () => (
    <div
      style={
        dailyStats.total === 0
          ? { ...styles.progressCard, background: "#dcfce7", border: "1px dashed #4ade80" }
          : styles.progressCard
      }
      onClick={() => navigate("/progress")}
    >
      {dailyStats.total === 0 ? (
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div style={{ padding: "10px", background: "#dcfce7", borderRadius: "50%", display: "flex" }}>
            <IoSunny color="#16a34a" size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", color: "#15803d" }}>Free Day</h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#166534" }}>No pending tasks.</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <IoBarChart color="#4f46e5" />
              <span style={{ fontWeight: "bold", fontSize: "14px", color: "#1e293b" }}>Daily Progress</span>
            </div>
            <IoChevronForwardCircle color="#94a3b8" />
          </div>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${dailyStats.percentage}%` }}></div>
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between",
              color: "#64748b",
            }}
          >
            <span>
              {dailyStats.completed}/{dailyStats.total} done
            </span>
            <span style={{ color: "#4f46e5", fontWeight: "bold" }}>{dailyStats.percentage}%</span>
          </div>
        </>
      )}
    </div>
  )

  const TaskItem = ({ task, status }) => {
    const isOverdue = !task.completed && task.date < formatDateLocal(new Date())
    return (
      <div
        style={{
          ...styles.taskCard,
          borderColor: isOverdue ? "#fca5a5" : "#e2e8f0",
          background: isOverdue ? "#fef2f2" : "#fff",
        }}
      >
        <div onClick={() => toggleTask(task.id)} style={task.completed ? styles.checkboxChecked : styles.checkbox}>
          {task.completed && <IoCheckmarkCircle size={20} color="white" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h4 style={task.completed ? styles.taskTitleDone : styles.taskTitle}>{task.title}</h4>
            {!task.completed && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ ...styles.priorityDot, background: getPriorityColor(task.priority) }} />
                <div style={{ position: "relative", display: "flex" }}>
                  <IoEllipsisHorizontal
                    size={18}
                    color="#94a3b8"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveMenuId(activeMenuId === task.id ? null : task.id)
                    }}
                  />
                  {activeMenuId === task.id && (
                    <div style={styles.menuDropdown}>
                      <div style={styles.menuItem} onClick={() => openEditModal(task)}>
                        <IoPencil size={14} /> Edit
                      </div>
                      <div style={{ ...styles.menuItem, color: "#ef4444" }} onClick={() => deleteTask(task.id)}>
                        <IoTrash size={14} /> Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={styles.taskMeta}>
            <span style={styles.subjectTag}>{task.subject}</span>
            <span style={{ ...styles.dateTag, color: isOverdue ? "#ef4444" : "#64748b" }}>
              {status === "done" ? (
                `Done`
              ) : isOverdue ? (
                <>
                  <IoAlertCircle size={14} /> Overdue • {formatTime(task.time)}
                </>
              ) : (
                <>
                  <IoTimeOutline size={14} /> {formatTime(task.time)}
                </>
              )}
            </span>
          </div>
          {task.description && !task.completed && <p style={styles.descPreview}>{task.description}</p>}
        </div>
        {status === "done" && (
          <button onClick={() => toggleTask(task.id)} style={styles.undoBtn}>
            <IoRefresh size={18} />
          </button>
        )}
      </div>
    )
  }

  // --- HEADER RENDERER ---
  const renderHeader = () => {
    // 1. KUNG NEGATIVE MOOD: Ipakita ang "Activate Zen" or "Active"
    if (isNegativeMood) {
      return (
        <div style={zenMode ? styles.headerZen : styles.headerWarning}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={zenMode ? styles.iconBoxZen : styles.iconBoxWarning}>
              {zenMode ? <IoLeaf size={24} color="#15803d" /> : <IoWarning size={24} color="#b45309" />}
            </div>
            <div>
              <h1 style={zenMode ? styles.headerTitleZen : styles.headerTitleWarning}>
                {zenMode ? "ZEN FOCUS" : `Feeling ${currentMood}?`}
              </h1>
              <p style={styles.headerSubtitle}>
                {zenMode ? "Distractions blocked." : "Let's reduce the noise. Try Zen Mode."}
              </p>
            </div>
          </div>
          <button onClick={() => setZenMode(!zenMode)} style={zenMode ? styles.toggleBtnZen : styles.toggleBtnWarning}>
            {zenMode ? (
              <>
                <IoRadioButtonOn /> Active
              </>
            ) : (
              <>
                <IoLeaf /> Activate Zen
              </>
            )}
          </button>
        </div>
      )
    }

    // 2. KUNG POSITIVE MOOD (Normal): Standard Header lang, walang Zen button
    return (
      <div style={styles.headerNormal}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={styles.iconBoxNormal}>
            <IoHappy size={24} color="#4338ca" />
          </div>
          <div>
            <h1 style={styles.headerTitleNormal}>Study Planner</h1>
            <p style={styles.headerSubtitle}>Ready to conquer tasks!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        ...(zenMode ? styles.mainContainerZen : styles.mainContainer),
        ...(showModal && { overflow: "hidden", height: "100vh" }),
      }}
      onClick={() => setActiveMenuId(null)}
    >
      {/* --- DYNAMIC HEADER --- */}
      {renderHeader()}

      {/* ---NAVIGATION TABS --- */}
      <div style={styles.subNav}>
        <div
          style={plannerView === "assigned" ? styles.subNavLinkActive : styles.subNavLink}
          onClick={() => setPlannerView("assigned")}
        >
          Assigned <span style={styles.badge}>{assigned.length}</span>
        </div>
        <div
          style={
            plannerView === "done"
              ? { ...styles.subNavLinkActive, color: "#15803d", borderColor: "#15803d" }
              : styles.subNavLink
          }
          onClick={() => setPlannerView("done")}
        >
          Done <span style={styles.badgeSuccess}>{done.length}</span>
        </div>
      </div>

      {plannerView === "assigned" && (
        <>
          <DailyWidget />

          {/* CALENDAR */}
          <div style={styles.calendarContainer}>
            <div style={styles.monthHeader}>
              <button style={styles.monthNav} onClick={prevMonth}>
                <IoChevronBack size={16} />
              </button>
              <span style={styles.monthTitle}>
                <IoCalendar style={{ marginRight: "8px", opacity: 0.6 }} /> {monthNames[month]} {year}
              </span>
              <button style={styles.monthNav} onClick={nextMonth}>
                <IoChevronForward size={16} />
              </button>
            </div>
            <div style={styles.weekGrid}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} style={styles.weekLabel}>
                  {d}
                </span>
              ))}
            </div>
            <div style={styles.calendarGrid}>{renderCalendarGrid()}</div>
          </div>

          {/* SELECTED DATE TASKS */}
          <div style={{ marginBottom: "25px" }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                Tasks for {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
              </h3>
            </div>
            {assigned.filter((t) => t.date === formatDateLocal(selectedDate)).length === 0
              ? !zenMode && (
                  <div style={styles.emptyStateSmall}>
                    <p>No tasks assigned.</p>
                  </div>
                )
              : assigned
                  .filter((t) => t.date === formatDateLocal(selectedDate))
                  .map((t) => <TaskItem key={t.id} task={t} status="assigned" />)}
            <button
              style={styles.dashedAddBtn}
              onClick={() => {
                resetForm()
                setIsEditing(false)
                setShowModal(true)
              }}
            >
              <IoAdd size={18} /> Add Task
            </button>
          </div>

          {/* UPCOMING / FILTERED LIST */}
          <div style={styles.smartListContainer}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px", opacity: 0.8 }}>
              {zenMode ? <IoFilter size={16} color="#16a34a" /> : <IoCalendar size={16} color="#64748b" />}
              <h3 style={{ ...styles.sectionTitle, color: zenMode ? "#16a34a" : "#64748b" }}>
                {zenMode ? "Filtered Essentials" : "Upcoming Overview"}
              </h3>
            </div>

            {assignedCats.overdue.length > 0 && (
              <div style={styles.categoryGroup}>
                <h4 style={{ ...styles.categoryTitle, color: "#ef4444" }}>
                  <IoWarning size={14} /> Overdue
                </h4>
                {assignedCats.overdue.map((t) => (
                  <TaskItem key={t.id} task={t} status="assigned" />
                ))}
              </div>
            )}
            {assignedCats.today.length > 0 && (
              <div style={styles.categoryGroup}>
                <h4 style={{ ...styles.categoryTitle, color: "#b91c1c" }}>
                  <IoFlame size={14} /> Due Today
                </h4>
                {assignedCats.today.map((t) => (
                  <TaskItem key={t.id} task={t} status="assigned" />
                ))}
              </div>
            )}
            {assignedCats.tomorrow.length > 0 && (
              <div style={styles.categoryGroup}>
                <h4 style={{ ...styles.categoryTitle, color: "#ea580c" }}>Tomorrow</h4>
                {assignedCats.tomorrow.map((t) => (
                  <TaskItem key={t.id} task={t} status="assigned" />
                ))}
              </div>
            )}

            {!zenMode && (
              <>
                {assignedCats.thisWeek.length > 0 && (
                  <div style={styles.categoryGroup}>
                    <h4 style={{ ...styles.categoryTitle, color: "#16a34a" }}>This Week</h4>
                    {assignedCats.thisWeek.map((t) => (
                      <TaskItem key={t.id} task={t} status="assigned" />
                    ))}
                  </div>
                )}
                {assignedCats.nextWeek.length > 0 && (
                  <div style={styles.categoryGroup}>
                    <h4 style={{ ...styles.categoryTitle, color: "#2563eb" }}>Next Week</h4>
                    {assignedCats.nextWeek.map((t) => (
                      <TaskItem key={t.id} task={t} status="assigned" />
                    ))}
                  </div>
                )}
                {assignedCats.later.length > 0 && (
                  <div style={styles.categoryGroup}>
                    <h4 style={{ ...styles.categoryTitle, color: "#4b5563" }}>Later</h4>
                    {assignedCats.later.map((t) => (
                      <TaskItem key={t.id} task={t} status="assigned" />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {plannerView === "done" && (
        <div style={styles.listContainer}>
          {done.length === 0 && (
            <div style={styles.emptyState}>
              <IoCheckmarkCircle size={40} color="#e2e8f0" />
              <p>No completed tasks yet.</p>
            </div>
          )}
          {doneGroups.thisWeek.length > 0 && (
            <div style={styles.categoryGroup}>
              <h4 style={styles.categoryTitle}>Done This Week</h4>
              {doneGroups.thisWeek.map((t) => (
                <TaskItem key={t.id} task={t} status="done" />
              ))}
            </div>
          )}
          {doneGroups.lastWeek.length > 0 && (
            <div style={styles.categoryGroup}>
              <h4 style={styles.categoryTitle}>Done Last Week</h4>
              {doneGroups.lastWeek.map((t) => (
                <TaskItem key={t.id} task={t} status="done" />
              ))}
            </div>
          )}
          {doneGroups.earlier.length > 0 && (
            <div style={styles.categoryGroup}>
              <h4 style={styles.categoryTitle}>Earlier</h4>
              {doneGroups.earlier.map((t) => (
                <TaskItem key={t.id} task={t} status="done" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={styles.modalIconBox}>
                  <IoAdd size={20} color="#15803d" />
                </div>
                <h3 style={styles.modalTitle}>{isEditing ? "Edit Task" : "Add New Task"}</h3>
              </div>
              <div style={styles.closeButton} onClick={() => setShowModal(false)}>
                <IoClose size={22} color="#64748b" />
              </div>
            </div>

            <form onSubmit={handleSaveTask} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Task Name *</label>
                <input
                  style={styles.formInput}
                  placeholder="e.g., Finish math homework"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Subject *</label>
                <input
                  style={styles.formInput}
                  placeholder="e.g., Mathematics"
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  style={{ ...styles.formInput, minHeight: "90px", resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Add any additional details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Priority *</label>
                  <select
                    style={styles.formInput}
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Due Time *</label>
                  <input
                    type="time"
                    style={styles.formInput}
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Due Date *</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={newTask.date || formatDateLocal(selectedDate)}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Task Type *</label>
                <select
                  style={styles.formInput}
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                >
                  <option value="task">📝 Task</option>
                  <option value="project">📁 Project</option>
                  <option value="exam">📖 Exam</option>
                  <option value="quiz">✏️ Quiz</option>
                </select>
              </div>

              <button type="submit" style={styles.saveButton}>
                <IoCheckmarkCircle size={18} />
                {isEditing ? "Update Task" : "Save Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// --- UPDATED STYLES ---
const styles = {
  mainContainer: {
    paddingBottom: "100px",
    transition: "all 0.5s ease",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
    minHeight: "100vh",
    padding: "20px",
  },
  mainContainerZen: {
    paddingBottom: "100px",
    transition: "all 0.5s ease",
    border: "2px solid #06b6d4",
    borderRadius: "16px",
    padding: "20px",
    margin: "-10px",
    background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
    minHeight: "100vh",
  },

  // HEADER STYLES (3 TYPES)
  headerNormal: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(21, 128, 61, 0.1)",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  },
  iconBoxNormal: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(21, 128, 61, 0.15)",
  },
  headerTitleNormal: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "#064e3b",
    letterSpacing: "-0.5px",
  },

  headerWarning: {
    background: "rgba(255, 251, 235, 0.9)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #fcd34d",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.1)",
  },
  iconBoxWarning: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "2px solid #f59e0b",
    boxShadow: "0 4px 10px rgba(245, 158, 11, 0.15)",
  },
  headerTitleWarning: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "#92400e",
    letterSpacing: "-0.5px",
  },
  toggleBtnWarning: {
    background: "white",
    color: "#b45309",
    border: "2px solid #fcd34d",
    padding: "10px 18px",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 10px rgba(245, 158, 11, 0.15)",
    transition: "all 0.2s",
  },

  headerZen: {
    background: "rgba(207, 250, 254, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "2px solid #67e8f9",
    boxShadow: "0 8px 20px rgba(6, 182, 212, 0.2)",
  },
  iconBoxZen: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "2px solid #06b6d4",
    boxShadow: "0 4px 10px rgba(6, 182, 212, 0.2)",
  },
  headerTitleZen: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "#164e63",
    letterSpacing: "-0.5px",
  },
  toggleBtnZen: {
    background: "#0891b2",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)",
    transition: "all 0.2s",
  },

  headerSubtitle: {
    margin: "4px 0 0 0",
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "500",
  },

  // NAV
  subNav: {
    display: "flex",
    gap: "25px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    padding: "8px 20px",
    borderRadius: "16px",
    marginBottom: "25px",
    border: "1px solid rgba(21, 128, 61, 0.1)",
  },
  subNavLink: {
    padding: "10px 5px",
    fontSize: "14px",
    color: "#64748b",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },
  subNavLinkActive: {
    padding: "10px 5px",
    fontSize: "14px",
    color: "#15803d",
    cursor: "pointer",
    borderBottom: "2px solid #15803d",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  badge: {
    fontSize: "10px",
    background: "#dcfce7",
    color: "#15803d",
    padding: "3px 8px",
    borderRadius: "8px",
    fontWeight: "700",
  },
  badgeSuccess: {
    fontSize: "10px",
    background: "#d1fae5",
    color: "#047857",
    padding: "3px 8px",
    borderRadius: "8px",
    fontWeight: "700",
  },

  // CONTENT
  calendarContainer: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid rgba(21, 128, 61, 0.1)",
    marginBottom: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  },
  monthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  monthTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#064e3b",
    display: "flex",
    alignItems: "center",
  },
  monthNav: {
    background: "white",
    border: "1px solid #d1fae5",
    borderRadius: "10px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#15803d",
    transition: "all 0.2s",
    fontWeight: "600",
  },

  weekGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    marginBottom: "15px",
  },
  weekLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#15803d",
    textTransform: "uppercase",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
  },

  dayCell: {
    height: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    cursor: "pointer",
    position: "relative",
    fontSize: "13px",
    color: "#334155",
    transition: "all 0.2s",
    background: "transparent",
  },
  dayActive: {
    height: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
    borderRadius: "10px",
    cursor: "pointer",
    color: "white",
    position: "relative",
    fontSize: "13px",
    boxShadow: "0 6px 15px rgba(21, 128, 61, 0.3)",
    fontWeight: "700",
  },
  dayEmpty: { height: "40px" },
  dot: {
    width: "5px",
    height: "5px",
    background: "#ef4444",
    borderRadius: "50%",
    position: "absolute",
    bottom: "6px",
  },

  sectionHeader: {
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#064e3b",
    margin: "0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  progressCard: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
    marginBottom: "25px",
    cursor: "pointer",
    border: "1px solid rgba(21, 128, 61, 0.1)",
    transition: "all 0.3s",
  },
  progressBarBg: {
    width: "100%",
    height: "8px",
    background: "#f1f5f9",
    borderRadius: "12px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #15803d 0%, #22c55e 100%)",
    borderRadius: "12px",
    transition: "width 0.5s ease",
  },

  taskCard: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    padding: "18px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid rgba(21, 128, 61, 0.08)",
    marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.2s",
  },
  checkbox: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "2px solid #cbd5e1",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
    transition: "all 0.2s",
  },
  checkboxChecked: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(21, 128, 61, 0.3)",
  },

  taskTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: "600",
    lineHeight: "1.5",
  },
  taskTitleDone: {
    margin: 0,
    fontSize: "14px",
    color: "#94a3b8",
    textDecoration: "line-through",
  },

  taskMeta: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  subjectTag: {
    fontSize: "11px",
    background: "#dcfce7",
    padding: "3px 10px",
    borderRadius: "6px",
    color: "#15803d",
    fontWeight: "700",
  },
  dateTag: {
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#64748b",
  },
  descPreview: {
    margin: "8px 0 0 0",
    fontSize: "12px",
    color: "#64748b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    lineHeight: "1.5",
  },

  dashedAddBtn: {
    width: "100%",
    padding: "14px",
    border: "2px dashed #86efac",
    background: "rgba(220, 252, 231, 0.3)",
    color: "#15803d",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
  },

  smartListContainer: {
    marginBottom: "25px",
  },

  categoryGroup: { marginBottom: "25px" },
  categoryTitle: {
    fontSize: "12px",
    fontWeight: "800",
    margin: "0 0 12px 0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  listContainer: {
    marginTop: "20px",
  },

  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "60px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    background: "rgba(255, 255, 255, 0.5)",
    borderRadius: "16px",
  },
  emptyStateSmall: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "25px 0",
    fontSize: "13px",
    fontStyle: "italic",
  },

  undoBtn: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    transition: "all 0.2s",
  },

  // MODAL
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(6, 78, 59, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backdropFilter: "blur(8px)",
    padding: "20px",
    overflowY: "auto",
  },
  modal: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "550px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "2px solid rgba(21, 128, 61, 0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
    margin: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px 20px 28px",
    borderBottom: "1px solid rgba(21, 128, 61, 0.1)",
  },
  modalIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(21, 128, 61, 0.15)",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#064e3b",
    letterSpacing: "-0.3px",
  },
  closeButton: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s",
  },
  modalForm: {
    padding: "24px 28px 28px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  formLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    letterSpacing: "0.3px",
    marginLeft: "2px",
  },
  formInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    background: "white",
    color: "#1e293b",
    transition: "all 0.2s",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  saveButton: {
    width: "100%",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 8px 20px rgba(21, 128, 61, 0.25)",
    transition: "all 0.3s",
    marginTop: "8px",
  },

  // MENU
  priorityDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    boxShadow: "0 0 5px currentColor",
  },
  menuDropdown: {
    position: "absolute",
    top: "24px",
    right: 0,
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    borderRadius: "12px",
    padding: "8px",
    zIndex: 50,
    minWidth: "120px",
    border: "1px solid rgba(21, 128, 61, 0.1)",
  },
  menuItem: {
    padding: "10px 12px",
    fontSize: "13px",
    color: "#334155",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "8px",
    transition: "all 0.15s",
    fontWeight: "600",
  },
}
