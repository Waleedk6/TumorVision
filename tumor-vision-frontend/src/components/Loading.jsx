import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="loading-overlay"
    >
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h3>Analyzing MRI Scan</h3>
        <p>Our AI is processing the image to detect any abnormalities...</p>
        <div className="progress-container">
          <div className="progress-bar"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default Loading;