import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePharmacyStore } from "../stores/pharmacyAuthStore";
import { useTranslation } from 'react-i18next';

export default function PharmacyNavbar() {
  const navigate = useNavigate();
  const { logout } = usePharmacyStore();
  const { t, i18n } = useTranslation();

  return (
    <nav className="bg-white shadow-sm" style={{ borderBottom: "1px solid #e2e8f0" }}>
      <div className="container d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center">
            <Link to="/pharmacy/dashboard" className="text-decoration-none d-flex align-items-center">
          <h1 className="h4 fw-bold mb-0" style={{ color: "#3b82f6" }}>
            {t('brandPharmacy')}
          </h1>
            </Link>
          
          
        </div>

        <div className="d-flex align-items-center">
          <div className="me-3 d-flex align-items-center">
            <label htmlFor="pharm-lang-select" className="me-2 fw-semibold text-secondary" style={{fontSize:'0.9rem'}}>
              {t('language.label')}:
            </label>
            <select
              id="pharm-lang-select"
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
          <button
            onClick={() => logout(navigate)}
            className="btn btn-outline-danger"
            style={{ padding: "8px 16px", fontSize: "0.9rem", borderRadius: "6px", transition: "all 0.2s ease" }}
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </nav>
  );
}
