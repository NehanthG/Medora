import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Store, MapPin, Phone, Mail } from "lucide-react";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const AllPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(
          "http://localhost:5002/api/user/pharmacy/allPharmacies"
        );
        setPharmacies(response.data.data);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
        setError(t('pharmacies.errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const url =
        q.trim() === ""
          ? "http://localhost:5002/api/user/pharmacy/allPharmacies"
          : `http://localhost:5002/api/user/pharmacy/search?q=${q}`;

      const response = await axios.get(url);
      setPharmacies(response.data.data);
    } catch (error) {
      console.error("Error searching pharmacies:", error);
      setError(t('pharmacies.errors.searchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
              {t('pharmacies.title')}
            </h2>
            <p className="text-secondary" style={{ fontSize: "1.1rem" }}>
              {t('pharmacies.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="d-flex gap-2">
            <div className="position-relative">
              <input
                type="text"
                placeholder={t('pharmacies.searchPlaceholder')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="form-control"
                style={{
                  padding: "10px 16px",
                  paddingLeft: "40px",
                  borderRadius: "8px",
                  width: "300px",
                }}
              />
              <Search
                size={18}
                className="position-absolute text-secondary"
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-outline-primary"
              style={{ padding: "10px 20px", borderRadius: "8px" }}
            >
              {t('pharmacies.search')}
            </button>
          </form>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row g-4">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy._id} className="col-md-6 col-lg-4">
              <div
                className="bg-white rounded-3 p-4 h-100"
                style={{
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/pharmacy/${pharmacy._id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                }}
              >
                <div className="d-flex align-items-center mb-3">
                <Store
                  size={24}
                  className="text-primary me-2"
                  style={{ opacity: 0.8 }}
                />
                <h3
                  className="h5 fw-bold mb-0"
                  style={{ color: "#2d3748" }}
                >
                  {i18n.language?.startsWith('hi') && pharmacy.name_hi ? pharmacy.name_hi : pharmacy.name}
                </h3>
              </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <MapPin size={16} className="text-secondary me-2" />
                    <p
                      className="text-secondary mb-0"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {pharmacy.address}
                    </p>
                  </div>
                  {pharmacy.phone && (
                    <div className="d-flex align-items-center mb-2">
                      <Phone size={16} className="text-secondary me-2" />
                      <p
                        className="text-secondary mb-0"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {pharmacy.phone}
                      </p>
                    </div>
                  )}
                  {pharmacy.email && (
                    <div className="d-flex align-items-center">
                      <Mail size={16} className="text-secondary me-2" />
                      <p
                        className="text-secondary mb-0"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {pharmacy.email}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-outline-primary w-100"
                  style={{
                    padding: "8px",
                    fontSize: "0.9rem",
                    borderRadius: "6px",
                  }}
                >
                  {t('pharmacies.viewMedicines')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllPharmacies;
