import express from "express";
import db from "../db.js";

const router = express.Router();

// ==========================================
// 1. POST: LOG SESSION (SECONDS VERSION)
// ==========================================
router.post("/log", (req, res) => {
  const { user_id, duration_seconds, subject, activity_type } = req.body; 
  
  const studySubject = subject || "General";
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA'); 

  console.log(`📥 LOGGING: User ${user_id} | ${duration_seconds} seconds | ${studySubject}`);

  const sqlLog = "INSERT INTO study_sessions (user_id, subject, duration_seconds, created_at) VALUES (?, ?, ?, NOW())";
  
  db.query(sqlLog, [user_id, studySubject, duration_seconds], (err) => {
      if (err) {
          console.error("❌ INSERT ERROR:", err);
          return res.status(500).json({ error: "Database Insert Error" });
      }
      
      db.query("UPDATE users SET last_study_time = NOW() WHERE id = ?", [user_id]);

      const sqlGetData = `SELECT created_at, duration_seconds FROM study_sessions WHERE user_id = ? ORDER BY created_at ASC`;

      db.query(sqlGetData, [user_id], (err2, sessions) => {
          if (err2) return res.status(500).json(err2);

          let totalTodaySeconds = 0;
          sessions.forEach(s => {
              const dateStr = new Date(s.created_at).toLocaleDateString('en-CA');
              if (dateStr === todayStr) {
                  totalTodaySeconds += s.duration_seconds;
              }
          });

          const GOAL_SECONDS = 600; 

          const sqlUser = "SELECT streak_count, points FROM users WHERE id = ?";
          db.query(sqlUser, [user_id], (err3, userData) => {
              if (err3) return res.status(500).json(err3);
              
              const user = userData[0];
              let currentStreak = user.streak_count || 0;
              let newStreak = currentStreak;
              let currentPoints = user.points || 0;
              let pointsToAdd = 0;
              let shouldUpdateStreak = false;

              if (totalTodaySeconds >= GOAL_SECONDS) {
                    const totalBefore = totalTodaySeconds - duration_seconds;
                    if (totalBefore < GOAL_SECONDS) {
                        newStreak += 1;
                        shouldUpdateStreak = true;
                        if (newStreak === 20) pointsToAdd += 200;
                        else if (newStreak === 50) pointsToAdd += 500;
                        else if (newStreak === 100) pointsToAdd += 1000;
                        else if (newStreak % 7 === 0) pointsToAdd += 100;
                    }
                    else if (currentStreak === 0) {
                        newStreak = 1;
                        shouldUpdateStreak = true;
                    }
              }

              const finalizeRequest = () => {
                  const minutesStudied = Math.floor(totalTodaySeconds / 60);
                  let dbMissionType = (activity_type === 'quiz' || activity_type === 'deck') ? 'quiz' : 'timer';

                  const sqlCheckMission = `
                      UPDATE daily_missions SET is_completed = 1 
                      WHERE user_id = ? AND mission_date = ? AND type = ?         
                        AND ((type = 'timer' AND target_minutes <= ?) OR (type = 'quiz'))
                        AND is_completed = 0 
                  `;

                  db.query(sqlCheckMission, [user_id, todayStr, dbMissionType, minutesStudied], (errMission, resMission) => {
                      if (!errMission && resMission.affectedRows > 0) {
                          db.query("UPDATE users SET points = points + 50 WHERE id = ?", [user_id]);
                          db.query("INSERT INTO point_logs (user_id, points, reason) VALUES (?, 50, ?)", [user_id, `Mission Completed: ${dbMissionType}`]);
                      }
                      res.json({ message: "Logged", current_streak: newStreak, total_today: totalTodaySeconds });
                  });
              };

              if (shouldUpdateStreak) {
                  db.query("UPDATE users SET streak_count = ?, points = ? WHERE id = ?", [newStreak, currentPoints + pointsToAdd, user_id], (err4) => {
                        if (err4) return res.status(500).json(err4); finalizeRequest(); 
                  });
              } else { finalizeRequest(); }
          });
      });
  });
});

// ==========================================
// 2. GET STATS (Chart Data) - FIXED INTEGRATION
// ==========================================
router.get("/stats/:user_id", (req, res) => {
    const userId = req.params.user_id;
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    db.query("SELECT subject, duration_seconds, created_at FROM study_sessions WHERE user_id = ? ORDER BY created_at ASC", [userId], (err, sessions) => {
        if (err) return res.status(500).json(err);
        
        db.query("SELECT subject_name FROM study_subjects WHERE user_id = ?", [userId], (errSub, subjectsRes) => {
            if (errSub) return res.status(500).json(errSub);
            
            db.query("SELECT streak_count, points FROM users WHERE id = ?", [userId], (err2, userRes) => {
                if (err2) return res.status(500).json(err2);
                
                const user = userRes[0] || { streak_count: 0, points: 0 };
                const activeSet = new Set(subjectsRes.map(s => s.subject_name)); 
                activeSet.add("General"); 
                
                const validSessions = sessions.filter(s => activeSet.has(s.subject));
                
                let totalToday = 0; 
                let totalWeeklyAccumulator = 0; // 🔥 Para sa tamang percentage calculation
                let weeklyMap = { "Sun":0,"Mon":0,"Tue":0,"Wed":0,"Thu":0,"Fri":0,"Sat":0 }; 
                let focusMap = {}; 
                
                const oneWeekAgo = new Date(); 
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                validSessions.forEach(s => {
                    const date = new Date(s.created_at);
                    const dateString = date.toLocaleDateString('en-CA');
                    
                    if (dateString === todayStr) totalToday += s.duration_seconds;

                    // Ipunin ang lahat para sa Focus Area
                    focusMap[s.subject] = (focusMap[s.subject] || 0) + s.duration_seconds;
                    
                    // Ipunin ang data para sa huling 7 days (Weekly Chart)
                    if (date >= oneWeekAgo) {
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        if (weeklyMap[dayName] !== undefined) {
                            weeklyMap[dayName] += s.duration_seconds;
                            totalWeeklyAccumulator += s.duration_seconds; // I-update ang weekly total
                        }
                    }
                });

                res.json({
                    weekly: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => ({ 
                        day: day, 
                        total_seconds: weeklyMap[day] 
                    })),
                    focus: Object.keys(focusMap).map(subj => ({ 
                        subject: subj, 
                        total_seconds: focusMap[subj] 
                    })),
                    total_weekly: totalWeeklyAccumulator || 1, // 🔥 Denominator para sa frontend
                    today_seconds: totalToday, 
                    streak: user.streak_count, 
                    points: user.points
                });
            });
        });
    });
});

// ==========================================
// 3. WEEKLY OBJECTIVE (5 Hours Target)
// ==========================================
router.get('/weekly-objective/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds 
        FROM study_sessions WHERE user_id = ? 
        AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
    `;

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error" });

        const totalSeconds = results[0].total_seconds;
        const targetSeconds = 18000; // 5 Hours

        const totalMinutesAll = Math.floor(totalSeconds / 60);
        const displayHours = Math.floor(totalMinutesAll / 60); 
        const displayMinutes = totalMinutesAll % 60; 

        const hoursDone = `${displayHours}.${displayMinutes}`; 

        let percentage = (totalSeconds / targetSeconds) * 100;
        if (percentage > 100) percentage = 100;
        const isCompleted = totalSeconds >= targetSeconds;

        if (isCompleted) {
            db.query("SELECT last_rewarded_week FROM users WHERE id = ?", [userId], (uErr, uRes) => {
                if (!uErr && uRes.length > 0) {
                    const lastRewarded = uRes[0].last_rewarded_week;
                    db.query("SELECT YEARWEEK(CURDATE(), 1) as cw", (wErr, wRes) => {
                        if (!wErr) {
                            const currentWeek = wRes[0].cw;
                            if (lastRewarded !== currentWeek) {
                                db.query("UPDATE users SET points = points + 500, last_rewarded_week = ? WHERE id = ?", [currentWeek, userId]);
                                db.query("INSERT INTO point_logs (user_id, points, reason) VALUES (?, 500, ?)", [userId, "Weekly Objective: 5 Hours Reached!"]);
                            }
                        }
                    });
                }
            });
        }

        res.json({ totalSeconds, hoursDone, percentage: Math.round(percentage), completed: isCompleted });
    });
});

export default router;