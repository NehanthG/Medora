import express from "express";
import bcrypt from "bcryptjs";
const router = express.Router();

const saltRounds = 10;

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "blahblahblahblah";

import Hospital from "../models/hospitalSchema.js";
import { authenticateToken } from "../middleware/adminAuth.js";
import generateToken from "../lib/utils.js";

export const login = async (req, res) => {
  const { hospitalId, password } = req.body;

  if (!hospitalId.trim() || !password.trim()) {
    return res.status(500).json({
      success: false,
      message: "ID and password cannot be empty ",
    });
  }

  try {
    const hospital = await Hospital.findOne({ hospitalId: hospitalId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const passwordMatch = await bcrypt.compare(password, hospital.password);
    if (passwordMatch) {
      const token = generateToken(hospital._id, res);
      return res.status(200).json({
        success: true,
        token: token,
        hospital: {
          id: hospital._id,
          hospitalId: hospital.hospitalId,
          email: hospital.email,
          address: hospital.address,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const register = async (req, res) => {
  const { hospitalId, email, password, address } = req.body;

  if (!hospitalId || !email || !password || !address) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({
      $or: [{ hospitalId: hospitalId }, { email: email }],
    });

    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: "Hospital ID or email already exists",
      });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);

    const newHospital = new Hospital({
      hospitalId: hospitalId,
      email: email,
      password: hashPassword,
      address: address,
    });

    await newHospital.save();

    return res.status(201).json({
      success: true,
      message: `New Hospital Registered with ID: ${hospitalId}`,
      data: {
        id: newHospital._id,
        hospitalId: newHospital.hospitalId,
        email: newHospital.email,
        address: newHospital.address,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Admin logged out successfully",
    });
  }
};

export const me = async (req, res) => {
  try {
    // const hospital = await Hospital.findById(req.hospital._id);

    // if (!hospital) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Hospital not found",
    //   });
    // }

    res.status(200).json({
      success: true,
      hospital: {
        id: req.hospital._id,
        hospitalId: req.hospital.hospitalId,
        email: req.hospital.email,
        address: req.hospital.address,
      },
    });
  } catch (err) {
    console.error("Get current hospital error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
