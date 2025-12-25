import mongoose from "mongoose";

const vitalsLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["BP", "SUGAR"],
      required: true
    },

    // BP
    systolic: Number,
    diastolic: Number,

    // Sugar
    sugarType: {
      type: String,
      enum: ["FASTING", "POST_MEAL", "RANDOM"]
    },
    sugarValue: Number,

    recordedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("VitalsLog", vitalsLogSchema);
