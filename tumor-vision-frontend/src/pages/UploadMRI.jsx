import React, { useState, useRef, useEffect } from 'react';
import styles from './UploadMRI.module.css';
import { Link } from 'react-router-dom';

const UploadMRI = () => {
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    document.getElementById('scanDate').valueAsDate = new Date();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (files) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      const validTypes = ['image/dicom', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(dcm|png|jpe?g)$/i)) {
        alert('Please upload a valid DICOM or image file (DCM, PNG, JPG, JPEG)');
        return;
      }
      if (selectedFile.size > 25 * 1024 * 1024) {
        alert('File size exceeds 25MB limit');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      if (!selectedFile.type.includes('dicom')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviewUrl(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreviewUrl('https://via.placeholder.com/500x400.png?text=DICOM+File+Preview');
      }
    }
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreviewUrl('');
    setFileName('');
    fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      window.location.href = 'results.html';
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <nav className={styles.menu}>
          <Link to="/dashboard" className={`${styles.link} ${styles.active}`}><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
            <Link to="/upload" className={styles.link}><i className="fas fa-upload"></i> Upload MRI</Link>
            <Link to="/patients" className={styles.link}><i className="fas fa-users"></i> Patients</Link>
            <Link to="/settings" className={styles.link}><i className="fas fa-cog"></i> Settings</Link>
          <Link to="/" className={styles.link}><i className="fas fa-sign-out-alt"></i> Logout</Link>
        </nav>
      </aside>
      <div className={styles.mainContent}>
        <div className="container-fluid">
          <h2>Upload MRI Scan</h2>
          <div className="card">
            <div className="card-body row">
              <div className="col-lg-6">
                <div className={styles.dropzone} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <h4>Upload MRI Scan</h4>
                  <p>Drag and drop DICOM or standard image files here</p>
                  <p>Supports: .dcm, .png, .jpg, .jpeg (Max 25MB)</p>
                  <input type="file" className="d-none" ref={fileInputRef} accept=".dcm,.png,.jpg,.jpeg" onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current.click()} className="btn btn-primary">Browse Files</button>
                </div>
                {filePreviewUrl && (
                  <div className="text-center">
                    <div className={styles.scanPreview}>
                      <img src={filePreviewUrl} alt="Preview" className="img-fluid rounded" />
                      <div className={styles.scanActions}>
                        <button className="btn btn-sm btn-light">Zoom</button>
                        <button onClick={handleRemoveFile} className="btn btn-sm btn-light">Replace</button>
                      </div>
                    </div>
                    <div><small>{fileName}</small></div>
                  </div>
                )}
              </div>
              <div className="col-lg-6">
                <form onSubmit={handleSubmit}>
                  <h5>Patient Information</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label>Patient ID</label>
                      <div className="input-group">
                        <span className="input-group-text">#PT-</span>
                        <input type="text" className="form-control" required />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Scan Date</label>
                      <input type="date" className="form-control" id="scanDate" required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label>First Name</label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Last Name</label>
                      <input type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label>Age</label>
                      <input type="number" className="form-control" min="1" max="120" required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Gender</label>
                      <select className="form-select" required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label>Blood Type</label>
                      <select className="form-select">
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                  <h5>Clinical Information</h5>
                  <div className="mb-3">
                    <label>Referring Physician</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label>Clinical Notes</label>
                    <textarea className="form-control" rows="3"></textarea>
                  </div>
                  <div className="mb-3">
                    <label>Priority</label>
                    <div className="btn-group w-100" role="group">
                      <input type="radio" className="btn-check" name="priority" id="low" defaultChecked />
                      <label className="btn btn-outline-success" htmlFor="low">Routine</label>
                      <input type="radio" className="btn-check" name="priority" id="medium" />
                      <label className="btn btn-outline-warning" htmlFor="medium">Urgent</label>
                      <input type="radio" className="btn-check" name="priority" id="high" />
                      <label className="btn btn-outline-danger" htmlFor="high">Emergency</label>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={!file || isUploading}>
                      {isUploading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-check me-2"></i>}
                      {isUploading ? 'Processing...' : 'Submit for Analysis'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMRI;