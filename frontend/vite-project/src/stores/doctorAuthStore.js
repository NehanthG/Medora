import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useDoctorAuthStore = create((set) => ({
  doctor: null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: true,
  error: null,

  checkAuth: async () => {
    try {
      // First, check if we have a doctor token
      const token = localStorage.getItem('doctorToken');
      
      if (!token) {
        set({ doctor: null, isCheckingAuth: false });
        return null;
      }
      
      // Verify the token with the server
      const res = await axiosInstance.get("/doctor/check", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      set({ doctor: res.data, isCheckingAuth: false });
      return res.data;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('doctorToken'); // Clear invalid token
      set({ doctor: null, isCheckingAuth: false });
      return null;
    }
  },

  login: async (data) => {
  set({ isLoggingIn: true, error: null });
  console.log('Login attempt with data:', {
    email: data.email,
    hasPassword: !!data.password
  });

  try {
    const response = await axiosInstance.post("/doctor/login", {
      email: data.email,
      password: data.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Login response:', {
      status: response.status,
      data: {
        ...response.data,
        token: response.data.token ? '***TOKEN_RECEIVED***' : 'NO_TOKEN'
      }
    });

    if (response.data.token) {
      localStorage.setItem('doctorToken', response.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      set({ doctor: response.data.doctor, isLoggingIn: false });
      toast.success("Login successful");
      return { success: true };
    }

    throw new Error('No token received from server');

  } catch (error) {
    const errorData = error.response?.data || {};
    console.error('Login error details:', {
      status: error.response?.status,
      message: error.message,
      response: errorData,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    const errorMessage = errorData.message || 
                        error.message || 
                        'Login failed. Please check your credentials.';
    
    set({ 
      error: errorMessage, 
      isLoggingIn: false,
      doctor: null
    });
    
    toast.error(errorMessage);
    return { 
      success: false, 
      error: errorMessage,
      status: error.response?.status
    };
  }
},

  logout: async () => {
    try {
      await axiosInstance.post("/doctor/logout");
      // Clear the stored token and auth header
      localStorage.removeItem('doctorToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      set({ doctor: null });
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage even if server logout fails
      localStorage.removeItem('doctorToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      set({ doctor: null });
      return { success: false };
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/doctor/profile", data);
      set({ doctor: res.data });
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return { success: false };
    }
  },
  
  signup: async (data) => {
    set({ isSigningUp: true, error: null });
    try {
      const res = await axiosInstance.post("/doctor/register", data);
      set({ doctor: res.data, isSigningUp: false });
      toast.success("Registration successful! Please log in.");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      set({ error: errorMessage, isSigningUp: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}));
