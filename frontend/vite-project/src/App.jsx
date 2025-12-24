
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SingleLogin from "./pages/SingleLogin";
import UserLoginWrapper from "./components/UserLoginWrapper";
import AdminLoginWrapper from "./components/AdminLoginWrapper";
import PharmacyLoginWrapper from "./components/PharmacyLoginWrapper";
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

import AllHospitals from "./pages/AllHospitals";
import AllDoctors from "./pages/AllDoctors";
import CreateAppointment from "./pages/CreateAppointment";

import PharmacySignup from "./pages/pharmaciesAdmin/pharmacySignup";
import PharmacyDashboard from "./pages/pharmaciesAdmin/PharmacyDashboard";
import PharmacyAddMedicine from "./pages/pharmaciesAdmin/PharmacyAddMedicine";
import PharmacyEditMed from "./pages/pharmaciesAdmin/PharmacyEditMed";
import AllAppointments from "./pages/AllAppointments";
import { useTranslation } from 'react-i18next';
import VitalLogging from "./pages/VitalLogging";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    // Only check auth for non-admin routes
    if (!window.location.pathname.startsWith("/admin")) {
      checkAuth();
    }
  }, [checkAuth]);

  if (
    isCheckingAuth &&
    !authUser &&
    !window.location.pathname.startsWith("/admin")
  ) {
    return <h1>{t('loading')}</h1>;
  }

  return (
    <div>
      {authUser &&
        !window.location.pathname.startsWith("/admin") &&
        !window.location.pathname.startsWith("/pharmacy") && <Navbar />}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <SingleLogin />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Single Login Layout with Nested Routes */}
        <Route path="/single-login" element={<SingleLogin />}>
          <Route index element={<UserLoginWrapper />} />
          <Route path="user" element={<UserLoginWrapper />} />
          <Route path="admin" element={<AdminLoginWrapper />} />
          <Route path="pharmacy" element={<PharmacyLoginWrapper />} />
        </Route>

        <Route path="/home" element={<HomePage />} />
        <Route path="/myprofile" element={<MyProfile />} />
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
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;

