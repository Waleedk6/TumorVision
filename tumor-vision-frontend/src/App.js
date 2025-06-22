<<<<<<< HEAD
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import UploadArea from './pages/UploadArea';
import Settings from './pages/Settings';
import './styles/colors.css';
import './styles/landing.css';
import './styles/utilities.css';
import './styles/animations.css';

=======
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
import UploadArea from "./pages/UploadArea";
import Settings from "./pages/Settings";
import EmailVerification from "./pages/EmailVerification";
import "./styles/colors.css";
import "./styles/landing.css";
import "./styles/utilities.css";
import "./styles/animations.css";
>>>>>>> 9994d633cb4f6f1cc2ea26a73aad759168b0844d

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="patients" element={<Patients />} />
          <Route path="upload" element={<UploadArea />} />
          <Route path="settings" element={<Settings />} />
          
          <Route index element={<Navigate to="patients" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
