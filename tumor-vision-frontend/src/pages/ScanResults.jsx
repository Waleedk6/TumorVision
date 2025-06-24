import React from "react";
import styles from "./ScanResults.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faArrowsAlt,
  faDownload,
  faExclamationTriangle,
  faFilePdf,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";

const ScanResults = () => {
  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <nav className={styles.menu}>
          <Link to="/dashboard" className={styles.link}>
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
          <Link to="/upload" className={styles.link}>
            <i className="fas fa-upload"></i> Upload MRI
          </Link>
          <Link to="/patients" className={`${styles.link} ${styles.active}}`}>
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

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>MRI Scan Results</h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/patients">Patient Records</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Scan Results
                </li>
              </ol>
            </nav>
          </div>

          {/* Patient Summary */}
          <div className="card mb-4">
            <div className="card-body row">
              <div className="col-md-3 d-flex align-items-center mb-3">
                <div className="me-3">
                  <span
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: 60, height: 60, fontSize: "1.5rem" }}
                  >
                    JD
                  </span>
                </div>
                <div>
                  <h5 className="mb-0">John Doe</h5>
                  <p className="text-muted mb-0">ID: #PT-1001</p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <small className="text-muted">Age</small>
                <p className="mb-0">45 years</p>
              </div>
              <div className="col-md-3 mb-3">
                <small className="text-muted">Gender</small>
                <p className="mb-0">Male</p>
              </div>
              <div className="col-md-3 mb-3">
                <small className="text-muted">Last Scan</small>
                <p className="mb-0">Today, 10:30 AM</p>
              </div>
            </div>
          </div>

          {/* Scan Results */}
          <div className="row">
            <div className="col-lg-6">
              <div className="card mb-4">
                <div className="card-header">
                  <h5>MRI Scan</h5>
                </div>
                <div className="card-body text-center">
                  <img
                    src="https://via.placeholder.com/500x400.png?text=MRI+Scan+with+Annotations"
                    alt="MRI Scan"
                    className="img-fluid rounded"
                  />
                  <div className="mt-3">
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <FontAwesomeIcon icon={faArrowsAlt} /> Fullscreen
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      <FontAwesomeIcon icon={faDownload} /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card mb-4">
                <div className="card-header">
                  <h5>Analysis Results</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-danger">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5>
                          <FontAwesomeIcon icon={faExclamationTriangle} /> Tumor
                          Detected
                        </h5>
                        <p className="mb-0">
                          High confidence of abnormal tissue growth in left
                          parietal lobe
                        </p>
                      </div>
                      <div className="text-end">
                        <h2 className="mb-0">87%</h2>
                        <small>Confidence</small>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6>Tumor Characteristics</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <small className="text-muted">Location</small>
                        <p className="mb-0">Left parietal lobe</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <small className="text-muted">Size</small>
                        <p className="mb-0">2.4 cm diameter</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <small className="text-muted">Type</small>
                        <p className="mb-0">Glioblastoma (suspected)</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <small className="text-muted">Edema Present</small>
                        <p className="mb-0">Yes, moderate</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6>Recommendations</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Consult with neurosurgeon</span>
                        <span className="badge bg-primary">Priority</span>
                      </li>
                      <li className="list-group-item">
                        Schedule follow-up MRI in 4 weeks
                      </li>
                      <li className="list-group-item">
                        Consider biopsy for definitive diagnosis
                      </li>
                    </ul>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button className="btn btn-primary">
                      <FontAwesomeIcon icon={faFilePdf} /> Generate Full Report
                    </button>
                    <button className="btn btn-outline-secondary">
                      <FontAwesomeIcon icon={faShareAlt} /> Share with Colleague
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Scans */}
          <div className="card">
            <div className="card-header">
              <h5>Previous Scans</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Result</th>
                      <th>Confidence</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>15 Jun 2023</td>
                      <td>
                        <span className="badge bg-danger">Tumor Detected</span>
                      </td>
                      <td>87%</td>
                      <td>Initial detection</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          View
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>12 May 2023</td>
                      <td>
                        <span className="badge bg-success">No Tumor</span>
                      </td>
                      <td>92%</td>
                      <td>Routine checkup</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
