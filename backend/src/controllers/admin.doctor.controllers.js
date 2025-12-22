import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import Hospital from "../models/hospitalSchema.js";
import Appointment from "../models/appointmentSchema.js";
import Doctor from "../models/doctorSchema.js";

export const getAllDoctors = async (req, res) => {
  // Get hospitalId from authenticated token
  const hospitalId = req.hospital.hospitalId; // Using the ObjectId from token
  try {
    const doctors = await Doctor.find({ hospitalId: hospitalId });
    if (doctors.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No doctors found for this hospital",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong fetching doctors",
    });
  }
};

// Get doctors by hospital ID (for public use without authentication)
export const getDoctorsByHospital = async (req, res) => {
  const { hospitalId } = req.params;
  //mongoose id

  const hospital = await Hospital.findById(hospitalId);

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: "Hospital not found",
    });
  }

  const hospitalUniqueId= hospital.hospitalId;
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID format",
      });
    }

    const doctors = await Doctor.find({ hospitalId: hospitalUniqueId });
    console.log(doctors);
    
    if (doctors.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No doctors found for this hospital",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong fetching doctors",
    });
  }
};

export const newDoctor = async (req, res) => {
  const { name, email, specialisation, start, end, isActive } = req.body;

  // Get hospitalId from authenticated token
  const hospitalId = req.hospital.hospitalId;
  console.log("HospitalID:", hospitalId);
  console.log("Request body:", req.body);

  let bookings = [];

  for (let hour = start; hour < end; hour++) {
    bookings.push({
      time: hour,
      isAvailable: true,
    });
  }

  try {
    const newDoctor = new Doctor({
      hospitalId: hospitalId,
      name: name,
      email: email,
      specialisation: specialisation,
      shift: {
        start: start,
        end: end,
      },
      isActive: isActive !== undefined ? isActive : true,
      appointments: [],
      bookings: bookings,
    });

    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: `Created new doctor successfully in hospital ${req.hospital.hospitalId}`,
      data: newDoctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create new Doctor ",
    });
  }
};

export const getDoctorDetails = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Not valid ID",
    });
  }

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor with that ID does not exist",
      });
    }
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong fetching doctor",
    });
  }
};

export const updateDoctor = async (req, res) => {
  const { name, email, specialisation, start, end, isActive } = req.body;
  const { id } = req.params; //id of doctor u want to update

  console.log("Updating doctor with ID:", id);
  console.log("Update data:", req.body);

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor with that ID does not exist",
      });
    }

    // Update doctor fields
    if (name !== undefined) doctor.name = name;
    if (email !== undefined) doctor.email = email;
    if (specialisation !== undefined) doctor.specialisation = specialisation;
    if (isActive !== undefined) doctor.isActive = isActive;

    // Update shift times if provided
    if (start !== undefined || end !== undefined) {
      if (!doctor.shift) doctor.shift = {};
      if (start !== undefined) doctor.shift.start = start;
      if (end !== undefined) doctor.shift.end = end;

      // Regenerate bookings only if both start and end are provided
      if (start !== undefined && end !== undefined) {
        doctor.bookings = []; // Clear existing bookings
        for (let hour = start; hour < end; hour++) {
          doctor.bookings.push({
            time: hour,
            isAvailable: true,
          });
        }
      }
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong updating doctor",
    });
  }
};

export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Not valid ID",
    });
    return;
  }

  try {
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor with that ID does not exist",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      data: doctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong deleting doctor",
    });
  }
};
