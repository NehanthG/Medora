import os
import uuid
import threading
import time 
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# --- Import ALL RAG components from your script (chatbot_rag.py) ---
# Ensure your chatbot_rag.py file is saved and contains the fixed RAG prompt 
# and is free of console-crashing emojis.
from chatbot_rag import (
    client,
    hospital_collection,
    medicines_collection,
    create_hospital_embeddings,
    create_pharmacy_embeddings,
    create_hospital_rag_system,
    create_pharmacy_rag_system,
    check_vector_indexes,
    check_appointment_status,
    PatientBookingSystem,
    hospital_memory,
    pharmacy_memory
)

# ------------------------------------------------------------------
# 1. GLOBALS AND CONFIG
# ------------------------------------------------------------------
load_dotenv()

global global_hospital_qa_chain
global global_pharmacy_qa_chain
global_hospital_qa_chain = None
global_pharmacy_qa_chain = None
global_session_store: Dict[str, Dict[str, Any]] = {}

# Utility function to call RAG system creation.
def create_hospital_rag_system_fixed():
    return create_hospital_rag_system()

# --- System Initialization ---
def initialize_system():
    """Performs synchronous, blocking startup operations."""
    global global_hospital_qa_chain, global_pharmacy_qa_chain

    print("[1] Starting API and initializing RAG system...")

    try:
        client.admin.command('ping')
        print("[1] MongoDB Atlas connection OK")
    except Exception as e:
        print(f"[1] MongoDB connection failed: {e}")
        return

    # Check embeddings
    print("[1]")
    check_vector_indexes() 

    # Create RAG systems 
    print("[1] Creating RAG systems...")
    global_hospital_qa_chain, _ = create_hospital_rag_system_fixed()
    global_pharmacy_qa_chain, _ = create_pharmacy_rag_system()

    if not global_hospital_qa_chain or not global_pharmacy_qa_chain:
        print("[1] Failed to create RAG systems.")
        return
    
    # Clear memory objects upon successful startup
    hospital_memory.clear()
    pharmacy_memory.clear()

    print("[1] Startup complete.")

# --- FastAPI lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages startup and shutdown events, ensuring RAG init is complete."""
    print("[1] Running startup initialization...")
    init_thread = threading.Thread(target=initialize_system)
    init_thread.start()
    init_thread.join()  # Block until initialize_system returns 
    
    # Enhanced Check: Wait briefly if initialization finished but RAG variables aren't set
    timeout_sec = 5
    start_time = time.time()
    while (not global_hospital_qa_chain or not global_pharmacy_qa_chain) and (time.time() - start_time < timeout_sec):
        print("Waiting for RAG variables to be fully established...")
        time.sleep(0.5)

    if not global_hospital_qa_chain or not global_pharmacy_qa_chain:
        print("[ERROR] RAG initialization failed or timed out. API endpoints will return 503.")
    else:
        print("[1] Startup complete. API is available.")
        
    yield
    print("Shutting down...")

# --- FastAPI App ---
app = FastAPI(lifespan=lifespan) 

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    # Allow local frontend origin and the server port itself
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5002"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# 2. API MODELS
# ------------------------------------------------------------------
class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None 

class ChatResponse(BaseModel):
    response: str
    session_id: str
    context: str  # "booking", "status", "hospital", "pharmacy", "mixed"
    error: Optional[str] = None

# ------------------------------------------------------------------
# 3. API ENDPOINT
# ------------------------------------------------------------------
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handles the main chat logic, routing to booking, status, or RAG systems."""
    
    # 3.1 Initialization Check (Prevents 503 error on uninitialized access)
    if not global_hospital_qa_chain or not global_pharmacy_qa_chain:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="System is initializing or failed to start. Try again later."
        )

    # 3.2 Session Management
    session_id = request.session_id or str(uuid.uuid4())
    if session_id not in global_session_store:
        # Create a new session with a dedicated booking system instance
        global_session_store[session_id] = {
            "booking_system": PatientBookingSystem(),
        }
    
    booking_system: PatientBookingSystem = global_session_store[session_id]["booking_system"]
    user_query = request.query
    
    try:
        # 3.3 Booking Handling (Highest Priority)
        
        # Check if booking is active OR if the query contains booking keywords to initiate.
        is_booking_init = booking_system.current_booking_step > 0 or any(keyword in user_query.lower() for keyword in ['book', 'appointment', 'schedule', 'see a doctor'])
        
        # NOTE: The booking system's initial call also acts as a check to see if a flow should start
        booking_response = booking_system.collect_booking_details(user_query, detected_lang=None)
        
        if booking_response:
             # If the booking system returned a response, it's either continuing the flow or finalizing it.
            return ChatResponse(response=booking_response, session_id=session_id, context="booking")


        # 3.4 Appointment Status Check
        if any(keyword in user_query.lower() for keyword in ['check', 'status', 'my appointment']):
            status_response = check_appointment_status(user_query)
            return ChatResponse(response=status_response, session_id=session_id, context="status")

        # 3.5 RAG Classification & Query
        pharmacy_keywords = ['medicine', 'drug', 'pharmacy', 'tablet', 'capsule', 'syrup', 'injection', 'prescription']
        hospital_keywords = ['doctor', 'physician', 'specialist', 'cardiologist', 'neurologist', 'surgeon', 'hours', 'department', 'ward']

        is_pharmacy_query = any(k in user_query.lower() for k in pharmacy_keywords)
        is_hospital_query = any(k in user_query.lower() for k in hospital_keywords)

        if is_pharmacy_query and not is_hospital_query:
            # Pharmacy Query (only)
            result = global_pharmacy_qa_chain.invoke({"question": user_query})
            answer = result['answer']
            return ChatResponse(response=answer, session_id=session_id, context="pharmacy")

        # *** CORRECTED RAG ROUTING LOGIC (Hospital Query only) ***
        elif is_hospital_query and not is_pharmacy_query:
            # Hospital Query (only)
            result = global_hospital_qa_chain.invoke({"question": user_query})
            answer = result['answer']
            return ChatResponse(response=answer, session_id=session_id, context="hospital")

        else:
            # Mixed or Unclassified Query: Query both and combine responses
            h_res = global_hospital_qa_chain.invoke({"question": user_query})
            p_res = global_pharmacy_qa_chain.invoke({"question": user_query})
            
            h_answer = h_res.get('answer', "I couldn't find hospital information on that.")
            p_answer = p_res.get('answer', "I couldn't find pharmacy information on that.")

            # Define keywords/phrases that signal a generic/introductory response (for cleanup)
            generic_phrases = ["hello", "hi there", "how can i assist you today", "i'm here to help", "welcome"]
            
            # Check if both responses are likely generic greetings
            h_is_generic = any(phrase in h_answer.lower() for phrase in generic_phrases)
            p_is_generic = any(phrase in p_answer.lower() for phrase in generic_phrases)
            
            if h_is_generic and p_is_generic:
                # Unified welcome message cleanup
                answer = "Hello! I am your combined Health and Pharmacy Assistant. Ask me about doctors, medicines, or book an appointment."
                context_type = "mixed"

            # Logic to provide the best response (for substantive answers)
            elif "I don't know" in h_answer and "I don't know" not in p_answer:
                answer = p_answer
                context_type = "pharmacy"
            elif "I don't know" not in h_answer and "I don't know" in p_answer:
                answer = h_answer
                context_type = "hospital"
            else:
                # --- FIX: Combine the two answers into a single, cohesive text block ---
                # Remove the bold formatting and use a clear separator or combine them naturally
                
                # Strip labels from the original outputs for cleaner presentation
                clean_h_answer = h_answer.replace("**Hospital Info:** ", "").strip()
                clean_p_answer = p_answer.replace("**Pharmacy Info:** ", "").strip()

                # Synthesize into a single narrative
                if clean_h_answer.startswith("To treat shoulder pain"):
                    answer = f"{clean_h_answer}. {clean_p_answer}"
                else:
                    # Generic combination if synthesis is complex
                    answer = f"**Hospital Advice:** {clean_h_answer}\n\n**Pharmacy Recommendation:** {clean_p_answer}"
                
                context_type = "mixed"

            return ChatResponse(response=answer, session_id=session_id, context=context_type)

    except Exception as e:
        # 3.6 Catch-all Internal Error Handler (Prevents unhandled crashes)
        print(f"[FAIL] UNHANDLED EXCEPTION in /api/chat for session {session_id}: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"An internal error occurred during RAG processing. Error: {str(e)[:50]}"
        )

# ------------------------------------------------------------------
# 4. RUN SERVER
# ------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    # Runs the application on port 5002, matching the frontend's fetch call
    uvicorn.run("api:app", host="127.0.0.1", port=5002, reload=True)