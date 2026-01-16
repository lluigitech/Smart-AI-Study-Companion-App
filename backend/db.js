import mysql from "mysql2";

// ✅ Gamitin ang createPool imbes na createConnection
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "student_db",
  waitForConnections: true, // Maghihintay ng connection pag busy
  connectionLimit: 10,      // Pwede magbukas ng hanggang 10 connections
  queueLimit: 0
});

// Optional: Checker kung connected, para makita mo sa console
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to MySQL database (Pool)");
    connection.release(); // Ibabalik ang connection sa pool pagkatapos i-check
  }
});

export default db;