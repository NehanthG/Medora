import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import twilio from "twilio";
import axios from "axios";

// Routes
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/pdf.routes.js";
import loginRoutes from "./routes/login.router.js";
import appointmentRouter from "./routes/appointment.router.js";
import doctorRouter from "./routes/doctor.router.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import userPharmacyRoutes from "./routes/userPharamcy.routes.js";
import doctorAuthRoutes from "./routes/doctor.auth.routes.js";
import userVitalsRoutes from "./routes/userVitals.js";

// DB
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = 5002;

/* -------------------- Twilio Config -------------------- */
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const twilioPhone = process.env.TWILIO_PHONE?.trim();

/* -------------------- Middleware -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

/* -------------------- Routes -------------------- */
app.use("/api/user", authRoutes);
app.use("/api/user", uploadRoutes);
app.use("/api/admin", loginRoutes);
app.use("/api/auth", loginRoutes);

app.use("/api/appointments", appointmentRouter);
app.use("/api/admin/doctors", doctorRouter);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/user/pharmacy", userPharmacyRoutes);
app.use("/api/doctor", doctorAuthRoutes);
app.use("/api/vitals", userVitalsRoutes);

/* -------------------- Chat (RAG API) -------------------- */
app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;
    const response = await axios.post("http://localhost:8000/api/query", {
      query,
    });
    res.json(response.data);
  } catch (err) {
    console.error("RAG API Error:", err.message);
    res.status(500).json({ error: "Failed to get response from RAG API" });
  }
});

/* -------------------- SMS (Twilio) -------------------- */
app.post("/api/send-sms", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res
      .status(400)
      .json({ error: "Phone number and message are required." });
  }

  if (!accountSid || !authToken || !twilioPhone) {
    return res
      .status(500)
      .json({ error: "SMS service not configured properly" });
  }

  try {
    const client = twilio(accountSid, authToken);
    const twilioRes = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });

    res.json({
      success: true,
      sid: twilioRes.sid,
      status: twilioRes.status,
    });
  } catch (err) {
    console.error("SMS Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- Root -------------------- */
app.get("/", (req, res) => {
  res.send("Hello World");
});

/* ======================================================
   WebRTC SIGNALING (Socket.IO)
   ====================================================== */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined");
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", { candidate });
  });
});


/* -------------------- Start Server -------------------- */
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
