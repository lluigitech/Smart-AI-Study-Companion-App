import express from "express";
import db from "../db.js"; 

const router = express.Router();

// --- GET MISSIONS (UPDATED: Now uses Database 'mission_types') ---
router.get("/:userId", (req, res) => {
    const userId = req.params.userId;
    const today = new Date().toISOString().slice(0, 10);

    // 1. Check kung may missions na today
    const checkQuery = "SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?";
    
    db.query(checkQuery, [userId, today], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) return res.json(results); // Kung meron na, return na agad.

        // 2. WALA PA? GENERATE TAYO.
        // Logic: Identify Difficulty based on Date (Para FAIR sa lahat)
        const dayNumber = new Date().getDate(); 
        let difficultyMode = 'MEDIUM'; // Default

        if (dayNumber % 3 === 0) {
            difficultyMode = 'EASY';   // 3 Tasks
        } else if (dayNumber % 3 === 1) {
            difficultyMode = 'HARD';   // 1 Task
        } else {
            difficultyMode = 'MEDIUM'; // 2 Tasks
        }

        // 3. Kunin ang missions mula sa 'mission_types' table
        const getMenuQuery = "SELECT * FROM mission_types WHERE difficulty = ?";
        
        db.query(getMenuQuery, [difficultyMode], (menuErr, menuItems) => {
            if (menuErr) return res.status(500).json(menuErr);
            if (menuItems.length === 0) return res.status(404).json("No mission types found in database.");

            // 4. I-prepare ang data para sa INSERT
            // Mapping: mission_types.target_value -> daily_missions.target_minutes
            const values = menuItems.map(m => [
                userId, 
                m.text, 
                m.type, 
                m.target_value, 
                false, 
                today
            ]);

            const insertQuery = "INSERT INTO daily_missions (user_id, text, type, target_minutes, is_completed, mission_date) VALUES ?";
            
            db.query(insertQuery, [values], (insertErr) => {
                if (insertErr) return res.status(500).json(insertErr);
                
                // 5. Return the newly created missions
                db.query(checkQuery, [userId, today], (finalErr, finalRes) => {
                    if (finalErr) return res.status(500).json(finalErr);
                    res.json(finalRes);
                });
            });
        });
    });
});

// --- UPDATE MISSION, POINTS & LOGS (No Changes Needed here, logic is good) ---
router.put("/:missionId", (req, res) => {
    const missionId = req.params.missionId;

    // 1. Get Mission Info
    const getMissionQuery = "SELECT * FROM daily_missions WHERE id = ?";

    db.query(getMissionQuery, [missionId], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json("Mission not found");

        const mission = results[0];
        const newStatus = !mission.is_completed; 
        const userId = mission.user_id;

        // Determine Points & Reason
        let pointsChange = 0;
        let logReason = "";

        if (newStatus === true) {
            pointsChange = 50; 
            logReason = `Completed Mission: ${mission.text}`;
        } else {
            pointsChange = -50; 
            logReason = `Undid Mission: ${mission.text}`;
        }

        // 2. Update Mission Status
        const updateMissionQuery = "UPDATE daily_missions SET is_completed = ? WHERE id = ?";
        db.query(updateMissionQuery, [newStatus, missionId], (updateErr) => {
            if (updateErr) return res.status(500).json(updateErr);

            // 3. Update User Points
            const updatePointsQuery = "UPDATE users SET points = IFNULL(points, 0) + ? WHERE id = ?";
            db.query(updatePointsQuery, [pointsChange, userId], (pointsErr) => {
                if (pointsErr) console.error("Points Update Error:", pointsErr);

                // 4. INSERT LOG
                const insertLogQuery = "INSERT INTO point_logs (user_id, points, reason) VALUES (?, ?, ?)";
                
                db.query(insertLogQuery, [userId, pointsChange, logReason], (logErr) => {
                    if (logErr) console.error("Logging Error:", logErr);

                    // Success Response
                    res.json({ 
                        message: "Mission updated, Points added, Log saved.", 
                        newStatus: newStatus,
                        pointsAdded: pointsChange 
                    });
                });
            });
        });
    });
});

export default router;