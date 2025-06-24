import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const stats = [
    { title: "Today's Scans", value: 8, icon: 'fas fa-calendar-day', color: 'primary' },
    { title: 'Total Patients', value: 142, icon: 'fas fa-user-injured', color: 'success' },
    { title: 'Positive Cases', value: 23, icon: 'fas fa-exclamation-triangle', color: 'danger' },
    { title: 'Accuracy Rate', value: '99%', icon: 'fas fa-check-circle', color: 'info' },
  ];
  const appointments = [
    { date: new Date(2025, 5, 14), type: 'completed' },
    { date: new Date(2025, 5, 15), type: 'completed' },
    { date: new Date(2025, 5, 18), type: 'completed' },
    { date: new Date(2025, 5, 20), type: 'completed' },
    { date: new Date(2025, 5, 21), type: 'completed' },
    { date: new Date(2025, 5, 25), type: 'upcoming' },
    { date: new Date(2025, 5, 26), type: 'upcoming' },
    { date: new Date(2025, 5, 30), type: 'upcoming' },
    { date: new Date(2025, 6, 4), type: 'upcoming' },
  ];

  const tileClassName = ({ date }) => {
    const found = appointments.find(app =>
      date.getFullYear() === app.date.getFullYear() &&
      date.getMonth() === app.date.getMonth() &&
      date.getDate() === app.date.getDate()
    );
    return found ? styles[found.type] : null;
  };
  const scans = [
    {
      name: 'John Doe', age: 45, time: 'Today, 10:30 AM', result: 'Tumor Detected', confidence: 87,
      badgeColor: 'danger', initials: 'JD', id: '#PT-1001'
    },
    {
      name: 'Jane Smith', age: 32, time: 'Today, 09:15 AM', result: 'No Tumor', confidence: 92,
      badgeColor: 'success', initials: 'JS', id: '#PT-1002'
    },
    {
      name: 'Robert Brown', age: 58, time: 'Yesterday, 3:45 PM', result: 'Tumor Detected', confidence: 78,
      badgeColor: 'danger', initials: 'RB', id: '#PT-1003'
    }
  ];

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <nav className={styles.menu}>
          <Link to="/dashboard" className={`${styles.link} ${styles.active}`}><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
          <Link to="/upload" className={styles.link}><i className="fas fa-upload"></i> Upload MRI</Link>
          <Link to="/patients" className={styles.link}><i className="fas fa-users"></i> Patients</Link>
          <Link to="/settings" className={styles.link}><i className="fas fa-cog"></i> Settings</Link>
          <Link to="/" className={styles.link}><i className="fas fa-sign-out-alt"></i> Logout</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>


        <div className={styles.card + ' card mb-4'}>
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">Welcome back, Dr. Smith</h4>
              <p className="text-muted mb-0">Here's what's happening with your patients today</p>
            </div>
            <button className="btn btn-primary"><i className="fas fa-upload me-2"></i> New Scan</button>
          </div>
        </div>

        <div className="row mb-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="col-md-3">
              <div className={`card ${styles.card}`}>
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded`}>
                    <i className={`${stat.icon} text-${stat.color}`}></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={`card mb-4 ${styles.card} ${styles.calendarCard}`}>

          <div className="card-body">
            <h5 className="mb-3">Appointment Calendar</h5>
            <Calendar tileClassName={tileClassName} className={styles.calendar} />
            <div className={styles.legend}>
              <span className={styles.completedDot}></span> Completed &nbsp;&nbsp;
              <span className={styles.upcomingDot}></span> Upcoming
            </div>
          </div>
        </div>


        <div className={`card ${styles.card}`}>
          <div className="card-header">
            <h5 className="mb-0">Recent MRI Scans</h5>
          </div>
          <div className="card-body table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th><th>Age</th><th>Scan Date</th><th>Result</th><th>Confidence</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className={`rounded-circle bg-${scan.badgeColor} text-white d-flex align-items-center justify-content-center me-3`} style={{ width: 36, height: 36 }}>
                          {scan.initials}
                        </div>
                        <div>
                          <h6 className="mb-0">{scan.name}</h6>
                          <small className="text-muted">ID: {scan.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{scan.age}</td>
                    <td>{scan.time}</td>
                    <td><span className={`badge bg-${scan.badgeColor}`}>{scan.result}</span></td>
                    <td>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className={`progress-bar bg-${scan.badgeColor}`} style={{ width: `${scan.confidence}%` }}></div>
                      </div>
                      <small>{scan.confidence}%</small>
                    </td>
                    <td><Link to="/results" className="btn btn-sm btn-outline-primary">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
