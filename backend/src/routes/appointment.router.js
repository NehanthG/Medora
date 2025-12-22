import express from "express";

const router = express.Router();

// Import authentication middlewares
import { protectRoute } from "../middleware/userAuth.js";
import { authenticateToken } from "../middleware/adminAuth.js";

// Import appointment controllers
import {
  createAppointment,
  getAllAppointments,
  getHospitalAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getPatientAppointments,
  getDoctorAppointments,
} from "../controllers/appointment.controllers.js";

//user routes (temporarily without auth for testing)
router.post("/create", createAppointment);
router.get("/patient/:patientId",  getPatientAppointments);

//hospital routes
router.get("/hospital", authenticateToken, getHospitalAppointments);
router.get("/all", authenticateToken, getAllAppointments);

// both users and hospital
router.get("/:id", getAppointmentById);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

// Doctor specific routes
router.get("/doctor/:doctorId", getDoctorAppointments);

export default router;
