import React from 'react';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';

const Settings = () => {
  return (
    
    <div className="settings-page">
            <aside className={styles.sidebar}>
              <nav className={styles.menu}>
                <Link to="/dashboard" className={styles.link}><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
                  <Link to="/upload" className={styles.link}><i className="fas fa-upload"></i> Upload MRI</Link>
                  <Link to="/patients" className={styles.link}><i className="fas fa-users"></i> Patients</Link>
                  <Link to="/settings" className={`${styles.link} ${styles.active}`}><i className="fas fa-cog"></i> Settings</Link>
                <Link to="/" className={styles.link}><i className="fas fa-sign-out-alt"></i> Logout</Link>
              </nav>
            </aside>
      <h1>Account Settings</h1>
      
      <div className="settings-section">
        <h2>Profile Information</h2>
        <div className="settings-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Dr. John Smith" 
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="your@hospital.com" 
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Security</h2>
        <div className="security-actions">
          <button className="btn-primary">
            Change Password
          </button>
          <button className="btn-outline">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-primary">Save Changes</button>
        <button className="btn-outline">Cancel</button>
      </div>
    </div>
  );
};

export default Settings;