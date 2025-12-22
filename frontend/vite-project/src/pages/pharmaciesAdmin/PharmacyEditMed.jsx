import React, { useState, useEffect } from "react";
import { usePharmacyStore } from "../../stores/pharmacyAuthStore";
import { useNavigate, useParams } from "react-router-dom";
import PharmacyNavbar from "../../components/PharmacyNavbar";
import { ArrowLeft, Loader } from "lucide-react";

export default function PharmacyEditMed() {
  const { id } = useParams();
  const { getMedicine, updateMedicine, isUpdating } = usePharmacyStore();
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

  // Fetch medicine data on mount
  useEffect(() => {
    const fetchMedicine = async () => {
      const res = await getMedicine(id);
      if (res.success) {
        setFormData({
          name: res.data.name || "",
          manufacturer: res.data.manufacturer || "",
          batchNumber: res.data.batchNumber || "",
          expiryDate: res.data.expiryDate
            ? res.data.expiryDate.split("T")[0]
            : "",
          price: res.data.price || "",
          stock: res.data.stock || "",
          category: res.data.category || "",
          description: res.data.description || "",
        });
      }
    };
    fetchMedicine();
  }, [id, getMedicine]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateMedicine({ medicineId: id, ...formData });
    if (res.success) {
      navigate("/pharmacy/dashboard");
    }
  };

  return (
    <div>
      <PharmacyNavbar />
      <div className="container mt-4">
        <button
          className="btn btn-link text-primary mb-3"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="me-1" /> Back
        </button>

        <h2 className="mb-4">Edit Medicine</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              className="form-control"
              value={formData.manufacturer}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Batch Number</label>
            <input
              type="text"
              name="batchNumber"
              className="form-control"
              value={formData.batchNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              className="form-control"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Price</label>
            <input
              type="number"
              name="price"
              className="form-control"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Stock</label>
            <input
              type="number"
              name="stock"
              className="form-control"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Category</label>
            <input
              type="text"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader className="spin me-2" size={18} /> Updating...
                </>
              ) : (
                "Update Medicine"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
