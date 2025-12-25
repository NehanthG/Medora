import express from "express";
import {
  logVitals,
  get30BpReadings,
  get7BpReadings,
  get30SugarReadings,
  get7SugarReadings,
  triggerFetch,
  getAISummary,
} from "../controllers/user.vitals.controller.js";
import { protectRoute } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/:userID/log", protectRoute, logVitals);
router.post("/:userID/trigger-fetch", protectRoute, triggerFetch);
// (debug endpoints removed) - all routes are protected
router.get("/:userID/7sugar", protectRoute, get7SugarReadings);
router.get("/:userID/7Bp", protectRoute, get7BpReadings);
router.get("/:userID/30sugar", protectRoute, get7SugarReadings);
router.get("/:userID/30Bp", protectRoute, get7BpReadings);
router.post("/ai-summary", protectRoute, getAISummary);
export default router;