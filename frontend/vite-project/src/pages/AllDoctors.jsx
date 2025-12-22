import React, { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useTranslation } from 'react-i18next';

export default function AllDoctors() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const {
    hospitalDoctors: doctors,
    isLoading,
    getDoctorsByHospital,
  } = useAuthStore();

  const { hospitalId, hospitalName, hospitalAddress } = location.state || {};

  const fetchDoctors = useCallback(async () => {
    if (!hospitalId) return;
    await getDoctorsByHospital(hospitalId);
  }, [hospitalId, getDoctorsByHospital]);

  useEffect(() => {
    if (!hospitalId) {
      navigate("/hospitals");
      return;
    }
    fetchDoctors();
  }, [hospitalId, navigate, fetchDoctors]);

  const handleSelectDoctor = (doctor) => {
    const localizedDoctorName = (i18n.language?.startsWith('hi') && doctor.name_hi) ? doctor.name_hi : doctor.name;
    navigate("/create-appointment", {
      state: {
        hospitalId,
        hospitalName,
        hospitalAddress,
        doctorId: doctor._id,
        doctorName: localizedDoctorName,
        doctorSpecialisation: doctor.specialisation,
        doctorEmail: doctor.email,
      },
    });
  };

  const handleBackToHospitals = () => {
    navigate("/hospitals");
  };

  if (isLoading) {
    return (
      <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
        <div className="container py-5">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="text-center">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">{t('loading')}</span>
              </div>
              <p
                className="text-secondary"
                style={{ fontSize: "1.1rem", fontWeight: "500" }}
              >
                {t('doctors.loading')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
        <div className="container py-5">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="text-center">
              <div className="text-center mb-4" style={{ fontSize: "4rem" }}>
                👨‍⚕️
              </div>
              <h2 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
                {t('doctors.noDoctorsTitle')}
              </h2>
              <p className="text-secondary mb-4" style={{ fontSize: "1.1rem" }}>
                {t('doctors.noDoctorsSubtitle', { hospital: hospitalName })}
              </p>
              <button
                onClick={handleBackToHospitals}
                className="btn btn-primary"
                style={{ borderRadius: "8px", padding: "12px 24px" }}
              >
                <span className="me-2">←</span>
                {t('doctors.backToHospitals')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <div className="container py-5">
        {/* Back Button and Header */}
        <div className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <button
              onClick={handleBackToHospitals}
              className="btn btn-outline-primary mb-3 d-flex align-items-center"
              style={{ borderRadius: "8px", padding: "8px 16px" }}
            >
              <span className="me-2">←</span>
              {t('doctors.backToHospitals')}
            </button>
            <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
              {t('doctors.headerTitle')}
            </h2>
            <p className="text-secondary mb-0" style={{ fontSize: "1.1rem" }}>
              {t('doctors.headerSubtitle', { hospital: hospitalName })}
            </p>
          </div>
        </div>

        {/* Selected Hospital Info */}
        <div className="mb-5">
          <div
            className="card border-0"
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    background: "#f1f5f9",
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🏥</span>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
                    {hospitalName}
                  </h6>
                  <p
                    className="mb-0 text-secondary"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {hospitalAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="row g-3 mb-5">
          <div className="col-md-4">
            <div
              className="card border-0 h-100"
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div className="card-body d-flex align-items-center p-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    background: "#f1f5f9",
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>👨‍⚕️</span>
                </div>
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: "#2d3748", fontSize: "1.5rem" }}
                  >
                    {doctors?.length || 0}
                  </h6>
                  <p
                    className="mb-0 text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {t('doctors.stats.doctorsAvailable')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card border-0 h-100"
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div className="card-body d-flex align-items-center p-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    background: "#f1f5f9",
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>✅</span>
                </div>
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: "#2d3748", fontSize: "1.5rem" }}
                  >
                    {doctors?.filter((d) => d.isActive).length || 0}
                  </h6>
                  <p
                    className="mb-0 text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {t('doctors.stats.currentlyAvailable')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card border-0 h-100"
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div className="card-body d-flex align-items-center p-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    background: "#f1f5f9",
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🎓</span>
                </div>
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: "#2d3748", fontSize: "1.5rem" }}
                  >
                    {new Set(doctors?.map((d) => d.specialisation)).size || 0}
                  </h6>
                  <p
                    className="mb-0 text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {t('doctors.stats.specializations')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="mb-5">
          <h5 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
            {t('doctors.gridTitle')}
          </h5>
          <div className="row g-4">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 h-100"
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
                  <div className="card-body p-4">
                    {/* Doctor Icon */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{
                        background: doctor.isActive ? "#dcfce7" : "#fef2f2",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <span style={{ fontSize: "2rem" }}>👨‍⚕️</span>
                    </div>

                    <div className="text-center mb-3">
                      <h6 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                        {i18n.language?.startsWith('hi') && doctor.name_hi ? doctor.name_hi : doctor.name}
                      </h6>

                      {/* Doctor Information */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <span className="me-2" style={{ fontSize: "0.9rem" }}>
                            🎓
                          </span>
                          <span
                            className="badge text-primary"
                            style={{
                              background: "#f1f5f9",
                              fontSize: "0.8rem",
                            }}
                          >
                            {t(`specialisations.${doctor.specialisation}`, { defaultValue: doctor.specialisation })}
                          </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <span className="me-2" style={{ fontSize: "0.9rem" }}>
                            📧
                          </span>
                          <small
                            className="text-secondary"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {doctor.email}
                          </small>
                        </div>
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <span className="me-2" style={{ fontSize: "0.9rem" }}>
                            🕒
                          </span>
                          <small
                            className="text-secondary"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {doctor.shift?.start}:00 - {doctor.shift?.end}:00
                          </small>
                        </div>
                      </div>

                      {/* Availability Status */}
                      <div className="mb-3">
                        <span
                          className={`badge d-flex align-items-center justify-content-center ${
                            doctor.isActive ? "text-success" : "text-danger"
                          }`}
                          style={{
                            background: doctor.isActive ? "#dcfce7" : "#fef2f2",
                            fontSize: "0.8rem",
                            padding: "6px 12px",
                          }}
                        >
                          <span
                            className={`rounded-circle me-2 ${
                              doctor.isActive ? "bg-success" : "bg-danger"
                            }`}
                            style={{ width: "6px", height: "6px" }}
                          ></span>
                          {doctor.isActive
                            ? t('doctors.status.availableNow')
                            : t('doctors.status.currentlyUnavailable')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectDoctor(doctor)}
                      disabled={!doctor.isActive}
                      className={`btn w-100 d-flex align-items-center justify-content-center ${
                        doctor.isActive
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      style={{
                        borderRadius: "8px",
                        padding: "10px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span className="me-2">📅</span>
                      {doctor.isActive
                        ? t('doctors.actions.bookAppointment')
                        : t('doctors.status.currentlyUnavailable')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="text-center">
          <p className="text-secondary" style={{ fontSize: "1rem" }}>
            {t('doctors.summary', { count: doctors.length, plural: doctors.length !== 1 ? 's' : '', hospital: hospitalName })}
          </p>
        </div>
      </div>
    </div>
  );
}
