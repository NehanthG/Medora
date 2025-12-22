import express from "express";
import { signup, login, logout, checkAuth, updateProfile, getAllHospitals } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/userAuth.js";
import User from "../models/user.model.js";
import { getAllAppointments } from "../controllers/user.controllers.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/allappointments", protectRoute, getAllAppointments);

router.get("/allhospitals", getAllHospitals); // Temporarily removed auth for testing

export default router;
