import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-layout"
    >
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>TumorVision</h2>
          <p>Welcome back, Dr. Smith</p>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard/patients" className="nav-item">
            Patients
          </Link>
          <Link to="/dashboard/upload" className="nav-item">
            Upload MRI
          </Link>
          <Link to="/dashboard/settings" className="nav-item">
            Settings
          </Link>
          <Link to="/logout" className="nav-item logout">
            Logout
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <Outlet /> {/* This will render the nested routes */}
      </div>
    </motion.div>
  );
};

export default Dashboard;