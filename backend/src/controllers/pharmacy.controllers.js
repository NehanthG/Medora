import express from "express";
import axios from "axios";
import mongoose from "mongoose";

import Pharmacy from "../models/pharmacySchema.js";
import Medicine from "../models/medicineSchema.js";

import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Generate JWT token function
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
};

export const newMedicine = async (req, res) => {
  const pharmacy = req.pharmacy;
  try {
    if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });
    pharmacy.medicines.push(req.body);
    await pharmacy.save();
    res.status(200).json({
      success: true,
      message: `Medicine added successfully to pharmacy`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server error " });
  }
};

export const updateMedicine = async (req, res) => {
  const pharmacy = req.pharmacy;
  if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });
  const medicine = pharmacy.medicines.id(req.params.medicineId);
  if (!medicine) return res.status(404).json({ error: "Medicine not found" });

  Object.assign(medicine, req.body);
  await pharmacy.save();

  res.status(200).json({ success: true, data: medicine });
};

export const deleteMedicine = async (req, res) => {
  try {
    const pharmacy = req.pharmacy;
    if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });

    const medicine = pharmacy.medicines.id(req.params.medicineId);
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    // pull() to remove subdocument from array
    pharmacy.medicines.pull(req.params.medicineId);
    await pharmacy.save();

    res.json({ success: true, message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMedicineDetails = async (req, res) => {
  const pharmacy = req.pharmacy;

  if (!pharmacy) return res.status(403).json({ error: "Pharmacy not found " });

  const medicine = pharmacy.medicines.id(req.params.medicineId);
  if (!medicine) return res.status(404).json({ error: "Medicine not found" });

  return res.status(200).json({ success: true, data: medicine });
};

export const getAllMedicine = async (req, res) => {
  const pharmacy = req.pharmacy;

  if (!pharmacy) return res.status(403).json({ error: "Pharmacy not found " });
  return res.status(200).json(pharmacy.medicines);
};

export const searchMedicine = async (req, res) => {
  //shows pharmacy names and the medicine details of that particular pharmacy
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Medicine name required" });
    // Find all pharmacies with at least one medicine matching the name
    const pharmacies = await Pharmacy.find({
      "medicines.name": { $regex: name, $options: "i" },
    }).select("name address medicines");
    res.status(200).json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const newPharmacy = async (req, res) => {
  //register new pharmacy
  try {
    const { email, licenseNumber, password, ...rest } = req.body;
    if (!email || !licenseNumber || !password) {
      return res
        .status(400)
        .json({ error: "Email, license number, and password required" });
    }
    // Check if pharmacy already exists
    const existing = await Pharmacy.findOne({
      $or: [{ email }, { licenseNumber }],
    });
    if (existing) {
      return res.status(409).json({
        error: "Pharmacy already registered with this email or license number",
      });
    }
    const pharmacy = new Pharmacy({ email, licenseNumber, password, ...rest });
    await pharmacy.save();
    res
      .status(201)
      .json({ success: true, message: "Pharmacy registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginPharmacy = async (req, res) => {
  // login pharmacy
  try {
    const { licenseNumber, password } = req.body;
    if (!licenseNumber || !password) {
      return res
        .status(400)
        .json({ error: "License number and password required" });
    }
    const pharmacy = await Pharmacy.findOne({ licenseNumber });
    if (!pharmacy || pharmacy.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(pharmacy._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res
      .status(200)
      .json({ success: true, message: "Login successful", token: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logoutPharmacy = async (req, res) => {
  // logout pharmacy
  try {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
