import os
import re
import certifi
import tempfile
import speech_recognition as sr
from pymongo import MongoClient
from bson.dbref import DBRef
from bson import ObjectId
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from datetime import datetime, timedelta
import uuid
from dotenv import load_dotenv

load_dotenv()

# --- FIX 1: Correctly retrieve open_api from environment ---
open_api = os.getenv("OPENAI_API_KEY")

# ------------------------------------------------------------------
# 1. ENVIRONMENT & GLOBALS
# ------------------------------------------------------------------
os.environ["TOKENIZERS_PARALLELISM"] = "false"

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://SIH25018DB:SIH25018@cluster0.k6z2tpt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

# ASR (input) via Whisper: Groq hosted or local
ASR_BACKEND = os.getenv("ASR_BACKEND", "groq_whisper")  # "groq_whisper" or "local_whisper"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_ASR_MODEL = os.getenv("GROQ_ASR_MODEL", "whisper-large-v3-turbo")
ASR_LANGUAGE_HINT = os.getenv("ASR_LANGUAGE_HINT", None)  # e.g., "ta", "te", or None for auto

# TTS (output) via ElevenLabs
TTS_BACKEND = "elevenlabs"
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")  # set this in env
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")  # pick from your account
ELEVENLABS_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")  # multilingual model recommended

AUDIO_SAMPLE_RATE = 16000
AUDIO_CHANNELS = 1

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ------------------------------------------------------------------
# 2. DATABASE / COLLECTION REFERENCES
# ------------------------------------------------------------------
hospital_db = client["rag_db"]
hospital_collection = hospital_db["documents"]
appointments_collection = hospital_db["appointments"]  # Using existing appointments collection

pharma_db = client["test"]
medicines_collection = pharma_db["medicines"]
pharmacies_collection = pharma_db["pharmacies"]

# ------------------------------------------------------------------
# 3. MEMORY SETUP
# ------------------------------------------------------------------
hospital_memory = ConversationBufferWindowMemory(k=10, memory_key="chat_history", output_key="answer", return_messages=True)
pharmacy_memory = ConversationBufferWindowMemory(k=10, memory_key="chat_history", output_key="answer", return_messages=True)

# ------------------------------------------------------------------
# 4. DBREF RESOLUTION & UTILITIES
# ------------------------------------------------------------------
def resolve_dbref(db_client, dbref_obj):
    if not isinstance(dbref_obj, DBRef):
        return None
    try:
        database_name = dbref_obj.database or pharma_db.name
        collection_name = dbref_obj.collection
        ref_id = dbref_obj.id
        target_db = db_client[database_name]
        target_collection = target_db[collection_name]
        return target_collection.find_one({"_id": ref_id})
    except Exception as e:
        print(f"Warning: Could not resolve DBRef: {e}")
        return None

def inspect_document_structure(collection, collection_name):
    # EMOJI REMOVED
    print(f"\n[INFO] Inspecting {collection_name} document structure...")
    sample_doc = collection.find_one()
    if not sample_doc:
        print(f"[FAIL] No documents found in {collection_name}")
        return None
    print(f"[INFO] Available fields in {collection_name}:")
    for key, value in sample_doc.items():
        if isinstance(value, DBRef):
            print(f"   - {key}: DBRef -> {value}")
        else:
            print(f"   - {key}: {type(value).__name__} = {str(value)[:60]}...")
    return sample_doc

def get_safe_field_value(doc, possible_names, default="N/A"):
    for name in possible_names:
        if name in doc and doc[name] is not None:
            return doc[name]
    return default

# ------------------------------------------------------------------
# 5. EMBEDDING CREATION
# ------------------------------------------------------------------
def create_hospital_embeddings():
    # EMOJI REMOVED
    print("\n[HOSPITAL] DATASET: creating/updating embeddings...")
    sample_doc = inspect_document_structure(hospital_collection, "hospital/documents")
    if not sample_doc:
        return
    docs = list(hospital_collection.find())
    print(f"[HOSPITAL] Processing {len(docs)} hospital documents for embeddings...")
    for doc in docs:
        doctor_name = get_safe_field_value(doc, ['doctor_name', 'doctorName', 'name', 'fullName', 'full_name'])
        specialty = get_safe_field_value(doc, ['speciality', 'specialty', 'specialization', 'department'])
        phone = get_safe_field_value(doc, ['phone', 'phoneNumber', 'phone_number', 'contact', 'mobile'])
        shift = get_safe_field_value(doc, ['shift', 'working_hours', 'schedule', 'timing'])
        hospital_name = get_safe_field_value(doc, ['hospital_name', 'hospitalName', 'hospital', 'clinic'])
        hospital_address = get_safe_field_value(doc, ['hospital_address', 'hospitalAddress', 'address', 'location'])
        is_available = doc.get("isAvailable", True)
        text_content = f"""Doctor: {doctor_name}
Speciality: {specialty}
Phone: {phone}
Shift: {shift}
Hospital: {hospital_name}
Address: {hospital_address}
Available: {is_available}"""
        try:
            embedding = embedding_model.embed_query(text_content)
        except Exception as e:
            print(f"  [WARN] Embedding failed for {doctor_name}: {e}")
            embedding = []
        hospital_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"text": text_content, "embeddings": embedding}}
        )
        print(f"  [OK] Updated embeddings for: {doctor_name}")
    print("[HOSPITAL] embeddings updated.")

def create_pharmacy_embeddings():
    # EMOJI REMOVED
    print("\n[PHARMACY] DATASET: creating/updating embeddings...")
    sample_doc = inspect_document_structure(medicines_collection, "medicines")
    if not sample_doc:
        return
    docs = list(medicines_collection.find())
    print(f"[PHARMACY] Processing {len(docs)} medicine documents for embeddings...")
    for doc in docs:
        medicine_name = get_safe_field_value(doc, ['name', 'medicine_name', 'medicineName', 'drug_name'])
        generic_name = get_safe_field_value(doc, ['genericName', 'generic_name', 'generic', 'composition'])
        description = get_safe_field_value(doc, ['description', 'details', 'info', 'about'])
        dosage_form = get_safe_field_value(doc, ['dosageForm', 'dosage_form', 'form', 'type'])
        manufacturer = get_safe_field_value(doc, ['manufacturer', 'company', 'brand', 'mfg'])
        quantity = get_safe_field_value(doc, ['quantity', 'qty', 'stock', 'available'])
        expiry_date = get_safe_field_value(doc, ['expiryDate', 'expiry_date', 'expiry', 'exp_date'])
        prescription_required = get_safe_field_value(doc, ['prescriptionRequired', 'prescription_required', 'prescription'])
        pharmacy_text = ""
        if 'pharmacy' in doc and isinstance(doc['pharmacy'], DBRef):
            pharmacy_doc = resolve_dbref(client, doc['pharmacy'])
            if pharmacy_doc:
                pharmacy_name = get_safe_field_value(pharmacy_doc, ['name', 'pharmacy_name', 'pharmacyName'])
                contact_number = get_safe_field_value(pharmacy_doc, ['contactNumber', 'contact_number', 'phone', 'mobile'])
                address = get_safe_field_value(pharmacy_doc, ['address', 'location', 'addr'])
                pharmacy_text = f"Pharmacy: {pharmacy_name}\nContact: {contact_number}\nAddress: {address}"
        elif 'pharmacy' in doc:
            try:
                pharmacy_id = doc['pharmacy']
                pharmacy_doc = pharmacies_collection.find_one({"_id": pharmacy_id})
                if pharmacy_doc:
                    pharmacy_name = get_safe_field_value(pharmacy_doc, ['name', 'pharmacy_name', 'pharmacyName'])
                    contact_number = get_safe_field_value(pharmacy_doc, ['contactNumber', 'phone'])
                    address = get_safe_field_value(pharmacy_doc, ['address', 'location'])
                    pharmacy_text = f"Pharmacy: {pharmacy_name}\nContact: {contact_number}\nAddress: {address}"
            except Exception:
                pharmacy_text = ""
        text_content = f"""Medicine: {medicine_name}
Generic Name: {generic_name}
Description: {description}
Dosage Form: {dosage_form}
Manufacturer: {manufacturer}
Quantity: {quantity}
Expiry Date: {expiry_date}
Prescription Required: {prescription_required}
{pharmacy_text}"""
        try:
            embedding = embedding_model.embed_query(text_content)
        except Exception as e:
            print(f"  [WARN] Embedding failed for {medicine_name}: {e}")
            embedding = []
        medicines_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"text": text_content, "embeddings": embedding}}
        )
        print(f"  [OK] Updated embeddings for: {medicine_name}")
    print("[PHARMACY] Medicine embeddings updated.")

# ------------------------------------------------------------------
# 6. ENHANCED BOOKING SYSTEM USING EXISTING APPOINTMENTS COLLECTION
# ------------------------------------------------------------------
class PatientBookingSystem:
    def __init__(self):
        self.booking_data = {}
        self.current_booking_step = 0
        self.booking_steps = [
            'doctor_selection',
            'patient_name', 
            'patient_phone',
            'patient_email',
            'appointment_reason',
            'preferred_date',
            'time_selection',
            'confirmation'
        ]
    
    def reset_booking(self):
        """Reset booking session"""
        self.booking_data = {}
        self.current_booking_step = 0
    
    def collect_booking_details(self, user_input, detected_lang=None):
        """Conversational booking flow using existing appointments collection"""
        
        # Check if the flow is at the start (step 0) and needs initiation keywords
        if self.current_booking_step == 0:
            if not any(keyword in user_input.lower() for keyword in ['book', 'appointment', 'schedule', 'see a doctor']):
                 return None # Not a booking query, defer to RAG
            
        step = self.booking_steps[self.current_booking_step]
        
        # Dispatch to specific step handlers
        if step == 'doctor_selection':
            return self.handle_doctor_selection(user_input)
        elif step == 'patient_name':
            return self.handle_patient_name(user_input)
        elif step == 'patient_phone':
            return self.handle_patient_phone(user_input)
        elif step == 'patient_email':
            return self.handle_patient_email(user_input)
        elif step == 'appointment_reason':
            return self.handle_appointment_reason(user_input)
        elif step == 'preferred_date':
            return self.handle_preferred_date(user_input)
        elif step == 'time_selection':
            return self.handle_time_selection(user_input)
        elif step == 'confirmation':
            return self.handle_confirmation(user_input)
        
        # Should not happen
        return "Sorry, I lost track of your booking. Let's start over. Which doctor would you like to see?"

    
    def handle_doctor_selection(self, user_input):
        """Extract and validate doctor selection"""
        doctor_name = None
        
        # Extract doctor name patterns
        patterns = [
            r"(?:dr\.?\s*|doctor\s+)([a-zA-Z\s\.]+)",
            r"with\s+([a-zA-Z\s\.]+)",
            r"appointment\s+with\s+([a-zA-Z\s\.]+)",
            r"see\s+([a-zA-Z\s\.]+)" # Catch "see Dr. Smith"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                doctor_name = match.group(1).strip()
                break
        
        if not doctor_name:
            # If the user is starting the flow but didn't specify a doctor yet
            if self.current_booking_step == 0:
                 self.current_booking_step = 0 # Remain at this step
            return "I'd be happy to help you book an appointment! Could you please tell me which doctor you'd like to see? For example: 'Dr. Sudeep Kumar' or 'Dr. Manoj Joshi'."
        
        # Find doctor in hospital collection
        doctor_doc = find_doctor_doc_by_name(doctor_name)
        if not doctor_doc:
            return f"I couldn't find a doctor named '{doctor_name}' in our system. Could you please check the spelling or try a different doctor's name?"
        
        # Simple availability check (only checking existence in DB)
        doctor_full_name = get_safe_field_value(doctor_doc, ['doctor_name', 'name', 'full_name'])
        
        self.booking_data['doctor'] = doctor_doc
        self.current_booking_step += 1
        
        specialty = get_safe_field_value(doctor_doc, ['speciality', 'specialty', 'specialization'])
        return f"Great! I found {doctor_full_name}, {specialty}. Now I need to collect some information from you. What's your full name?"
    
    def handle_patient_name(self, user_input):
        """Collect patient's full name"""
        name = user_input.strip()
        if len(name) < 2:
            return "Please provide your full name (first and last name)."
        
        self.booking_data['patient_name'] = name
        self.current_booking_step += 1
        return f"Thank you, {name}. What's your phone number?"
    
    def handle_patient_phone(self, user_input):
        """Collect and validate phone number"""
        phone = re.sub(r'[^\d+\-\s\(\)]', '', user_input.strip())
        
        if len(re.sub(r'[^\d]', '', phone)) < 10:
            return "Please provide a valid phone number (at least 10 digits)."
        
        self.booking_data['patient_phone'] = phone
        self.current_booking_step += 1
        return "Perfect! What's your email address?"
    
    def handle_patient_email(self, user_input):
        """Collect and validate email"""
        email = user_input.strip()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(email_pattern, email):
            return "Please provide a valid email address (e.g., example@email.com)."
        
        self.booking_data['patient_email'] = email
        self.current_booking_step += 1
        return "Great! Could you briefly tell me the reason for your visit or any specific concerns?"
    
    def handle_appointment_reason(self, user_input):
        """Collect reason for appointment"""
        reason = user_input.strip()
        if len(reason) < 3:
            return "Please provide a brief reason for your visit (e.g., 'regular checkup', 'chest pain', 'consultation')."
        
        self.booking_data['appointment_reason'] = reason
        self.current_booking_step += 1
        return "Thank you. When would you prefer to have your appointment? You can say 'tomorrow', 'next week', or a specific date like 'September 25th'."
    
    def handle_preferred_date(self, user_input):
        """Parse date preference and show available dates"""
        # Ensure we have the dependency for advanced date parsing
        try:
            import dateutil.parser
        except ImportError:
            return "Error: Please install 'python-dateutil' to enable flexible date parsing."
            
        date_input = user_input.strip().lower()
        self.booking_data['preferred_date_input'] = date_input
        
        # Parse common date expressions
        target_date = self.parse_date_expression(date_input)
        
        if not target_date:
            return "I couldn't understand that date. Please try saying 'tomorrow', 'next Monday', or a specific date like 'September 25th'."
        
        # Check availability for that doctor on the requested date
        doctor_name = get_safe_field_value(self.booking_data['doctor'], ['doctor_name', 'name', 'full_name'])
        
        existing_appointments = list(appointments_collection.find({
            "doctor_name": doctor_name,
            "appointment_date": target_date.strftime("%Y-%m-%d"),
            "status": {"$in": ["scheduled", "confirmed"]}
        }))
        
        # Generate available time slots (excluding booked ones)
        all_slots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
        booked_times = [apt.get("appointment_time", "").split(":")[0] + ":00" 
                        for apt in existing_appointments if apt.get("appointment_time")]
        
        available_slots = [slot for slot in all_slots if slot not in booked_times]
        
        if not available_slots:
            next_date = target_date + timedelta(days=1)
            return f"Sorry, {doctor_name} has no available slots on {target_date.strftime('%B %d, %Y')}. Would you like to try {next_date.strftime('%B %d, %Y')} instead?"
        
        self.booking_data['appointment_date'] = target_date
        slots_text = "\n".join([f"- {slot}" for slot in available_slots])
        
        self.current_booking_step += 1
        return f"Available time slots for {target_date.strftime('%B %d, %Y')}:\n\n{slots_text}\n\nWhich time would you prefer?"
    
    def handle_time_selection(self, user_input):
        """Handle time slot selection"""
        time_input = user_input.strip()
        
        # Extract time from input (e.g., 10:30, 2 pm, 4)
        time_pattern = r'(\d{1,2}):?(\d{0,2})\s*(am|pm)?'
        match = re.search(time_pattern, time_input.lower())
        
        selected_time = None
        
        if match:
            hour = int(match.group(1))
            minute = match.group(2) or "00"
            period = match.group(3)
            
            if period == "pm" and hour < 12:
                hour += 12
            elif period == "am" and hour == 12:
                hour = 0
            
            selected_time = f"{hour:02d}:{minute}"
        else:
            # Try to match common single hour formats
            time_mappings = {
                "9": "09:00", "10": "10:00", "11": "11:00",
                "2": "14:00", "3": "15:00", "4": "16:00", "5": "17:00",
                "9am": "09:00", "10am": "10:00", "11am": "11:00",
                "2pm": "14:00", "3pm": "15:00", "4pm": "16:00", "5pm": "17:00",
            }
            selected_time = time_mappings.get(time_input.strip().lower().replace(" ", ""))
        
        if not selected_time:
            return "Please specify a time like '10:00 AM', '2:30 PM', or just '10' for 10 AM."
        
        self.booking_data['appointment_time'] = selected_time
        self.current_booking_step += 1
        
        # Show confirmation details
        doctor_name = get_safe_field_value(self.booking_data['doctor'], ['doctor_name', 'name', 'full_name'])
        specialty = get_safe_field_value(self.booking_data['doctor'], ['speciality', 'specialty'])
        date_str = self.booking_data['appointment_date'].strftime('%B %d, %Y')
        
        confirmation_text = f"""
[CONFIRMATION] Please confirm your appointment details:

- Patient: {self.booking_data['patient_name']}
- Doctor: {doctor_name} ({specialty})
- Date: {date_str}
- Time: {selected_time}
- Reason: {self.booking_data['appointment_reason']}
- Phone: {self.booking_data['patient_phone']}
- Email: {self.booking_data['patient_email']}

Type 'YES' to confirm or 'NO' to cancel.
        """
        
        return confirmation_text.strip()
    
    def handle_confirmation(self, user_input):
        """Handle final confirmation"""
        response = user_input.strip().lower()
        
        if response in ['yes', 'y', 'confirm', 'ok']:
            # Create appointment in existing collection
            appointment_id = self.create_appointment_record()
            
            if appointment_id:
                doctor_name = get_safe_field_value(self.booking_data['doctor'], ['doctor_name', 'name', 'full_name'])
                date_str = self.booking_data['appointment_date'].strftime('%B %d, %Y')
                time_str = self.booking_data['appointment_time']
                
                confirmation_msg = f"""
[APPOINTMENT CONFIRMED!]

[Details]
- Appointment ID: {appointment_id}
- Patient: {self.booking_data['patient_name']}
- Doctor: {doctor_name}
- Date & Time: {date_str} at {time_str}
- Reason: {self.booking_data['appointment_reason']}

You will receive a confirmation SMS and email shortly. For changes, please call us at least 24 hours in advance.

Thank you for choosing our healthcare services!
                """
                
                self.reset_booking()
                return confirmation_msg.strip()
            else:
                return "[FAIL] Sorry, there was an error creating your appointment. Please try again or contact our support team."
        
        elif response in ['no', 'n', 'cancel']:
            self.reset_booking()
            return "[CANCELED] Appointment cancelled. Is there anything else I can help you with?"
        
        else:
            return "Please type 'YES' to confirm your appointment or 'NO' to cancel."
    
    def parse_date_expression(self, date_input):
        """Parse various date expressions (requires python-dateutil)"""
        try:
            import dateutil.parser
        except ImportError:
            return None # Cannot proceed without dateutil for flexible parsing
            
        today = datetime.now().date()
        
        # Simple relative checks
        if "today" in date_input:
            return today
        if "tomorrow" in date_input:
            return today + timedelta(days=1)
        if "next week" in date_input:
            return today + timedelta(days=7)
        
        # Day of week checks (gets next occurrence)
        day_map = {'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6}
        for day_name, day_index in day_map.items():
             if day_name in date_input:
                days_ahead = day_index - today.weekday()
                if days_ahead <= 0: # Check if day has passed this week, if so, look to next week
                    days_ahead += 7
                return today + timedelta(days=days_ahead)

        # Try to parse specific dates
        try:
            parsed_date = dateutil.parser.parse(date_input, default=datetime.now()).date()
            # Ensure the date is today or in the future
            if parsed_date >= today:
                return parsed_date
        except:
            pass
        
        return None
    
    def create_appointment_record(self):
        """Create appointment record in existing appointments collection"""
        try:
            doctor = self.booking_data['doctor']
            appointment_id = str(uuid.uuid4())[:8].upper()
            
            # Create appointment record matching your existing structure
            appointment_record = {
                "appointment_id": appointment_id,
                "doctor_id": ObjectId(doctor['_id']),
                "doctor_name": get_safe_field_value(doctor, ['doctor_name', 'name', 'full_name']),
                "doctor_specialty": get_safe_field_value(doctor, ['speciality', 'specialty', 'specialization']),
                "doctor_phone": get_safe_field_value(doctor, ['phone', 'phoneNumber', 'contact']),
                "patient_name": self.booking_data['patient_name'],
                "patient_phone": self.booking_data['patient_phone'],
                "patient_email": self.booking_data['patient_email'],
                "appointment_datetime": f"{self.booking_data['appointment_date']}T{self.booking_data['appointment_time']}:00.000+00:00",
                "appointment_date": self.booking_data['appointment_date'].strftime('%Y-%m-%d'),
                "appointment_time": self.booking_data['appointment_time'],
                "reason": self.booking_data['appointment_reason'],
                "status": "scheduled",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            # Insert into existing appointments collection
            result = appointments_collection.insert_one(appointment_record)
            
            if result.inserted_id:
                print(f"[DB OK] Appointment created with ID: {appointment_id}")
                return appointment_id
            else:
                print("[DB FAIL] Failed to create appointment")
                return None
                
        except Exception as e:
            print(f"[DB FAIL] Error creating appointment: {e}")
            return None

# Initialize booking system
booking_system = PatientBookingSystem() 

# ------------------------------------------------------------------
# 7. DOCTOR LOOKUP FUNCTIONS
# ------------------------------------------------------------------
def find_doctor_doc_by_name(name):
    if not name:
        return None
    fields = ['doctor_name', 'doctorName', 'name', 'fullName', 'full_name']
    for f in fields:
        # Exact match attempt
        doc = hospital_collection.find_one({f: name})
        if doc:
            return doc
    for f in fields:
        # Regex match attempt
        doc = hospital_collection.find_one({f: {"$regex": re.escape(name), "$options": "i"}})
        if doc:
            return doc
    return None

def book_doctor_appointment(doctor_name):
    """(Legacy/Quick Booking) - Only used in main_system loop, ignored by API logic."""
    try:
        doc = find_doctor_doc_by_name(doctor_name)
        if not doc:
            return f"[FAIL] Doctor '{doctor_name}' not found."
        
        if not doc.get("isAvailable", True):
            found_name = get_safe_field_value(doc, ['doctor_name', 'name', 'full_name'])
            return f"[WARN] Doctor {found_name} is already booked."
            
        found_name = get_safe_field_value(doc, ['doctor_name', 'name', 'full_name'])
        return f"[OK] Appointment booked successfully with {found_name}! (This is a quick simulation.)"
    except Exception as e:
        return f"[FAIL] Quick Booking failed: {e}"

def handle_booking_conversation(user_query, detected_lang=None):
    """(Legacy function used only by the main_system CLI loop)"""
    
    # Check if this is the start of a new booking
    if booking_system.current_booking_step == 0:
        if not any(keyword in user_query.lower() for keyword in ['book', 'appointment', 'schedule']):
            return None
    
    # Process the booking conversation
    response = booking_system.collect_booking_details(user_query, detected_lang)
    return response

# ------------------------------------------------------------------
# 8. APPOINTMENT MANAGEMENT FUNCTIONS
# ------------------------------------------------------------------
def get_patient_appointments(patient_phone):
    """Retrieve appointments for a patient"""
    try:
        appointments = list(appointments_collection.find({
            "patient_phone": patient_phone,
            "status": {"$in": ["scheduled", "confirmed"]}
        }).sort("appointment_datetime", 1))
        
        return appointments
    except Exception as e:
        print(f"[FAIL] Error retrieving appointments: {e}")
        return []

def cancel_appointment(appointment_id):
    """Cancel an existing appointment"""
    try:
        result = appointments_collection.update_one(
            {"appointment_id": appointment_id},
            {"$set": {"status": "cancelled", "updated_at": datetime.now()}}
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"[FAIL] Error cancelling appointment: {e}")
        return False

def check_appointment_status(query):
    """Check appointment status based on user query"""
    # Extract phone number or appointment ID from query
    phone_match = re.search(r'(\d{10,})', query)
    id_match = re.search(r'([A-F0-9]{8})', query.upper())
    
    if phone_match:
        phone = phone_match.group(1)
        appointments = get_patient_appointments(phone)
        if appointments:
            apt_list = []
            for apt in appointments:
                date = apt.get('appointment_date', 'N/A')
                time = apt.get('appointment_time', 'N/A')
                doctor = apt.get('doctor_name', 'N/A')
                apt_list.append(f"- {apt.get('appointment_id')}: {doctor} on {date} at {time} (Status: {apt.get('status', 'N/A')})")
            return f"Your appointments associated with phone {phone}:\n" + "\n".join(apt_list)
        else:
            return "No scheduled appointments found for this phone number."
    
    elif id_match:
        apt_id = id_match.group(1)
        appointment = appointments_collection.find_one({"appointment_id": apt_id})
        if appointment:
            return f"Appointment {apt_id}: {appointment.get('doctor_name')} on {appointment.get('appointment_date')} at {appointment.get('appointment_time')} - Status: {appointment.get('status')}"
        else:
            return f"No appointment found with ID {apt_id}"
    
    return "Please provide your phone number or appointment ID to check status."

# ------------------------------------------------------------------
# 9. SPEECH: ASR (Whisper) + TTS (ElevenLabs)
# ------------------------------------------------------------------
def record_to_wav(tmp_path=None, sample_rate=AUDIO_SAMPLE_RATE):
    recognizer = sr.Recognizer()
    mic = sr.Microphone(sample_rate=sample_rate)
    print("Listening... (speak now)")
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=0.8)
        audio = recognizer.listen(source)
    wav_bytes = audio.get_wav_data(convert_rate=sample_rate, convert_width=2)
    if not tmp_path:
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".wav")
        os.close(tmp_fd)
    with open(tmp_path, "wb") as f:
        f.write(wav_bytes)
    return tmp_path

def transcribe_with_groq_whisper(wav_path, model=GROQ_ASR_MODEL, language_hint=ASR_LANGUAGE_HINT):
    import requests
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
    data = {"model": model}
    if language_hint:
        data["language"] = language_hint
    files = {"file": (os.path.basename(wav_path), open(wav_path, "rb"), "audio/wav")}
    try:
        resp = requests.post(url, headers=headers, data=data, files=files, timeout=60)
        if resp.status_code == 200:
            out = resp.json()
            text = (out.get("text") or "").strip()
            detected_lang = out.get("language")
            return text, detected_lang
        else:
            print(f"[ASR FAIL] Groq ASR error {resp.status_code}: {resp.text}")
            return "", None
    except Exception as e:
        print(f"[ASR FAIL] Groq ASR exception: {e}")
        return "", None

def transcribe_with_local_whisper(wav_path, language_hint=ASR_LANGUAGE_HINT):
    try:
        import whisper
        model = whisper.load_model("large-v3")
        result = model.transcribe(wav_path, language=language_hint)
        text = (result.get("text") or "").strip()
        detected_lang = result.get("language")
        return text, detected_lang
    except Exception as e:
        print(f"[ASR FAIL] Local Whisper error: {e}")
        return "", None

def detect_lang_for_tts(detected_lang, fallback_hint=ASR_LANGUAGE_HINT, default="en"):
    for code in [detected_lang, fallback_hint]:
        if not code:
            continue
        c = code.lower()
        if len(c) >= 2:
            return c[:2]
    return default

def tts_with_elevenlabs(text, lang2="en"):
    try:
        from elevenlabs import stream
        from elevenlabs.client import ElevenLabs

        client = ElevenLabs(api_key=ELEVENLABS_API_KEY if ELEVENLABS_API_KEY else None)

        audio_stream = client.text_to_speech.stream(
            voice_id=ELEVENLABS_VOICE_ID,
            text=text,
            model_id=ELEVENLABS_MODEL_ID
        )
        stream(audio_stream)
    except Exception as e:
        print(f"[TTS FAIL] ElevenLabs TTS error: {e}")

def speak_text(text, detected_lang=None):
    lang2 = detect_lang_for_tts(detected_lang)
    if TTS_BACKEND == "elevenlabs":
        tts_with_elevenlabs(text, lang2=lang2)
    else:
        print("(TTS disabled or unsupported backend)")

def listen_to_voice():
    wav_path = record_to_wav()
    if ASR_BACKEND == "groq_whisper":
        text, detected_lang = transcribe_with_groq_whisper(wav_path)
    elif ASR_BACKEND == "local_whisper":
        text, detected_lang = transcribe_with_local_whisper(wav_path)
    else:
        print("WARN: No ASR backend configured")
        return "", None
    if text:
        print(f"[VOICE] You said: {text}")
    return text, detected_lang


# ------------------------------------------------------------------
# 10. CONVERSATIONAL RAG SYSTEMS
# ------------------------------------------------------------------
def create_hospital_rag_system():
    try:
        vectorstore = MongoDBAtlasVectorSearch(
            collection=hospital_collection,
            embedding=embedding_model,
            index_name="hospital_vector_index",
            text_key="text",
            embedding_key="embeddings",
        )
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=open_api)
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            memory=hospital_memory,
            return_source_documents=True,
            verbose=False,
            combine_docs_chain_kwargs={
                "prompt": PromptTemplate(
                    # --- FIX 2: CORRECTED PROMPT/PERSONA ---
                    template="""You are a helpful **Hospital and Doctor Assistant**. Use chat history + context. Give the answer in short, layman terms so everybody can understand.

Chat History:
{chat_history}
Doctor Info:
{context}
Question: {question}
Answer:""",
                    input_variables=["chat_history", "context", "question"]
                )
            }
        )
        print("[RAG OK] Hospital RAG system created.")
        return qa_chain, vectorstore
    except Exception as e:
        print(f"[RAG FAIL] Hospital RAG creation failed: {e}")
        return None, None

def create_pharmacy_rag_system():
    try:
        vectorstore = MongoDBAtlasVectorSearch(
            collection=medicines_collection,
            embedding=embedding_model,
            index_name="medicine_vector_index",
            text_key="text",
            embedding_key="embeddings",
        )
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=open_api)
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            memory=pharmacy_memory,
            return_source_documents=True,
            verbose=False,
            combine_docs_chain_kwargs={
                "prompt": PromptTemplate(
                    template="""You are a helpful pharmacy assistant. Use chat history + context. Give answer in short laymam terms so the everybody can understand
Chat History:
{chat_history}
Medicine & Pharmacy Info:
{context}
Question: {question}
Answer:""",
                    input_variables=["chat_history", "context", "question"]
                )
            }
        )
        print("[RAG OK] Pharmacy RAG system created.")
        return qa_chain, vectorstore
    except Exception as e:
        print(f"[RAG FAIL] Pharmacy RAG creation failed: {e}")
        return None, None

# ------------------------------------------------------------------
# 11. DEBUG HELPERS
# ------------------------------------------------------------------
def test_dbref_resolution():
    print("\n[TEST] Testing DBRef resolution...")
    sample_medicine = medicines_collection.find_one({"pharmacy": {"$exists": True}})
    if sample_medicine and 'pharmacy' in sample_medicine:
        print(f"Found medicine: {sample_medicine.get('name')}")
        print(f"Pharmacy reference: {sample_medicine['pharmacy']} (type={type(sample_medicine['pharmacy'])})")
        if isinstance(sample_medicine['pharmacy'], DBRef):
            pharmacy_doc = resolve_dbref(client, sample_medicine['pharmacy'])
            if pharmacy_doc:
                print(f"[TEST OK] Resolved to: {pharmacy_doc.get('name')}")
            else:
                print("[TEST FAIL] Could not resolve DBRef")
        else:
            pharmacy_doc = pharmacies_collection.find_one({"_id": sample_medicine['pharmacy']})
            if pharmacy_doc:
                print(f"[TEST OK] Found pharmacy by id: {pharmacy_doc.get('name')}")
    else:
        print("[TEST FAIL] No medicines with pharmacy references found.")

def check_vector_indexes():
    # EMOJI REMOVED
    print("\nChecking basic collection stats and embeddings presence...")
    try:
        hospital_count = hospital_collection.count_documents({})
        medicines_count = medicines_collection.count_documents({})
        pharmacies_count = pharmacies_collection.count_documents({})
        appointments_count = appointments_collection.count_documents({})
        print(f" - Hospital docs: {hospital_count}")
        print(f" - Medicine docs: {medicines_count}")
        print(f" - Pharmacy docs: {pharmacies_count}")
        print(f" - Appointment docs: {appointments_count}")
        hospital_with_embeddings = hospital_collection.count_documents({"embeddings": {"$exists": True}})
        medicines_with_embeddings = medicines_collection.count_documents({"embeddings": {"$exists": True}})
        print(f" - Hospital w/ embeddings: {hospital_with_embeddings}/{hospital_count}")
        print(f" - Medicines w/ embeddings: {medicines_with_embeddings}/{medicines_count}")
    except Exception as e:
        print(f"[FAIL] Error checking collections: {e}")

# ------------------------------------------------------------------
# 12. MAIN SYSTEM LOOP (For CLI Execution)
# ------------------------------------------------------------------
def main_system():
    # EMOJI REMOVED
    print("\nStarting Enhanced Conversational RAG Assistant with Advanced Booking...")

    try:
        client.admin.command('ping')
        print("[DB OK] MongoDB Atlas connection OK")
    except Exception as e:
        print(f"[DB FAIL] MongoDB ping failed: {e}")
        return

    hospital_qa, _ = create_hospital_rag_system()
    pharmacy_qa, _ = create_pharmacy_rag_system()
    if not hospital_qa or not pharmacy_qa:
        print("[FATAL] Could not create RAG systems. Abort.")
        return

    print("\n[ASSISTANT] ready. Type or speak queries. Type 'exit' to quit.")
    print("Examples:")
    print(" - 'I need a cardiologist'")
    print(" - 'I'm looking for paracetamol'") 
    print(" - 'Book appointment with Dr. Sudeep Kumar'")
    print(" - 'Check my appointment status'")

    while True:
        try:
            mode = input("\n[PROMPT] Press 's' for speech input or 't' for text (default 't'): ").strip().lower()
            detected_lang_for_tts = None
            if mode == 's':
                user_query, detected_lang_for_tts = listen_to_voice()
                if not user_query:
                    continue
            else:
                user_query = input("\n[QUERY] Ask anything: ").strip()

            if not user_query:
                continue
            if user_query.lower() in ['exit', 'quit', 'bye']:
                print("[ASSISTANT] Goodbye!")
                break

            # ENHANCED BOOKING HANDLING
            booking_response = handle_booking_conversation(user_query, detected_lang_for_tts)
            if booking_response:
                print(f"\n[BOOKING] Booking Assistant: {booking_response}")
                speak_text(booking_response, detected_lang=detected_lang_for_tts)
                if booking_system.current_booking_step > 0: 
                    continue 
                continue

            # APPOINTMENT STATUS CHECK
            if any(keyword in user_query.lower() for keyword in ['check', 'status', 'my appointment']):
                status_response = check_appointment_status(user_query)
                print(f"\n[STATUS] Appointment Status: {status_response}")
                speak_text(status_response, detected_lang=detected_lang_for_tts)
                continue

            # LEGACY BOOKING (for backward compatibility)
            if "book" in user_query.lower() and "appointment" in user_query.lower():
                words = user_query.split()
                doctor_name = None
                for i, w in enumerate(words):
                    if w.lower() in ["dr.", "dr", "doctor"]:
                        doctor_name = " ".join(words[i+1:])
                        break
                if not doctor_name:
                    m = re.search(r"with (dr\.?\s*)?(?P<name>[\w\s\.]+)", user_query, flags=re.I)
                    if m:
                        doctor_name = m.group("name").strip()
                if doctor_name:
                    booking_msg = book_doctor_appointment(doctor_name)
                    print(f"\n[QUICK BOOK] Quick Booking: {booking_msg}")
                    speak_text(booking_msg, detected_lang=detected_lang_for_tts)
                else:
                    msg = "Could not detect doctor name. Try: 'Book appointment with Dr. Sudeep Kumar'"
                    print(f"\n[WARN] {msg}")
                    speak_text(msg, detected_lang=detected_lang_for_tts)
                continue

            # CLASSIFY & QUERY RAG
            pharmacy_keywords = ['medicine', 'drug', 'pharmacy', 'tablet', 'capsule', 'syrup', 'injection', 'prescription']
            hospital_keywords = ['doctor', 'physician', 'specialist', 'cardiologist', 'neurologist', 'surgeon']

            is_pharmacy_query = any(k in user_query.lower() for k in pharmacy_keywords)
            is_hospital_query = any(k in user_query.lower() for k in hospital_keywords)

            if is_pharmacy_query and not is_hospital_query:
                result = pharmacy_qa.invoke({"question": user_query})
                answer = result['answer']
                print(f"\n[PHARMACY] Pharmacy Assistant: {answer}")
                speak_text(answer, detected_lang=detected_lang_for_tts)
            elif is_hospital_query and not is_pharmacy_query:
                result = hospital_qa.invoke({"question": user_query})
                answer = result['answer']
                print(f"\n[HOSPITAL] Hospital Assistant: {answer}")
                speak_text(answer, detected_lang=detected_lang_for_tts)
            else:
                # Mixed/Ambiguous query
                h_res = hospital_qa.invoke({"question": user_query})
                p_res = pharmacy_qa.invoke({"question": user_query})
                
                h_answer = h_res.get('answer', "I don't have information on that.")
                p_answer = p_res.get('answer', "I don't have information on that.")
                
                print(f"\n[HOSPITAL] Hospital Info: {h_answer}")
                print(f"\n[PHARMACY] Pharmacy Info: {p_answer}")
                
                # Combine response for TTS
                if "I don't know" in h_answer and "I don't know" in p_answer:
                    combined_answer = "I'm sorry, I couldn't find information regarding your query in either the hospital or pharmacy database."
                elif "I don't know" in h_answer:
                    combined_answer = f"Regarding the pharmacy: {p_answer}"
                elif "I don't know" in p_answer:
                    combined_answer = f"Regarding the hospital: {h_answer}"
                else:
                    combined_answer = f"Regarding the hospital: {h_answer}. And regarding the pharmacy: {p_answer}"
                
                speak_text(combined_answer, detected_lang=detected_lang_for_tts)


        except KeyboardInterrupt:
            print("\n[EXIT] Exiting by Ctrl-C")
            break
        except Exception as e:
            print(f"\n[ERROR] Unhandled Error: {e}")
            continue

if __name__ == "__main__":
    print("[SETUP] Setup check: collections and embeddings...")
    check_vector_indexes()
    test_dbref_resolution()
    
    # Optional: Skip heavy embedding operations if they're already done
    setup_choice = input("Run embedding setup (create/update embeddings)? (y/n, default n): ").strip().lower()
    if setup_choice == 'y':
        create_hospital_embeddings()
        create_pharmacy_embeddings()
    
    main_system()