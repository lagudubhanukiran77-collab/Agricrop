"""
Intelligent Alert System Service
Scans field readings and environmental parameters to issue severity-coded alerts.
Ensures moisture readings match field cards exactly.
Severities: Critical, High, Medium, Low
"""

from database.db import db
from database.models import Alert, Field
from services.agronomic_engine import SOIL_PROPERTIES

def evaluate_and_generate_alerts():
    """
    Scans all registered fields and their latest environmental data,
    generating new unresolved alerts matching field readings.
    """
    fields = Field.query.all()
    generated_alerts = []

    for field in fields:
        field_dict = field.to_dict()
        env_dict = field_dict.get("latest_environment")

        if not env_dict:
            continue

        soil_type = field.soil_type
        soil_props = SOIL_PROPERTIES.get(soil_type, SOIL_PROPERTIES["Loamy"])
        
        # Use exact latest environment moisture reading
        moisture = env_dict.get("soil_moisture_pct", 25.0)
        temp = env_dict.get("temperature_c", 25.0)
        rain_prob = env_dict.get("rain_probability_pct", 0.0)
        rainfall_mm = env_dict.get("rainfall_mm", 0.0)

        # 1. Critical Water Stress Alert
        if moisture <= soil_props["wilting_point"] + 2.0:
            msg = f"Soil moisture in '{field.name}' is at {moisture}%, approaching wilting point ({soil_props['wilting_point']}%). Severe crop stress risk!"
            alert = create_alert_if_new(field.id, f"CRITICAL: Severe Crop Water Stress ({moisture}%)", msg, "Critical")
            if alert: generated_alerts.append(alert)

        # 2. Low Soil Moisture Warning
        elif moisture < soil_props["mad_threshold"]:
            msg = f"Soil moisture in '{field.name}' ({moisture}%) dropped below optimal threshold ({soil_props['mad_threshold']}%)."
            alert = create_alert_if_new(field.id, f"HIGH: Low Soil Moisture Detected ({moisture}%)", msg, "High")
            if alert: generated_alerts.append(alert)

        # 3. Rain Postponement Alert
        if rain_prob >= 75.0 and rainfall_mm >= 5.0:
            msg = f"Heavy rain ({rainfall_mm}mm, {rain_prob}% prob) forecast for '{field.name}'. Scheduled irrigation postponed to conserve water."
            alert = create_alert_if_new(field.id, "INFO: Heavy Rainfall Postponement", msg, "Medium")
            if alert: generated_alerts.append(alert)

        # 4. Heat Stress Alert
        if temp >= 36.0:
            msg = f"Extreme temperature ({temp}°C) recorded at '{field.name}'. High evapotranspiration expected."
            alert = create_alert_if_new(field.id, "HIGH: Extreme Temperature Alert", msg, "High")
            if alert: generated_alerts.append(alert)

        # 5. Limited Water Storage Warning
        if field.available_water_liters < (field.area_hectares * 5000.0):
            msg = f"Water reservoir for '{field.name}' is low ({field.available_water_liters} Liters remaining). Rationing advised."
            alert = create_alert_if_new(field.id, "MEDIUM: Water Storage Low", msg, "Medium")
            if alert: generated_alerts.append(alert)

    db.session.commit()
    return generated_alerts

def create_alert_if_new(field_id, title, message, severity):
    # Check if unresolved alert with same title already exists for this field
    existing = Alert.query.filter_by(field_id=field_id, title=title, is_resolved=False).first()
    if not existing:
        alert = Alert(
            field_id=field_id,
            title=title,
            message=message,
            severity=severity,
            is_resolved=False
        )
        db.session.add(alert)
        return alert
    return None
