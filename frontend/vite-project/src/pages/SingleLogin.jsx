import React, { useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { User, Shield, Pill, Stethoscope } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/useAuthStore';

export default function SingleLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { authUser } = useAuthStore();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (authUser) {
      navigate('/home');
    }
  }, [authUser, navigate]);

  // Show loading state while checking auth
  if (authUser) {
    return <div>Loading...</div>;
  }

  // Extract selected login type from URL
  const getSelectedLoginType = () => {
    if (location.pathname.includes("admin")) return "admin";
    if (location.pathname.includes("pharmacy")) return "pharmacy";
    if (location.pathname.includes("doctor")) return "doctor";
    return "user";
  };

  const selectedLoginType = getSelectedLoginType();

  const loginTypes = [
    {
      id: "user",
      title: t('singleLogin.types.user.title'),
      description: t('singleLogin.types.user.description'),
      icon: User,
      bgColor: "#4f46e5",
      redirectPath: "/single-login/user",
    },
    {
      id: "doctor",
      title: t('singleLogin.types.doctor.title', 'Doctor'),
      description: t('singleLogin.types.doctor.description', 'Access your doctor dashboard'),
      icon: Stethoscope,
      bgColor: "#2563eb",
      redirectPath: "/single-login/doctor",
    },
    {
      id: "admin",
      title: t('singleLogin.types.admin.title'),
      description: t('singleLogin.types.admin.description'),
      icon: Shield,
      bgColor: "#059669",
      redirectPath: "/single-login/admin",
    },
    {
      id: "pharmacy",
      title: t('singleLogin.types.pharmacy.title'),
      description: t('singleLogin.types.pharmacy.description'),
      icon: Pill,
      bgColor: "#dc2626",
      redirectPath: "/single-login/pharmacy",
    },
  ];

  const handleLoginTypeSelection = (type) => {
    navigate(loginTypes.find((lt) => lt.id === type).redirectPath);
  };

  return (
    <div key={i18n.language} style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <div className="container py-4">
        {/* Language Selector */}
        <div className="d-flex justify-content-end mb-2">
          <label htmlFor="single-login-lang-select" className="me-2 fw-semibold text-secondary" style={{fontSize:'0.9rem'}}>
            {t('language.label')}:
          </label>
          <select
            id="single-login-lang-select"
            className="form-select form-select-sm"
            style={{ width: '130px' }}
            value={i18n.resolvedLanguage || i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">{t('language.en')}</option>
            <option value="hi">{t('language.hi')}</option>
            <option value="pa">{t('language.pa')}</option>
            <option value="te">{t('language.te')}</option>
          </select>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-4">
              <h1
                className="fw-bold mb-2"
                style={{ color: "#2d3748", fontSize: "2rem" }}
              >
                {t('singleLogin.header.title', { brand: t('brand') })}
              </h1>
              <p className="text-secondary mb-0" style={{ fontSize: "1rem" }}>
                {t('singleLogin.header.subtitle')}
              </p>
            </div>

            {/* Login Type Selection */}
            <div className="mb-4">
              <h6
                className="fw-bold mb-3 text-center"
                style={{ color: "#2d3748" }}
              >
                {t('singleLogin.chooseType')}
              </h6>
              <div className="row g-2">
                {loginTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div key={type.id} className="col-md-4">
                      <div
                        className={`card border-0 h-100 cursor-pointer ${
                          selectedLoginType === type.id
                            ? "shadow-lg"
                            : "shadow-sm"
                        }`}
                        style={{
                          background:
                            selectedLoginType === type.id
                              ? type.bgColor
                              : "white",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          border:
                            selectedLoginType === type.id
                              ? `2px solid ${type.bgColor}`
                              : "2px solid transparent",
                        }}
                        onClick={() => handleLoginTypeSelection(type.id)}
                        onMouseEnter={(e) => {
                          if (selectedLoginType !== type.id) {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedLoginType !== type.id) {
                            e.currentTarget.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        <div className="card-body d-flex flex-column align-items-center p-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                            style={{
                              background:
                                selectedLoginType === type.id
                                  ? "rgba(255,255,255,0.2)"
                                  : "#f1f5f9",
                              width: "48px",
                              height: "48px",
                            }}
                          >
                            <IconComponent
                              size={24}
                              className={
                                selectedLoginType === type.id
                                  ? "text-white"
                                  : "text-primary"
                              }
                            />
                          </div>
                          <h6
                            className={`fw-bold mb-1 text-center ${
                              selectedLoginType === type.id ? "text-white" : ""
                            }`}
                            style={{
                              color:
                                selectedLoginType === type.id
                                  ? "white"
                                  : "#2d3748",
                              fontSize: "0.9rem",
                            }}
                          >
                            {type.title}
                          </h6>
                          <p
                            className={`mb-0 text-center ${
                              selectedLoginType === type.id
                                ? "text-white-50"
                                : "text-secondary"
                            }`}
                            style={{ fontSize: "0.75rem" }}
                          >
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Login Form - Outlet */}
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <Outlet
                  context={{
                    loginTypes: loginTypes.find(
                      (type) => type.id === selectedLoginType
                    ),
                    selectedLoginType,
                  }}
                />
              </div>
            </div>

            {/* Footer Links */}
            <div className="text-center mt-3">
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link
                  to="/forgot-password"
                  className="text-decoration-none text-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  {t('singleLogin.links.forgotPassword')}
                </Link>
                <Link
                  to="/help"
                  className="text-decoration-none text-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  {t('singleLogin.links.needHelp')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
