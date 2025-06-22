import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setError(data.message || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setError('Network error. Please try again.');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setError('No verification token provided');
    }
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>TumorVision</h1>
          <h2>Email Verification</h2>
          <p>
            {status === 'verifying' && 'Verifying your email address...'}
            {status === 'success' && 'Email successfully verified!'}
            {status === 'error' && 'Verification failed'}
          </p>
        </div>

        {status === 'verifying' && (
          <div className="verification-status">
            <div className="loading-spinner"></div>
            <p>Please wait while we verify your email</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <p>Your email has been successfully verified.</p>
            <p>You will be redirected to the login page shortly.</p>
            <Link to="/login" className="auth-button">
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="verification-error">
            <div className="error-icon">✗</div>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button 
                className="auth-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link to="/login" className="auth-button secondary">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p>Need help? <Link to="/contact-support">Contact support</Link></p>
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

export default EmailVerification;