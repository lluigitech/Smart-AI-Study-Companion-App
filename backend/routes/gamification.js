import express from "express";
import db from "../db.js";

const router = express.Router();

// GET Points, Streak, AND Weekly Study Time
router.get("/:userId", (req, res) => {
    const userId = req.params.userId;

    // Query 1: Get Points & Streak (Users Table)
    const userQuery = "SELECT points, streak_count as streak FROM users WHERE id = ?";

    // Query 2: Get Total Minutes Completed in the Last 7 Days (Daily Missions Table)
    const timeQuery = `
        SELECT SUM(target_minutes) as total_minutes 
        FROM daily_missions 
        WHERE user_id = ? 
        AND is_completed = 1 
        AND mission_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;

    db.query(userQuery, [userId], (err, userData) => {
        if (err) return res.status(500).json(err);
        
        db.query(timeQuery, [userId], (timeErr, timeData) => {
            if (timeErr) return res.status(500).json(timeErr);

            const points = userData.length > 0 ? userData[0].points : 0;
            const streak = userData.length > 0 ? userData[0].streak : 0;
            const totalMinutes = timeData.length > 0 ? (timeData[0].total_minutes || 0) : 0;

            res.json({ 
                points, 
                streak, 
                weeklyMinutes: totalMinutes 
            });
        });
    });
});

export default router;