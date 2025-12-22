import React, { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock, Calendar } from "lucide-react";
import { useTranslation } from 'react-i18next';

// Fixed InputField component outside SignupPage for stability
const InputField = ({ icon: Icon, type, id, label, placeholder, value, onChange, autoComplete }) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label fw-semibold">{label}</label>
    <div className="d-flex align-items-center border rounded-pill px-3 py-1 shadow-sm">
      <Icon size={22} className="text-secondary me-3" />
      <input
        type={type}
        id={id}
        className="form-control border-0 flex-grow-1 px-2 py-1"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </div>
  </div>
);

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  const { signup, isSigningUp } = useAuthStore();
  const { t } = useTranslation();

  const validateForm = () => {
    const { fullName, email, password, phoneNumber, dateOfBirth } = formData;
    if (!fullName || !email || !password || !phoneNumber || !dateOfBirth) {
      return toast.error(t('signup.errors.required'));
    }
    if (password.length < 6) {
      return toast.error(t('signup.errors.passwordLength'));
    }
    if (phoneNumber.length !== 10) {
      return toast.error(t('signup.errors.phoneLength'));
    }
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error(t('signup.errors.invalidEmail'));
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success) {
      const nav = await signup(formData);
      if (nav) navigate("/");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f6f8fb" }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: "380px", width: "100%", borderRadius: "18px" }}>
        <div className="card-body p-4">
          <h2 className="mb-4 text-center fw-bold" style={{ letterSpacing: "1px" }}>{t('signup.title')}</h2>
          <form onSubmit={handleSubmit}>
            <InputField
              icon={User}
              type="text"
              id="fullName"
              label={t('signup.fullName')}
              placeholder={t('signup.fullName')}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              autoComplete="name"
            />
            <InputField
              icon={Mail}
              type="email"
              id="email"
              label={t('signup.email')}
              placeholder={t('signup.email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="username"
            />
            <InputField
              icon={Lock}
              type="password"
              id="password"
              label={t('signup.password')}
              placeholder={t('signup.password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="new-password"
            />
            <InputField
              icon={Phone}
              type="text"
              id="phoneNumber"
              label={t('signup.phoneNumber')}
              placeholder={t('signup.phoneNumber')}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              autoComplete="tel"
            />
            <InputField
              icon={Calendar}
              type="date"
              id="dateOfBirth"
              label={t('signup.dateOfBirth')}
              placeholder={t('signup.dateOfBirth')}
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              autoComplete="bday"
            />

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold mt-2"
              disabled={isSigningUp}
              style={{ transition: "background 0.2s" }}
            >
              {isSigningUp ? t('signup.signingUp') : t('signup.signUp')}
            </button>

            <div className="mt-3 text-center">
              <p className="mb-0 text-secondary">
                {t('signup.haveAccount')} <Link to="/login" className="fw-bold text-primary text-decoration-none">{t('signup.login')}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
