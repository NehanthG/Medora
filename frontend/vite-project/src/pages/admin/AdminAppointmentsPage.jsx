import React from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { useTranslation } from "react-i18next";

export default function AdminAppointmentsPage() {
  const { t, i18n } = useTranslation();

  // Placeholder empty state; hook up data later
  const appointments = [];

  return (
    <div>
      <AdminNavbar />
      <div style={{ background: "#f6f8fb", minHeight: "100vh", padding: "32px 0" }}>
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-2" style={{ color: "#1e293b" }}>
                {t('adminAppointments.title')}
              </h2>
              <p className="text-secondary mb-0" style={{ fontSize: "1.05rem" }}>
                {t('adminAppointments.subtitle')}
              </p>
            </div>
            <div className="d-flex gap-2">
              <select className="form-select">
                <option value="all">{t('adminAppointments.filters.status.all')}</option>
                <option value="Confirmed">{t('adminAppointments.filters.status.confirmed')}</option>
                <option value="Pending">{t('adminAppointments.filters.status.pending')}</option>
                <option value="Cancelled">{t('adminAppointments.filters.status.cancelled')}</option>
              </select>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white p-5 text-center rounded-3" style={{ border: "1px solid #e2e8f0" }}>
              <h3 className="fw-bold mb-2" style={{ color: "#1e293b" }}>{t('adminAppointments.empty.title')}</h3>
              <p className="text-secondary mb-0">{t('adminAppointments.empty.subtitle')}</p>
            </div>
          ) : (
            <div className="table-responsive bg-white rounded-3" style={{ border: "1px solid #e2e8f0" }}>
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>{t('adminAppointments.table.patient')}</th>
                    <th>{t('adminAppointments.table.doctor')}</th>
                    <th>{t('adminAppointments.table.time')}</th>
                    <th>{t('adminAppointments.table.status')}</th>
                    <th className="text-end">{t('adminAppointments.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map appointments here when wired */}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
