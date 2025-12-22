import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
    ref: "Hospital",
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Doctor",
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  appointmentTime: {
    type: Date,
    required: true,
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["pending", "appointed", "cancelled"],
    default: "pending",
  },
  description: {
    type: String,
    required: true,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
