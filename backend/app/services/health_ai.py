"""
AI-Based Health Risk Prediction Service
Analyzes health metrics and provides risk assessments and recommendations.
"""
from typing import List, Dict, Optional


def check_alerts(record: dict) -> List[str]:
    """Check a single health record for abnormal values and return alert messages."""
    alerts = []

    systolic = record.get("systolic_bp")
    diastolic = record.get("diastolic_bp")
    if systolic is not None:
        if systolic >= 180:
            alerts.append("🚨 CRITICAL: Systolic BP is dangerously high (≥180 mmHg) — Hypertensive Crisis!")
        elif systolic >= 140:
            alerts.append("⚠️ HIGH: Systolic BP elevated (≥140 mmHg) — Stage 2 Hypertension")
        elif systolic >= 130:
            alerts.append("⚠️ ELEVATED: Systolic BP slightly high (≥130 mmHg) — Stage 1 Hypertension")
        elif systolic < 90:
            alerts.append("⚠️ LOW: Systolic BP is low (<90 mmHg) — Hypotension")

    if diastolic is not None:
        if diastolic >= 120:
            alerts.append("🚨 CRITICAL: Diastolic BP dangerously high (≥120 mmHg)")
        elif diastolic >= 90:
            alerts.append("⚠️ HIGH: Diastolic BP elevated (≥90 mmHg)")
        elif diastolic < 60:
            alerts.append("⚠️ LOW: Diastolic BP is low (<60 mmHg)")

    sugar = record.get("sugar_level")
    if sugar is not None:
        if sugar >= 300:
            alerts.append("🚨 CRITICAL: Blood sugar dangerously high (≥300 mg/dL)")
        elif sugar >= 200:
            alerts.append("⚠️ HIGH: Blood sugar very elevated (≥200 mg/dL) — Possible Diabetes")
        elif sugar >= 140:
            alerts.append("⚠️ ELEVATED: Blood sugar above normal (≥140 mg/dL) — Pre-diabetic range")
        elif sugar < 70:
            alerts.append("⚠️ LOW: Blood sugar is low (<70 mg/dL) — Hypoglycemia risk")

    heart_rate = record.get("heart_rate")
    if heart_rate is not None:
        if heart_rate > 120:
            alerts.append("⚠️ HIGH: Heart rate elevated (>120 bpm) — Tachycardia")
        elif heart_rate < 50:
            alerts.append("⚠️ LOW: Heart rate below normal (<50 bpm) — Bradycardia")

    temperature = record.get("temperature")
    if temperature is not None:
        if temperature >= 103:
            alerts.append("🚨 CRITICAL: High fever (≥103°F)")
        elif temperature >= 100.4:
            alerts.append("⚠️ ELEVATED: Fever detected (≥100.4°F)")
        elif temperature < 95:
            alerts.append("⚠️ LOW: Body temperature too low (<95°F) — Hypothermia risk")

    return alerts


def calculate_risk_score(records: List[dict]) -> Dict:
    """
    Calculate an overall health risk score based on recent health records.
    Returns a score from 0-100, risk level, and recommendations.
    """
    if not records:
        return {
            "score": 0,
            "level": "unknown",
            "message": "No health data available for assessment.",
            "recommendations": ["Please add health records for an accurate assessment."]
        }

    risk_points = 0
    total_checks = 0
    recommendations = []

    # Analyze the most recent 10 records
    recent = records[:10]

    bp_highs = 0
    sugar_highs = 0
    hr_issues = 0

    for r in recent:
        systolic = r.get("systolic_bp")
        if systolic is not None:
            total_checks += 1
            if systolic >= 140:
                risk_points += 3
                bp_highs += 1
            elif systolic >= 130:
                risk_points += 1.5
                bp_highs += 1

        sugar = r.get("sugar_level")
        if sugar is not None:
            total_checks += 1
            if sugar >= 200:
                risk_points += 3
                sugar_highs += 1
            elif sugar >= 140:
                risk_points += 1.5
                sugar_highs += 1

        hr = r.get("heart_rate")
        if hr is not None:
            total_checks += 1
            if hr > 100 or hr < 55:
                risk_points += 1
                hr_issues += 1

    if bp_highs > len(recent) * 0.5:
        recommendations.append("Consistently high blood pressure detected. Consult a cardiologist.")
        recommendations.append("Reduce salt intake and increase physical activity.")

    if sugar_highs > len(recent) * 0.5:
        recommendations.append("Frequent high blood sugar readings. Consider diabetes screening.")
        recommendations.append("Monitor carbohydrate intake and maintain regular meal times.")

    if hr_issues > len(recent) * 0.3:
        recommendations.append("Irregular heart rate patterns observed. Consider a cardiac evaluation.")

    if not recommendations:
        recommendations.append("Your recent health metrics look good! Keep maintaining a healthy lifestyle.")

    # Calculate score (0-100)
    max_possible = total_checks * 3 if total_checks > 0 else 1
    score = min(100, int((risk_points / max_possible) * 100))

    if score >= 70:
        level = "high"
        message = "High health risk detected. Immediate medical consultation recommended."
    elif score >= 40:
        level = "moderate"
        message = "Moderate health risk. Please monitor your vitals regularly."
    elif score > 0:
        level = "low"
        message = "Low health risk. Continue maintaining healthy habits."
    else:
        level = "healthy"
        message = "No significant risk factors detected. Great job!"

    return {
        "score": score,
        "level": level,
        "message": message,
        "recommendations": recommendations
    }
