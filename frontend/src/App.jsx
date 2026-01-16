import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
// 1. IMPORT ANG GOOGLE PROVIDER
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import StudySpace from "./pages/StudySpace";
import WellBeing from "./pages/WellBeing"; 
import AITips from "./pages/AITips";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard"; 
import ResetPassword from "./pages/ResetPassword";

// Components
import BottomNav from "./components/BottomNav"; 
import Settings from "./components/Settings"; 

// --- LAYOUT COMPONENT ---
const MainLayout = () => {
  return (
    <>
      <div style={{ minHeight: '100vh', width: '100%', paddingBottom: '70px' }}> 
        <Outlet /> 
      </div>
      <BottomNav />
    </>
  );
};

function App() {
  // --- DARK MODE STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.body.style.backgroundColor = isDarkMode ? "#0f172a" : "#f1f5f9";
    document.body.style.color = isDarkMode ? "#ffffff" : "#000000"; // Optional: update text color too
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // 2. ILAGAY DITO ANG CLIENT ID MO MULA SA GOOGLE CLOUD CONSOLE
  const googleClientId = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";

  return (
    // 3. I-WRAP ANG BUONG ROUTER NG GOOGLE PROVIDER
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          
          {/* --- GROUP A: FULL SCREEN PAGES (No Bottom Nav) --- */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login isDarkMode={isDarkMode} />} />
          <Route path="/register" element={<Register isDarkMode={isDarkMode} />} />
          <Route path="/reset-password" element={<ResetPassword isDarkMode={isDarkMode} />} />
          
          {/* SETTINGS */}
          <Route 
            path="/settings" 
            element={<Settings isDarkMode={isDarkMode} onToggle={toggleDarkMode} />} 
          /> 

          {/* --- GROUP B: APP PAGES (With Bottom Nav) --- */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} />} />
            <Route path="/progress" element={<Progress isDarkMode={isDarkMode} />} />
            <Route path="/leaderboard" element={<Leaderboard isDarkMode={isDarkMode} />} /> 
            <Route path="/study-space" element={<StudySpace isDarkMode={isDarkMode} />} />
            <Route path="/study-plan" element={<Navigate to="/study-space" state={{ tab: 'planner' }} replace />} />
            <Route path="/profile" element={<Profile isDarkMode={isDarkMode} />} />
            <Route path="/wellbeing" element={<WellBeing isDarkMode={isDarkMode} />} />
            <Route path="/ai-tips" element={<AITips isDarkMode={isDarkMode} />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div style={{textAlign:'center', marginTop: 50, color: isDarkMode ? 'white' : 'black'}}>404: Page Not Found</div>} />

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;