import React from 'react';
import styles from './Settings.module.css';
import { Link } from 'react-router-dom';

const Settings = () => {
  return (
    <div className={styles.settingsPage}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <nav className={styles.menu}>
          <Link to="/dashboard" className={styles.link}>
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
          <Link to="/upload" className={styles.link}>
            <i className="fas fa-upload"></i> Upload MRI
          </Link>
          <Link to="/patients" className={styles.link}>
            <i className="fas fa-users"></i> Patients
          </Link>
          <Link to="/settings" className={`${styles.link} ${styles.linkActive}`}>
            <i className="fas fa-cog"></i> Settings
          </Link>
          <Link to="/" className={styles.link}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </Link>
        </nav>
      </aside>

      {/* Main Heading */}
      <h1 className={styles.heading}>Account Settings</h1>

      {/* Profile Section */}
      <div className={styles.settingsSection}>
        <h2>Profile Information</h2>
        <div className={styles.settingsForm}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Dr. John Smith"
              className={styles.formControl}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="your@hospital.com"
              className={styles.formControl}
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className={styles.settingsSection}>
        <h2>Security</h2>
        <div className={styles.securityActions}>
          <button className={styles.btnPrimary}>Change Password</button>
          <button className={styles.btnOutline}>Enable Two-Factor Authentication</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.btnPrimary}>Save Changes</button>
        <button className={styles.btnOutline}>Cancel</button>
      </div>
    </div>
  );
};

export default Settings;
