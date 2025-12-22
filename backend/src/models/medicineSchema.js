import mongoose from "mongoose";

const { Schema, model } = mongoose;

const medicineSchema = new Schema(
  {
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String }, // optional (e.g. Antibiotic, etc.)
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Medicine = model("Medicine", medicineSchema);
export default Medicine;
