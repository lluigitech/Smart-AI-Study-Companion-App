import express from "express"
import cors from "cors"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import multer from "multer"
import axios from "axios"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"

// --- Route Imports ---
import materialRoute from "./routes/material.js"
import registerRoute from "./routes/register.js"
import loginRoute from "./routes/login.js"
import studyRoute from "./routes/study.js"
import aiRoute from "./routes/ai.js"
import missionsRoutes from "./routes/missions.js"
import taskRoutes from "./routes/tasks.js"
import db from "./db.js"

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "toledo.j.bsinfotech@gmail.com",
    pass: "ozkggwdttpjdqthe",
  },
})

// ============================
// MIDDLEWARE
// ============================
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/api/study-hub/materials", materialRoute)

// ============================
// MULTER CONFIG
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// ============================
// UPLOAD ROUTE (study_materials)
// ============================
app.post("/api/study-hub/materials/add", upload.single("file"), (req, res) => {
  console.log("📥 Upload Request Received:", req.body)

  const { user_id, subject_id, type, title, content } = req.body

  let file_path = null
  if (req.file) {
    console.log("✅ File Uploaded:", req.file.filename)
    file_path = `http://localhost:5000/uploads/${req.file.filename}`
  }

  const finalContent = content || null

  const sql =
    "INSERT INTO study_materials (user_id, subject_id, type, title, content, file_path) VALUES (?, ?, ?, ?, ?, ?)"

  db.query(sql, [user_id, subject_id, type, title, finalContent, file_path], (err, result) => {
    if (err) {
      console.error("❌ SQL Insert Error:", err)
      return res.status(500).json({ error: "Database error", details: err.message })
    }
    console.log("🎉 Material Saved! ID:", result.insertId)
    res.json({ message: "Material added successfully", id: result.insertId })
  })
})

// ============================
// STUDY HUB ROUTES
// ============================

// 1. Get Subjects
app.get("/api/study-hub/subjects/:userId", (req, res) => {
  const sql = "SELECT * FROM study_subjects WHERE user_id = ?"
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) {
      console.error("❌ Fetch Subjects Error:", err)
      return res.status(500).json(err)
    }
    res.json(results)
  })
})

// 2. Add Subject
app.post("/api/study-hub/subjects/add", (req, res) => {
  const { user_id, subject_name, color_theme } = req.body
  const sql = "INSERT INTO study_subjects (user_id, subject_name, color_theme) VALUES (?, ?, ?)"
  db.query(sql, [user_id, subject_name, color_theme], (err, result) => {
    if (err) return res.status(500).json(err)
    res.json({ id: result.insertId })
  })
})

// 3. Delete Subject
app.delete("/api/study-hub/subjects/:id", (req, res) => {
  const sql = "DELETE FROM study_subjects WHERE id = ?"
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Deleted" })
  })
})

// 4. Get Materials
app.get("/api/study-hub/materials/:subjectId", (req, res) => {
  const sql = "SELECT * FROM study_materials WHERE subject_id = ? ORDER BY created_at DESC"
  db.query(sql, [req.params.subjectId], (err, results) => {
    if (err) return res.status(500).json(err)
    res.json(results)
  })
})

// 5. Delete Material
app.delete("/api/study-hub/materials/:id", (req, res) => {
  const sql = "DELETE FROM study_materials WHERE id = ?"
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Deleted" })
  })
})

// ============================
// RANK SYSTEM CONSTANTS & HELPER
// ============================
const RANK_TIERS = [
  { name: "SCHOLAR", threshold: 1000, reward: 100 },
  { name: "ELITE", threshold: 5000, reward: 250 },
  { name: "MASTER", threshold: 10000, reward: 500 },
  { name: "GRANDMASTER", threshold: 25000, reward: 1000 },
  { name: "LEGEND", threshold: 50000, reward: 2500 },
  { name: "CELESTIAL", threshold: 100000, reward: 5000 },
]

const checkAndAwardRankUp = (userId, dbConnection) => {
  dbConnection.query("SELECT points FROM users WHERE id = ?", [userId], (err, results) => {
    if (err || results.length === 0) return
    const currentPoints = results[0].points

    let reachedTier = null
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
      if (currentPoints >= RANK_TIERS[i].threshold) {
        reachedTier = RANK_TIERS[i]
        break
      }
    }

    if (!reachedTier) return

    const milestoneTag = `RANK_UP_${reachedTier.name}`
    dbConnection.query(
      "SELECT * FROM claimed_milestones WHERE user_id = ? AND milestone_tag = ?",
      [userId, milestoneTag],
      (err, claimed) => {
        if (!err && claimed.length === 0) {
          const updateSql = "UPDATE users SET points = points + ? WHERE id = ?"
          dbConnection.query(updateSql, [reachedTier.reward, userId], () => {
            const insertSql = "INSERT INTO claimed_milestones (user_id, milestone_tag) VALUES (?, ?)"
            dbConnection.query(insertSql, [userId, milestoneTag])
            const logSql = "INSERT INTO point_logs (user_id, points, reason) VALUES (?, ?, ?)"
            dbConnection.query(logSql, [userId, reachedTier.reward, `Rank Up Reward: ${reachedTier.name}!`])
          })
        }
      },
    )
  })
}

// ============================
// HEALTH CHECK
// ============================
app.get("/", (req, res) => {
  res.send("🚀 Smart AI Study Companion API Running")
})

// ============================
// API ROUTES
// ============================
app.use("/api/register", registerRoute)
app.use("/api/login", loginRoute)
app.use("/api/study", studyRoute)
app.use("/api/ai", aiRoute)
app.use("/api/missions", missionsRoutes)
app.use("/api/tasks", taskRoutes)

// ============================
// USER PROFILE ROUTES
// ============================

// 1. Update Avatar
app.put("/api/users/update-avatar/:id", (req, res) => {
  const userId = req.params.id
  const { profile_pic } = req.body

  const sql = "UPDATE users SET profile_pic = ? WHERE id = ?"
  db.query(sql, [profile_pic, userId], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err)
      return res.status(500).json({ error: "Failed to update profile picture" })
    }
    res.json({ message: "Avatar updated successfully!" })
  })
})

// 2. Update Profile Info
app.put("/api/users/update-profile", (req, res) => {
  const { userId, username, email } = req.body

  if (!userId || !username || !email) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const checkSql = "SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?"

  db.query(checkSql, [username, email, userId], (err, data) => {
    if (err) return res.status(500).json({ error: "Server error checking availability" })

    if (data.length > 0) {
      const existingUser = data[0]
      if (existingUser.username === username) return res.status(409).json({ error: "Username is not available" })
      if (existingUser.email === email)
        return res.status(409).json({ error: "Email is already linked to another account" })
    }

    const updateSql = "UPDATE users SET username = ?, email = ? WHERE id = ?"
    db.query(updateSql, [username, email, userId], (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update profile" })
      res.json({ message: "Profile updated successfully!" })
    })
  })
})

// ============================
// GOOGLE LOGIN ROUTE
// ============================
app.post("/api/google-login", async (req, res) => {
  const { access_token } = req.body

  if (!access_token) {
    return res.status(400).json({ message: "Access token is required" })
  }

  try {
    const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`)

    const { email, given_name, family_name, picture } = googleResponse.data

    const checkSql = "SELECT * FROM users WHERE email = ?"
    db.query(checkSql, [email], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" })

      if (results.length > 0) {
        return res.json({
          success: true,
          message: "Login successful via Google",
          user: results[0],
        })
      }

      const username = `${given_name} ${family_name}`
      const role = "student"
      const points = 0

      const insertSql = `
                INSERT INTO users (username, email, password, profile_pic, role, points)
                VALUES (?, ?, ?, ?, ?, ?)
            `

      db.query(insertSql, [username, email, "google-auth-pass", picture, role, points], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to register Google user" })

        res.json({
          success: true,
          message: "Google account created and logged in",
          user: { id: result.insertId, username, email, profile_pic: picture, role, points },
        })
      })
    })
  } catch (error) {
    console.error("Google Auth Error:", error.message)
    res.status(500).json({ message: "Failed to authenticate with Google" })
  }
})

// ============================
// FORGOT PASSWORD ROUTE
// ============================
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "Email is required" })
  }

  try {
    // Check if user exists
    const checkSql = "SELECT id, username, email FROM users WHERE email = ?"
    db.query(checkSql, [email], async (err, results) => {
      if (err) {
        console.error("❌ Database Error:", err)
        return res.status(500).json({ message: "Database error occurred" })
      }

      if (results.length === 0) {
        // For security, we still return success even if email doesn't exist
        return res.json({
          success: true,
          message: "If an account exists with this email, a password reset link has been sent.",
        })
      }

      // User exists - send reset email
      const resetLink = `http://localhost:5173/reset-password?email=${encodeURIComponent(email)}`

      const mailOptions = {
        from: '"Smart AI Support" <toledo.j.bsinfotech@gmail.com>',
        to: email,
        subject: "Password Reset Request - Smart AI",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #047857;">Smart AI Study Companion</h2>
            <p>Kumusta ${results[0].username}! Nakatanggap kami ng request na i-reset ang iyong password.</p>
            <p>I-click ang button sa ibaba para mag-set ng bagong password:</p>
            <a href="${resetLink}" 
               style="background: #047857; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
               Reset Password
            </a>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">Kung hindi mo ito ni-request, balewalain lamang ang email na ito.</p>
          </div>
        `,
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log(`📧 Password reset email sent to: ${email}`)

        res.json({
          success: true,
          message: "Password reset link has been sent to your email address. Please check your inbox.",
        })
      } catch (emailError) {
        console.error("❌ Email Send Error:", emailError)
        res.status(500).json({
          success: false,
          message: "Failed to send reset email. Please try again later.",
        })
      }
    })
  } catch (error) {
    console.error("❌ Forgot Password Error:", error)
    res.status(500).json({ message: "Failed to process password reset request." })
  }
})

// ============================
// UPDATE PASSWORD ROUTE
// ============================
app.post("/api/update-password", async (req, res) => {
  const { email, newPassword } = req.body

  // Validation: I-check kung may laman ang email at password
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Kulang ang data." })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" })
  }

  try {
    // 1. I-hash ang bagong password (10 ang standard salt rounds)
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // 2. I-update ang database gamit ang HASHED password
    const sqlUpdate = "UPDATE users SET password = ? WHERE email = ?"

    db.query(sqlUpdate, [hashedPassword, email], (err, result) => {
      if (err) {
        console.error("❌ Database Error:", err)
        return res.status(500).json({ message: "Database error." })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." })
      }

      console.log(`🔒 Password updated (hashed) for: ${email}`)
      res.status(200).json({ message: "Password updated successfully!" })
    })
  } catch (error) {
    console.error("❌ Bcrypt Error:", error)
    res.status(500).json({ message: "Encryption error." })
  }
})

// ============================
// WEEKLY OBJECTIVE ROUTE
// ============================
app.get("/api/weekly-objective/:userId", (req, res) => {
  const userId = req.params.userId

  const query = `
        SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes 
        FROM study_sessions 
        WHERE user_id = ? 
        AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
    `

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ SQL Error:", err)
      return res.status(500).json({ message: "Failed to fetch weekly progress" })
    }

    const totalMinutes = results[0].total_minutes
    const targetMinutes = 300
    const hoursDone = (totalMinutes / 60).toFixed(1)
    let percentage = (totalMinutes / targetMinutes) * 100
    if (percentage > 100) percentage = 100

    const isCompleted = totalMinutes >= targetMinutes

    if (isCompleted) {
      const checkUserQuery = "SELECT last_rewarded_week FROM users WHERE id = ?"
      db.query(checkUserQuery, [userId], (uErr, uRes) => {
        if (!uErr && uRes.length > 0) {
          const lastRewarded = uRes[0].last_rewarded_week
          const weekQuery = "SELECT YEARWEEK(CURDATE(), 1) as cw"
          db.query(weekQuery, (wErr, wRes) => {
            if (!wErr) {
              const currentWeek = wRes[0].cw
              if (lastRewarded !== currentWeek) {
                const updatePoints = `UPDATE users SET points = points + 500, last_rewarded_week = ? WHERE id = ?`
                db.query(updatePoints, [currentWeek, userId], (err) => {
                  if (!err) {
                    const logPoints = "INSERT INTO point_logs (user_id, points, reason) VALUES (?, ?, ?)"
                    db.query(logPoints, [userId, 500, "Weekly Objective: 5 Hours Reached!"])
                    checkAndAwardRankUp(userId, db)
                  }
                })
              }
            }
          })
        }
      })
    }

    res.json({
      totalMinutes,
      hoursDone,
      percentage: Math.round(percentage),
      completed: isCompleted,
    })
  })
})

// ============================
// PROGRESS TRACKER & STATS
// ============================

app.get("/api/study/stats/:userId", (req, res) => {
  const userId = req.params.userId

  const userQuery = "SELECT points, streak_count FROM users WHERE id = ?"

  const weeklyQuery = `
        SELECT DATE_FORMAT(created_at, '%a') as day, SUM(duration_minutes) as total_minutes
        FROM study_sessions 
        WHERE user_id = ? 
        AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) 
        GROUP BY day
        ORDER BY FIELD(day, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat')
    `

  const focusQuery = `
        SELECT subject, SUM(duration_minutes) as total_minutes
        FROM study_sessions
        WHERE user_id = ?
        GROUP BY subject
        ORDER BY total_minutes DESC
        LIMIT 4
    `

  const milestoneQuery = "SELECT milestone_tag FROM claimed_milestones WHERE user_id = ?"

  db.query(userQuery, [userId], (err, userRes) => {
    if (err) return res.status(500).json({ error: "DB Error" })

    db.query(weeklyQuery, [userId], (err, weekRes) => {
      if (err) return res.status(500).json({ error: "DB Error" })

      db.query(focusQuery, [userId], (err, focusRes) => {
        if (err) return res.status(500).json({ error: "DB Error" })

        db.query(milestoneQuery, [userId], (err, milestoneRes) => {
          if (err) return res.status(500).json({ error: "DB Error" })

          const weeklyFormatted = weekRes.map((row) => ({
            day: row.day,
            total_seconds: row.total_minutes * 60,
          }))

          const focusFormatted = focusRes.map((row) => ({
            subject: row.subject,
            total_seconds: row.total_minutes * 60,
          }))

          const claimed = milestoneRes.map((row) => row.milestone_tag)

          const today = new Date().toLocaleDateString("en-US", { weekday: "short" })
          const todayData = weeklyFormatted.find((d) => d.day === today)
          const todaySeconds = todayData ? todayData.total_seconds : 0

          res.json({
            points: userRes[0]?.points || 0,
            streak: userRes[0]?.streak_count || 0,
            today_seconds: todaySeconds,
            weekly: weeklyFormatted,
            focus: focusFormatted,
            claimed_milestones: claimed,
          })
        })
      })
    })
  })
})

// 2. SAVE POINTS & MILESTONES
app.put("/api/users/add-points/:id", (req, res) => {
  const userId = req.params.id
  const { points, milestone } = req.body

  if (!points) return res.status(400).json({ error: "Points required" })

  if (milestone) {
    const checkSql = "SELECT * FROM claimed_milestones WHERE user_id = ? AND milestone_tag = ?"
    db.query(checkSql, [userId, milestone], (err, results) => {
      if (err) return res.status(500).json(err)

      if (results.length > 0) {
        return res.status(400).json({ message: "Milestone already claimed!" })
      }

      const updateSql = "UPDATE users SET points = points + ? WHERE id = ?"
      db.query(updateSql, [points, userId], (err) => {
        if (err) return res.status(500).json(err)

        const insertSql = "INSERT INTO claimed_milestones (user_id, milestone_tag) VALUES (?, ?)"
        db.query(insertSql, [userId, milestone])

        const logSql = "INSERT INTO point_logs (user_id, points, reason) VALUES (?, ?, ?)"
        db.query(logSql, [userId, points, `Milestone: ${milestone}`])

        checkAndAwardRankUp(userId, db)

        res.json({ message: "Points added successfully" })
      })
    })
  } else {
    const updateSql = "UPDATE users SET points = points + ? WHERE id = ?"
    db.query(updateSql, [points, userId], (err) => {
      if (err) return res.status(500).json(err)
      checkAndAwardRankUp(userId, db)
      res.json({ message: "Points added successfully" })
    })
  }
})

// ============================
// LEADERBOARD ROUTES
// ============================
app.get("/api/leaderboard", (req, res) => {
  const query = `
        SELECT id, username, COALESCE(points, 0) AS points, profile_pic AS avatar_url 
        FROM users 
        ORDER BY points DESC 
        LIMIT 50
    `
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ SQL Leaderboard Error:", err)
      return res.status(500).json({ error: "Failed to fetch leaderboard" })
    }
    res.json(results)
  })
})

app.post("/api/points/add", (req, res) => {
  const { userId, points, reason } = req.body
  if (!userId || !points) return res.status(400).json({ error: "Missing userId or points" })

  const logReason = reason || "General Reward"
  const logQuery = "INSERT INTO point_logs (user_id, points, reason) VALUES (?, ?, ?)"

  db.query(logQuery, [userId, points, logReason], (err) => {
    if (err) return res.status(500).json({ error: "Failed to log points" })

    const updateQuery = "UPDATE users SET points = points + ? WHERE id = ?"
    db.query(updateQuery, [points, userId], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update points" })
      checkAndAwardRankUp(userId, db)
      res.json({ message: "Points added successfully!" })
    })
  })
})

app.get("/api/points/history/:userId", (req, res) => {
  const query = "SELECT points, reason, created_at FROM point_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
  db.query(query, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch history" })
    res.json(results)
  })
})

// ============================
// DATA ROUTES (Dashboard)
// ============================
app.get("/api/progress/:studentId", (req, res) => {
  const studentId = req.params.studentId
  const query = `SELECT day, completed, focus_time FROM tasks WHERE student_id = ?`
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })

    const weeklyDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const breakdown = weeklyDays.map((day) => {
      const dayTasks = results.filter((r) => r.day === day)
      const completed = dayTasks.filter((r) => r.completed).length
      const total = dayTasks.length
      const focusTime = dayTasks.reduce((acc, r) => acc + r.focus_time, 0)
      const percentage = total ? Math.round((completed / total) * 100) : 0
      return { day, value: percentage, focusTime }
    })
    const totalCompleted = results.filter((r) => r.completed).length
    const totalTasks = results.length
    const overall = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0
    res.json({ overall, breakdown })
  })
})

app.get("/api/gamification/:studentId", (req, res) => {
  const studentId = req.params.studentId
  const query = "SELECT points, streak_count FROM users WHERE id = ?"
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    const points = results[0]?.points || 0
    const streak = results[0]?.streak_count || 0
    const badges = []
    if (points >= 50) badges.push("💎 Beginner Achiever")
    if (streak >= 5) badges.push("🔥 5-Day Streak")
    if (points >= 100) badges.push("🏆 Study Pro")
    res.json({ points, badges, streak })
  })
})

// ============================
// MOOD LOGS & WELLBEING
// ============================
app.get("/api/wellbeing/:studentId", (req, res) => {
  const studentId = req.params.studentId
  const query = "SELECT * FROM wellbeing WHERE student_id=?"
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(results)
  })
})

app.post("/api/wellbeing/:studentId", (req, res) => {
  const studentId = req.params.studentId
  const { mood, exercise_minutes, notes } = req.body
  const query = "INSERT INTO wellbeing (student_id, mood, exercise_minutes, notes) VALUES (?, ?, ?, ?)"
  db.query(query, [studentId, mood, exercise_minutes, notes], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: "Wellbeing entry added" })
  })
})

app.post("/api/mood-logs", (req, res) => {
  const { userId, mood, note } = req.body
  if (!userId || !mood) return res.status(400).json({ error: "Missing fields" })
  const sql = "INSERT INTO mood_logs (user_id, mood, note) VALUES (?, ?, ?)"
  db.query(sql, [userId, mood, note], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" })
    res.json({ message: "Mood saved successfully!", id: result.insertId })
  })
})

app.get("/api/mood-logs/:userId", (req, res) => {
  const userId = req.params.userId
  const sql = "SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC"
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" })
    res.json(results)
  })
})

// ============================
// 404 & ERROR HANDLING
// ============================
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ status: "error", message: "Server error" })
})

// ============================
// SERVER START
// ============================
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
