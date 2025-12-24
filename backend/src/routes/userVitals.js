import express from "express";
import { logVitals } from "../controllers/user.vitals.controller.js";
import { protectRoute } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/:userID/log",protectRoute ,logVitals);

export default router;