import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  allHospitals: null,
  hospitalDoctors: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  isAddingDoc: false,
  isLoading: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/user/check", {
        withCredentials: true,
      });
      set({ authUser: res.data });
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false }); // ✅ THIS IS ENOUGH
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/user/signup", data);
      set({ authUser: res.data });
      toast.success("User Created Successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/user/login", data);
      set({ authUser: res.data });
      toast.success("User Logged In Successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/user/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile Updated Successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  logout: async (navigate) => {
    try {
      await axiosInstance.post("/user/logout");
      set({ authUser: null });
      toast.success("User Logged Out Successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  addDocs: async (data) => {
    set({ isAddingDoc: true });
    try {
      await axiosInstance.post("/user/upload", data);
      toast.success("Document Added Successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isAddingDoc: false });
    }
  },

  createAppointment: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/appointments/create", data);
      const appointment = res.data.data;

      toast.success("Appointment Created successfully");

      const { authUser, sendSms } = useAuthStore.getState();

      if (authUser?.phoneNumber) {
        const zoomId = `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(
          Math.random() * 900 + 100
        )}-${Math.floor(Math.random() * 900 + 100)}`;

        await sendSms({
          phone: `+91${authUser.phoneNumber}`,
          message: `🏥 APPOINTMENT CONFIRMED - VitalsHub

Patient: ${authUser.fullName}
Doctor: ${data.doctorName}
Date & Time: ${data.appointmentTime}

Meeting ID: ${zoomId}
Password: VH2024`,
        });
      }

      return { success: true, appointment };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create appointment"
      );
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  sendSms: async (data) => {
    set({ isLoading: true });
    try {
      await axiosInstance.post("/send-sms", data);
      toast.success(`SMS sent successfully to ${data.phone}`);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send SMS");
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  getAllHospitals: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/user/allhospitals");
      set({ allHospitals: res.data.data });
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch hospitals");
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  getDoctorsByHospital: async (hospitalId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(
        `/admin/doctors/hospital/${hospitalId}`
      );
      set({ hospitalDoctors: res.data.data || res.data });
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
      set({ hospitalDoctors: [] });
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },
}));
