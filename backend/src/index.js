import express from "express"
import cors from "cors"
const app = express();
const PORT =5002;
import authRoutes from "./routes/auth.routes.js"
import uploadRoutes from "./routes/pdf.routes.js"
// import appointmentRoutes from "./routes/appointment.routes.js"
import {connectDB} from "./lib/db.js"
import dotenv from "dotenv" 
import cookieParser from "cookie-parser"
import twilio from "twilio";
import axios from "axios";
import loginRoutes from "./routes/login.router.js";
import appointmentRouter from "./routes/appointment.router.js";
import doctorRouter from "./routes/doctor.router.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";

import userPharmacyRoutes from "./routes/userPharamcy.routes.js";

// Load environment variables first
dotenv.config();

// Now access environment variables and trim any whitespace
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const twilioPhone = process.env.TWILIO_PHONE?.trim();

console.log("Twilio Config Check:", {
  accountSid: accountSid ? `${accountSid.substring(0, 10)}...` : "MISSING",
  authToken: authToken ? "EXISTS" : "MISSING",
  twilioPhone: twilioPhone || "MISSING",
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both frontend ports
    credentials: true,
  })
);
app.use("/api/user", authRoutes);
app.use("/api/user", uploadRoutes);
app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;
    const response = await axios.post("http://localhost:8000/api/query", {
      query,
    });
    return res.json(response.data);
  } catch (err) {
    console.error("RAG API Error:", err.message);
    return { error: "Failed to get response from RAG API" };
  }
});

app.use("/api/admin", loginRoutes);

app.use("/api/auth", loginRoutes);

app.use("/api/appointments", appointmentRouter); //CRUD of Appointments and state update
app.use("/api/admin/doctors", doctorRouter);
app.use("/api/chatbot", chatbotRoutes); // Add chatbot routes
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/user/pharmacy", userPharmacyRoutes);

app.get("/", (req, res) => {
  res.send("Hellow World");
});

app.post("/api/send-sms", async (req, res) => {
  const { phone, message } = req.body;

  console.log("SMS Request:", { phone, message }); // Debug log

  // Validate input
  if (!phone || !message) {
    return res
      .status(400)
      .json({ error: "Phone number and message are required." });
  }

  // Debug: Log environment variables (without exposing sensitive data)
  console.log("Environment check:", {
    accountSid: accountSid ? `${accountSid.substring(0, 10)}...` : "MISSING",
    authToken: authToken ? "EXISTS" : "MISSING",
    twilioPhone: twilioPhone ? twilioPhone : "MISSING",
    nodeEnv: process.env.NODE_ENV,
  });

  // Check if Twilio credentials are available
  if (!accountSid || !authToken || !twilioPhone) {
    console.error("Missing Twilio credentials:", {
      accountSid: !!accountSid,
      authToken: !!authToken,
      twilioPhone: !!twilioPhone,
    });
    return res
      .status(500)
      .json({ error: "SMS service not configured properly" });
  }

  try {
    console.log("Creating Twilio client...");
    const client = twilio(accountSid, authToken);

    console.log("Sending SMS from", twilioPhone, "to", phone);
    const twilioRes = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });

    console.log("SMS sent successfully:", twilioRes.sid);
    res.json({ success: true, sid: twilioRes.sid, status: twilioRes.status });
  } catch (err) {
    console.error("Error sending SMS:", err);
    console.error("Full error details:", {
      message: err.message,
      code: err.code,
      status: err.status,
      moreInfo: err.moreInfo,
    });
    res.status(500).json({
      error: err.message,
      code: err.code,
      details: err.moreInfo,
    });
  }
});

app.listen(PORT, () =>{ console.log(`Server running on port ${PORT}`)

connectDB();
});