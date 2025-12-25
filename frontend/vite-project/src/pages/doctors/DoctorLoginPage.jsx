import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDoctorAuthStore } from '../../stores/doctorAuthStore';
import { Mail, Lock } from "lucide-react";
import { useTranslation } from 'react-i18next';

// Reusable InputField component
const InputField = ({ icon: Icon, type, id, label, placeholder, value, onChange, autoComplete }) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label fw-semibold">{label}</label>
    <div className="d-flex align-items-center border rounded-pill px-3 py-2 shadow-sm">
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

export default function DoctorLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login, isLoggingIn, doctor } = useDoctorAuthStore();
  const { t } = useTranslation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (doctor) {
      navigate('/doctor/dashboard', { replace: true });
    }
  }, [doctor, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await login(formData);
      if (result?.success) {
        navigate("/doctor/dashboard", { replace: true });
      } else {
        setError(result?.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f6f8fb" }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: "380px", width: "100%", borderRadius: "18px" }}>
        <div className="card-body p-4">
          <h2 className="mb-4 text-center fw-bold" style={{ letterSpacing: "1px" }}>{t('login.doctorLogin') || 'Doctor Login'}</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <InputField
              icon={Mail}
              type="email"
              id="email"
              label={t('login.email') || 'Email'}
              placeholder={t('login.email') || 'Enter your email'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="username"
            />
            <InputField
              icon={Lock}
              type="password"
              id="password"
              label={t('login.password') || 'Password'}
              placeholder={t('login.password') || 'Enter your password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold mt-2"
              disabled={isLoggingIn}
              style={{ transition: "background 0.2s" }}
            >
              {isLoggingIn ? (t('login.loggingIn') || 'Logging in...') : (t('login.login') || 'Login')}
            </button>

            <div className="mt-3 text-center">
              <p className="mb-0 text-secondary">
                {t('login.noAccount') || 'Don\'t have an account?'} 
                <Link to="/doctor/register" className="fw-bold text-primary text-decoration-none ms-1">
                  {t('login.signUp') || 'Sign Up'}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
