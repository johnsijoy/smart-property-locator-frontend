import axios from 'axios';

// ✅ Django backend base URL (update if using a different host/port)
const API_URL = "http://127.0.0.1:8000/api/accounts/";


// ✅ Register Buyer
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}register/`, userData);
    return response; // Return the full response object
  } catch (error) {
    console.error("Registration API Error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Login (Admin or Buyer)
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}login/`, credentials);
    return response; // Return full response object with tokens
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};
