// src/API/RegisterAPI.jsx
import axios from "axios";

// Global Axios defaults
axios.defaults.withCredentials = false;
axios.defaults.headers.post["Content-Type"] = "application/json";

// Base URLs for different endpoints
const API_URL = "http://localhost:8080/register"; // Endpoints for register, login, verify, resend OTP
const USER_API_URL = "http://localhost:8080/user";  // Endpoint for fetching user data

// Attach Basic Auth credentials automatically for requests to USER_API_URL
axios.interceptors.request.use(
  (config) => {
    if (config.url.startsWith(USER_API_URL)) {
      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");
      if (username && password) {
        config.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Register a new user (required info)
export const registerUser = async (userData) => {
  try {
    console.debug("[DEBUG] Registering user with data:", userData);
    const response = await axios.post(`${API_URL}/required-info`, userData);
    console.debug("[DEBUG] User registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ERROR] Registration failed:", error);
    throw error;
  }
};

// Log in a user
// Example: Return the full Axios response for loginUser
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response;
  } catch (error) {
    // Additional logging or error handling can be added here if needed
    throw error;
  }
};

// Verify a user's email using OTP
export const verifyEmail = async (email, otp) => {
  try {
    console.debug(`[DEBUG] Verifying email ${email} with OTP: ${otp}`);
    const response = await axios.get(`${API_URL}/verify-email`, {
      params: { email, otp },
    });
    console.debug("[DEBUG] Email verification response:", response.data);
    return response; // Return the full response object
  } catch (error) {
    console.error("[ERROR] Email verification failed:", error);
    throw error;
  }
};

// Resend OTP to the given email
export const resendOtp = async (email) => {
  try {
    console.debug("[DEBUG] Resending OTP to email:", email);
    const response = await axios.post(`${API_URL}/resend-otp`, { email });
    console.debug("[DEBUG] Resend OTP response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ERROR] Resend OTP failed:", error);
    throw error;
  }
};

// Get full user data (user, diet, workout plan)
// This endpoint is protected; Basic Auth credentials are attached automatically.
// Return the entire response object (i.e. the DTO: { user, diet, workoutPlan })
export const getFullUserData = async () => {
  try {
    console.debug("[DEBUG] Fetching full user data from:", `${USER_API_URL}/full`);
    const response = await axios.get(`${USER_API_URL}/full`);
    console.debug("[DEBUG] Full user data (entire Axios response):", response);
    return response.data; // Return the DTO object { user, diet, workoutPlan }
  } catch (error) {
    console.error("[ERROR] Fetching full user data failed:", error);
    throw error;
  }
};
// Change password for the authenticated user
// Expects passwordData to be an object with { currentPassword: string, newPassword: string }
export const changePassword = async (passwordData) => {
  try {
    console.debug("[DEBUG] Changing password with data:", passwordData);
    const response = await axios.put(`${USER_API_URL}/change-password`, passwordData);
    console.debug("[DEBUG] Change password response:", response.data);
    return response;
  } catch (error) {
    console.error("[ERROR] Change password failed:", error);
    throw error;
  }
};
// Helper to build an image URL from a full local file path.
// For example, if the backend sends "Z:/Fitnesstan- FYP/fitnesstan-backend/gif_images/barbell_curl.gif",
// this function will return "http://localhost:8080/images/barbell_curl.gif".
export const buildImageUrl = (fullLocalPath) => {
  if (!fullLocalPath) return "";
  const filename = fullLocalPath.split(/[\\/]/).pop();
  return `http://localhost:8080/images/${filename}`;
};


// at the bottom of that file:
export const changeItemFromCluster = async (payload) => {
  console.debug("[DEBUG API] change-item payload:", payload);
  return axios.post(`${USER_API_URL}/change-item`, payload);
};

// API for resubmitting user data
export const reSubmitData = async (userData) => {
  try {
    console.debug("[DEBUG] Resubmitting user data:", userData);
    const response = await axios.put(`${USER_API_URL}/resubmit-data`, userData);
    console.debug("[DEBUG] User data resubmission response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ERROR] Resubmission failed:", error);
    throw error;
  }
};


// @param {{ name: string, email: string, feedback: string }} feedbackData
export const submitFeedback = async (feedbackData) => {
  try {
    console.debug("[DEBUG] Submitting feedback:", feedbackData);
    // hits POST http://localhost:8080/register/feedback
    const response = await axios.post(`${API_URL}/feedback`, feedbackData);
    console.debug("[DEBUG] Feedback response:", response.data);
    return response.data;
  } catch (err) {
    console.error("[ERROR] Feedback submission failed:", err);
    throw err;
  }
};

/**
 * Fetch all feedback entries (name + message) from the server
 * @returns {Promise<Array<{ name: string, feedback: string }>>}
 */
export const fetchFeedbacks = async () => {
  try {
    console.debug("[DEBUG] Fetching all feedbacks");
    const response = await axios.get(`${API_URL}/feedbacks`);
    console.debug("[DEBUG] Feedbacks fetched:", response.data);
    return response.data;
  } catch (err) {
    console.error("[ERROR] Fetching feedbacks failed:", err);
    throw err;
  }
};

export const requestPasswordReset = async ({ email }) => {
  try {
    console.debug("[DEBUG] Requesting password reset for:", email);
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    console.debug("[DEBUG] Password reset request response:", response.data);
    return response;
  } catch (err) {
    console.error("[ERROR] Password reset request failed:", err);
    throw err;
  }
};

// 2) Confirm the reset by supplying OTP + new password
// @param {{ email: string, otp: string, newPassword: string }}
export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    console.debug(
      "[DEBUG] Confirming password reset for:",
      email,
      "OTP:",
      otp
    );
    const url = `${API_URL}/reset-password?email=${encodeURIComponent(email)}`;
    const response = await axios.post(url, { otp, newPassword });
    console.debug("[DEBUG] Password reset confirmation response:", response.data);
    return response;
  } catch (err) {
    console.error("[ERROR] Password reset confirmation failed:", err);
    throw err;
  }
};