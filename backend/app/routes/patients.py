import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from bson import ObjectId
from app.database import health_records_collection, uploaded_reports_collection, doctor_notes_collection
from app.models.health_record import HealthRecordCreate, HealthRecordResponse, UploadedReportResponse
from app.models.doctor_note import DoctorNoteResponse
from app.services.auth_service import require_role
from app.services.health_ai import check_alerts, calculate_risk_score
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.post("/health-records", response_model=HealthRecordResponse)
async def add_health_record(
    record: HealthRecordCreate,
    current_user: dict = Depends(require_role("patient"))
):
    record_doc = {
        "patient_id": current_user["id"],
        "systolic_bp": record.systolic_bp,
        "diastolic_bp": record.diastolic_bp,
        "sugar_level": record.sugar_level,
        "weight": record.weight,
        "heart_rate": record.heart_rate,
        "temperature": record.temperature,
        "symptoms": record.symptoms,
        "notes": record.notes,
        "created_at": datetime.utcnow().isoformat(),
    }

    # Check for alerts
    alerts = check_alerts(record_doc)
    record_doc["alerts"] = alerts

    result = health_records_collection.insert_one(record_doc)

    return HealthRecordResponse(
        id=str(result.inserted_id),
        patient_id=current_user["id"],
        systolic_bp=record.systolic_bp,
        diastolic_bp=record.diastolic_bp,
        sugar_level=record.sugar_level,
        weight=record.weight,
        heart_rate=record.heart_rate,
        temperature=record.temperature,
        symptoms=record.symptoms,
        notes=record.notes,
        alerts=alerts,
        created_at=record_doc["created_at"],
    )


@router.get("/health-records", response_model=List[HealthRecordResponse])
async def get_health_records(current_user: dict = Depends(require_role("patient"))):
    records = list(
        health_records_collection.find({"patient_id": current_user["id"]})
        .sort("created_at", -1)
    )
    return [
        HealthRecordResponse(
            id=str(r["_id"]),
            patient_id=r["patient_id"],
            systolic_bp=r.get("systolic_bp"),
            diastolic_bp=r.get("diastolic_bp"),
            sugar_level=r.get("sugar_level"),
            weight=r.get("weight"),
            heart_rate=r.get("heart_rate"),
            temperature=r.get("temperature"),
            symptoms=r.get("symptoms"),
            notes=r.get("notes"),
            alerts=r.get("alerts", []),
            created_at=r["created_at"],
        )
        for r in records
    ]


@router.get("/risk-assessment")
async def get_risk_assessment(current_user: dict = Depends(require_role("patient"))):
    records = list(
        health_records_collection.find({"patient_id": current_user["id"]})
        .sort("created_at", -1)
        .limit(10)
    )
    return calculate_risk_score(records)


@router.post("/upload-report", response_model=UploadedReportResponse)
async def upload_report(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("patient"))
):
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and image files are allowed")

    # Save file
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Save record
    doc = {
        "patient_id": current_user["id"],
        "filename": unique_name,
        "original_name": file.filename,
        "file_path": file_path,
        "content_type": file.content_type,
        "upload_date": datetime.utcnow().isoformat(),
    }
    result = uploaded_reports_collection.insert_one(doc)

    return UploadedReportResponse(
        id=str(result.inserted_id),
        patient_id=current_user["id"],
        filename=unique_name,
        original_name=file.filename,
        upload_date=doc["upload_date"],
    )


@router.get("/reports", response_model=List[UploadedReportResponse])
async def get_reports(current_user: dict = Depends(require_role("patient"))):
    reports = list(
        uploaded_reports_collection.find({"patient_id": current_user["id"]})
        .sort("upload_date", -1)
    )
    return [
        UploadedReportResponse(
            id=str(r["_id"]),
            patient_id=r["patient_id"],
            filename=r["filename"],
            original_name=r["original_name"],
            upload_date=r["upload_date"],
        )
        for r in reports
    ]


@router.get("/prescriptions", response_model=List[DoctorNoteResponse])
async def get_prescriptions(current_user: dict = Depends(require_role("patient"))):
    from app.database import users_collection
    notes = list(
        doctor_notes_collection.find({"patient_id": current_user["id"]})
        .sort("created_at", -1)
    )
    result = []
    for n in notes:
        doctor = users_collection.find_one({"_id": ObjectId(n["doctor_id"])})
        result.append(DoctorNoteResponse(
            id=str(n["_id"]),
            doctor_id=n["doctor_id"],
            doctor_name=doctor["name"] if doctor else "Unknown",
            patient_id=n["patient_id"],
            prescription=n.get("prescription"),
            diagnosis=n.get("diagnosis"),
            notes=n.get("notes"),
            follow_up_date=n.get("follow_up_date"),
            created_at=n["created_at"],
        ))
    return result
