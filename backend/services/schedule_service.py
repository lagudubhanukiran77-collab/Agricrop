"""
Smart Irrigation Schedule Service
Generates actionable, multi-field irrigation schedules prioritized by crop stress,
water availability, and optimal time windows.
"""

from datetime import datetime, timedelta
from services.hybrid_decision_engine import analyze_field_irrigation

def generate_smart_schedule(fields):
    """
    Given a list of field models, evaluates current state and generates
    an actionable irrigation schedule sorted by priority.
    """
    schedule_items = []

    for field in fields:
        field_dict = field.to_dict()
        crop_dict = field_dict.get("crop")
        env_dict = field_dict.get("latest_environment")

        if not env_dict:
            # Fallback default env data if not recorded yet
            env_dict = {
                "soil_moisture_pct": 22.0, "temperature_c": 30.0,
                "humidity_pct": 45.0, "rainfall_mm": 0.0, "rain_probability_pct": 10.0,
                "wind_speed_kmh": 6.0, "days_since_last_irrigation": 3
            }

        analysis = analyze_field_irrigation(field_dict, env_dict, crop_dict)

        decision = analysis["decision"]
        if decision in ["Irrigate Now", "Irrigate Later"]:
            now = datetime.now()
            if decision == "Irrigate Now":
                rec_date = now.strftime("%Y-%m-%d")
                rec_time = "Early Morning (05:30 - 07:30)" if analysis["inputs"]["temperature_c"] > 28 else "Evening (17:30 - 19:30)"
            else:
                rec_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
                rec_time = "Morning (06:00 - 08:00)"

            schedule_items.append({
                "field_id": field.id,
                "field_name": field.name,
                "crop_name": crop_dict.get("crop_name", "Crop") if crop_dict else "Crop",
                "recommended_date": rec_date,
                "recommended_time": rec_time,
                "duration_minutes": analysis["recommended_duration_mins"],
                "estimated_water_liters": analysis["estimated_water_liters"],
                "priority": analysis["priority_level"],
                "stress_score": analysis["stress_score"],
                "decision": decision,
                "reason": f"Soil moisture at {env_dict.get('soil_moisture_pct')}% with stress score {analysis['stress_score']}/100."
            })

    # Sort schedule items: Critical -> High -> Medium -> Low, then by highest stress_score
    priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    schedule_items.sort(key=lambda x: (priority_order.get(x["priority"], 4), -x["stress_score"]))

    return schedule_items
