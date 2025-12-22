import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePharmacyStore } from "../../stores/pharmacyAuthStore";
import { LogIn, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from 'react-i18next';

export default function PharmacyLogin() {
  const { login, isLoggingIn } = usePharmacyStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    licenseNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      toast.success(t('pharmacyLogin.toasts.success'));
      navigate("/pharmacy/dashboard");
    } else {
      toast.error(t('pharmacyLogin.toasts.invalid'));
    }
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <div className="container py-5" style={{ maxWidth: "450px" }}>
        <div
          className="bg-white rounded-3 shadow-sm p-4 p-md-5"
          style={{ border: "1px solid #e2e8f0" }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <LogIn
              size={40}
              className="text-primary mb-3"
              style={{ opacity: 0.8 }}
            />
            <h2
              className="fw-bold mb-2"
              style={{ color: "#2d3748" }}
            >
              {t('pharmacyLogin.title')}
            </h2>
            <p
              className="text-secondary"
              style={{ fontSize: "1.05rem" }}
            >
              {t('pharmacyLogin.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-12">
              <label
                className="fw-medium mb-2"
                style={{ color: "#4a5568" }}
              >
                {t('pharmacyLogin.fields.licenseNumber')}
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
                placeholder={t('pharmacyLogin.fields.licenseNumberPlaceholder')}
              />
            </div>

            <div className="col-12">
              <label
                className="fw-medium mb-2"
                style={{ color: "#4a5568" }}
              >
                {t('pharmacyLogin.fields.password')}
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
                placeholder={t('pharmacyLogin.fields.passwordPlaceholder')}
              />
            </div>

            {/* Submit Button */}
            <div className="col-12 mt-3">
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
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader size={20} className="me-2 animate-spin" />
                    {t('pharmacyLogin.buttons.loggingIn')}
                  </>
                ) : (
                  t('pharmacyLogin.buttons.login')
                )}
              </button>

              {/* Link to Signup */}
              <p className="text-center mt-4 mb-0">
                {t('pharmacyLogin.links.noAccount')} {" "}
                <Link
                  to="/pharmacy/signup"
                  className="text-decoration-none"
                  style={{ color: "#4f46e5" }}
                >
                  {t('pharmacyLogin.links.register')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
