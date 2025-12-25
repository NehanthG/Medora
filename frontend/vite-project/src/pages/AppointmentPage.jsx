import { useParams } from "react-router-dom";
import VideoCall from "../components/VideoCall";

export default function AppointmentPage() {
  const { appointmentId } = useParams();

  // Decide role ONLY for WebRTC behavior
  const userId =
    window.location.pathname.startsWith("/doctor")
      ? "doctor"
      : "patient";

  return (
    <div>
      <h2>Video Call</h2>

      {/* BOTH doctor & patient MUST reach this */}
      <VideoCall
        roomId={appointmentId}
        userId={userId}
      />
    </div>
  );
}
