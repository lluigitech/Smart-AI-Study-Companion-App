import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required"
    });
  }

  // Note: SELECT * kinukuha lahat ng columns kasama ang profile_pic at username
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: "error",
        message: "Server error"
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Email not found"
      });
    }

    const user = data[0];

    // Compare hashed password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect password"
      });
    }

    // ✅ SUCCESS RESPONSE
    res.json({
      status: "success",
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username, // 🔥 IMPORTANTE: Idinagdag ito para makita sa Profile/Settings
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        birthday: user.birthday,
        email: user.email,
        school: user.school, // Note: Kung tinanggal mo na sa DB ang school, magiging undefined ito, okay lang yan.
        preferred_study_time: user.preferred_study_time,
        learning_style: user.learning_style,
        profile_pic: user.profile_pic 
      }
    });
  });
});

export default router;