import express from "express";
import axios from "axios";
import mongoose from "mongoose";

import Appointment from "../models/appointmentSchema.js";
import Doctor from "../models/doctorSchema.js";
import { authenticateToken } from "../middleware/adminAuth.js";
import {
  deleteDoctor,
  getAllDoctors,
  getDoctorDetails,
  getDoctorsByHospital,
  newDoctor,
  updateDoctor,
} from "../controllers/admin.doctor.controllers.js";

const router = express.Router();

router.get("/all", authenticateToken, getAllDoctors);

// Public route to get doctors by hospital (no auth required)
router.get("/hospital/:hospitalId", getDoctorsByHospital);

router.post("/new", authenticateToken, newDoctor);

router.get("/:id", authenticateToken, getDoctorDetails);

router.put("/update/:id", authenticateToken, updateDoctor);

router.delete("/delete/:id", authenticateToken, deleteDoctor);

export default router
