import { useAuthStore } from "../../stores/adminAuthStore";
import AdminNavbar from "../../components/AdminNavbar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <AdminNavbar />
      <div className="container" style={{ maxWidth: "1200px", padding: "32px 0" }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
            {t('adminDashboard.welcome')}
          </h2>
          <p className="text-secondary mb-4" style={{ fontSize: "1.1rem" }}>
            {t('adminDashboard.hospitalId', { id: authUser?.hospitalId || t('adminDashboard.notAssigned') })}
          </p>
        </div>

        {/* Quick Actions */}
        <h5 className="fw-bold mb-3" style={{ color: "#2d3748" }}>{t('adminDashboard.quickActions')}</h5>
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-3">
            <div 
              className="bg-white rounded-3 p-4 h-100 d-flex flex-column"
              style={{ 
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer"
              }}
              onClick={() => navigate("/admin/doctors")}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <h3 className="h5 fw-bold mb-2" style={{ color: "#2d3748" }}>{t('adminDashboard.cards.manageDoctors.title')}</h3>
              <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                {t('adminDashboard.cards.manageDoctors.subtitle')}
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div 
              className="bg-white rounded-3 p-4 h-100 d-flex flex-column"
              style={{ 
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer"
              }}
              onClick={() => navigate("/admin/appointments")}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <h3 className="h5 fw-bold mb-2" style={{ color: "#2d3748" }}>{t('adminDashboard.cards.viewAppointments.title')}</h3>
              <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                {t('adminDashboard.cards.viewAppointments.subtitle')}
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div 
              className="bg-white rounded-3 p-4 h-100 d-flex flex-column"
              style={{ 
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer"
              }}
              onClick={() => navigate("/admin/patients")}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <h3 className="h5 fw-bold mb-2" style={{ color: "#2d3748" }}>{t('adminDashboard.cards.patientRecords.title')}</h3>
              <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                {t('adminDashboard.cards.patientRecords.subtitle')}
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div 
              className="bg-white rounded-3 p-4 h-100 d-flex flex-column"
              style={{ 
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer"
              }}
              onClick={() => navigate("/admin/settings")}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <h3 className="h5 fw-bold mb-2" style={{ color: "#2d3748" }}>{t('adminDashboard.cards.settings.title')}</h3>
              <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                {t('adminDashboard.cards.settings.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
