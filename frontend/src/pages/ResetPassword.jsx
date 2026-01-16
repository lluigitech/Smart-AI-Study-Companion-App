import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
// Import lahat ng icons na ginamit mo sa baba
import { IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoLibrary } from "react-icons/io5";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email"); 
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // DAGDAG: Kailangan ito para hindi mag-error ang UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return setMessage("Passwords do not match!");
    }

    setLoading(true); // Simulan ang loading
    try {
      const response = await axios.post("http://localhost:5000/api/update-password", {
        email: email,       
        newPassword: newPassword
      });

      if (response.status === 200) {
        alert("Password updated! Redirecting to login...");
        navigate("/login");
      }
    } catch (err) {
      console.log(err.response?.data);
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false); // Tapos na ang loading
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <IoLibrary size={40} color="#047857" />
          <h2 style={styles.title}>New Password</h2>
          <p style={styles.sub}>Please enter your new secure password for: <br/> <b>{email}</b></p>
        </div>

        <form onSubmit={handleReset} style={styles.form}>
          {/* New Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>NEW PASSWORD</label>
            <div style={styles.inputContainer}>
              <IoLockClosedOutline style={styles.inputIcon} size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                style={styles.inputField}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {/* Show/Hide Password Toggle */}
              <div 
                style={styles.eyeIcon} 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline size={20}/> : <IoEyeOutline size={20}/>}
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>CONFIRM PASSWORD</label>
            <div style={styles.inputContainer}>
              <IoLockClosedOutline style={styles.inputIcon} size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                style={styles.inputField}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message && <div style={styles.message}>{message}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ecfdf5" },
  card: { background: "#fff", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" },
  title: { fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "20px" },
  sub: { color: "#64748b", marginBottom: "30px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { textAlign: "left" },
  label: { fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", display: "block" },
  inputContainer: { position: "relative" },
  inputIcon: { position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" },
  eyeIcon: { position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", cursor: "pointer" },
  inputField: { width: "100%", padding: "12px 45px 12px 45px", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none", boxSizing: "border-box" },
  btn: { padding: "15px", borderRadius: "10px", border: "none", background: "#047857", color: "#fff", fontWeight: "700", cursor: "pointer", transition: "0.3s" },
  message: { padding: "10px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "14px" }
};