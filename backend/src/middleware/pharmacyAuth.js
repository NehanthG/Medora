import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import Pharmacy from "../models/pharmacySchema.js";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Middleware to verify JWT token and extract hospital information
export const authenticatePharmacyToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized no token provided ",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    const pharmacy = await Pharmacy.findById(decoded.userId).select(
      "-password"
    );

    if (!pharmacy) {
      return res.status(400).json({
        success: false,
        message: "Not valid token",
      });
    }

    req.pharmacy = pharmacy;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server error ",
    });
  }
};
