import React from "react";
import styles from './Patients.module.css';
import { Link } from 'react-router-dom';

const Patients = () => {
  const patients = []; // Empty array - will be populated dynamically

  return (
  <div className={styles.wrapper}>
    <aside className={styles.sidebar}>
      <nav className={styles.menu}>
        <Link to="/dashboard" className={styles.link}>
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </Link>
        <Link to="/upload" className={styles.link}>
          <i className="fas fa-upload"></i> Upload MRI
        </Link>
        <Link to="/patients" className={`${styles.link} ${styles.active}`}>
          <i className="fas fa-users"></i> Patients
        </Link>
        <Link to="/settings" className={styles.link}>
          <i className="fas fa-cog"></i> Settings
        </Link>
        <Link to="/" className={styles.link}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </Link>
      </nav>
    </aside>
    <main className={styles.mainContent}>
      <h1>Patient Records</h1>

      <div className={styles.patientsTableContainer}>
        <table className={styles.patientsTable}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Scan Date</th>
              <th>Result</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className={
                  patient.result === "Tumor Detected"
                    ? "positive-case"
                    : "negative-case"
                }
              >
                <td>
                  {patient.name} <small>ID: {patient.id}</small>
                </td>
                <td>{patient.age}</td>
                <td>{patient.scanDate}</td>
                <td>{patient.result}</td>
                <td>{patient.confidence}%</td>
                <td>
                  <button className="btn-view">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  </div>
  );
};

export default Patients;
