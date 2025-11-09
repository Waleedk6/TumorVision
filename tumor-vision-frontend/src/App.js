import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
  
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import UploadMRI from "./pages/UploadMRI";
import Settings from "./pages/Settings";
import ScanResults from "./pages/ScanResults";
import EmailVerification from "./pages/EmailVerification";
 
// Global styles
import "./styles/colors.css";
import "./styles/landing.css";
import "./styles/utilities.css";
import "./styles/animations.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Dashboard and its nested routes */}
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/results" element={<ScanResults />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/upload" element={<UploadMRI />} />
        <Route path="/settings" element={<Settings />} />


        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
