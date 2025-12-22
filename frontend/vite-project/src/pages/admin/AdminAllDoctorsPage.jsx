import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/adminAuthStore";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Plus, Eye, UserCircle } from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";
import Navbar from "../../components/Navbar";
import { useTranslation } from 'react-i18next';
export default function AdminAllDoctorsPage() {
  const {
    authUser,
    doctors,
    isLoadingDoctors,
    isUpdating,
    getAllDoctors,
    deleteDoctor,
  } = useAuthStore();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    getAllDoctors();
  }, [getAllDoctors]);

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm(t('adminDoctors.confirmDelete'))) {
      const result = await deleteDoctor({ doctorId });
      if (result.success) {
        getAllDoctors();
      }
    }
  };

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetails(true);
  };

  const handleAddNewDoctor = () => {
    navigate("/admin/doctors/add");
  };

  const handleEditDoctor = (doctorId) => {
    navigate(`/admin/doctors/edit/${doctorId}`);
  };

  if (isLoadingDoctors) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>

      <AdminNavbar/>
    <div
    style={{ background: "#f8fafc", minHeight: "100vh", padding: "32px 0" }}
    
    >
      <div className="container" style={{ maxWidth: "1200px" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: "#1e293b" }}>
              {t('adminDoctors.list.title')}
            </h2>
            <p className="text-secondary" style={{ fontSize: "1.1rem" }}>
              {t('adminDoctors.list.hospital', { id: authUser?.hospitalId || t('adminDoctors.common.unknown') })}
            </p>
          </div>
          <button
            onClick={handleAddNewDoctor}
            className="btn btn-outline-primary d-flex align-items-center"
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <Plus className="me-2" size={18} />
            {t('adminDoctors.list.addNewDoctor')}
          </button>
        </div>

        {/* Empty State */}
        {doctors.length === 0 ? (
          <div
            className="text-center bg-white rounded-3 p-5"
            style={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <UserCircle size={64} className="text-secondary mb-3 opacity-75" />
            <h3 className="fw-bold mb-2" style={{ color: "#1e293b" }}>
              {t('adminDoctors.empty.title')}
            </h3>
            <p className="text-secondary mb-4">
              {t('adminDoctors.empty.subtitle')}
            </p>
            <button
              onClick={handleAddNewDoctor}
              className="btn btn-outline-primary d-flex align-items-center mx-auto"
              style={{ padding: "10px 24px", borderRadius: "8px" }}
            >
              <Plus className="me-2" size={18} />
              {t('adminDoctors.actions.addDoctor')}
            </button>
          </div>
        ) : (
          /* Doctor Cards Grid */
          <div className="row g-4">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="col-md-6 col-lg-4">
                <div
                  className="bg-white rounded-3 p-4 h-100"
                  style={{
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.05)";
                  }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <UserCircle
                      size={48}
                      className="text-secondary me-3 opacity-75"
                    />
                    <div>
                      <h3
                        className="fw-bold mb-1"
                        style={{ color: "#1e293b", fontSize: "1.1rem" }}
                      >
                        {doctor.name}
                      </h3>
                      <p
                        className="text-secondary mb-0"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {doctor.specialisation}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p
                      className="mb-2 text-secondary"
                      style={{ fontSize: "0.95rem" }}
                    >
                      <strong className="text-dark">{t('adminDoctors.common.email')}:</strong> {doctor.email}
                    </p>
                    <p
                      className="mb-2 text-secondary"
                      style={{ fontSize: "0.95rem" }}
                    >
                      <strong className="text-dark">{t('adminDoctors.common.shift')}:</strong> {doctor.shift?.start} -{" "}
                      {doctor.shift?.end}
                    </p>
                    <p className="mb-2" style={{ fontSize: "0.95rem" }}>
                      <strong className="text-dark">{t('adminDoctors.common.status')}:</strong>{" "}
                      <span
                        className={`badge rounded-pill ${
                          doctor.isActive
                            ? "bg-success-subtle text-success"
                            : "bg-danger-subtle text-danger"
                        }`}
                      >
                        {doctor.isActive ? t('adminDoctors.common.active') : t('adminDoctors.common.inactive')}
                      </span>
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleViewDetails(doctor)}
                      className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center"
                      style={{ padding: "8px", borderRadius: "6px" }}
                    >
                      <Eye size={16} className="me-2" />
                      {t('adminDoctors.actions.view')}
                    </button>
                    <button
                      onClick={() => handleEditDoctor(doctor._id)}
                      className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center"
                      style={{ padding: "8px", borderRadius: "6px" }}
                    >
                      <Edit size={16} className="me-2" />
                      {t('adminDoctors.actions.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor._id)}
                      disabled={isUpdating}
                      className="btn btn-outline-danger flex-grow-1 d-flex align-items-center justify-content-center"
                      style={{ padding: "8px", borderRadius: "6px" }}
                    >
                      <Trash2 size={16} className="me-2" />
                      {t('adminDoctors.actions.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Updates */}
        {showDetails && selectedDoctor && <div className="modal-backdrop show"></div>}
        {showDetails && selectedDoctor && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content border-0"
                style={{
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                }}
              >
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold" style={{ color: "#1e293b" }}>
                    {t('adminDoctors.modal.title')}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetails(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="d-flex align-items-center mb-4">
                    <UserCircle size={64} className="text-secondary me-3" />
                    <div>
                      <h3
                        className="fw-bold mb-1"
                        style={{ color: "#1e293b" }}
                      >
                        {selectedDoctor.name}
                      </h3>
                      <p className="text-secondary mb-0">
                        {selectedDoctor.specialisation}
                      </p>
                    </div>
                  </div>

                  <div className="border-top pt-3">
                    <p className="mb-2">
                      <strong>{t('adminDoctors.common.email')}:</strong> {selectedDoctor.email}
                    </p>
                    <p className="mb-2">
                      <strong>{t('adminDoctors.common.hospitalId')}:</strong> {selectedDoctor.hospitalId}
                    </p>
                    <p className="mb-2">
                      <strong>{t('adminDoctors.common.shift')}:</strong> {selectedDoctor.shift?.start} -{" "}
                      {selectedDoctor.shift?.end}
                    </p>
                    <p className="mb-2">
                      <strong>{t('adminDoctors.common.status')}:</strong>{" "}
                      <span
                        className={`badge ${
                          selectedDoctor.isActive ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {selectedDoctor.isActive ? t('adminDoctors.common.active') : t('adminDoctors.common.inactive')}
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong>{t('adminDoctors.common.appointments')}:</strong>{" "}
                      {selectedDoctor.appointments?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button
                    onClick={() => handleEditDoctor(selectedDoctor._id)}
                    className="btn btn-outline-primary flex-grow-1"
                    style={{ borderRadius: "6px" }}
                  >
                    {t('adminDoctors.modal.editDoctor')}
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="btn btn-outline-secondary flex-grow-1"
                    style={{ borderRadius: "6px" }}
                  >
                    {t('adminDoctors.modal.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
