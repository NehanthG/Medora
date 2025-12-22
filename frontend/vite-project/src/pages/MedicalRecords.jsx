import React, { useState, useEffect } from 'react'
import { axiosInstance } from '../lib/axios'
import { useTranslation } from 'react-i18next'

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axiosInstance.get('/user/getDocs', { withCredentials: true });
        setRecords(res.data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh", padding: "32px 0" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        <h2 className="fw-bold mb-4" style={{ color: "#22223b", fontSize: "2rem" }}>{t('medicalRecords.title')}</h2>
        <div className="bg-white rounded-4 shadow-sm p-4" style={{ border: "1px solid #e2e8f0" }}>
          <table className="table align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0 12px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th className="fw-bold" style={{ color: "#22223b", border: "none", fontSize: "1.05rem" }}>{t('medicalRecords.table.title')}</th>
                <th className="fw-bold" style={{ color: "#22223b", border: "none", fontSize: "1.05rem" }}>{t('medicalRecords.table.dateUploaded')}</th>
                <th className="fw-bold" style={{ color: "#22223b", border: "none", fontSize: "1.05rem" }}>{t('medicalRecords.table.type')}</th>
                <th className="fw-bold text-center" style={{ color: "#22223b", border: "none", fontSize: "1.05rem" }}>{t('medicalRecords.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-secondary py-5" style={{ background: "#f8fafc", borderRadius: "12px" }}>
                    {t('medicalRecords.empty')}
                  </td>
                </tr>
              ) : (
                records.map((file) => (
                  <tr key={file._id} style={{ background: "#f8fafc", borderRadius: "12px", boxShadow: "0 2px 8px #e2e8f0" }}>
                    <td className="fw-semibold" style={{ border: "none", fontSize: "1rem" }}>{file.title}</td>
                    <td style={{ border: "none", color: "#22223b" }}>{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td style={{ border: "none" }}>
                      <span className={`badge ${file.pdf?.contentType?.includes("pdf") ? "bg-primary" : "bg-info"} text-white`} style={{ fontSize: "0.95rem", padding: "6px 14px", borderRadius: "8px" }}>
                        {file.pdf?.contentType?.includes("pdf") ? t('medicalRecords.type.pdf') : t('medicalRecords.type.image')}
                      </span>
                    </td>
                    <td className="text-center" style={{ border: "none" }}>
                      <a
                        href={`http://localhost:5002/api/user/pdf/${file._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary me-2"
                        style={{ borderRadius: "8px", fontWeight: 500 }}
                      >
                        {t('medicalRecords.actions.view')}
                      </a>
                      <a
                        href={`http://localhost:5002/api/user/pdf/${file._id}`}
                        download
                        className="btn btn-sm btn-outline-secondary me-2"
                        style={{ borderRadius: "8px", fontWeight: 500 }}
                      >
                        {t('medicalRecords.actions.download')}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
