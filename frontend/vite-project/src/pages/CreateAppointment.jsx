import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Toast,
  ToastContainer,
  Button,
  Form,
  Card,
  Row,
  Col,
  Container,
} from "react-bootstrap";

export default function CreateAppointment() {
  const { authUser, createAppointment, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    hospitalId,
    hospitalName,
    hospitalAddress,
    doctorId,
    doctorName,
    doctorSpecialisation,
    doctorEmail,
  } = location.state || {};

  const [showToast, setShowToast] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [formData, setFormData] = useState({
    hospitalId: "",
    patientId: authUser?._id || "",
    doctorId: "",
    appointmentTime: "",
    isEmergency: false,
    description: "",
  });
  const [error, setError] = useState("");

  // Generate available dates (next 7 days)
  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label:
          i === 0
            ? "Today"
            : i === 1
            ? "Tomorrow"
            : date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
      });
    }
    return dates;
  };

  // Generate time slots (9 AM to 6 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time12 =
        hour > 12
          ? `${hour - 12}:00 PM`
          : hour === 12
          ? `${hour}:00 PM`
          : `${hour}:00 AM`;
      const time24 = `${hour.toString().padStart(2, "0")}:00`;
      slots.push({
        value: time24,
        label: time12,
      });
    }
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  // Set form data on mount
  useEffect(() => {
    if (hospitalId && doctorId && authUser) {
      setFormData((prev) => ({
        ...prev,
        hospitalId,
        doctorId,
        patientId: authUser._id,
      }));
    }
  }, [hospitalId, doctorId, authUser]);

  // Redirect if doctor/hospital not selected
  useEffect(() => {
    if (!hospitalId || !doctorId) {
      alert("Please select a hospital and doctor first");
      navigate("/hospitals");
    }
  }, [hospitalId, doctorId, navigate]);

  // Update appointment time when date and time slot are selected
  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      const appointmentDateTime = `${selectedDate}T${selectedTimeSlot}:00`;
      setFormData((prev) => ({
        ...prev,
        appointmentTime: appointmentDateTime,
      }));
    }
  }, [selectedDate, selectedTimeSlot]);

  const validateForm = () => {
    const { hospitalId, patientId, doctorId, description } = formData;
    if (
      !hospitalId ||
      !patientId ||
      !doctorId ||
      !selectedDate ||
      !selectedTimeSlot ||
      !description
    ) {
      setError(
        "Please fill in all required fields and select a date and time slot"
      );
      return false;
    }
    return true;
  };

  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(""); // Reset time slot when date changes
    if (error) setError("");
  };

  const handleTimeSlotSelection = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!validateForm()) return;

  try {
    const appointmentData = {
      ...formData,
      doctorName: doctorName,
    };

    const result = await createAppointment(appointmentData);

    if (result?.success) {
      setShowToast(true);

  // ⏳ Give user feedback, then redirect to appointments list
  setTimeout(() => {
    navigate("/appointments"); // 👈 patient's appointment list
  }, 1500);
    } else {
      setError("Failed to create appointment. Please try again.");
    }
  } catch (err) {
    console.error("Appointment creation error:", err);
    setError("An unexpected error occurred. Please try again.");
  }
};


  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleBackToDoctors = () => {
    navigate("/doctors", {
      state: { hospitalId, hospitalName, hospitalAddress },
    });
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Container className="py-4">
        <Button
          variant="link"
          className="mb-3 fw-semibold text-decoration-none"
          onClick={handleBackToDoctors}
          style={{
            color: "#4f46e5",
            fontSize: "0.9rem",
          }}
        >
          ← Back to Doctors
        </Button>

        <Card
          className="border-0 shadow-sm"
          style={{
            borderRadius: "12px",
            background: "white",
          }}
        >
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                📅 Book Your Appointment
              </h2>
              <p className="text-secondary mb-0" style={{ fontSize: "1rem" }}>
                Select your preferred date and time slot for the consultation
              </p>
            </div>

            {/* Selected Hospital & Doctor Info */}
            <Row className="mb-4">
              <Col md={6}>
                <Card
                  className="border-0 shadow-sm mb-3"
                  style={{
                    background: "#4f46e5",
                    borderRadius: "12px",
                    color: "white",
                  }}
                >
                  <Card.Body className="p-3">
                    <h6 className="fw-bold mb-2">🏥 Selected Hospital</h6>
                    <p className="mb-1 fw-semibold">{hospitalName}</p>
                    <small className="opacity-75">{hospitalAddress}</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card
                  className="border-0 shadow-sm mb-3"
                  style={{
                    background: "#059669",
                    borderRadius: "12px",
                    color: "white",
                  }}
                >
                  <Card.Body className="p-3">
                    <h6 className="fw-bold mb-2">👨‍⚕️ Selected Doctor</h6>
                    <p className="mb-1 fw-semibold">{doctorName}</p>
                    <small className="opacity-75 d-block">
                      {doctorSpecialisation}
                    </small>
                    <small className="opacity-75">{doctorEmail}</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Appointment Form */}
            <Form onSubmit={handleSubmit}>
              {/* Date Selection */}
              <div className="mb-4">
                <h5 className="mb-3 fw-bold" style={{ color: "#2d3748" }}>
                  📅 Select Date
                </h5>
                <Row className="g-2">
                  {availableDates.map((date) => (
                    <Col key={date.value} xs={6} md={3} lg={2}>
                      <Button
                        variant="outline-secondary"
                        className="w-100 py-3 fw-semibold"
                        style={{
                          borderRadius: "10px",
                          fontSize: "0.85rem",
                          background:
                            selectedDate === date.value ? "#4f46e5" : "white",
                          borderColor:
                            selectedDate === date.value ? "#4f46e5" : "#e2e8f0",
                          color:
                            selectedDate === date.value ? "white" : "#2d3748",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => handleDateSelection(date.value)}
                        onMouseEnter={(e) => {
                          if (selectedDate !== date.value) {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0,0,0,0.15)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedDate !== date.value) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "";
                          }
                        }}
                      >
                        <div>{date.label}</div>
                        <small
                          className="d-block opacity-75"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {new Date(date.value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </small>
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div className="mb-4">
                  <h5 className="mb-3 fw-bold" style={{ color: "#2d3748" }}>
                    🕐 Select Time Slot
                  </h5>
                  <Row className="g-2">
                    {timeSlots.map((slot) => (
                      <Col key={slot.value} xs={6} md={4} lg={3}>
                        <Button
                          variant="outline-secondary"
                          className="w-100 py-2 fw-semibold"
                          style={{
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            background:
                              selectedTimeSlot === slot.value
                                ? "#059669"
                                : "white",
                            borderColor:
                              selectedTimeSlot === slot.value
                                ? "#059669"
                                : "#e2e8f0",
                            color:
                              selectedTimeSlot === slot.value
                                ? "white"
                                : "#2d3748",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => handleTimeSlotSelection(slot.value)}
                          onMouseEnter={(e) => {
                            if (selectedTimeSlot !== slot.value) {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(0,0,0,0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedTimeSlot !== slot.value) {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "";
                            }
                          }}
                        >
                          {slot.label}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Selected Date and Time Display */}
              {selectedDate && selectedTimeSlot && (
                <div className="mb-4">
                  <Card
                    className="border-0 shadow-sm"
                    style={{
                      background: "#f6f8fb",
                      borderRadius: "10px",
                    }}
                  >
                    <Card.Body className="p-3">
                      <h6 className="mb-2 fw-bold" style={{ color: "#2d3748" }}>
                        📋 Appointment Summary
                      </h6>
                      <p className="mb-1" style={{ color: "#4a5568" }}>
                        <strong>Date:</strong>{" "}
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="mb-0" style={{ color: "#4a5568" }}>
                        <strong>Time:</strong>{" "}
                        {
                          timeSlots.find(
                            (slot) => slot.value === selectedTimeSlot
                          )?.label
                        }
                      </p>
                    </Card.Body>
                  </Card>
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label
                  className="fw-semibold"
                  style={{ color: "#2d3748" }}
                >
                  📝 Appointment Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  placeholder="Please describe your symptoms or reason for visit..."
                  required
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.9rem",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  label="🚨 This is an emergency appointment"
                  checked={formData.isEmergency}
                  onChange={(e) =>
                    setFormData({ ...formData, isEmergency: e.target.checked })
                  }
                  style={{ color: "#2d3748" }}
                />
              </Form.Group>

              <div className="d-flex gap-3">
                <Button
                  variant="outline-secondary"
                  className="flex-grow-1 fw-semibold"
                  onClick={handleBackToDoctors}
                  style={{
                    borderRadius: "10px",
                    padding: "12px",
                    borderColor: "#e2e8f0",
                    color: "#6b7280",
                  }}
                >
                  ← Back to Doctors
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="flex-grow-1 fw-semibold"
                  disabled={isLoading || !selectedDate || !selectedTimeSlot}
                  style={{
                    borderRadius: "10px",
                    padding: "12px",
                    background: "#4f46e5",
                    borderColor: "#4f46e5",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Booking...
                    </>
                  ) : (
                    "📅 Book Appointment"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Success Toast */}
        <ToastContainer position="top-end" className="p-3">
          <Toast
            show={showToast}
            onClose={() => {
              setShowToast(false);
              navigate("/");
            }}
            bg="success"
          >
            <Toast.Header closeButton={true}>
              <strong className="me-auto">✅ Appointment Confirmed!</strong>
              <small>Just now</small>
            </Toast.Header>
            <Toast.Body className="text-white">
              Your appointment with {doctorName} on{" "}
              {selectedDate &&
                selectedTimeSlot &&
                new Date(
                  `${selectedDate}T${selectedTimeSlot}`
                ).toLocaleString()}{" "}
              has been successfully booked!
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  );
}
