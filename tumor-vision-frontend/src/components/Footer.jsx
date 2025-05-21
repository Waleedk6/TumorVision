import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2>Start Free Trial</h2>
          <div className="footer-logo">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">TumorVision</span>
          </div>
          <p>Advanced brain tumor detection system for medical professionals.</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/research">Research</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Resources</h3>
          <ul className="footer-links">
            <li><Link to="/documentation">Documentation</Link></li>
            <li><Link to="/api">API</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <div className="compliance-badge">
            <span>🔒</span> HIPAA Compliant
          </div>
          <div className="partner-badge">
            <span>🏥</span> Partner Hospitals
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 TumorVision. All rights reserved.</p>
        <div className="legal-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;