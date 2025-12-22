import express from "express"
import { addAppointment , getAppointment ,getHospitals, getDoctors } from "../controllers/appointment.controllers.js"
const router = express.Router()

router.get("/getAppointment",getAppointment);
router.get("/getHospitals",getHospitals);
router.get("/getDoctors",getDoctors);
router.post("/addAppointment",addAppointment);

export default router