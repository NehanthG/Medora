import React, { useEffect, useState } from 'react';
import { usePharmacyStore } from '../../stores/pharmacyAuthStore';
import { useNavigate } from 'react-router-dom';
import { Package, Edit, Trash2, Loader, Plus } from 'lucide-react';
import PharmacyNavbar from '../../components/PharmacyNavbar';
import { useTranslation } from 'react-i18next';

export default function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pharmacyUser, getAllMedicines, isCheckingAuth, checkAuth, deleteMedicine } = usePharmacyStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
        const response = await getAllMedicines();
        if (response.success) {
          setMedicines(response.data);
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/pharmacy/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuth, getAllMedicines, navigate]);

  const handleDelete = async (medicineId) => {
    const confirmed = window.confirm('Are you sure you want to delete this medicine?');
    if (confirmed) {
      const response = await deleteMedicine(medicineId);
      if (response.success) {
        setMedicines(prev => prev.filter(med => med._id !== medicineId));
      }
    }
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f6f8fb" }}>
        <div className="text-center">
          <Loader size={40} className="text-primary mb-3 animate-spin" />
          <p className="text-secondary fw-medium">{t('pharmacyDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!pharmacyUser) {
    navigate('/pharmacy/login');
    return null;
  }

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
        <PharmacyNavbar />
      <div className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div className="mb-3 mb-md-0">
            <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
              {t('pharmacyDashboard.welcome', { name: pharmacyUser?.name })}
            </h2>
            <p className="text-secondary mb-0" style={{ fontSize: "1.1rem" }}>
              {t('pharmacyDashboard.subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/pharmacy/add-medicine')}
            className="btn btn-primary d-flex align-items-center shadow-sm hover-lift"
            style={{ 
              padding: "12px 24px", 
              borderRadius: "8px",
              background: "#4f46e5",
              border: "none"
            }}
          >
            <Plus size={20} className="me-2" />
            {t('pharmacyDashboard.actions.addNewMedicine')}
          </button>
        </div>

        {medicines.length === 0 ? (
          <div className="text-center py-5 mt-4">
            <Package size={56} className="text-secondary mb-4" style={{ opacity: 0.5 }} />
            <h4 className="fw-bold mb-2" style={{ color: "#2d3748" }}>{t('pharmacyDashboard.empty.title')}</h4>
            <p className="text-secondary mb-4" style={{ fontSize: "1.1rem" }}>
              {t('pharmacyDashboard.empty.subtitle')}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {medicines.map((medicine) => (
              <div key={medicine._id} className="col-md-6 col-lg-4">
                <div 
                  className="bg-white rounded-3 p-4 hover-lift"
                  style={{
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="h5 fw-bold mb-0" style={{ color: "#2d3748" }}>
                      {medicine.name}
                    </h3>
                    <span 
                      className={`badge ${medicine.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                    >
                      {medicine.stock > 0 ? t('pharmacyDashboard.badges.inStock') : t('pharmacyDashboard.badges.outOfStock')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <p className="text-secondary small mb-1">{t('pharmacyDashboard.fields.manufacturer')}</p>
                        <p className="fw-medium mb-0">{medicine.manufacturer}</p>
                      </div>
                      <div className="col-6">
                        <p className="text-secondary small mb-1">{t('pharmacyDashboard.fields.batchNumber')}</p>
                        <p className="fw-medium mb-0">{medicine.batchNumber}</p>
                      </div>
                      <div className="col-6">
                        <p className="text-secondary small mb-1">{t('pharmacyDashboard.fields.price')}</p>
                        <p className="fw-medium mb-0">₹{medicine.price}</p>
                      </div>
                      <div className="col-6">
                        <p className="text-secondary small mb-1">{t('pharmacyDashboard.fields.stock')}</p>
                        <p className="fw-medium mb-0">{medicine.stock} {t('pharmacyDashboard.units')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      onClick={() => navigate(`/pharmacy/edit-medicine/${medicine._id}`)}
                      className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center hover-lift"
                      style={{ padding: "10px", borderRadius: "8px" }}
                    >
                      <Edit size={16} className="me-2" />
                      {t('pharmacyDashboard.actions.edit')}
                    </button>
                    <button 
                      onClick={() => handleDelete(medicine._id)}
                      className="btn btn-outline-danger flex-grow-1 d-flex align-items-center justify-content-center hover-lift"
                      style={{ padding: "10px", borderRadius: "8px" }}
                    >
                      <Trash2 size={16} className="me-2" />
                      {t('pharmacyDashboard.actions.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
