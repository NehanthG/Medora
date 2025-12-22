import mongoose from "mongoose";

const bookingSlotSchema = new mongoose.Schema(
  {
    time: {
      type: Number, //  9 for 9 AM
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  specialisation: {
    type: String,
    required: true,
  },
  shift: {
    start: {
      type: Number, // 24 hour format
      required: true,
    },
    end: {
      type: Number, // 24 hour format
      required: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  bookings: [bookingSlotSchema],
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
