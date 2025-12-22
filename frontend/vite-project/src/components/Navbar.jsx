
import { NavLink, Link } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuthStore } from '../stores/useAuthStore'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';






export default function Navbar() {
  const { logout,authUser } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const navLinkClass = ({ isActive }) =>
    `mx-3 fw-semibold text-decoration-none ${isActive ? "text-primary" : "text-dark"}`;

  return (
    <nav
      className="d-flex align-items-center justify-content-between px-4 py-3 shadow-sm bg-white"
      style={{ borderRadius: "12px" }}
    >
      <div className="d-flex align-items-center">
        <Link
          to="/"
          className="fw-bold fs-4 text-primary me-4 text-decoration-none"
          style={{ letterSpacing: "1px" }}
        >
          {t('brand')}
        </Link>
        <NavLink to="/" className={navLinkClass}>
          {t('nav.home')}
        </NavLink>

        <NavLink to="/chatbot" className={navLinkClass}>
          {t('nav.quickAsk')}
        </NavLink>
        <NavLink to="/appointments" className={navLinkClass}>
          {t('nav.appointments')}
        </NavLink>
        <NavLink to="/medical-records" className={navLinkClass}>
          {t('nav.medicalRecords')}
        </NavLink>
        {/* <NavLink to="/chatbot" className={navLinkClass}>Health Assistant</NavLink> */}

        <NavLink to="/allPharmacies" className={navLinkClass}>
          {t('nav.pharmacy')}
        </NavLink>
        {/* <NavLink to="/appointments" className={navLinkClass}>Appointments</NavLink> */}
        {/* <NavLink to="/messages" className={navLinkClass}>Messages</NavLink> */}

        <NavLink to="/myprofile" className={navLinkClass}>
          {t('nav.myProfile')}
        </NavLink>
      </div>
      <div className="d-flex align-items-center">
        <div className="me-3 d-flex align-items-center">
          <label htmlFor="lang-select" className="me-2 fw-semibold text-secondary" style={{fontSize:'0.9rem'}}>
            {t('language.label')}:
          </label>
          <select
            id="lang-select"
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
          className="btn btn-outline-danger d-flex align-items-center fw-bold px-3 py-1 rounded-pill me-3"
          style={{ gap: "8px" }}
        >
          <LogOut size={18} className="me-1" />
          {t('nav.logout')}
        </button>
        <img
          src={authUser?.profilePic || "/avatar.png"}
          alt="Profile"
          className="rounded-circle"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            border: "2px solid #e2e8f0",
          }}
        />
      </div>
    </nav>
  );
}

