import json
from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Field, Recommendation, EnvironmentalData
from services.hybrid_decision_engine import analyze_field_irrigation
from services.explanation_service import generate_recommendation_explanation
from services.weather_service import fetch_live_field_weather

analysis_bp = Blueprint('analysis_bp', __name__)

@analysis_bp.route('/api/analyze-irrigation', methods=['POST'], strict_slashes=False)
@analysis_bp.route('/api/analyze-irrigation/', methods=['POST'], strict_slashes=False)
def analyze_irrigation():
    """
    Core Workflow Endpoint:
    Receives field + env params -> Fetches Live Weather -> Hybrid Decision Engine -> Explainable AI -> Water calculation -> Database entry
    """
    data = request.get_json() or {}
    field_id = data.get('field_id')

    if field_id:
        field = Field.query.get(field_id)
        if field:
            field_dict = field.to_dict()
            crop_dict = field_dict.get('crop') or {}
            
            # Fetch live weather for the field's location
            live_w = fetch_live_field_weather(field.id, field.latitude, field.longitude, force_refresh=False)
        else:
            field_dict = {
                "name": f"Field #{field_id}",
                "area_hectares": float(data.get("area_hectares", 1.0)),
                "soil_type": data.get("soil_type", "Loamy"),
                "irrigation_method": data.get("irrigation_method", "Drip"),
                "available_water_liters": float(data.get("available_water_liters", 50000.0))
            }
            crop_dict = {
                "crop_name": data.get("crop_name", "Wheat"),
                "growth_stage": data.get("growth_stage", "Mid-Season")
            }
            live_w = {}
        
        # Override env data if explicitly passed in body, otherwise combine soil moisture with live weather
        latest_env = field_dict.get('latest_environment') or {}
        soil_moisture = float(data.get('soil_moisture_pct')) if 'soil_moisture_pct' in data else float(latest_env.get('soil_moisture_pct', 24.0))

        env_dict = {
            "soil_moisture_pct": soil_moisture,
            "temperature_c": float(data.get("temperature_c")) if 'temperature_c' in data else float(live_w.get("temperature_c", latest_env.get("temperature_c", 29.0))),
            "humidity_pct": float(data.get("humidity_pct")) if 'humidity_pct' in data else float(live_w.get("humidity_pct", latest_env.get("humidity_pct", 50.0))),
            "rainfall_mm": float(data.get("rainfall_mm")) if 'rainfall_mm' in data else float(live_w.get("rainfall_mm", latest_env.get("rainfall_mm", 0.0))),
            "rain_probability_pct": float(data.get("rain_probability_pct")) if 'rain_probability_pct' in data else float(live_w.get("rain_probability_pct", latest_env.get("rain_probability_pct", 10.0))),
            "wind_speed_kmh": float(data.get("wind_speed_kmh")) if 'wind_speed_kmh' in data else float(live_w.get("wind_speed_kmh", latest_env.get("wind_speed_kmh", 6.0))),
            "days_since_last_irrigation": int(data.get("days_since_last_irrigation", 3)),
            "source": live_w.get("data_source", "Live Weather + Sensor")
        }

        # Save env record
        if field:
            new_env = EnvironmentalData(
                field_id=field.id,
                soil_moisture_pct=env_dict["soil_moisture_pct"],
                temperature_c=env_dict["temperature_c"],
                humidity_pct=env_dict["humidity_pct"],
                rainfall_mm=env_dict["rainfall_mm"],
                rain_probability_pct=env_dict["rain_probability_pct"],
                wind_speed_kmh=env_dict["wind_speed_kmh"],
                source=env_dict["source"]
            )
            db.session.add(new_env)
            db.session.commit()
    else:
        # Standalone sandbox mode without specific database field
        lat = float(data.get("latitude", 17.1856))
        lon = float(data.get("longitude", 81.9685))
        live_w = fetch_live_field_weather(None, lat, lon, force_refresh=False)

        field_dict = {
            "name": data.get("field_name", "Sandbox Field"),
            "area_hectares": float(data.get("area_hectares", 1.0)),
            "soil_type": data.get("soil_type", "Loamy"),
            "irrigation_method": data.get("irrigation_method", "Drip"),
            "available_water_liters": float(data.get("available_water_liters", 50000.0))
        }
        crop_dict = {
            "crop_name": data.get("crop_name", "Wheat"),
            "growth_stage": data.get("growth_stage", "Mid-Season")
        }
        env_dict = {
            "soil_moisture_pct": float(data.get("soil_moisture_pct", 22.0)),
            "temperature_c": float(data.get("temperature_c", live_w.get("temperature_c", 30.0))),
            "humidity_pct": float(data.get("humidity_pct", live_w.get("humidity_pct", 50.0))),
            "rainfall_mm": float(data.get("rainfall_mm", live_w.get("rainfall_mm", 0.0))),
            "rain_probability_pct": float(data.get("rain_probability_pct", live_w.get("rain_probability_pct", 10.0))),
            "wind_speed_kmh": float(data.get("wind_speed_kmh", live_w.get("wind_speed_kmh", 6.0))),
            "days_since_last_irrigation": int(data.get("days_since_last_irrigation", 3)),
            "source": live_w.get("data_source", "Live Open-Meteo API")
        }

    # Execute Hybrid Engine
    analysis_result = analyze_field_irrigation(field_dict, env_dict, crop_dict)

    # Generate Explainable AI reasoning
    reasons = generate_recommendation_explanation(analysis_result)
    analysis_result["reasons"] = reasons

    # If linked to an existing field, save recommendation record
    if field_id and Field.query.get(field_id):
        rec = Recommendation(
            field_id=field_id,
            decision=analysis_result["decision"],
            estimated_water_liters=analysis_result["estimated_water_liters"],
            recommended_duration_mins=analysis_result["recommended_duration_mins"],
            recommended_time=analysis_result["recommended_time"],
            priority_level=analysis_result["priority_level"],
            stress_score=analysis_result["stress_score"],
            confidence_score=analysis_result.get("confidence_score", 85.0),
            data_status=analysis_result.get("data_status", "Live Weather + Field Data"),
            explanation_json=json.dumps(reasons),
            feature_importance_json=json.dumps(analysis_result["ml_details"].get("feature_importances", {}))
        )
        db.session.add(rec)
        db.session.commit()

    return jsonify(analysis_result), 200

@analysis_bp.route('/api/recommendations/<int:field_id>', methods=['GET'])
def get_field_recommendations(field_id):
    recs = Recommendation.query.filter_by(field_id=field_id).order_by(Recommendation.created_at.desc()).limit(20).all()
    return jsonify([r.to_dict() for r in recs]), 200
