import Doctor from "../models/doctorSchema.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointmentSchema.js";

export const createAppointment = async (req, res) => {
  try {
    const {
      hospitalId,
      patientId,
      doctorId,
      appointmentTime,
      isEmergency,
      description,
    } = req.body;

    if (
      !hospitalId ||
      !doctorId ||
      !patientId ||
      !appointmentTime ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.isActive) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available",
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const newAppointment = new Appointment({
      hospitalId,
      doctorId,
      patientId,
      appointmentTime: new Date(appointmentTime),
      isEmergency: isEmergency || false,
      description,
    });

    await newAppointment.save();

    doctor.appointments.push(newAppointment._id);

    const appointmentDate = new Date(appointmentTime);
    const appointmentHour = appointmentDate.getHours(); //gives int value 9 ,10 etc

    const bookingSlot = doctor.bookings.find(
      (booking) => booking.time === appointmentHour
    );
    if (bookingSlot) {
      bookingSlot.isAvailable = false;
    }

    await doctor.save();

    patient.appointments.push(newAppointment._id);
    await patient.save();

    // ?? Populate the appointment with doctor and patient details
    const thisAppointment = await Appointment.findById(newAppointment._id)
      .populate("doctorId", "name email specialisation")
      .populate("patientId", "fullName email phoneNumber");

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: thisAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//every appointment that stored in db
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "name email specialisation")
      .populate("patientId", "fullName email phoneNumber")
      .sort({ appointmentTime: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//all appointments of a hospital
export const getHospitalAppointments = async (req, res) => {
  try {
    const hospitalId = req.hospital?.hospitalId || req.params.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
      });
    }

    const appointments = await Appointment.find({ hospitalId })
      .populate("doctorId", "name email specialisation")
      .populate("patientId", "fullName email phoneNumber")
      .sort({ appointmentTime: -1 });

    res.status(200).json({
      success: true,
      message: `Found ${appointments.length} appointments for hospital`,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//specific appointment details
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate("doctorId", "name email specialisation")
      .populate("patientId", "fullName email phoneNumber");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentTime, isEmergency, status, description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointmentTime !== undefined) {
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor) {
        const oldAppointmentDate = new Date(appointment.appointmentTime);
        const oldHour = oldAppointmentDate.getHours();
        const oldBookingSlot = doctor.bookings.find(
          (booking) => booking.time === oldHour
        );
        if (oldBookingSlot) {
          oldBookingSlot.isAvailable = true;
        }

        const newAppointmentDate = new Date(appointmentTime);
        const newHour = newAppointmentDate.getHours();
        const newBookingSlot = doctor.bookings.find(
          (booking) => booking.time === newHour
        );
        if (newBookingSlot) {
          newBookingSlot.isAvailable = false;
        }
        await doctor.save();
      }

      appointment.appointmentTime = new Date(appointmentTime);
    }

    if (isEmergency !== undefined) appointment.isEmergency = isEmergency;
    if (status !== undefined) appointment.status = status;
    if (description !== undefined) appointment.description = description;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate("doctorId", "name email specialisation")
      .populate("patientId", "fullName email phoneNumber");

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
      doctor.appointments.pull(id);
      const appointmentDate = new Date(appointment.appointmentTime);
      const appointmentHour = appointmentDate.getHours();

      const bookingSlot = doctor.bookings.find(
        (booking) => booking.time === appointmentHour
      );
      if (bookingSlot) {
        bookingSlot.isAvailable = true;
      }

      await doctor.save();
    }

    await User.findByIdAndUpdate(appointment.patientId, {
      $pull: { appointments: id },
    });

    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// appointments of patient
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name email specialisation")
      .sort({ appointmentTime: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//appointments of doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "fullName email phoneNumber")
      .sort({ appointmentTime: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
