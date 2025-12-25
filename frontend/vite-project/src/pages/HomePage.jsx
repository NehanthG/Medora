import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { CalendarDays, FolderOpen, Upload, Bell, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { authUser } = useAuthStore();
  const { t, i18n } = useTranslation();
  const firstName = authUser?.fullName ? authUser.fullName.split(" ")[0] : "";
  // Localized sample dates for demo content
  const locale = i18n.language;
  const upcomingAppointmentDate = new Date("2024-07-15");
  const recentRecordDate = new Date("2024-06-20");
  // const monthYearLocalized = new Date('2024-06-01').toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <div className="container py-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
              {firstName
                ? t("homepage.welcomeBackName", { name: firstName })
                : t("homepage.welcomeBack")}
            </h2>
            <p className="text-secondary mb-0" style={{ fontSize: "1.1rem" }}>
              {t("homepage.summary")}
            </p>
          </div>
          <button
            className="btn btn-outline-secondary position-relative"
            style={{ padding: "10px", borderRadius: "8px" }}
          >
            <Bell size={20} />
            <span
              className="position-absolute bg-danger rounded-circle"
              style={{
                width: "8px",
                height: "8px",
                top: "8px",
                right: "8px",
              }}
            ></span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <h5 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
            {t("homepage.quickActions")}
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <Link
                to="/hospitals"
                className="card border-0 text-decoration-none h-100"
                style={{
                  background: "#4f46e5",
                  borderRadius: "12px",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div className="card-body d-flex align-items-center p-4">
                  <CalendarDays size={24} className="text-white me-3" />
                  <div>
                    <h6 className="fw-bold mb-1 text-white">
                      {t("homepage.scheduleAppointment.title")}
                    </h6>
                    <p
                      className="mb-0 text-white-50"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {t("homepage.scheduleAppointment.subtitle")}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-4">
              <Link
                to="/medical-records"
                className="card border-0 text-decoration-none h-100"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div className="card-body d-flex align-items-center p-4">
                  <FolderOpen size={24} className="text-primary me-3" />
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
                      {t("homepage.medicalRecords.title")}
                    </h6>
                    <p
                      className="mb-0 text-secondary"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {t("homepage.medicalRecords.subtitle")}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-4">
              <Link
                to="/logVitals"
                className="card border-0 text-decoration-none h-100"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div className="card-body d-flex align-items-center p-4">
                  <Activity size={24} className="text-danger me-3" />
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
                      {t("homepage.logVitals.title")}
                    </h6>
                    <p
                      className="mb-0 text-secondary"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {t("homepage.logVitals.subtitle")}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-5">
          <h5 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
            {t("homepage.recentActivity")}
          </h5>
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      background: "#f1f5f9",
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <CalendarDays size={24} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
                      {t("homepage.upcomingAppointment")}
                    </h6>
                    <p
                      className="text-secondary mb-0"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {t("homepage.appointmentWith", {
                        doctor: "Dr. Emily Carter",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className="badge text-secondary"
                  style={{ background: "#f1f5f9" }}
                >
                  {upcomingAppointmentDate.toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      background: "#f1f5f9",
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <FolderOpen size={24} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
                      {t("homepage.recentMedicalRecords")}
                    </h6>
                    <p
                      className="text-secondary mb-0"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {t("homepage.checkupResults", {
                        monthYear: recentRecordDate.toLocaleDateString(locale, {
                          month: "long",
                          year: "numeric",
                        }),
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <span
                className="badge text-secondary"
                style={{ background: "#f1f5f9" }}
              >
                {recentRecordDate.toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="text-end d-flex justify-content-end gap-2">
          <Link
            to="/logVitals"
            className="btn btn-outline-danger d-inline-flex align-items-center"
            style={{
              borderRadius: "8px",
              padding: "12px 24px",
              transition: "all 0.2s ease",
            }}
          >
            <Activity size={18} className="me-2" />
            {t("homepage.logVitals.title")}
          </Link>
          <Link
            to="/addDocs"
            className="btn btn-outline-primary d-inline-flex align-items-center"
            style={{
              borderRadius: "8px",
              padding: "12px 24px",
              transition: "all 0.2s ease",
            }}
          >
            <Upload size={18} className="me-2" />
            {t("homepage.addDocuments")}
          </Link>
        </div>
      </div>
    </div>
  );
}
