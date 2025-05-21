import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>TumorVision</h1>
          <h2>Welcome Back</h2>
          <p>Please enter your credentials to access the dashboard</p>
        </div>

        <form className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
            />
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Request access</Link></p>
        </div>
      </div>

      <div className="security-section">
        <h3>Secure Access</h3>
        <p>This portal is restricted to authorized medical professionals only.</p>
        <div className="security-features">
          <div className="security-badge">🔒 End-to-end encryption</div>
          <div className="security-badge">🏥 HIPAA compliant</div>
          <div className="security-badge">🛡️ Two-factor authentication</div>
        </div>
      </div>
    </div>
  );
};

export default Login;