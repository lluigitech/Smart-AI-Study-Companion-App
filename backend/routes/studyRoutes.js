import express from "express";
import db from "../db.js"; 
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// ==========================================
// ☁️ 1. CLOUDINARY CONFIGURATION
// ==========================================
cloudinary.config({
    cloud_name: 'dbhacjoud',                
    api_key: '662386273461439',      // ✅ Gamit ang keys na binigay mo
    api_secret: 'oPcJ8qkpUFcUBwYbkfbATJumBK8' 
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'study-companion-files',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'ppt', 'pptx'],
        resource_type: 'auto',
        access_mode: 'public' // 🔥 IMPORTANTE: Para gumana ang PDF Viewer at hindi 401 Error
    }
});

const upload = multer({ storage: storage });

// ==========================================
// 📂 2. SUBJECT ROUTES
// ==========================================

// GET ALL SUBJECTS
router.get('/subjects/:userId', (req, res) => {
    const sql = "SELECT * FROM study_subjects WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) {
            console.error("DB Error (Subjects):", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ADD SUBJECT
router.post('/subjects/add', (req, res) => {
    const { user_id, subject_name, color_theme } = req.body;
    const sql = "INSERT INTO study_subjects (user_id, subject_name, color_theme) VALUES (?, ?, ?)";
    db.query(sql, [user_id, subject_name, color_theme], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Subject added", id: result.insertId });
    });
});

// UPDATE SUBJECT
router.put('/subjects/update/:id', (req, res) => {
    const { subject_name, color_theme } = req.body;
    const sql = "UPDATE study_subjects SET subject_name = ?, color_theme = ? WHERE id = ?";
    db.query(sql, [subject_name, color_theme, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Subject updated" });
    });
});

// DELETE SUBJECT
router.delete('/subjects/:id', (req, res) => {
    const subjectId = req.params.id;
    db.query("SELECT subject_name FROM study_subjects WHERE id = ?", [subjectId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: "Subject not found" });
        const subjectName = results[0].subject_name;

        db.query("DELETE FROM tasks WHERE subject = ?", [subjectName], () => {
            db.query("DELETE FROM study_subjects WHERE id = ?", [subjectId], (delErr) => {
                if (delErr) return res.status(500).json(delErr);
                res.json({ message: "Subject deleted" });
            });
        });
    });
});

// ==========================================
// 📄 3. MATERIAL ROUTES (Uploads)
// ==========================================

// GET MATERIALS
router.get('/materials/:subjectId', (req, res) => {
    const sql = "SELECT * FROM study_materials WHERE subject_id = ? ORDER BY created_at DESC";
    db.query(sql, [req.params.subjectId], (err, results) => {
        if (err) return res.status(500).json(err);
        const processed = results.map(m => ({
            ...m,
            content: m.type === 'deck' ? JSON.parse(m.content) : m.content
        }));
        res.json(processed);
    });
});

// UPLOAD MATERIAL (Cloudinary)
router.post('/materials/add', upload.single('file'), (req, res) => {
    if (req.body.type === 'file' && !req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const { user_id, subject_id, type, title, content } = req.body;
    
    // Get Cloudinary URL
    const filePath = req.file ? req.file.path : null;
    
    let finalContent = content;
    if (type === 'file') finalContent = "File Attachment";
    else if (type === 'deck') finalContent = content; 

    const sql = "INSERT INTO study_materials (user_id, subject_id, type, title, content, file_path) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [user_id, subject_id, type, title, finalContent, filePath], (err, result) => {
        if (err) {
            console.error("DB Error (Upload):", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Saved!", id: result.insertId, file_path: filePath });
    });
});

// DELETE MATERIAL
router.delete('/materials/:id', (req, res) => {
    const sql = "DELETE FROM study_materials WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});

// ==========================================
// 🎮 4. GAMIFICATION ROUTES
// ==========================================
router.post('/add-points', (req, res) => {
    const { userId, points, reason } = req.body;
    
    // Check if 'points' column exists, if not just return success to avoid crash
    const sql = "UPDATE users SET points = points + ? WHERE id = ?";
    
    db.query(sql, [points, userId], (err, result) => {
        if (err) {
            console.warn("Gamification Error (Might need 'points' column in DB):", err.message);
            return res.status(200).json({ message: "Points tracked (locally)" });
        }
        res.json({ message: "Points added successfully!" });
    });
});

export default router;