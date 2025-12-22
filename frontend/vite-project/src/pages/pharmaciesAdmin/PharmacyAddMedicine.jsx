import React, { useState } from "react";
import { usePharmacyStore } from "../../stores/pharmacyAuthStore";
import { useNavigate } from "react-router-dom";
import PharmacyNavbar from "../../components/PharmacyNavbar";
import { ArrowLeft, Plus, Loader } from "lucide-react";

export default function PharmacyAddMedicine() {
  const { addMedicine, isAddingMedicine } = usePharmacyStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await addMedicine(formData);
    if (response.success) {
      navigate("/pharmacy/dashboard");
    }
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <PharmacyNavbar />
      <div className="container py-5">
        <button
          onClick={() => navigate("/pharmacy/dashboard")}
          className="btn btn-link text-decoration-none mb-4 p-0"
          style={{ color: "#4f46e5" }}
        >
          <ArrowLeft size={18} className="me-2" />
          Back to Dashboard
        </button>

        <div
          className="bg-white rounded-3 shadow-sm p-4"
          style={{ border: "1px solid #e2e8f0" }}
        >
          <h2
            className="fw-bold mb-4"
            style={{ color: "#2d3748" }}
          >
            Add New Medicine
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Medicine Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Stock (units)
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                  min="0"
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div className="col-12">
                <label
                  className="fw-bold mb-2"
                  style={{ color: "#2d3748" }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="d-flex gap-3 mt-4">
              <button
                type="submit"
                className="btn btn-outline-primary"
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
                disabled={isAddingMedicine}
              >
                {isAddingMedicine ? (
                  <>
                    <Loader size={18} className="me-2 animate-spin" />
                    Adding Medicine...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="me-2" />
                    Add Medicine
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/pharmacy/dashboard")}
                className="btn btn-outline-secondary"
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
