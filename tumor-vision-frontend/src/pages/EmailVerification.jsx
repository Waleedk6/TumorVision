import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail, resendOtp } from '../API/RegisterAPI';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      setStatus('verifying');
      const response = await verifyEmail(email, otp);
      if (response.data) {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setStatus('error');
      setError(err.response?.data || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(email);
      alert('New verification code has been sent to your email.');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setError('No email provided for verification');
    }
  }, [email]);

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
            <div className="form-group">
              <label>Enter Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button 
              className="auth-button"
              onClick={handleVerify}
            >
              Verify Email
            </button>
            <button 
              className="auth-button secondary"
              onClick={handleResend}
            >
              Resend Code
            </button>
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
              {email && (
                <>
                  <button 
                    className="auth-button"
                    onClick={handleResend}
                  >
                    Resend Code
                  </button>
                  <Link to="/login" className="auth-button secondary">
                    Go to Login
                  </Link>
                </>
              )}
              {!email && (
                <Link to="/register" className="auth-button">
                  Register Again
                </Link>
              )}
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