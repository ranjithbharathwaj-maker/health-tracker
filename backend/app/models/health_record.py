from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HealthRecordCreate(BaseModel):
    systolic_bp: Optional[int] = None       # mmHg
    diastolic_bp: Optional[int] = None      # mmHg
    sugar_level: Optional[float] = None     # mg/dL
    weight: Optional[float] = None          # kg
    heart_rate: Optional[int] = None        # bpm
    temperature: Optional[float] = None     # °F
    symptoms: Optional[str] = None
    notes: Optional[str] = None


class HealthRecordResponse(BaseModel):
    id: str
    patient_id: str
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    sugar_level: Optional[float] = None
    weight: Optional[float] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    alerts: List[str] = []
    created_at: str


class UploadedReportResponse(BaseModel):
    id: str
    patient_id: str
    filename: str
    original_name: str
    upload_date: str
