import { useEffect, useRef, useState } from "react";
import { socket } from "../services/webrtc";

export default function VideoCall({ roomId, userId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);
  const polite = useRef(userId === "doctor");
  const pendingCandidates = useRef([]);

  const [status, setStatus] = useState("Connecting...");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    if (!roomId || !userId) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pcRef.current = pc;

    /* ---------------- JOIN ROOM ---------------- */
    socket.emit("join-room", { roomId, userId });

    /* ---------------- LOCAL MEDIA ---------------- */
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setStatus("Waiting for other user...");
      })
      .catch(() => setStatus("Camera / Mic blocked"));

    /* ---------------- REMOTE MEDIA ---------------- */
    pc.ontrack = (e) => {
      if (!remoteVideoRef.current) return;

      remoteVideoRef.current.srcObject = e.streams[0];
      remoteVideoRef.current.onloadedmetadata = () => {
        remoteVideoRef.current.play().catch(() => {});
      };

      setStatus("Connected"); // 🔥 FIX
    };

    /* ---------------- ICE ---------------- */
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("ice-candidate", { roomId, candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected") {
        setStatus("Connected");
      }
      if (pc.iceConnectionState === "failed") {
        pc.restartIce();
      }
    };

    /* ---------------- NEGOTIATION ---------------- */
    pc.onnegotiationneeded = async () => {
      try {
        makingOffer.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      } catch (err) {
        console.error(err);
      } finally {
        makingOffer.current = false;
      }
    };

    /* ---------------- SOCKET EVENTS ---------------- */

    socket.on("user-joined", async () => {
      if (polite.current) return;

      try {
        makingOffer.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      } catch (err) {
        console.error(err);
      } finally {
        makingOffer.current = false;
      }
    });

    socket.on("offer", async ({ offer }) => {
      const offerCollision =
        makingOffer.current || pc.signalingState !== "stable";

      ignoreOffer.current = !polite.current && offerCollision;
      if (ignoreOffer.current) return;

      await pc.setRemoteDescription(offer);

      for (const c of pendingCandidates.current) {
        await pc.addIceCandidate(c);
      }
      pendingCandidates.current = [];

      if (offer.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      }
    });

    socket.on("answer", async ({ answer }) => {
      if (pc.signalingState !== "stable") {
        await pc.setRemoteDescription(answer);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!candidate) return;

      if (pc.remoteDescription) {
        await pc.addIceCandidate(candidate);
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      pc.close();
    };
  }, [roomId, userId]);

  /* ---------------- CONTROLS ---------------- */

  const toggleMic = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn(!camOn);
  };

  const endCall = () => {
    window.history.back();
  };

  return (
    <div className="vc-root">
      <video ref={remoteVideoRef} autoPlay playsInline className="vc-remote" />

      {status !== "Connected" && (
        <div className="vc-status">{status}</div>
      )}

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="vc-local"
      />

      <div className="vc-controls">
        <button onClick={toggleMic} className={!micOn ? "off" : ""}>
          {micOn ? "🎤" : "🔇"}
        </button>
        <button onClick={toggleCamera} className={!camOn ? "off" : ""}>
          {camOn ? "📷" : "🚫"}
        </button>
        <button onClick={endCall} className="end">
          ❌
        </button>
      </div>

      <style>{`
        .vc-root {
          position: relative;
          width: 100%;
          height: 100vh;
          background: black;
        }

        .vc-remote {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vc-local {
          position: absolute;
          bottom: 90px;
          right: 20px;
          width: 220px;
          height: 140px;
          border-radius: 12px;
          border: 2px solid white;
          object-fit: cover;
          background: black;
        }

        .vc-controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
        }

        .vc-controls button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          font-size: 22px;
          background: #1f2937;
          color: white;
          cursor: pointer;
        }

        .vc-controls button.off {
          background: #b91c1c;
        }

        .vc-controls button.end {
          background: #dc2626;
        }

        .vc-status {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
