import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdating: false,
  isAddingDoc: false,
  isLoadingDoctors: false,
  doctors: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me", {
        withCredentials: true,
      });
      console.log("Auth check response:", res.data);
      set({ authUser: res.data.hospital });
    } catch (error) {
      console.log("Error in checkAuth", error.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data.data });
      toast.success("Hospital Registered Successfully");
      return { success: true };
    } catch (error) {
      console.log("Error in signup", error.message);
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false };
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.hospital });
      toast.success("Login Successful");

      return { success: true };
    } catch (error) {
      console.log("Error in login", error.message);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  addDoctor: async (data) => {
    set({ isAddingDoc: true });
    try {
      const res = await axiosInstance.post("/admin/doctors/new", data);
      toast.success("Doctor Added Successfully");
      return { success: true, data: res.data.data };
    } catch (error) {
      console.log("Error in adding doctor", error.message);
      toast.error(error.response?.data?.message || "Failed to add doctor");
      return { success: false };
    } finally {
      set({ isAddingDoc: false });
    }
  },

  deleteDoctor: async (data) => {
    set({ isUpdating: true });
    try {
      const id = data.doctorId;
      await axiosInstance.delete(`/admin/doctors/delete/${id}`);
      toast.success("Doctor Deleted Successfully");

      // Remove the doctor from the local state
      const currentDoctors = get().doctors;
      const updatedDoctors = currentDoctors.filter(
        (doctor) => doctor._id !== id
      );
      set({ doctors: updatedDoctors });

      return { success: true };
    } catch (error) {
      console.log("Error in deleting doctor", error.message);
      toast.error(error.response?.data?.message || "Failed to delete doctor");
      return { success: false };
    } finally {
      set({ isUpdating: false });
    }
  },
  updateDoctor: async (data) => {
    //here data is all info about the doctor u get from form
    set({ isUpdating: true });
    try {
      const id = data.doctorId;
      const res = await axiosInstance.put(`/admin/doctors/update/${id}`, data);
      toast.success("Doctor Updated Successfully");
      return { success: true, data: res.data.data };
    } catch (error) {
      console.log("Error in updating doctor", error.message);
      toast.error(error.response?.data?.message || "Failed to update doctor");
      return { success: false };
    } finally {
      set({ isUpdating: false });
    }
  },

  //write a new function to get all doctors (route /api/doctors/all)
  getAllDoctors: async () => {
    set({ isLoadingDoctors: true });
    try {
      const res = await axiosInstance.get("/admin/doctors/all");
      set({ doctors: res.data.data || [] });
      return { success: true, data: res.data.data };
    } catch (error) {
      console.log("Error in getting all doctors", error.message);
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
      set({ doctors: [] });
      return { success: false };
    } finally {
      set({ isLoadingDoctors: false });
    }
  },

  // Get single doctor details
  getDoctor: async (doctorId) => {
    set({ isLoadingDoctors: true });
    try {
      const res = await axiosInstance.get(`/admin/doctors/${doctorId}`);
      return { success: true, data: res.data.data };
    } catch (error) {
      console.log("Error in getting doctor details", error.message);
      toast.error(error.response?.data?.message || "Failed to fetch doctor details");
      return { success: false };
    } finally {
      set({ isLoadingDoctors: false });
    }
  },

  //use it in adminalldoctors page
  logout: async (navigate) => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged Out Successfully");
      if (navigate) {
        navigate("/");
      }
      return { success: true };
    } catch (error) {
      console.log("Error in logout", error.message);
      // Even if logout fails, clear the local state
      set({ authUser: null });
      toast.success("Logged Out Successfully");
      if (navigate) {
        navigate("/");
      }
      return { success: true };
    }
  },
}));
