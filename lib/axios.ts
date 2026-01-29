import axios from "axios";
import { supabase } from "./supabase/client";

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_API_URL || ""
      : "",
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add auth token to requests
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          data: config.data,
          params: config.params,
          headers: config.headers,
        },
      );
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    // Get current session from Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting auth session:", error);
      return null;
    }

    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        },
      );
    }

    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      console.warn("Unauthorized access - redirecting to login");
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.warn("Forbidden - insufficient permissions");
    } else if (error.response?.status >= 500) {
      // Server error
      console.error("Server error - please try again later");
    } else if (error.code === "ECONNABORTED") {
      // Timeout
      console.error("Request timeout - please check your connection");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
