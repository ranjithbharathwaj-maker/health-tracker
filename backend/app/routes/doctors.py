from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from bson import ObjectId
from app.database import (
    users_collection,
    health_records_collection,
    doctor_notes_collection,
)
from app.models.health_record import HealthRecordResponse
from app.models.doctor_note import DoctorNoteCreate, DoctorNoteResponse
from app.models.user import UserResponse
from app.services.auth_service import require_role
from app.services.health_ai import check_alerts, calculate_risk_score

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get("/patients", response_model=List[UserResponse])
async def get_all_patients(
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user: dict = Depends(require_role("doctor"))
):
    query = {"role": "patient"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    patients = list(users_collection.find(query))
    return [
        UserResponse(
            id=str(p["_id"]),
            name=p["name"],
            email=p["email"],
            role=p["role"],
            phone=p.get("phone"),
            age=p.get("age"),
            gender=p.get("gender"),
        )
        for p in patients
    ]


@router.get("/patients/{patient_id}")
async def get_patient_detail(
    patient_id: str,
    current_user: dict = Depends(require_role("doctor"))
):
    patient = users_collection.find_one({"_id": ObjectId(patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Get health records
    records = list(
        health_records_collection.find({"patient_id": patient_id})
        .sort("created_at", -1)
    )

    # Get doctor notes
    notes = list(
        doctor_notes_collection.find({"patient_id": patient_id})
        .sort("created_at", -1)
    )

    # Risk assessment
    risk = calculate_risk_score(records)

    records_response = [
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

    notes_response = []
    for n in notes:
        doctor = users_collection.find_one({"_id": ObjectId(n["doctor_id"])})
        notes_response.append(DoctorNoteResponse(
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

    return {
        "patient": UserResponse(
            id=str(patient["_id"]),
            name=patient["name"],
            email=patient["email"],
            role=patient["role"],
            phone=patient.get("phone"),
            age=patient.get("age"),
            gender=patient.get("gender"),
        ),
        "health_records": records_response,
        "doctor_notes": notes_response,
        "risk_assessment": risk,
    }


@router.post("/patients/{patient_id}/notes", response_model=DoctorNoteResponse)
async def add_doctor_note(
    patient_id: str,
    note: DoctorNoteCreate,
    current_user: dict = Depends(require_role("doctor"))
):
    # Verify patient exists
    patient = users_collection.find_one({"_id": ObjectId(patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    note_doc = {
        "doctor_id": current_user["id"],
        "patient_id": patient_id,
        "prescription": note.prescription,
        "diagnosis": note.diagnosis,
        "notes": note.notes,
        "follow_up_date": note.follow_up_date,
        "created_at": datetime.utcnow().isoformat(),
    }

    result = doctor_notes_collection.insert_one(note_doc)

    return DoctorNoteResponse(
        id=str(result.inserted_id),
        doctor_id=current_user["id"],
        doctor_name=current_user["name"],
        patient_id=patient_id,
        prescription=note.prescription,
        diagnosis=note.diagnosis,
        notes=note.notes,
        follow_up_date=note.follow_up_date,
        created_at=note_doc["created_at"],
    )


@router.get("/alerts")
async def get_alerts(current_user: dict = Depends(require_role("doctor"))):
    """Get all patients with abnormal health values."""
    patients = list(users_collection.find({"role": "patient"}))
    alerts_list = []

    for patient in patients:
        pid = str(patient["_id"])
        # Get most recent record
        latest = health_records_collection.find_one(
            {"patient_id": pid},
            sort=[("created_at", -1)]
        )
        if latest:
            alerts = check_alerts(latest)
            if alerts:
                risk = calculate_risk_score(
                    list(health_records_collection.find({"patient_id": pid}).sort("created_at", -1).limit(10))
                )
                alerts_list.append({
                    "patient": UserResponse(
                        id=pid,
                        name=patient["name"],
                        email=patient["email"],
                        role=patient["role"],
                        phone=patient.get("phone"),
                        age=patient.get("age"),
                        gender=patient.get("gender"),
                    ),
                    "alerts": alerts,
                    "risk_assessment": risk,
                    "latest_record_date": latest["created_at"],
                })

    # Sort by risk score descending
    alerts_list.sort(key=lambda x: x["risk_assessment"]["score"], reverse=True)
    return alerts_list
