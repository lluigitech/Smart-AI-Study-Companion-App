import express from "express";
import db from "../db.js";

const router = express.Router();

// 1. GET ALL TASKS for a User
router.get("/:userId", (req, res) => {
    const q = "SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC";
    db.query(q, [req.params.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// 2. ADD NEW TASK
router.post("/add", (req, res) => {
    const { user_id, title, subject, type, date, time, priority, description } = req.body;
    const q = "INSERT INTO tasks (user_id, title, subject, type, due_date, due_time, priority, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(q, [user_id, title, subject, type, date, time, priority, description], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Task created", id: data.insertId });
    });
});

// 3. TOGGLE COMPLETE
router.put("/toggle/:taskId", (req, res) => {
    const taskId = req.params.taskId;
    const { is_completed, date_completed } = req.body; // Expecting true/false and date string
    
    const q = "UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ?";
    db.query(q, [is_completed, date_completed, taskId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Task updated" });
    });
});

// 4. DELETE TASK
router.delete("/:taskId", (req, res) => {
    const q = "DELETE FROM tasks WHERE id = ?";
    db.query(q, [req.params.taskId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Task deleted" });
    });
});

export default router;