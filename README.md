# Welcome to Medora — a friendly developer guide

Project layout at a glance

- `backend/` — Node.js + Express APIs, controllers, and database models
- `backend/src/chatbot/` — small Python (FastAPI) microservice that powers the RAG chatbot
- `frontend/vite-project/` — React + Vite frontend (development server usually on http://localhost:5173)

What you need before we start

- Node.js (v18 or later) and npm
- Python 3.10+ and pip
- MongoDB Atlas (or a local MongoDB instance) and a connection URI
- Git and a code editor (VS Code recommended)

Keep secrets out of source control

Create `backend/.env` locally (do not commit). Replace placeholders with your actual values:

```env
MONGODB_URI=YOUR_MONGODB_URI
PORT=5002
JWT_SECRET=YOUR_JWT_SECRET

# Cloudinary
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME

# Twilio (optional)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE=+1234567890

# AI provider keys (optional)
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
GROQ_API_KEY=YOUR_GROQ_API_KEY
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Two friendly ways to run Medora

Option A — Start each piece yourself (best for development and debugging)

1) Run the Python chatbot

```powershell
cd C:\path\to\Medora\backend\src\chatbot
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install fastapi uvicorn python-dotenv pymongo pydantic
python -m uvicorn api:app --reload --port 5002
```

Look for a MongoDB ping and no fatal exceptions in the Python logs.

2) Run the Node backend (new terminal)

```powershell
cd C:\path\to\Medora\backend
npm install
npm run start
```

3) Run the frontend (another terminal)

```powershell
cd C:\path\to\Medora\frontend\vite-project
npm install
npm run dev
```

Then open the Vite URL (commonly http://localhost:5173).

Option B — Quick start (one command for Node + chatbot)

```powershell
cd C:\path\to\Medora\backend
npm install
npm run dev
```

This uses `concurrently` to start the Node server and run uvicorn for the chatbot.

Quick checks (smoke tests)

Test the chatbot endpoint:

```powershell
$body = @{ query = 'hello' } | ConvertTo-Json
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body $body -Uri http://127.0.0.1:5002/api/chat
```

You should receive JSON with `response`, `session_id`, and `context`. If the RAG system is still initializing you may get a 503 — wait briefly and retry.

Common problems and quick fixes

- MongoDB connection errors: check `MONGODB_URI` and Atlas IP whitelist or cluster permissions.
- `uvicorn` not found: activate the venv and `pip install uvicorn` in the chatbot folder.
- Chatbot returns 503: look at the Python console — RAG initialization may be in progress or failed.
- Browser CORS errors: confirm `http://localhost:5173` is allowed in `backend/src/chatbot/api.py` during development.
- Port conflicts: change the port in `.env` or stop the conflicting process.

Quick pre-check list

1. `backend/.env` exists and contains `MONGODB_URI` and `JWT_SECRET`.
2. Python `.venv` active when starting the chatbot and dependencies installed.
3. Chatbot logs show no fatal errors and ideally a MongoDB ping.
4. Node backend logs show Express is running.
5. Frontend opens in the browser.

## Visual flowchart — how Medora works (human-friendly)

**System health checks**
- Chatbot logs show no fatal errors and ideally a MongoDB ping
- Node backend logs show Express is running
- Frontend opens successfully in the browser

---
### Architecture Flow (Mermaid)

```mermaid
flowchart LR
  U["User (Browser / Mobile)"]
  F["Frontend (React + Vite)"]
  B["Backend (Node + Express)"]
  C["Controller Layer"]
  DB[("MongoDB via Mongoose")]
  CL["Cloudinary"]
  TW["Twilio"]
  CH["Chatbot (FastAPI + Uvicorn)"]
  VDB[("Vector Indexes (MongoDB)")]
  AI["AI Providers (OpenAI / Groq / Gemini)"]

  U -->|UI actions| F
  F -->|HTTP requests| B
  B -->|routes| C
  C -->|read/write| DB
  C -->|file uploads| CL
  C -->|send SMS| TW
  C -->|invoke chat| CH
  CH -->|vector lookups| VDB
  CH -->|LLM calls| AI
  B -->|responses| F
  F -->|render| U

Plain-English walkthrough (step-by-step)

1. A person opens the frontend and interacts with the UI (searches, requests an appointment, or asks a question).
2. The frontend calls the backend API endpoints (routes defined under `backend/routes/`).
3. The backend forwards the request to the appropriate controller. That controller may:
	- read or write data in MongoDB (users, doctors, appointments),
	- upload or fetch media from Cloudinary,
	- send SMS via Twilio, or
	- forward knowledge queries to the Chatbot microservice.
4. The chatbot (FastAPI) performs a RAG workflow:
	- it searches vector indexes stored in MongoDB to retrieve relevant documents,
	- it may call an external LLM (OpenAI, GROQ, etc.) to generate or refine the answer,
	- it returns a structured response (response text, session id, context) to the backend or frontend.
5. The backend returns results to the frontend and the UI updates accordingly.

ASCII fallback (if Mermaid does not render)

User -> Frontend -> Backend -> Controller -> MongoDB
											|-> Cloudinary
											|-> Twilio
											|-> Chatbot -> (Vector DB / AI providers)

Where to look in the repository

- Frontend: `frontend/vite-project/src/` — pages, components and AI/chat UI.
- Backend: `backend/src/` — `routes/`, `controllers/`, `models/`, and `lib/`.
 - Chatbot: `backend/src/chatbot/` — `api.py` (FastAPI entrypoint) and `chatbot_rag.py` (RAG logic and helpers).

## API examples (curl) + Postman collection snippet

The examples below show common flows: signup, login, booking an appointment, and calling the chatbot. Replace host/ports and payload fields with your values.

1) Signup (create user)

```bash
curl -X POST http://localhost:5002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

2) Login (receive JWT)

```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response contains a token you must send as Authorization: Bearer <token>
```

3) Book appointment (authenticated)

```bash
curl -X POST http://localhost:5002/api/appointments/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"doctorId":"<doctorId>","userId":"<userId>","date":"2025-12-30T10:00:00Z","reason":"Consultation"}'
```

4) Call chatbot (RAG) — POST /api/chat on the FastAPI service

```bash
curl -X POST http://127.0.0.1:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"How do I treat a headache?"}'
```

Postman collection (minimal JSON snippet)

You can import the JSON below into Postman (File → Import) as a starting collection. Update the base URL and auth token in Postman variables.

```json
{
  "info": {"name": "Medora API Examples", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},
  "item": [
    {"name":"Signup","request":{"method":"POST","header":[{"key":"Content-Type","value":"application/json"}],"url":{"raw":"http://localhost:5002/api/auth/signup","host":["http://localhost:5002"],"path":["api","auth","signup"]},"body":{"mode":"raw","raw":"{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"password123\"}"}}},
    {"name":"Login","request":{"method":"POST","header":[{"key":"Content-Type","value":"application/json"}],"url":{"raw":"http://localhost:5002/api/auth/login","host":["http://localhost:5002"],"path":["api","auth","login"]},"body":{"mode":"raw","raw":"{\"email\":\"test@example.com\",\"password\":\"password123\"}"}}},
    {"name":"Chat","request":{"method":"POST","header":[{"key":"Content-Type","value":"application/json"}],"url":{"raw":"http://127.0.0.1:5002/api/chat","host":["127.0.0.1:5002"],"path":["api","chat"]},"body":{"mode":"raw","raw":"{\"query\":\"hello\"}"}}}
  ]
}
```

## Route → Controller summary (quick map)

Below is a high-level table mapping route files to controller areas and whether they usually require authentication. This is a quick reference — inspect the files for full details.

| Route file | Controller(s) | Purpose | Auth required |
|---|---|---|---|
| `auth.routes.js` | `auth.controllers.js` | User signup / login | No for signup/login; Yes for protected routes |
| `login.router.js` | `auth.controllers.js` | (Alternate login routes) | No for login |
| `appointment.routes.js`, `appointment.router.js` | `appointment.controllers.js` | Create/list appointments | Yes |
| `chatbot.routes.js`, `ragRoutes.js` | `chatbot` / `chatbot_rag.py` | Chat and RAG queries | No (chatbot FastAPI endpoint is public but rate-limited in prod) |
| `pdf.routes.js` | `pdf.model.js` (pdf controller) | Generate/download PDFs | Yes |
| `pharmacy.routes.js` | `pharmacy.controllers.js` | Pharmacy and medicines endpoints | Some endpoints require auth |
| `userPharamcy.routes.js` | `userPharmacy.controllers.js` | User-pharmacy actions | Yes |
| `userVitals.js` | `user.vitals.controller.js` | Vitals logging and retrieval | Yes |

Notes:
- Controllers live in `backend/src/controllers/` and hold the business logic. Route files wire controllers to Express endpoints.
- The exact auth requirement per route is set by middleware (see `backend/src/middleware/`) — double-check per-route middleware for permission details.

## OpenAPI / Swagger for the chatbot (FastAPI)

The chatbot microservice (FastAPI) provides interactive API docs automatically. When the chatbot service is running locally you can visit:

- Swagger UI: http://127.0.0.1:5002/docs
- ReDoc: http://127.0.0.1:5002/redoc
- Raw OpenAPI JSON: http://127.0.0.1:5002/openapi.json

These pages are great for trying the `/api/chat` endpoint manually and seeing request/response shapes.

## Response shapes & common error codes

Chat response model (example)

```json
{
  "response": "Hello — I can help you book an appointment or answer questions about medicines.",
  "session_id": "b6f8b9a2-1234-5678-90ab-cdef12345678",
  "context": "mixed",
  "error": null
}
```

Common HTTP status codes you will encounter

- 200 OK — Successful request with expected payload.
- 201 Created — Resource created (e.g., signup, appointment creation).
- 400 Bad Request — The request payload is invalid or missing required fields.
- 401 Unauthorized — Missing or invalid JWT token for protected routes.
- 403 Forbidden — Authenticated but lacks permission for the action.
- 404 Not Found — Resource not found (wrong id or endpoint).
- 500 Internal Server Error — Unexpected server error. Check logs.
- 503 Service Unavailable — Chatbot RAG system still initializing or an external service is unavailable.

Error response (recommended format used by many controllers)

```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": {"field":"error details"}
}
```

Add this to your tests and Postman checks to assert correct error handling.
## About this project

Medora is built to be a practical, developer-friendly healthcare assistant platform. It combines a classic REST backend, a small RAG-powered chatbot microservice, and a responsive React frontend so clinics, pharmacies, and patients can interact in one place.

Key goals:
- Make appointment workflows simple for patients and staff.
- Provide fast, contextual answers about hospitals and medicines using a RAG chatbot.
- Centralize records (appointments, vitals, prescriptions) so clinicians and pharmacies can coordinate.
- Support multilingual users and an accessible UI.

Who it's for:
- Small clinics and pharmacies that want a light-weight digital assistant.
- Developers and teams prototyping health-tech features for pilot programs.
- Students and maintainers learning how to combine Node, FastAPI, and RAG-style AI.

## Real-world advantages (what this enables)

1. Faster access to information
  - Patients can ask the chatbot simple questions about medicines, specialist availability, and clinic hours without waiting on phone support.

2. Smarter appointment flow
  - Guided booking flows reduce no-shows and clerical work by collecting required patient details up front and confirming by SMS.

3. Better coordination between clinics and pharmacies
  - Shared records and pharmacy listings help reduce prescription friction and make it easier to find medicines locally.

4. Multilingual support and accessibility
  - The frontend includes basic i18n support so more users can interact in their native language.

5. Rapid prototyping and extensibility
  - The codebase shows a clean separation between API, chat RAG logic, and frontend UI — making it straightforward to add integrations (analytics, EMR connectors, more LLMs).

6. Cost-effective pilot deployments
  - The combination of server-side Node and the small Python service keeps resource needs modest for early pilots or educational demos.

7. Improved patient engagement and safety
  - Vitals logging, PDF reports, and SMS reminders help patients track care and provide clinicians with quick snapshots.

Security and privacy note

Medora stores and moves health-related data. For any real deployment:
- Use encrypted connections and TLS everywhere.
- Limit database user privileges.
- Don’t store secrets in Git; use a secrets manager in production.
- Follow local healthcare data regulations (HIPAA, GDPR) when deploying to real users.




