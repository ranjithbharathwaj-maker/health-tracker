from pymongo import MongoClient
from app.config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
health_records_collection = db["health_records"]
doctor_notes_collection = db["doctor_notes"]
uploaded_reports_collection = db["uploaded_reports"]

# Create indexes
users_collection.create_index("email", unique=True)
health_records_collection.create_index("patient_id")
doctor_notes_collection.create_index("patient_id")
uploaded_reports_collection.create_index("patient_id")
