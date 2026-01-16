import express from "express";
import db from "../db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = express.Router();

// 🔥 MULTER CONFIG (Pang-upload ng files)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 1. ADD Material (With PDF Text Extraction Integration)
router.post('/add', upload.single('file'), async (req, res) => {
    const { user_id, subject_id, type, title, content } = req.body;
    let file_path = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
    let extractedText = content || null; // Default content

    // 🔥 INTEGRATION: Kung PDF ang file, basahin ang text nito
    if (req.file && req.file.mimetype === 'application/pdf') {
        try {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            extractedText = data.text; // Ito ang magiging context ng AI mo
            console.log(`📄 PDF Parsed: ${title} (${data.numpages} pages)`);
        } catch (error) {
            console.error("❌ PDF Parsing Error:", error);
            // Itutuloy pa rin ang save kahit fail ang parsing
        }
    }

    const sql = "INSERT INTO study_materials (user_id, subject_id, type, title, content, file_path) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [user_id, subject_id, type, title, extractedText, file_path], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Success", id: result.insertId });
    });
});

// 2. UPDATE Material
router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    
    const sql = "UPDATE study_materials SET content = ? WHERE id = ?";
    db.query(sql, [content, id], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "Updated successfully" });
    });
});

// 3. GET Materials per Subject
router.get('/:subjectId', (req, res) => {
    const sql = "SELECT * FROM study_materials WHERE subject_id = ? ORDER BY created_at DESC";
    db.query(sql, [req.params.subjectId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 4. DELETE Material
router.delete('/:id', (req, res) => {
    const sql = "DELETE FROM study_materials WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});

export default router;