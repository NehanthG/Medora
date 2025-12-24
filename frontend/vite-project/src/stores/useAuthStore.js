import {create} from "zustand"
import toast from "react-hot-toast"
import {axiosInstance} from "../lib/axios"


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
  last7BpReadings: null,
  last7SugarReadings: null,
  last30BpReadings: null,
  last30SugarReadings: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/user/check", {
        withCredentials: true,
      });
      console.log("Login response:", res.data);
      set({ authUser: res.data });
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
      const res = await axiosInstance.post("/user/signup", data);
      set({ authUser: res.data });
      toast.success("User Created Successfully");
      return { success: true };
    } catch (error) {
      console.log("Error in signup", error.message);
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
      console.log("Error in login", error.message);
      console.log("Login data sent:", data);
      console.log("Backend response:", error.response?.data);
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
      console.log("Error in updateProfile", error.message);
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
      console.log("Error in logout", error.message);
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
      console.log("Error in addDocs", error.message);
      toast.error(error.response.data.message);
    } finally {
      set({ isAddingDoc: false });
    }
  },
  createAppointment: async (data) => {
    set({ isLoading: true });
    try {
      await axiosInstance.post("/appointments/create", data);
      toast.success("Appointment Created successfully");

      // Get the current state to access authUser
      const { authUser, sendSms } = useAuthStore.getState();

      if (authUser?.phoneNumber) {
        // Generate random Zoom meeting ID (9 digits with dashes)
        const generateZoomId = () => {
          const part1 = Math.floor(Math.random() * 900) + 100; // 3 digits
          const part2 = Math.floor(Math.random() * 900) + 100; // 3 digits
          const part3 = Math.floor(Math.random() * 900) + 100; // 3 digits
          return `${part1}-${part2}-${part3}`;
        };

        const zoomId = generateZoomId();
        const zoomPassword = "VH2024"; // Static password

        await sendSms({
          phone: `+91${authUser.phoneNumber}`,
          message: `🏥 APPOINTMENT CONFIRMED - VitalsHub

✅ Your appointment has been successfully booked!

  Patient: ${authUser.fullName}
  Doctor: ${data.doctorName || "Dr. [Name]"}
  Date & Time: ${data.appointmentTime}
  Appointment Description: ${data.description}

🎥 TELEHEALTH DETAILS:
Zoom Meeting ID: ${zoomId}
Password: ${zoomPassword}

📞 For any queries, contact our support team.

Thank you for choosing VitalsHub! `,
        });
      }

      return { success: true };
    } catch (error) {
      console.log("Error in creating appointment", error.message);
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
    console.log("Sending SMS with data:", data);
    try {
      const response = await axiosInstance.post("/send-sms", data);
      console.log("SMS response:", response.data);
      toast.success(`SMS sent successfully to ${data.phone}`);
      return { success: true };
    } catch (error) {
      console.error("Error in sending SMS:", error);
      console.error("Error response:", error.response?.data);
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
      console.log("Error in getting all hospitals", error.message);
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
      console.log(res.data);

      set({ hospitalDoctors: res.data.data || res.data });
      return { success: true, data: res.data.data || res.data };
    } catch (error) {
      console.log("Error in getting doctors by hospital", error.message);
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
      set({ hospitalDoctors: [] });
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  get7BpReadings: async (userID) => {
    set({ isLoading: true });
    try {
      const url = `/vitals/${userID}/7Bp`;
      console.log("GET 7Bp ->", url);
      const res = await axiosInstance.get(url);
      console.log("GET 7Bp response:", res.data);
      set({ last7BpReadings: res.data.data || res.data });
      return { success: true, data: res.data.data || res.data };
    } catch (error) {
      console.error(
        "Error fetching 7Bp readings:",
        error?.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch readings"
      );
      return { success: false, error: error?.response?.data || error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  get7SugarReadings: async (userID) => {
    set({ isLoading: true });
    try {
      const url = `/vitals/${userID}/7sugar`;
      console.log("GET 7Sugar ->", url);
      const res = await axiosInstance.get(url);
      console.log("GET 7Sugar response:", res.data);
      set({ last7SugarReadings: res.data.data || res.data });
      return { success: true, data: res.data.data || res.data };
    } catch (error) {
      console.error(
        "Error fetching 7Sugar readings:",
        error?.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch readings"
      );
      return { success: false, error: error?.response?.data || error.message };
    } finally {
      set({ isLoading: false });
    }
  },
  get30SugarReadings: async (userID) => {
    set({ isLoading: true });
    try {
      const url = `/vitals/${userID}/30sugar`;
      console.log("GET 30Sugar ->", url);
      const res = await axiosInstance.get(url);
      console.log("GET 30Sugar response:", res.data);
      set({ last30SugarReadings: res.data.data || res.data });
      return { success: true, data: res.data.data || res.data };
    } catch (error) {
      console.error(
        "Error fetching 30Sugar readings:",
        error?.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch readings"
      );
      return { success: false, error: error?.response?.data || error.message };
    } finally {
      set({ isLoading: false });
    }
  },
  get30BpReadings: async (userID) => {
    set({ isLoading: true });
    try {
      const url = `/vitals/${userID}/30Bp`;
      console.log("GET 30Bp ->", url);
      const res = await axiosInstance.get(url);
      console.log("GET 30Bp response:", res.data);
      set({ last30BpReadings: res.data.data || res.data });
      return { success: true, data: res.data.data || res.data };
    } catch (error) {
      console.error(
        "Error fetching 30Bp readings:",
        error?.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch readings"
      );
      return { success: false, error: error?.response?.data || error.message };
    } finally {
      set({ isLoading: false });
    }
  },
}));