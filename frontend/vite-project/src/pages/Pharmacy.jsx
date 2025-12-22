import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Store, MapPin, Phone, Mail, ArrowLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Pharmacy() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [pharmacy, setPharmacy] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchPharmacy = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await axios.get(`http://localhost:5002/api/user/pharmacy/${id}`);
                setPharmacy(response.data.data);
                setMedicines(response.data.data.medicines);
            } catch (error) {
                setError(t('pharmacy.errors.loadFailed'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchPharmacy();
    }, [id]);

    const filteredMedicines = medicines.filter((medicine) =>
        (medicine?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (medicine?.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
            <div className="container py-5">
                {/* Header Section */}
                <button
                    onClick={() => navigate('/allPharmacies')}
                    className="btn btn-link text-decoration-none mb-4 p-0"
                    style={{ color: "#4f46e5" }}
                >
                    <ArrowLeft size={18} className="me-2" />
                    {t('pharmacy.backToPharmacies')}
                </button>

                <div className="bg-white rounded-3 p-4 mb-4" style={{ border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center mb-3">
                        <Store size={32} className="text-primary me-3" style={{ opacity: 0.8 }} />
                        <div>
                            <h2 className="fw-bold mb-1" style={{ color: '#2d3748' }}>
                                {i18n.language?.startsWith('hi') && pharmacy.name_hi ? pharmacy.name_hi : pharmacy.name}
                            </h2>
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center">
                                    <MapPin size={16} className="text-secondary me-2" />
                                    <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
                                        {i18n.language?.startsWith('hi') && pharmacy.address_hi ? pharmacy.address_hi : pharmacy.address}
                                    </p>
                                </div>
                                {pharmacy.phone && (
                                    <div className="d-flex align-items-center">
                                        <Phone size={16} className="text-secondary me-2" />
                                        <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
                                            {pharmacy.phone}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0" style={{ color: '#2d3748' }}>
                        {t('pharmacy.availableMedicines')}
                    </h3>
                    <div className="position-relative">
                        <input
                            type="text"
                            placeholder={t('pharmacy.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-control"
                            style={{ padding: '10px 16px', paddingLeft: '40px', borderRadius: '8px', width: '300px' }}
                        />
                        <Search size={18} className="position-absolute text-secondary" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                </div>

                {/* Medicines Grid */}
                {filteredMedicines.length === 0 ? (
                    <div className="text-center py-5">
                        <Package size={48} className="text-secondary mb-3" style={{ opacity: 0.5 }} />
                        <h4 className="fw-bold mb-2" style={{ color: '#2d3748' }}>{t('pharmacy.noMedicines')}</h4>
                        <p className="text-secondary mb-0">{t('pharmacy.tryAdjust')}</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredMedicines.map((medicine) => (
                            <div key={medicine._id} className="col-md-6 col-lg-4">
                                <div
                                    className="bg-white rounded-3 p-4 h-100"
                                    style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                                >
                                    <div className="d-flex align-items-center mb-3">
                                        <Package size={24} className="text-primary me-2" style={{ opacity: 0.8 }} />
                                        <h3 className="h5 fw-bold mb-0" style={{ color: '#2d3748' }}>
                                            {i18n.language?.startsWith('hi') && medicine.name_hi ? medicine.name_hi : medicine.name}
                                        </h3>
                                    </div>

                                    <p className="text-secondary mb-3" style={{ fontSize: '0.95rem' }}>
                                        {i18n.language?.startsWith('hi') && medicine.description_hi ? medicine.description_hi : medicine.description}
                                    </p>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-0 fw-bold" style={{ color: '#2d3748' }}>₹{medicine.price}</p>
                                            <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                                                {t('pharmacy.stock', { count: medicine.stock })}
                                            </p>
                                        </div>
                                        <button className="btn btn-outline-primary" style={{ padding: '6px 12px', fontSize: '0.9rem', borderRadius: '6px' }}>
                                            {t('pharmacy.viewDetails')}
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
