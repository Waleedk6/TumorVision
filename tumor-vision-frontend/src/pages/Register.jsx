import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../API/RegisterAPI";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("[DEBUG] Registration form data:", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: "HIDDEN", // Never log actual passwords
      });

      const response = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("[COMPONENT] Received response:", response);

      if (response.status === 201) {
        console.log("[DEBUG] Navigating to /verify-email with state:", {
          email: formData.email.trim(),
        });

        // Double-ensure navigation
        navigate("/verify-email", {
          state: {
            email: formData.email.trim(),
            fromRegistration: true,
          },
          replace: true, // Prevent back navigation to register
        });

        // Fallback check after 1 second
        setTimeout(() => {
          if (window.location.pathname !== "/verify-email") {
            console.error("Navigation failed, forcing redirect");
            window.location.href = `/verify-email?email=${encodeURIComponent(
              formData.email.trim()
            )}`;
          }
        }, 1000);
      }
    } catch (err) {
      console.error("[DEBUG] Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page register-page">
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-header">
            <h1>TumorVision</h1>
            <h2>Register for a TumorVision professional account</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="username"
                placeholder="Dr. John Smith"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@hospital.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min 8 characters)"
                required
                minLength="8"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" required /> I agree to the{" "}
                <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
