import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePharmacyStore } from "../../stores/pharmacyAuthStore";
import { Store, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from 'react-i18next';

export default function PharmacySignup() {
  const { signup, isSigningUp } = usePharmacyStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    contactNumber: "",
    email: "",
    password: "",
    pharmacistName: "",
    pharmacistId: "",
    pharmacistQualification: "",
    workingTimings: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(formData);
    if (result.success) {
      toast.success(t('pharmacySignup.toasts.success'));
      navigate("/pharmacy/login");
    } else {
      toast.error(t('pharmacySignup.toasts.failed'));
    }
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <div
          className="bg-white rounded-3 shadow-sm p-4 p-md-5"
          style={{ border: "1px solid #e2e8f0" }}
        >
          <div className="text-center mb-4">
            <Store
              size={40}
              className="text-primary mb-3"
              style={{ opacity: 0.8 }}
            />
            <h2
              className="fw-bold mb-2"
              style={{ color: "#2d3748" }}
            >
              {t('pharmacySignup.title')}
            </h2>
            <p
              className="text-secondary"
              style={{ fontSize: "1.1rem" }}
            >
              {t('pharmacySignup.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="row g-4">
            {/* General Information Section */}
            <div className="col-12">
              <h5
                className="fw-bold mb-3"
                style={{ color: "#2d3748" }}
              >
                {t('pharmacySignup.sections.generalInfo')}
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.licenseNumber')}
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="form-control"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="col-12">
              <h5
                className="fw-bold mb-3"
                style={{ color: "#2d3748" }}
              >
                {t('pharmacySignup.sections.addressDetails')}
              </h5>
              <div className="row g-3">
                <div className="col-12">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.address')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.district')}
                  </label>
                  <input
                    type="text"
                    name="district"
                    className="form-control"
                    value={formData.district}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.state')}
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.pincode')}
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-control"
                    value={formData.pincode}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact & Account Section */}
            <div className="col-12">
              <h5
                className="fw-bold mb-3"
                style={{ color: "#2d3748" }}
              >
                {t('pharmacySignup.sections.contactAccount')}
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.contactNumber')}
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    className="form-control"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.password')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.workingTimings')}
                  </label>
                  <input
                    type="text"
                    name="workingTimings"
                    className="form-control"
                    value={formData.workingTimings}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    placeholder={t('pharmacySignup.fields.workingTimingsPlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pharmacist Details Section */}
            <div className="col-12">
              <h5
                className="fw-bold mb-3"
                style={{ color: "#2d3748" }}
              >
                {t('pharmacySignup.sections.pharmacistDetails')}
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.pharmacistName')}
                  </label>
                  <input
                    type="text"
                    name="pharmacistName"
                    className="form-control"
                    value={formData.pharmacistName}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.pharmacistId')}
                  </label>
                  <input
                    type="text"
                    name="pharmacistId"
                    className="form-control"
                    value={formData.pharmacistId}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div className="col-12">
                  <label
                    className="fw-medium mb-2"
                    style={{ color: "#4a5568" }}
                  >
                    {t('pharmacySignup.fields.pharmacistQualification')}
                  </label>
                  <input
                    type="text"
                    name="pharmacistQualification"
                    className="form-control"
                    value={formData.pharmacistQualification}
                    onChange={handleChange}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-12 mt-4">
              <button
                type="submit"
                className="btn btn-primary w-100"
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  background: "#4f46e5",
                  border: "none",
                }}
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader size={20} className="me-2 animate-spin" />
                    {t('pharmacySignup.buttons.creating')}
                  </>
                ) : (
                  t('pharmacySignup.buttons.create')
                )}
              </button>

              <p className="text-center mt-4 mb-0">
                {t('pharmacySignup.links.haveAccount')} {" "}
                <Link
                  to="/pharmacy/login"
                  className="text-decoration-none"
                  style={{ color: "#4f46e5" }}
                >
                  {t('pharmacySignup.links.signIn')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
