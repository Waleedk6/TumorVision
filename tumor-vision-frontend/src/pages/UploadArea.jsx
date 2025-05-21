import React from 'react';
import { useDropzone } from 'react-dropzone';

const UploadArea = () => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.dcm']
    },
    maxFiles: 1
  });

  return (
    <div className="upload-page">
      <h1>Upload MRI Scan</h1>
      
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="upload-instructions">
          <p>Drag & drop an MRI image file here, or click to select files</p>
          <p>Supported formats: JPEG, PNG, DICOM</p>
          <p>Max file size: 10MB</p>
        </div>
      </div>

      <div className="history-section">
        <h2>Analysis History</h2>
        <div className="history-placeholder">
          {/* History will appear here */}
        </div>
      </div>
    </div>
  );
};

export default UploadArea;