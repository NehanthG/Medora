import express from "express";
const router = express.Router();

import Hospital from "../models/hospitalSchema.js";
import { authenticateToken } from "../middleware/adminAuth.js";
import generateToken from "../lib/utils.js";

import {
  login,
  logout,
  me,
  register,
} from "../controllers/admin.auth.controllers.js";

router.post("/login", login);

router.post("/register", register);

// Route to verify token and get current hospital info
router.get("/me", authenticateToken, me);

router.post("/logout", logout);



export default router;
