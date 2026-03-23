from pydantic import BaseModel
from typing import Optional


class DoctorNoteCreate(BaseModel):
    prescription: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None


class DoctorNoteResponse(BaseModel):
    id: str
    doctor_id: str
    doctor_name: str
    patient_id: str
    prescription: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    created_at: str
