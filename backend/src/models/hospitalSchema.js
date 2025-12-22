import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String, // This should be hashed before saving
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital
