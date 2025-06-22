// src/API/RegisterAPI.jsx
import axios from "axios";

// Configure Axios defaults
axios.defaults.withCredentials = false;
axios.defaults.headers.post["Content-Type"] = "application/json";

// Base API URL
const API_BASE_URL = "http://localhost:8080/user";

// Request interceptor for Basic Auth
axios.interceptors.request.use(
  (config) => {
    if (config.url.startsWith(API_BASE_URL)) {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        config.headers.Authorization = `Basic ${authToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// In RegisterAPI.jsx
axios.interceptors.response.use(
  (response) => {
    // Ensure consistent response structure
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  },

  // Format error responses consistently
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper function to create Basic Auth token
const createBasicToken = (email, password) => {
  return btoa(`${email}:${password}`);
};

export const registerUser = async (userData) => {
  try {
    console.log("[FRONTEND DEBUG] Sending registration data:", {
      username: userData.username,
      email: userData.email,
      password: "HIDDEN",
    });

    const response = await axios.post(`${API_BASE_URL}/register`, {
      // Changed endpoint to match backend
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });

    console.log("[FRONTEND DEBUG] Full registration response:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });

    return response;
  } catch (error) {
    console.error("[FRONTEND DEBUG] Registration error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config,
    });
    throw (
      error.response?.data || {
        message: "Registration failed",
        status: error.response?.status || 500,
      }
    );
  }
};

export const verifyEmail = async (email, otp) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/verify-email`, {
      params: { email, otp },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Email verification failed" };
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to resend OTP" };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email: credentials.email,
      password: credentials.password,
    });

    // Debug log the full response
    console.log("Login API Response:", response);

    // Handle both response structures
    const userData = response.data.user || response.data;

    if (!userData) {
      throw new Error("Invalid response structure from server");
    }

    // Create and store Basic Auth token
    const authToken = createBasicToken(credentials.email, credentials.password);
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw (
      error.response?.data || {
        message: "Login failed. Please check your credentials.",
      }
    );
  }
};

export const logoutUser = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

// User Management API Endpoints
export const getFullUserData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/full`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch user data" };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/change-password`,
      passwordData
    );

    // Update stored auth token if password changed successfully
    if (response.data.success) {
      const user = JSON.parse(localStorage.getItem("user"));
      const authToken = createBasicToken(user.email, passwordData.newPassword);
      localStorage.setItem("authToken", authToken);
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Password change failed" };
  }
};
