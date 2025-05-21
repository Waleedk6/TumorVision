import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="auth-page register-page">
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-header">
            <h1>TumorVision</h1>
            <h2>Register for a TumorVision professional account</h2>
        </div>

        <form className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Dr. John Smith"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@hospital.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password (min 8 characters)"
              required
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label>Medical License Number</label>
            <input
              type="text"
              placeholder="Your professional license number"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" required /> I agree to the{' '}
              <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;