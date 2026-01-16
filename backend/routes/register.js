import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    username, // Added username
    first_name,
    middle_name,
    last_name,
    birthday,
    email,
    password,
    // school, <-- REMOVED NA
    preferred_study_time,
    learning_style
  } = req.body;

  // Validate required fields (Kasama na username)
  if (!username || !first_name || !last_name || !birthday || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Please fill all required fields"
    });
  }

  // Check muna kung existing na ang Email o Username
  const checkSql = "SELECT * FROM users WHERE email = ? OR username = ?";
  
  db.query(checkSql, [email, username], async (err, data) => {
    if (err) {
        console.log(err);
        return res.status(500).json({ status: "error", message: "Server error checking user" });
    }
    
    if (data.length > 0) {
        return res.status(409).json({ status: "error", message: "Username or Email already exists!" });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User (Wala nang School column)
        const sql = `
        INSERT INTO users 
        (username, first_name, middle_name, last_name, birthday, email, password, preferred_study_time, learning_style) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
        username,
        first_name,
        middle_name || null,
        last_name,
        birthday,
        email,
        hashedPassword,
        preferred_study_time || null,
        learning_style || null
        ];

        db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
            status: "error",
            message: "Database insertion error"
            });
        }

        res.json({
            status: "success",
            message: "Registration successful",
            userId: result.insertId
        });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
        status: "error",
        message: "Server error"
        });
    }
  });
});

export default router;