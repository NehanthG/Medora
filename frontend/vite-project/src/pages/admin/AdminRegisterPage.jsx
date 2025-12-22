import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/adminAuthStore";
import { useTranslation } from 'react-i18next';

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    hospitalId: "",
    email: "",
    password: "",
    address: "",
  });

  const [error, setError] = useState("");
  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validateForm = () => {
    const { hospitalId, email, password, address } = formData;
    if (!email || !password || !hospitalId || !address) {
      setError(t('adminRegister.errors.required'));
      return false;
    }
    if (password.length < 6) {
      setError(t('adminRegister.errors.passwordLength'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('adminRegister.errors.invalidEmail'));
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const result = await signup(formData);

      if (result?.success) {
        console.log("Registration successful");
        toast.success(t('adminRegister.toasts.success'));
        navigate("/admin/login");
      } else {
        setError(t('adminRegister.errors.failed'));
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(t('adminRegister.errors.unexpected'));
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }} className="d-flex align-items-center justify-content-center py-5">
      <div className="container" style={{ maxWidth: "450px" }}>
        <div className="bg-white rounded-3 shadow-sm p-4" style={{ border: "1px solid #e2e8f0" }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
              {t('adminRegister.title')}
            </h2>
            <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
              {t('adminRegister.subtitle')}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="hospitalId" className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                {t('adminRegister.fields.hospitalId')}
              </label>
              <input
                id="hospitalId"
                name="hospitalId"
                type="text"
                value={formData.hospitalId}
                onChange={handleInputChange("hospitalId")}
                placeholder={t('adminRegister.fields.hospitalIdPlaceholder')}
                className="form-control"
                style={{ padding: "12px", borderRadius: "8px" }}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                {t('adminRegister.fields.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder={t('adminRegister.fields.emailPlaceholder')}
                className="form-control"
                style={{ padding: "12px", borderRadius: "8px" }}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                {t('adminRegister.fields.address')}
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange("address")}
                placeholder={t('adminRegister.fields.addressPlaceholder')}
                rows="3"
                className="form-control"
                style={{ padding: "12px", borderRadius: "8px" }}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                {t('adminRegister.fields.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                placeholder={t('adminRegister.fields.passwordPlaceholder')}
                className="form-control"
                style={{ padding: "12px", borderRadius: "8px" }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className="btn btn-outline-primary w-100 mb-3"
              style={{ 
                padding: "12px", 
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "all 0.2s ease"
              }}
            >
              {isSigningUp ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('adminRegister.buttons.registering')}
                </>
              ) : (
                t('adminRegister.buttons.register')
              )}
            </button>

            <div className="text-center">
              <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                {t('adminRegister.links.haveAccount')} {" "}
                <button
                  type="button"
                  onClick={() => navigate("/admin/login")}
                  className="btn btn-link p-0 align-baseline"
                  style={{ color: "#4f46e5", textDecoration: "none" }}
                >
                  {t('adminRegister.links.loginHere')}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
