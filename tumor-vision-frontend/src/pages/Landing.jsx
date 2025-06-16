import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="landing-page">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-content"
          >
            <h1>Advanced Brain Tumor Detection and</h1>
            <p className="subtitle">
              AI-powered diagnostic tool to assist medical professionals in detecting brain tumors from MRI scans with 99% accuracy
            </p>
            <div className="cta-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                <Link to="/register" style={{color: 'inherit', textDecoration: 'none'}}>Get Started</Link>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline"
              >
                <Link to="/login" style={{color: 'inherit', textDecoration: 'none'}}>Medical Login</Link>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose TumorVision?</h2>
          <p className="section-subtitle">Our 2025 platform offers cutting-edge features for medical professionals</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Rapid Analysis</h3>
              <p>Get results in seconds with our optimized deep learning models, reducing diagnosis time by 90%.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>99% Accuracy</h3>
              <p>Clinically validated models with sensitivity and specificity exceeding most human radiologists.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & HIPAA Compliant</h3>
              <p>End-to-end encrypted data with strict access controls to protect patient information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <p className="section-subtitle">Simple three-step process for accurate diagnosis</p>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload MRI Scan</h3>
              <p>Drag and drop DICOM or standard image files directly into our secure portal.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our deep learning model processes the scan, identifying potential abnormalities.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>Receive a detailed report with highlighted areas of concern and confidence metrics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Enhance Your Diagnostic Process?</h2>
          <p>Join hundreds of medical professionals using TumorVision for faster, more accurate brain tumor detection.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary"
          >
            <Link to="/register" style={{color: 'inherit', textDecoration: 'none'}}>Start Free Trial</Link>
          </motion.button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Landing;