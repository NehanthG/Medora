
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SingleLogin from "./pages/SingleLogin";
import UserLoginWrapper from "./components/UserLoginWrapper";
import AdminLoginWrapper from "./components/AdminLoginWrapper";
import PharmacyLoginWrapper from "./components/PharmacyLoginWrapper";
import DoctorLoginWrapper from "./components/DoctorLoginWrapper";
import { Toaster } from "react-hot-toast";
import MyProfile from "./pages/MyProfile";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./stores/useAuthStore";
import AddDocs from "./pages/AddDocs";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import AdminAllDoctorsPage from "./pages/admin/AdminAllDoctorsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEditDoctor from "./pages/admin/AdminEditDoctor";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import AdminAddDoctorPage from "./pages/admin/AdminAddDoctorPage";
import RagChatbot from "./pages/RagChatbot";
import MedicalRecords from "./pages/MedicalRecords";
import AllPharmacies from "./pages/AllPharmacies";
import Pharmacy from "./pages/Pharmacy";
import PharmacyLogin from "./pages/pharmaciesAdmin/pharmacyLogin";
import AdminNavbar from "./components/AdminNavbar";
import DoctorProtectedRoute from "./components/DoctorProtectedRoute";
import DoctorDashboard from "./pages/doctors/DoctorDashboard";
import DoctorLoginPage from "./pages/doctors/DoctorLoginPage";
import DoctorSignupPage from "./pages/doctors/DoctorSignupPage";

import AllHospitals from "./pages/AllHospitals";
import AllDoctors from "./pages/AllDoctors";
import CreateAppointment from "./pages/CreateAppointment";

import PharmacySignup from "./pages/pharmaciesAdmin/pharmacySignup";
import PharmacyDashboard from "./pages/pharmaciesAdmin/PharmacyDashboard";
import PharmacyAddMedicine from "./pages/pharmaciesAdmin/PharmacyAddMedicine";
import PharmacyEditMed from "./pages/pharmaciesAdmin/PharmacyEditMed";
import AllAppointments from "./pages/AllAppointments";
import AppointmentPage from "./pages/AppointmentPage";
import VitalLogging from "./pages/VitalLogging";
import { useTranslation } from 'react-i18next';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
  checkAuth();
}, [checkAuth]);


  if (isCheckingAuth) {
  return <h1>{t("loading")}</h1>;
}


  // Determine if we should show the main navbar
  const showNavbar = authUser && 
    !window.location.pathname.startsWith("/admin") &&
    !window.location.pathname.startsWith("/pharmacy") &&
    !window.location.pathname.startsWith("/doctor");

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<SingleLogin />} />
        <Route path="/single-login" element={<SingleLogin />}>
          <Route index element={<UserLoginWrapper />} />
          <Route path="user" element={<UserLoginWrapper />} />
          <Route path="admin" element={<AdminLoginWrapper />} />
          <Route path="pharmacy" element={<PharmacyLoginWrapper />} />
          <Route path="doctor" element={<DoctorLoginWrapper />} />
        </Route>
        
        {/* Public routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/home" element={<HomePage />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route
          path="/appointments/:appointmentId"
          element={<AppointmentPage />}
        />

        <Route path="/addDocs" element={<AddDocs />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/chatbot" element={<RagChatbot />} />

        <Route path="/hospitals" element={<AllHospitals />} />
        <Route path="/doctors" element={<AllDoctors />} />
        <Route path="/create-appointment" element={<CreateAppointment />} />

        <Route path="/allPharmacies" element={<AllPharmacies />} />
        <Route path="/pharmacy/:id" element={<Pharmacy />} />
        <Route path="/appointments" element={<AllAppointments />} />
        <Route path="/logVitals" element={<VitalLogging />} />

        <Route path="/admin/*">
          <Route index element={<AdminLoginPage />} />
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="register" element={<AdminRegisterPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="doctors" element={<AdminAllDoctorsPage />} />
          <Route path="doctors/add" element={<AdminAddDoctorPage />} />
          <Route path="doctors/edit/:id" element={<AdminEditDoctor />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
        </Route>

        <Route path="/pharmacy/login" element={<PharmacyLogin />} />
        <Route path="/pharmacy/signup" element={<PharmacySignup />} />
        <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
        <Route
          path="/pharmacy/add-medicine"
          element={<PharmacyAddMedicine />}
        />
        <Route
          path="/pharmacy/edit-medicine/:id"
          element={<PharmacyEditMed />}
        />

        {/* Doctor Routes */}
        <Route path="/doctor">
          {/* Public doctor routes */}
          <Route path="login" element={<DoctorLoginPage />} />
          <Route path="register" element={<DoctorSignupPage />} />
          
          {/* Protected doctor routes */}
          <Route element={<DoctorProtectedRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            {/* Add more protected doctor routes here */}
          </Route>
          
          {/* Catch-all for unknown doctor routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;

