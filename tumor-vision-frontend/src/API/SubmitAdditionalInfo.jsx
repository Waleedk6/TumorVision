import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Update to your backend's URL if different

/**
 * Function to submit additional user information to the backend
 * @param {Object} additionalInfo - The payload containing user details
 * @returns {Promise<Object>} - The diet recommendations from the backend
 */
export const submitAdditionalInfo = async (additionalInfo) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict/`, additionalInfo, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Return the response data directly
  } catch (error) {
    console.error("Error in submitAdditionalInfo API call:", error);
    throw error; // Rethrow the error for the calling function to handle
  }
};
