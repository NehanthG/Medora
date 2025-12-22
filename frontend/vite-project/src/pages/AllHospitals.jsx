import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useTranslation } from 'react-i18next';

export default function AllHospitals() {
  const { getAllHospitals, allHospitals, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    getAllHospitals();
  }, [getAllHospitals]);

  const handleViewDoctors = (hospital) => {
    navigate("/doctors", {
      state: {
        hospitalId: hospital._id,
        hospitalName: hospital.hospitalId,
        hospitalAddress: hospital.address,
      },
    });
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
                {t('hospitals.loading')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!allHospitals || allHospitals.length === 0) {
    return (
      <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
        <div className="container py-5">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="text-center">
              <div className="text-center mb-4" style={{ fontSize: "5rem" }}>
                🏥
              </div>
              <h2 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
                {t('hospitals.emptyTitle')}
              </h2>
              <p className="text-secondary" style={{ fontSize: "1.1rem" }}>
                {t('hospitals.emptySubtitle')}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary mt-3"
                style={{ borderRadius: "8px", padding: "12px 24px" }}
              >
                {t('hospitals.tryAgain')}
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
        {/* Header Section */}
        <div className="mb-5">
          <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
            {t('hospitals.headerTitle')}
          </h2>
          <p className="text-secondary mb-0" style={{ fontSize: "1.1rem" }}>
            {t('hospitals.headerSubtitle')}
          </p>
        </div>

        {/* Statistics Cards */}
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
                  <span style={{ fontSize: "1.5rem" }}>🏥</span>
                </div>
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: "#2d3748", fontSize: "1.5rem" }}
                  >
                    {allHospitals?.length || 0}
                  </h6>
                  <p
                    className="mb-0 text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {t('hospitals.stats.hospitalsAvailable')}
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
                  <span style={{ fontSize: "1.5rem" }}>⏰</span>
                </div>
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: "#2d3748", fontSize: "1.5rem" }}
                  >
                    24/7
                  </h6>
                  <p
                    className="mb-0 text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {t('hospitals.stats.emergencyCare')}
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
                  <span style={{ fontSize: "1.5rem" }}>👨‍⚕️</span>
                </div>
                <div>
                  <h6
                    className="fw-bold mb-1"
                    style={{ color: "#2d3748", fontSize: "1.5rem" }}
                  >
                    100+
                  </h6>
                  <p
                    className="mb-0 text-secondary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {t('hospitals.stats.expertDoctors')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Cards */}
        <div className="mb-5">
          <h5 className="fw-bold mb-3" style={{ color: "#2d3748" }}>
            {t('hospitals.networkTitle')}
          </h5>
          <div className="row g-4">
            {allHospitals.map((hospital) => (
              <div key={hospital._id} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 h-100 text-decoration-none"
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    transition: "transform 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                  onClick={() => handleViewDoctors(hospital)}
                >
                  <div className="card-body p-4">
                    {/* Hospital Icon */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{
                        background: "#f1f5f9",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <span style={{ fontSize: "2rem" }}>🏥</span>
                    </div>

                    <div className="text-center mb-3">
                      <h6 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                        {hospital.hospitalId}
                      </h6>

                      {/* Contact Information */}
                      <div className="mb-2">
                        <div className="d-flex align-items-center justify-content-center mb-1">
                          <span className="me-2" style={{ fontSize: "0.9rem" }}>
                            📧
                          </span>
                          <small
                            className="text-secondary"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {hospital.email}
                          </small>
                        </div>
                        <div className="d-flex align-items-start justify-content-center">
                          <span className="me-2" style={{ fontSize: "0.9rem" }}>
                            📍
                          </span>
                          <small
                            className="text-secondary text-center"
                            style={{ fontSize: "0.85rem", maxWidth: "200px" }}
                          >
                            {hospital.address}
                          </small>
                        </div>
                      </div>

                      {/* Service Tags */}
                      <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
                        <span
                          className="badge text-primary"
                          style={{ background: "#f1f5f9", fontSize: "0.7rem" }}
                        >
                          {t('hospitals.tags.emergencyCare')}
                        </span>
                        <span
                          className="badge text-primary"
                          style={{ background: "#f1f5f9", fontSize: "0.7rem" }}
                        >
                          {t('hospitals.tags.surgery')}
                        </span>
                        <span
                          className="badge text-primary"
                          style={{ background: "#f1f5f9", fontSize: "0.7rem" }}
                        >
                          {t('hospitals.tags.diagnostics')}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                      style={{
                        borderRadius: "8px",
                        padding: "10px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDoctors(hospital);
                      }}
                    >
                      <span className="me-2">👨‍⚕️</span>
                      {t('hospitals.actions.viewDoctors')}
                    </button>
                  </div>

                  {/* Card Footer */}
                  <div
                    className="card-footer border-0 d-flex align-items-center justify-content-between"
                    style={{
                      background: "#f8fafc",
                      borderBottomLeftRadius: "12px",
                      borderBottomRightRadius: "12px",
                      padding: "12px 20px",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-success me-2"
                        style={{ width: "8px", height: "8px" }}
                      ></div>
                      <small
                        className="text-success fw-bold"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {t('hospitals.availableNow')}
                      </small>
                    </div>
                    <small
                      className="text-secondary"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {t('hospitals.quickBooking')}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="text-center">
          <p className="text-secondary" style={{ fontSize: "1rem" }}>
            {t('hospitals.summary', { count: allHospitals.length, plural: allHospitals.length !== 1 ? 's' : '' })}
          </p>
        </div>
      </div>
    </div>
  );
}
