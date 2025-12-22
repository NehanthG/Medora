import os
import certifi
from pymongo import MongoClient
from bson.dbref import DBRef
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import uuid
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Replace hardcoded credentials with environment variables
MONGO_URI = os.getenv('MONGO_URI')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

if not MONGO_URI or not GROQ_API_KEY:
    raise ValueError("Missing required environment variables. Please check .env file")

os.environ["TOKENIZERS_PARALLELISM"] = "false"

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

hospital_db = client["rag_db"]
hospital_collection = hospital_db["documents"]
appointments_collection = hospital_db["appointments"]  # ✅ New collection for appointments

pharma_db = client["PharmaDB"]
medicines_collection = pharma_db["medicines"]
pharmacies_collection = pharma_db["pharmacies"]


hospital_memory = ConversationBufferWindowMemory(
    k=10,
    memory_key="chat_history",
    output_key="answer",
    return_messages=True
)

pharmacy_memory = ConversationBufferWindowMemory(
    k=10,
    memory_key="chat_history",
    output_key="answer",
    return_messages=True
)

class AppointmentBooking:
    """Handle all appointment booking operations"""

    @staticmethod
    def book_appointment(doctor_id, patient_name, patient_phone, patient_email, appointment_date, appointment_time,
                         reason="General consultation"):
        """
        Book an appointment with a doctor

        Args:
            doctor_id (str): MongoDB ObjectId of the doctor
            patient_name (str): Patient's full name
            patient_phone (str): Patient's phone number
            patient_email (str): Patient's email address
            appointment_date (str): Date in YYYY-MM-DD format
            appointment_time (str): Time in HH:MM format
            reason (str): Reason for appointment

        Returns:
            dict: Booking result with status and details
        """
        try:
            if isinstance(doctor_id, str):
                doctor_id = ObjectId(doctor_id)
            doctor = hospital_collection.find_one({"_id": doctor_id})
            if not doctor:
                return {
                    "success": False,
                    "message": "Doctor not found",
                    "appointment_id": None
                }
            is_available = doctor.get("isAvailable", True)
            if not is_available:
                return {
                    "success": False,
                    "message": f"Dr. {doctor.get('doctor_name', 'Unknown')} is currently not available for appointments",
                    "appointment_id": None
                }
            try:
                appointment_datetime = datetime.strptime(f"{appointment_date} {appointment_time}", "%Y-%m-%d %H:%M")
            except ValueError:
                return {
                    "success": False,
                    "message": "Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time",
                    "appointment_id": None
                }
            if appointment_datetime <= datetime.now():
                return {
                    "success": False,
                    "message": "Appointment must be scheduled for a future date and time",
                    "appointment_id": None
                }
            existing_appointment = appointments_collection.find_one({
                "doctor_id": doctor_id,
                "appointment_datetime": appointment_datetime,
                "status": {"$in": ["scheduled", "confirmed"]}
            })

            if existing_appointment:
                return {
                    "success": False,
                    "message": f"Dr. {doctor.get('doctor_name', 'Unknown')} already has an appointment at {appointment_time} on {appointment_date}",
                    "appointment_id": None
                }

            # Generate unique appointment ID
            appointment_id = str(uuid.uuid4())[:8].upper()

            # Create appointment document
            appointment_doc = {
                "appointment_id": appointment_id,
                "doctor_id": doctor_id,
                "doctor_name": doctor.get("doctor_name", "Unknown"),
                "doctor_specialty": doctor.get("speciality", "General"),
                "doctor_phone": doctor.get("phone", "N/A"),
                "patient_name": patient_name,
                "patient_phone": patient_phone,
                "patient_email": patient_email,
                "appointment_datetime": appointment_datetime,
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "reason": reason,
                "status": "scheduled",  # scheduled, confirmed, completed, cancelled
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }

            # Insert appointment
            appointments_collection.insert_one(appointment_doc)

            return {
                "success": True,
                "message": f"Appointment booked successfully! Appointment ID: {appointment_id}",
                "appointment_id": appointment_id,
                "doctor_name": doctor.get("doctor_name"),
                "appointment_datetime": appointment_datetime.strftime("%B %d, %Y at %I:%M %p"),
                "doctor_phone": doctor.get("phone")
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to book appointment: {str(e)}",
                "appointment_id": None
            }

    @staticmethod
    def cancel_appointment(appointment_id):
        """Cancel an appointment by ID"""
        try:
            result = appointments_collection.update_one(
                {"appointment_id": appointment_id, "status": {"$ne": "cancelled"}},
                {
                    "$set": {
                        "status": "cancelled",
                        "updated_at": datetime.now(),
                        "cancelled_at": datetime.now()
                    }
                }
            )

            if result.matched_count > 0:
                appointment = appointments_collection.find_one({"appointment_id": appointment_id})
                return {
                    "success": True,
                    "message": f"Appointment {appointment_id} cancelled successfully",
                    "appointment_details": appointment
                }
            else:
                return {
                    "success": False,
                    "message": f"Appointment {appointment_id} not found or already cancelled"
                }

        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to cancel appointment: {str(e)}"
            }

    @staticmethod
    def get_appointment_status(appointment_id):
        """Get appointment details by ID"""
        try:
            appointment = appointments_collection.find_one({"appointment_id": appointment_id})

            if appointment:
                return {
                    "success": True,
                    "appointment": {
                        "id": appointment["appointment_id"],
                        "doctor_name": appointment["doctor_name"],
                        "patient_name": appointment["patient_name"],
                        "date_time": appointment["appointment_datetime"].strftime("%B %d, %Y at %I:%M %p"),
                        "reason": appointment["reason"],
                        "status": appointment["status"],
                        "doctor_phone": appointment.get("doctor_phone", "N/A")
                    }
                }
            else:
                return {
                    "success": False,
                    "message": f"Appointment {appointment_id} not found"
                }

        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to retrieve appointment: {str(e)}"
            }

    @staticmethod
    def get_doctor_availability(doctor_id, date):
        """Check doctor's availability for a specific date"""
        try:
            if isinstance(doctor_id, str):
                doctor_id = ObjectId(doctor_id)

            doctor = hospital_collection.find_one({"_id": doctor_id})
            if not doctor:
                return {"success": False, "message": "Doctor not found"}

            if not doctor.get("isAvailable", True):
                return {
                    "success": True,
                    "available": False,
                    "message": f"Dr. {doctor.get('doctor_name')} is currently not accepting appointments"
                }

            # Get existing appointments for the date
            start_date = datetime.strptime(date, "%Y-%m-%d")
            end_date = start_date + timedelta(days=1)

            booked_slots = list(appointments_collection.find({
                "doctor_id": doctor_id,
                "appointment_datetime": {"$gte": start_date, "$lt": end_date},
                "status": {"$in": ["scheduled", "confirmed"]}
            }))

            booked_times = [apt["appointment_time"] for apt in booked_slots]

            # Define available time slots (9 AM to 5 PM, 1-hour slots)
            available_slots = []
            for hour in range(9, 17):  # 9 AM to 5 PM
                time_slot = f"{hour:02d}:00"
                if time_slot not in booked_times:
                    available_slots.append(time_slot)

            return {
                "success": True,
                "available": True,
                "doctor_name": doctor.get("doctor_name"),
                "date": date,
                "available_slots": available_slots,
                "booked_slots": booked_times
            }

        except Exception as e:
            return {"success": False, "message": f"Error checking availability: {str(e)}"}


# ------------------------------------------------------------------
# 5. DBREF RESOLUTION UTILITIES
# ------------------------------------------------------------------
def resolve_dbref(db_client, dbref_obj):
    """Resolve a MongoDB DBRef to get the actual referenced document"""
    if not isinstance(dbref_obj, DBRef):
        return None

    try:
        database_name = dbref_obj.database or pharma_db.name
        collection_name = dbref_obj.collection
        ref_id = dbref_obj.id

        target_db = db_client[database_name]
        target_collection = target_db[collection_name]
        referenced_doc = target_collection.find_one({"_id": ref_id})

        return referenced_doc

    except Exception as e:
        print(f"Warning: Could not resolve DBRef: {e}")
        return None


def get_safe_field_value(doc, possible_names, default="N/A"):
    """Get field value using multiple possible field names"""
    for name in possible_names:
        if name in doc:
            return doc[name]
    return default


def inspect_document_structure(collection, collection_name):
    """Inspect and display the structure of documents in a collection"""
    print(f"\n🔍 Inspecting {collection_name} document structure...")

    sample_doc = collection.find_one()
    if not sample_doc:
        print(f"❌ No documents found in {collection_name}")
        return None

    print(f"📋 Available fields in {collection_name}:")
    for key, value in sample_doc.items():
        if isinstance(value, DBRef):
            print(f"  • {key}: DBRef = DBRef('{value.collection}', ObjectId('{value.id}'))")
        else:
            print(f"  • {key}: {type(value).__name__} = {str(value)[:50]}...")

    return sample_doc


# ------------------------------------------------------------------
# 6. EMBEDDING CREATION (same as before but with isAvailable info)
# ------------------------------------------------------------------
def create_hospital_embeddings():
    """Create embeddings for hospital/doctor documents with booking info"""
    print("\n🏥 HOSPITAL DATA SETUP")
    print("=" * 50)

    sample_doc = inspect_document_structure(hospital_collection, "hospital/doctors")
    if not sample_doc:
        return

    docs = list(hospital_collection.find())
    print(f"\n🔄 Processing {len(docs)} hospital documents...")

    for doc in docs:
        doctor_name = get_safe_field_value(doc, [
            'doctor_name', 'doctorName', 'name', 'fullName', 'full_name'
        ])
        specialty = get_safe_field_value(doc, [
            'speciality', 'specialty', 'specialization', 'department'
        ])
        phone = get_safe_field_value(doc, [
            'phone', 'phoneNumber', 'phone_number', 'contact', 'mobile'
        ])
        shift = get_safe_field_value(doc, [
            'shift', 'working_hours', 'schedule', 'timing'
        ])
        hospital_name = get_safe_field_value(doc, [
            'hospital_name', 'hospitalName', 'hospital', 'clinic'
        ])
        hospital_address = get_safe_field_value(doc, [
            'hospital_address', 'hospitalAddress', 'address', 'location'
        ])
        is_available = doc.get('isAvailable', True)  # ✅ Get booking availability

        # ✅ Include booking information in embeddings
        availability_text = "Available for booking" if is_available else "Not available for booking"

        text_content = f"""Doctor: {doctor_name}
Speciality: {specialty}
Phone: {phone}
Shift: {shift}
Hospital: {hospital_name}
Address: {hospital_address}
Booking Status: {availability_text}
Doctor ID: {str(doc['_id'])}"""

        print(f"Processing: Dr. {doctor_name} ({specialty}) - {'✅ Available' if is_available else '❌ Not Available'}")
        embedding = embedding_model.embed_query(text_content)

        hospital_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"text": text_content, "embeddings": embedding}}
        )

    print("✅ All hospital documents updated with embeddings and booking info!")


def create_pharmacy_embeddings():
    """Create embeddings for medicine documents with DBRef resolution (same as before)"""
    print("\n💊 PHARMACY DATA SETUP")
    print("=" * 50)

    sample_doc = inspect_document_structure(medicines_collection, "medicines")
    if not sample_doc:
        return

    docs = list(medicines_collection.find())
    print(f"\n🔄 Processing {len(docs)} medicine documents...")

    for doc in docs:
        # Extract medicine fields (same logic as before)
        medicine_name = get_safe_field_value(doc, ['name', 'medicine_name', 'medicineName'])
        generic_name = get_safe_field_value(doc, ['genericName', 'generic_name'])
        description = get_safe_field_value(doc, ['description', 'details'])
        dosage_form = get_safe_field_value(doc, ['dosageForm', 'dosage_form'])
        manufacturer = get_safe_field_value(doc, ['manufacturer', 'company'])
        quantity = get_safe_field_value(doc, ['quantity', 'qty'])
        expiry_date = get_safe_field_value(doc, ['expiryDate', 'expiry_date'])
        prescription_required = get_safe_field_value(doc, ['prescriptionRequired'])

        # Resolve pharmacy DBRef (same logic as before)
        pharmacy_text = ""
        if 'pharmacy' in doc and isinstance(doc['pharmacy'], DBRef):
            pharmacy_doc = resolve_dbref(client, doc['pharmacy'])
            if pharmacy_doc:
                pharmacy_name = get_safe_field_value(pharmacy_doc, ['name', 'pharmacyName'])
                contact = get_safe_field_value(pharmacy_doc, ['contactNumber', 'phone'])
                address = get_safe_field_value(pharmacy_doc, ['address'])

                pharmacy_text = f"""
Pharmacy Name: {pharmacy_name}
Contact: {contact}
Address: {address}
"""

        text_content = f"""Medicine: {medicine_name}
Generic Name: {generic_name}
Description: {description}
Dosage Form: {dosage_form}
Manufacturer: {manufacturer}
Quantity: {quantity}
Expiry Date: {expiry_date}
Prescription Required: {prescription_required}
{pharmacy_text}
"""

        print(f"Processing: {medicine_name}")
        embedding = embedding_model.embed_query(text_content)

        medicines_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"text": text_content, "embeddings": embedding}}
        )

    print("✅ All medicine documents updated with embeddings and pharmacy data!")


# ------------------------------------------------------------------
# 7. ENHANCED RAG SYSTEMS WITH BOOKING CAPABILITY
# ------------------------------------------------------------------
def create_hospital_rag_system():
    """Create hospital RAG system with booking functionality"""
    try:
        vectorstore = MongoDBAtlasVectorSearch(
            collection=hospital_collection,
            embedding=embedding_model,
            index_name="vector_index",
            text_key="text",
            embedding_key="embeddings",
        )

        llm = ChatGroq(model="gemma2-9b-it", api_key=GROQ_API_KEY)

        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            memory=hospital_memory,
            return_source_documents=True,
            verbose=False,
            combine_docs_chain_kwargs={
                "prompt": PromptTemplate(
                    template="""You are a helpful hospital assistant with appointment booking capabilities. Use the doctor information and chat history to answer questions naturally.

Chat History:
{chat_history}

Doctor Information:
{context}

Current Question: {question}

Instructions:
- Use the chat history to understand context and provide personalized responses
- Provide specific doctor names, specialties, phone numbers, and availability status
- For booking requests, clearly explain the booking process
- Include Doctor ID when mentioning doctors for booking purposes
- Mention if doctors are "Available for booking" or "Not available for booking"
- Guide users on how to book appointments using commands like "book appointment with Dr. [Name]"
- Be helpful and professional

IMPORTANT BOOKING COMMANDS TO MENTION:
- To book: "book appointment with Dr. [Doctor Name] on [YYYY-MM-DD] at [HH:MM]"
- To check: "check appointment status [APPOINTMENT_ID]"
- To cancel: "cancel appointment [APPOINTMENT_ID]"
- Patient details will be collected during booking process

Answer:""",
                    input_variables=["chat_history", "context", "question"]
                )
            }
        )

        print("✅ Hospital RAG system with booking capability created!")
        return qa_chain, vectorstore

    except Exception as e:
        print(f"❌ Hospital RAG system creation failed: {e}")
        return None, None


def create_pharmacy_rag_system():
    """Create pharmacy RAG system (same as before)"""
    try:
        vectorstore = MongoDBAtlasVectorSearch(
            collection=medicines_collection,
            embedding=embedding_model,
            index_name="medicine_vector_index",
            text_key="text",
            embedding_key="embeddings",
        )

        llm = ChatGroq(model="gemma2-9b-it", api_key=GROQ_API_KEY)

        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            memory=pharmacy_memory,
            return_source_documents=True,
            verbose=False,
            combine_docs_chain_kwargs={
                "prompt": PromptTemplate(
                    template="""You are a helpful pharmacy assistant. Use the medicine/pharmacy information and chat history to answer questions naturally.

Chat History:
{chat_history}

Medicine & Pharmacy Information:
{context}

Current Question: {question}

Guidelines:
- Use chat history to provide personalized responses
- Provide complete medicine details and pharmacy information
- Include contact details and addresses when available
- Be helpful and professional

Answer:""",
                    input_variables=["chat_history", "context", "question"]
                )
            }
        )

        print("✅ Pharmacy RAG system created successfully!")
        return qa_chain, vectorstore

    except Exception as e:
        print(f"❌ Pharmacy RAG system creation failed: {e}")
        return None, None


# ------------------------------------------------------------------
# 8. BOOKING COMMAND PROCESSOR
# ------------------------------------------------------------------
def process_booking_command(query):
    """Process booking-related commands"""
    query_lower = query.lower().strip()

    # Book appointment command
    if query_lower.startswith("book appointment"):
        return handle_appointment_booking(query)

    # Check appointment status
    elif query_lower.startswith("check appointment"):
        return handle_appointment_check(query)

    # Cancel appointment
    elif query_lower.startswith("cancel appointment"):
        return handle_appointment_cancellation(query)

    # Check doctor availability
    elif "availability" in query_lower or "available" in query_lower:
        return handle_availability_check(query)

    return None


def handle_appointment_booking(query):
    """Handle appointment booking command"""
    try:

        print("\n📋 APPOINTMENT BOOKING PROCESS")
        print("=" * 40)

        patient_name = input("👤 Enter your full name: ").strip()
        if not patient_name:
            return "❌ Name is required for booking"

        patient_phone = input("📞 Enter your phone number: ").strip()
        if not patient_phone:
            return "❌ Phone number is required for booking"

        patient_email = input("📧 Enter your email address: ").strip()
        if not patient_email:
            return "❌ Email address is required for booking"
        doctor_name = None
        if "dr." in query.lower():
            parts = query.lower().split("dr.")
            if len(parts) > 1:
                name_part = parts[1].split(" on ")[0].strip()
                doctor_name = name_part

        if not doctor_name:
            return "❌ Please specify the doctor's name in format: 'book appointment with Dr. [Name] on [Date] at [Time]'"
        doctor = hospital_collection.find_one({
            "$or": [
                {"doctor_name": {"$regex": doctor_name, "$options": "i"}},
                {"name": {"$regex": doctor_name, "$options": "i"}}
            ]
        })

        if not doctor:
            return f"❌ Doctor '{doctor_name}' not found. Please check the spelling and try again."

        appointment_date = input("📅 Enter appointment date (YYYY-MM-DD): ").strip()
        appointment_time = input("⏰ Enter appointment time (HH:MM, 24-hour format): ").strip()
        reason = input("🏥 Reason for appointment (optional): ").strip() or "General consultation"

        result = AppointmentBooking.book_appointment(
            doctor_id=doctor["_id"],
            patient_name=patient_name,
            patient_phone=patient_phone,
            patient_email=patient_email,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            reason=reason
        )

        if result["success"]:
            return f"""✅ APPOINTMENT BOOKED SUCCESSFULLY!

📋 Appointment Details:
• Appointment ID: {result['appointment_id']}
• Doctor: {result['doctor_name']}
• Date & Time: {result['appointment_datetime']}
• Patient: {patient_name}
• Phone: {patient_phone}
• Doctor Contact: {result['doctor_phone']}

💡 Save your Appointment ID: {result['appointment_id']}
You can use it to check status or cancel: "check appointment {result['appointment_id']}"
"""
        else:
            return f"❌ Booking failed: {result['message']}"

    except Exception as e:
        return f"❌ Error processing booking: {str(e)}"


def handle_appointment_check(query):
    """Handle appointment status check"""
    try:

        words = query.split()
        appointment_id = None
        for word in words:
            if len(word) == 8 and word.isalnum():
                appointment_id = word.upper()
                break

        if not appointment_id:
            appointment_id = input("🔍 Enter Appointment ID: ").strip().upper()

        if not appointment_id:
            return "❌ Please provide a valid Appointment ID"

        result = AppointmentBooking.get_appointment_status(appointment_id)

        if result["success"]:
            apt = result["appointment"]
            return f"""📋 APPOINTMENT DETAILS

• ID: {apt['id']}
• Doctor: {apt['doctor_name']}
• Patient: {apt['patient_name']}
• Date & Time: {apt['date_time']}
• Reason: {apt['reason']}
• Status: {apt['status'].upper()}
• Doctor Contact: {apt['doctor_phone']}
"""
        else:
            return f"❌ {result['message']}"

    except Exception as e:
        return f"❌ Error checking appointment: {str(e)}"


def handle_appointment_cancellation(query):
    """Handle appointment cancellation"""
    try:
        words = query.split()
        appointment_id = None
        for word in words:
            if len(word) == 8 and word.isalnum():
                appointment_id = word.upper()
                break

        if not appointment_id:
            appointment_id = input("🔍 Enter Appointment ID to cancel: ").strip().upper()

        if not appointment_id:
            return "❌ Please provide a valid Appointment ID"
        confirm = input(f"⚠️ Are you sure you want to cancel appointment {appointment_id}? (yes/no): ").strip().lower()

        if confirm not in ['yes', 'y']:
            return "❌ Appointment cancellation aborted"

        result = AppointmentBooking.cancel_appointment(appointment_id)

        if result["success"]:
            return f"✅ Appointment {appointment_id} cancelled successfully"
        else:
            return f"❌ {result['message']}"

    except Exception as e:
        return f"❌ Error cancelling appointment: {str(e)}"


def handle_availability_check(query):
    """Handle doctor availability check"""
    try:
        doctor_name = input("👨‍⚕️ Enter doctor's name: ").strip()
        check_date = input("📅 Enter date to check (YYYY-MM-DD): ").strip()

        if not doctor_name or not check_date:
            return "❌ Both doctor name and date are required"
        doctor = hospital_collection.find_one({
            "$or": [
                {"doctor_name": {"$regex": doctor_name, "$options": "i"}},
                {"name": {"$regex": doctor_name, "$options": "i"}}
            ]
        })

        if not doctor:
            return f"❌ Doctor '{doctor_name}' not found"

        result = AppointmentBooking.get_doctor_availability(doctor["_id"], check_date)

        if result["success"] and result["available"]:
            available_slots = ", ".join(result["available_slots"])
            booked_slots = ", ".join(result["booked_slots"]) if result["booked_slots"] else "None"

            return f"""📅 AVAILABILITY FOR DR. {result['doctor_name']} on {check_date}

✅ Available Slots: {available_slots or "No slots available"}
❌ Booked Slots: {booked_slots}

💡 To book: "book appointment with Dr. {result['doctor_name']} on {check_date} at [TIME]"
"""
        else:
            return f"❌ {result.get('message', 'Doctor not available')}"

    except Exception as e:
        return f"❌ Error checking availability: {str(e)}"
def main_system():
    print("\n🚀 Starting Enhanced RAG Assistant with Appointment Booking...")

    # Test connection
    try:
        client.admin.command('ping')
        print("✅ MongoDB Atlas connection successful")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return
    hospital_qa, hospital_vectorstore = create_hospital_rag_system()
    pharmacy_qa, pharmacy_vectorstore = create_pharmacy_rag_system()

    if not hospital_qa or not pharmacy_qa:
        print("❌ Failed to initialize RAG systems")
        return

    print("\n🤖 Enhanced Hospital & Pharmacy Assistant with Appointment Booking")
    print("🧠 Features: Memory + DBRef Resolution + Doctor Booking + Pharmacy Info")
    print("\n💡 Available Commands:")
    print("🏥 Hospital: 'I need a cardiologist' → 'book appointment with Dr. [Name] on 2025-09-20 at 10:00'")
    print("💊 Pharmacy: 'I'm looking for paracetamol'")
    print("📋 Booking: 'book appointment with Dr. Smith on 2025-09-20 at 14:00'")
    print("📊 Status: 'check appointment ABC12345'")
    print("❌ Cancel: 'cancel appointment ABC12345'")
    print("📅 Availability: 'check Dr. Smith availability'")
    print("-" * 80)

    while True:
        try:
            query = input("\n🔍 Ask anything or use booking commands: ")
            if query.lower() in ['exit', 'quit', 'bye']:
                print("\n👋 Goodbye! Thanks for using the enhanced assistant!")
                break

            print("\n" + "=" * 60)
            booking_result = process_booking_command(query)
            if booking_result:
                print(booking_result)
                continue
            pharmacy_keywords = [
                'medicine', 'drug', 'pharmacy', 'price', 'stock', 'expiry',
                'tablet', 'capsule', 'syrup', 'injection', 'prescription',
                'paracetamol', 'aspirin', 'antibiotic', 'vitamin', 'paracetomol'
            ]
            hospital_keywords = [
                'doctor', 'physician', 'specialist', 'appointment', 'shift',
                'schedule', 'cardiologist', 'neurologist', 'surgeon', 'available'
            ]

            is_pharmacy_query = any(keyword in query.lower() for keyword in pharmacy_keywords)
            is_hospital_query = any(keyword in query.lower() for keyword in hospital_keywords)

            if is_pharmacy_query and not is_hospital_query:
                print("🔍 Searching medicine database...")
                result = pharmacy_qa({"question": query})
                print(f"\n💊 Pharmacy Assistant: {result['answer']}")

            elif is_hospital_query and not is_pharmacy_query:
                print("🔍 Searching hospital database...")
                result = hospital_qa({"question": query})
                print(f"\n🏥 Hospital Assistant: {result['answer']}")
                print(
                    f"\n💡 Booking Tip: To book an appointment, use: 'book appointment with Dr. [Name] on [Date] at [Time]'")

            else:
                print("🔍 Searching both databases...")
                hospital_result = hospital_qa({"question": query})
                pharmacy_result = pharmacy_qa({"question": query})
                print(f"\n🏥 Hospital Info: {hospital_result['answer']}")
                print(f"\n💊 Pharmacy Info: {pharmacy_result['answer']}")

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("🔄 Continuing...")
            continue

if __name__ == "__main__":
    print("🔧 Setting up Enhanced RAG System with Appointment Booking...")

    create_hospital_embeddings()
    create_pharmacy_embeddings()
    main_system()