import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import axios from "axios";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const { authUser } = useAuthStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAppointments() {
      try {
        if (!authUser?._id) return;

        const res = await axios.get(
          `http://localhost:5002/api/appointments/patient/${authUser._id}`,
          { withCredentials: true }
        );

        setAppointments(res.data.data);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchAppointments();
  }, [authUser]);

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">
        {t("appointments.title")}
      </h2>

      {appointments.length === 0 && (
        <p className="text-center text-secondary mb-0">
          {t("appointments.empty", {
            defaultValue: "No appointments found.",
          })}
        </p>
      )}

      <Row>
        {appointments.map((appointment) => (
          <Col md={6} lg={4} key={appointment._id} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="text-primary">
                  {(() => {
                    const lang = (i18n.language || "").split("-")[0];
                    const localizedKey = `name_${lang}`;
                    const doc = appointment.doctorId || {};
                    return doc[localizedKey] || doc.name || "";
                  })()}
                </Card.Title>

                <Card.Subtitle className="mb-2 text-muted">
                  {t(
                    `specialisations.${appointment.doctorId.specialisation}`,
                    {
                      defaultValue:
                        appointment.doctorId.specialisation,
                    }
                  )}
                </Card.Subtitle>

                <Card.Text>
                  <strong>{t("appointments.timeLabel")}</strong>{" "}
                  {new Date(
                    appointment.appointmentTime
                  ).toLocaleString(i18n.language)}
                </Card.Text>

                <Card.Text>
                  <strong>{t("appointments.statusLabel")}</strong>{" "}
                  <span
                    className={
                      appointment.status === "appointed"
                        ? "text-success"
                        : appointment.status === "pending"
                        ? "text-warning"
                        : "text-danger"
                    }
                  >
                    {appointment.status}
                  </span>
                </Card.Text>

                <Card.Text>
                  <strong>
                    {t("appointments.description", "Description")}:
                  </strong>{" "}
                  {appointment.description ||
                    t("appointments.noDescription", "No description provided")}
                </Card.Text>

                {/* 🔥 JOIN VIDEO CALL */}
                <Button
                  variant="success"
                  className="mt-2"
                  onClick={() =>
                    navigate(`/appointments/${appointment._id}`)
                  }
                >
                  {t(
                    "appointments.joinCall",
                    "Join Video Call"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
