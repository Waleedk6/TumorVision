import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, resendOtp } from '../API/RegisterAPI';

const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  // Get email from navigation state or fallback
  const email = state?.email || '';

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setError('No email provided for verification');
    }
  }, [email]);

  const handleVerify = async () => {
    if (!otp || !email) return;
    
    setLoading(true);
    setError('');
    setStatus('verifying');
    
    try {
      const response = await verifyEmail(email, otp);
      if (response.status === 200) {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      await resendOtp(email);
      setStatus('verifying');
      alert('New verification code has been sent to your email.');
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>TumorVision</h1>
          <h2>Email Verification</h2>
          <p>
            {status === 'verifying' && `Enter the verification code sent to ${email}`}
            {status === 'success' && 'Email successfully verified!'}
            {status === 'error' && 'Verification failed'}
          </p>
        </div>

        {status === 'verifying' && (
          <div className="verification-status">
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button 
                className="auth-button"
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              <button 
                className="auth-button secondary"
                onClick={handleResend}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <p>Your email has been successfully verified.</p>
            <p>You will be redirected to the login page shortly.</p>
            <Link to="/login" className="auth-button">
              Go to Login Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="verification-error">
            <div className="error-icon">✗</div>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              {email ? (
                <>
                  <button 
                    className="auth-button"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Resend Code'}
                  </button>
                  <Link to="/login" className="auth-button secondary">
                    Go to Login
                  </Link>
                </>
              ) : (
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