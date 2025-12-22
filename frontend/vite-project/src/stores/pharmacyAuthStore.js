import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";


export const usePharmacyStore = create((set, get) => ({
  pharmacyUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdating: false,
  isAddingMedicine: false,
  isLoadingMedicines: false,
  medicines: [],

  checkAuth: async () => {
  try {
    const res = await axiosInstance.get("/pharmacy/me", {
      withCredentials: true,
    });
    console.log("Auth check response:", res.data);
    // Use `res.data.data` instead of `res.data.pharmacy`
    set({ pharmacyUser: res.data.data });
  } catch (error) {
    console.log("Error in checkAuth", error.message);
    set({ pharmacyUser: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},

  signup: async (data) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post("/pharmacy/register", data); // corrected
    set({ pharmacyUser: res.data.data });
    toast.success("Pharmacy Registered Successfully");
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
    const res = await axiosInstance.post("/pharmacy/login", data); // corrected
    set({ pharmacyUser: res.data.data || { _id: res.data.pharmacy?._id } });
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

  addMedicine: async (data) => {
  set({ isAddingMedicine: true });
  try {
    const res = await axiosInstance.post("/pharmacy/medicine/new", data);
    toast.success("Medicine Added Successfully");
    const updatedMedicines = [...get().medicines, res.data.data];
    set({ medicines: updatedMedicines });
    return { success: true, data: res.data.data };
  } catch (error) {
    console.log("Error adding medicine", error.message);
    toast.error(error.response?.data?.message || "Failed to add medicine");
    return { success: false };
  } finally {
    set({ isAddingMedicine: false });
  }
},


  deleteMedicine: async (medicineId) => {
  set({ isUpdating: true });
  try {
    await axiosInstance.delete(`/pharmacy/medicine/${medicineId}`);
    toast.success("Medicine Deleted Successfully");

    // Remove medicine from state
    const updatedMedicines = get().medicines.filter(
      (med) => med._id !== medicineId
    );
    set({ medicines: updatedMedicines });

    return { success: true };
  } catch (error) {
    console.log("Error deleting medicine", error.message);
    toast.error(error.response?.data?.message || "Failed to delete medicine");
    return { success: false };
  } finally {
    set({ isUpdating: false });
  }
},
  updateMedicine: async (data) => {
  set({ isUpdating: true });
  try {
    const res = await axiosInstance.put(`/pharmacy/medicine/${data.medicineId}`, data);
    toast.success("Medicine Updated Successfully");

    // Update local state
    const updatedMedicines = get().medicines.map((med) =>
      med._id === data.medicineId ? res.data.data : med
    );
    set({ medicines: updatedMedicines });

    return { success: true, data: res.data.data };
  } catch (error) {
    console.log("Error updating medicine", error.message);
    toast.error(error.response?.data?.message || "Failed to update medicine");
    return { success: false };
  } finally {
    set({ isUpdating: false });
  }
},

  //write a new function to get all medicine (route /api/medicine/all)
  getAllMedicines: async () => {
  set({ isLoadingMedicines: true });
  try {
    const res = await axiosInstance.get("/pharmacy/allmedicine");
    set({ medicines: res.data || [] }); // use medicines
    return { success: true, data: res.data };
  } catch (error) {
    console.log("Error fetching medicines:", error.message);
    set({ medicines: [] });
    toast.error(error.response?.data?.message || "Failed to fetch medicines");
    return { success: false };
  } finally {
    set({ isLoadingMedicines: false });
  }
},


  // Get single doctor details
  getMedicine: async (medicineId) => {
  set({ isLoadingMedicines: true });
  try {
    const res = await axiosInstance.get(`/pharmacy/medicine/${medicineId}`);
    return { success: true, data: res.data.data };
  } catch (error) {
    console.log("Error fetching medicine details", error.message);
    toast.error(error.response?.data?.message || "Failed to fetch medicine details");
    return { success: false };
  } finally {
    set({ isLoadingMedicines: false });
  }
},


  //use it in adminallmedicine page
  logout: async (navigate) => {
  try {
    await axiosInstance.post("/pharmacy/logout"); // corrected
    set({ pharmacyUser: null });
    toast.success("Logged Out Successfully");
    if (navigate) navigate("/");
    return { success: true };
  } catch (error) {
    console.log("Error in logout", error.message);
    set({ pharmacyUser: null });
    toast.success("Logged Out Successfully");
    if (navigate) navigate("/");
    return { success: true };
  }
},
}));
