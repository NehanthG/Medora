import mongoose from "mongoose";
const { Schema, model } = mongoose;
import Medicine from "./medicineSchema.js";
const pharmacySchema = new Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pharmacistName: { type: String, required: true },
  pharmacistId: { type: String, required: true },
  pharmacistQualification: { type: String, required: true },
  workingTimings: { type: String, required: true },
  medicines: { type: [Medicine.schema], default: [] },
});

const Pharmacy = model("Pharmacy", pharmacySchema);

export default Pharmacy;
