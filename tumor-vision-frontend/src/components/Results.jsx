import React from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Results = ({ data, patientData, onNewAnalysis }) => {
  const chartData = {
    labels: data.affectedAreas.map(area => area.region),
    datasets: [
      {
        label: 'Tumor Probability',
        data: data.affectedAreas.map(area => area.probability * 100),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Probability (%)',
        },
      },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="results-section"
    >
      <div className="results-header">
        <h2>Analysis Results</h2>
        <button onClick={onNewAnalysis} className="new-analysis-button">
          New Analysis
        </button>
      </div>
      
      <div className="results-grid">
        <div className="patient-info">
          <h3>Patient Information</h3>
          {patientData ? (
            <div className="patient-details">
              <p><strong>Name:</strong> {patientData.name}</p>
              <p><strong>Age:</strong> {patientData.age}</p>
              <p><strong>Gender:</strong> {patientData.gender}</p>
              <p><strong>ID:</strong> {patientData.id || 'N/A'}</p>
            </div>
          ) : (
            <p>No patient information provided</p>
          )}
        </div>
        
        <div className="scan-preview">
          <h3>MRI Scan</h3>
          <div className="image-container">
            <img src={data.imageUrl} alt="Analyzed MRI" className="result-image" />
            {data.hasTumor && (
              <div className="tumor-indicator">
                <div className="pulse-animation"></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="diagnosis-summary">
          <h3>Diagnosis Summary</h3>
          <div className={`diagnosis-card ${data.hasTumor ? 'positive' : 'negative'}`}>
            <h4>
              {data.hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}
            </h4>
            {data.hasTumor && (
              <>
                <p><strong>Type:</strong> {data.tumorType}</p>
                <p><strong>Confidence:</strong> {(data.confidence * 100).toFixed(2)}%</p>
              </>
            )}
          </div>
        </div>
        
        <div className="detailed-analysis">
          <h3>Detailed Analysis</h3>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="affected-areas">
            <h4>Affected Areas</h4>
            <ul>
              {data.affectedAreas.map((area, index) => (
                <li key={index}>
                  {area.region}: {(area.probability * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="recommendations">
        <h3>Recommendations</h3>
        {data.hasTumor ? (
          <div className="recommendation-content">
            <p>Based on the analysis, we recommend:</p>
            <ul>
              <li>Consultation with a neuro-oncologist</li>
              <li>Further imaging (CT scan or advanced MRI)</li>
              <li>Biopsy for definitive diagnosis</li>
              <li>Immediate treatment planning</li>
            </ul>
          </div>
        ) : (
          <p>No immediate action required. Routine follow-up recommended.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Results;