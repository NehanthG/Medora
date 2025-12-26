🩺 Medora — Developer Guide

Welcome to Medora, a full-stack telemedicine and healthcare platform built to support remote consultations, patient vitals tracking, appointment scheduling, and clinic–pharmacy coordination.

This guide is intended for developers who want to run, understand, and extend the Medora codebase.

📁 Project Layout (At a Glance)
Path	Description
backend/	Node.js + Express APIs, controllers, middleware, and database models
backend/src/chatbot/	Small Python (FastAPI) microservice for optional AI assistance
frontend/vite-project/	React + Vite frontend (dev server usually on http://localhost:5173)
🧰 What You Need Before We Start

Make sure the following are installed:

Node.js v18 or later and npm

Python 3.10+ and pip

MongoDB Atlas (or a local MongoDB instance) and a connection URI

Git

A code editor (VS Code recommended)

A modern browser (Chrome / Edge recommended for WebRTC)

🔐 Keep Secrets Out of Source Control

Create backend/.env locally (do not commit this file).
Replace placeholders with your actual values:

MONGODB_URI=YOUR_MONGODB_URI
PORT=5002
JWT_SECRET=YOUR_JWT_SECRET

# Cloudinary (media & documents)
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME

# Twilio (optional – SMS notifications)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE=+1234567890

# AI provider keys (optional)
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
GROQ_API_KEY=YOUR_GROQ_API_KEY
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

🚀 Two Friendly Ways to Run Medora
Option A — Start Each Piece Manually

(Best for development and debugging)

1️⃣ Run the Python Service (Optional AI)
cd C:\path\to\Medora\backend\src\chatbot
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install fastapi uvicorn python-dotenv pymongo pydantic
python -m uvicorn api:app --reload --port 5002


✅ Look for:

No fatal exceptions

Successful MongoDB connection in logs

2️⃣ Run the Node.js Backend (New Terminal)
cd C:\path\to\Medora\backend
npm install
npm run start

3️⃣ Run the Frontend (Another Terminal)
cd C:\path\to\Medora\frontend\vite-project
npm install
npm run dev


Open the Vite dev server (commonly):

http://localhost:5173

Option B — Quick Start (Recommended)
cd C:\path\to\Medora\backend
npm install
npm run dev


This uses concurrently to start:

The Node.js backend

The optional FastAPI service

🧪 Quick Checks (Smoke Tests)
Test the Optional AI Endpoint
$body = @{ query = 'hello' } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -ContentType 'application/json' `
  -Body $body `
  -Uri http://127.0.0.1:5002/api/chat


You should receive JSON containing response, session_id, and context.

If you receive a 503, the service may still be initializing — wait briefly and retry.

🛠 Common Problems & Quick Fixes
Issue	Resolution
MongoDB connection error	Verify MONGODB_URI and Atlas IP whitelist
uvicorn not found	Activate venv and pip install uvicorn
Browser CORS error	Ensure http://localhost:5173 is allowed
Port conflict	Change the port in .env or stop conflicting process
Video call issues	Use Chrome/Edge and allow camera/mic permissions
✅ Quick Pre-Run Checklist

backend/.env exists and contains MONGODB_URI and JWT_SECRET

Node backend logs show Express running

MongoDB connection successful

Frontend opens in the browser

Camera & microphone permissions allowed

🧭 System Architecture & Flow

Medora follows a modular, service-oriented architecture designed for real-world telemedicine workflows.

🔄 High-Level Flow (Human-Friendly)

A user opens the React frontend

The frontend calls Express backend APIs

The backend routes requests to controllers which may:

Read/write data in MongoDB (users, appointments, vitals)

Upload or fetch documents from Cloudinary

Send notifications via Twilio

Prepare signaling data for video calls

WebRTC establishes peer-to-peer audio/video between users

Responses are returned to the frontend and the UI updates

🎥 Real-Time Video Consultation Flow (WebRTC)

Backend handles signaling (offers, answers, ICE candidates)

Media flows directly between browsers

Backend is not in the media path (low latency)

Enables secure doctor–patient consultations

🩺 Health Vitals Flow

Patients submit vitals through the UI

Backend validates and stores data in MongoDB

Doctors retrieve vitals during consultations

Enables informed clinical decisions

🤖 Optional AI Assistance (Secondary)

Certain informational queries may be forwarded to the Python service

Used for contextual help only

Does not block or control core workflows

📊 Architecture Flow Diagram (Mermaid)
graph TD
    U[User]
    FE[Frontend<br/>React + Vite]
    BE[Backend API<br/>Node.js + Express]
    DB[(MongoDB)]
    RTC[WebRTC<br/>Peer-to-Peer]
    CLD[Cloudinary]
    SMS[Twilio]
    AI[Optional AI Service]

    U --> FE
    FE -->|HTTP + JWT| BE
    BE --> DB
    BE --> CLD
    BE --> SMS
    FE <-->|Signaling| BE
    FE <-->|Audio / Video| RTC
    BE -->|Optional| AI

ASCII Fallback
User -> Frontend -> Backend -> Controllers
                     |-> MongoDB
                     |-> Cloudinary
                     |-> Twilio
                     |-> WebRTC Signaling
                          ↕
                    Peer-to-Peer Media

📂 Where to Look in the Repository
Area	Path
Frontend UI	frontend/vite-project/src/
Backend APIs	backend/src/
Controllers	backend/src/controllers/
Routes	backend/src/routes/
Models	backend/src/models/
Optional AI	backend/src/chatbot/
🔌 API Examples (curl)
Signup
curl -X POST http://localhost:5002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

Login
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

Book Appointment (Authenticated)
curl -X POST http://localhost:5002/api/appointments/book \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"doctorId":"<doctorId>","date":"2025-12-30T10:00:00Z","reason":"Consultation"}'

🗺 Route → Controller Summary
Route File	Controller	Purpose	Auth
auth.routes.js	auth.controllers.js	Signup / login	Partial
appointment.routes.js	appointment.controllers.js	Appointments	Yes
userVitals.js	user.vitals.controller.js	Vitals	Yes
pharmacy.routes.js	pharmacy.controllers.js	Pharmacy	Partial
pdf.routes.js	pdf.controller.js	Reports	Yes
chatbot.routes.js	chatbot service	Optional AI	No
📘 About This Project

Medora is built to be a practical, developer-friendly telemedicine platform, not just a demo.
It emphasizes real workflows: scheduling, vitals, consultations, records, and coordination.

🔐 Security & Privacy Notes

For real deployments:

Use HTTPS/TLS everywhere

Restrict database permissions

Never commit secrets

Follow healthcare data regulations (HIPAA, GDPR)

✅ Final Note

Medora demonstrates how modern web technologies can be combined to build a realistic healthcare system that is modular, extensible, and ready for real-world use.
