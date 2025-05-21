import React from 'react';
import { motion } from 'framer-motion';
import { FaHistory, FaFileMedical, FaUser } from 'react-icons/fa';

const History = ({ analyses }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="history-section"
    >
      <div className="history-header">
        <FaHistory className="history-icon" />
        <h2>Analysis History</h2>
      </div>
      
      {analyses.length === 0 ? (
        <div className="empty-history">
          <p>No previous analyses found</p>
        </div>
      ) : (
        <div className="history-list">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="history-item">
              <div className="item-header">
                <div className="patient-info">
                  <FaUser className="patient-icon" />
                  <span>{analysis.patient.name}</span>
                </div>
                <div className="analysis-date">{analysis.date}</div>
              </div>
              
              <div className="item-content">
                <div className={`result-indicator ${analysis.result.hasTumor ? 'positive' : 'negative'}`}>
                  {analysis.result.hasTumor ? 'Tumor Detected' : 'No Tumor'}
                </div>
                {analysis.result.hasTumor && (
                  <div className="tumor-details">
                    <span>Type: {analysis.result.tumorType}</span>
                    <span>Confidence: {(analysis.result.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              
              <div className="item-footer">
                <button className="view-details-button">
                  <FaFileMedical /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default History;