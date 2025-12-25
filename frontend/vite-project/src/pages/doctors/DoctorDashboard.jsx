import { useState } from "react";
import { useDoctorAuthStore } from "../../stores/doctorAuthStore";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const { doctor, logout } = useDoctorAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);

  // 🔑 FIX: handle doctor object shape correctly
  const doctorData = doctor?.doctor || doctor;
  const doctorId = doctorData?._id;

  const handleLogout = () => {
    logout();
    window.location.href = "/doctor/login";
  };

  const fetchAppointments = async () => {
    if (!doctorId) return;

    setLoadingAppointments(true);
    try {
      const res = await axios.get(
        `http://localhost:5002/api/appointments/doctor/${doctorId}`,
        { withCredentials: true }
      );

      setAppointments(res.data.data);
      setShowAppointments(true);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="h4 mb-0">
                {t("doctor.dashboard.title", "Doctor Dashboard")}
              </h2>
            </div>

            <div className="card-body">
              {/* Doctor Info */}
              <div className="mb-4">
                <h3 className="h5">
                  {t("doctor.dashboard.welcome", "Welcome, Dr.")}{" "}
                  {doctorData?.name || "Doctor"}
                </h3>
                <p className="text-muted">{doctorData?.email}</p>
              </div>

              {/* Action Cards */}
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">
                        {t("doctor.dashboard.appointments", "Appointments")}
                      </h5>
                      <p className="card-text">
                        {t(
                          "doctor.dashboard.viewUpcoming",
                          "View and manage your upcoming appointments."
                        )}
                      </p>
                      <button
                        className="btn btn-outline-primary"
                        onClick={fetchAppointments}
                      >
                        {t(
                          "doctor.dashboard.viewAppointments",
                          "View Appointments"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">
                        {t("doctor.dashboard.patients", "Patients")}
                      </h5>
                      <p className="card-text">
                        {t(
                          "doctor.dashboard.managePatients",
                          "Access and manage your patients' records."
                        )}
                      </p>
                      <button className="btn btn-outline-primary">
                        {t(
                          "doctor.dashboard.viewPatients",
                          "View Patients"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment List */}
              {showAppointments && (
                <div className="mt-4">
                  <h4 className="mb-3">My Appointments</h4>

                  {loadingAppointments && (
                    <p>Loading appointments...</p>
                  )}

                  {!loadingAppointments && appointments.length === 0 && (
                    <p>No appointments found.</p>
                  )}

                  {!loadingAppointments &&
                    appointments.map((appt) => (
                      <div
                        key={appt._id}
                        className="border rounded p-3 mb-3"
                      >
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(
                            appt.appointmentTime
                          ).toLocaleString()}
                        </p>
                        <p>
                          <strong>Patient:</strong>{" "}
                          {appt.patientId?.fullName}
                        </p>
                        <p>
                          <strong>Status:</strong> {appt.status}
                        </p>
                        <p>
                          <strong>Description:</strong>{" "}
                          {appt.description}
                        </p>

                        <button
                          className="btn btn-success"
                          onClick={() =>
                            navigate(`/appointments/${appt._id}`)
                          }
                        >
                          Join Video Call
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Logout */}
              <div className="mt-4">
                <button
                  onClick={handleLogout}
                  className="btn btn-danger"
                >
                  {t("doctor.dashboard.logout", "Logout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
