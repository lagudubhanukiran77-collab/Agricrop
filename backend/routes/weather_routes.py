"""
Weather Routes
Endpoints for live hyper-local weather fetching, manual refresh, and forecasts.
"""

from flask import Blueprint, request, jsonify
from services.weather_service import fetch_live_field_weather
from database.models import Field

weather_bp = Blueprint('weather_bp', __name__)

@weather_bp.route('/api/weather/<int:field_id>', methods=['GET'])
def get_field_weather_route(field_id):
    """
    Returns live or cached weather data for a specific field.
    """
    field = Field.query.get(field_id)
    if not field:
        return jsonify({"error": f"Field with ID {field_id} not found"}), 404

    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    weather_data = fetch_live_field_weather(
        field_id=field.id,
        latitude=field.latitude,
        longitude=field.longitude,
        force_refresh=force_refresh
    )
    return jsonify(weather_data), 200

@weather_bp.route('/api/weather/refresh/<int:field_id>', methods=['POST'])
def refresh_field_weather_route(field_id):
    """
    Forces an immediate live weather update for a field.
    """
    field = Field.query.get(field_id)
    if not field:
        return jsonify({"error": f"Field with ID {field_id} not found"}), 404

    weather_data = fetch_live_field_weather(
        field_id=field.id,
        latitude=field.latitude,
        longitude=field.longitude,
        force_refresh=True
    )
    return jsonify({
        "message": "Weather data refreshed successfully",
        "weather": weather_data
    }), 200

@weather_bp.route('/api/weather/<int:field_id>/forecast', methods=['GET'])
def get_field_weather_forecast_route(field_id):
    """
    Returns 5-day daily and 12-hour forecast for a specific field.
    """
    field = Field.query.get(field_id)
    if not field:
        return jsonify({"error": f"Field with ID {field_id} not found"}), 404

    weather_data = fetch_live_field_weather(
        field_id=field.id,
        latitude=field.latitude,
        longitude=field.longitude,
        force_refresh=False
    )
    return jsonify({
        "field_id": field.id,
        "location_name": field.location_name or field.name,
        "daily_forecast": weather_data.get("daily_forecast", []),
        "hourly_forecast": weather_data.get("hourly_forecast", []),
        "status_badge": weather_data.get("status_badge", "LIVE WEATHER")
    }), 200

@weather_bp.route('/api/weather', methods=['GET'])
def get_general_weather():
    """
    Backwards compatibility endpoint for general weather view.
    """
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)

    weather_data = fetch_live_field_weather(field_id=None, latitude=lat, longitude=lon)

    # Transform into format expected by existing frontend components if needed
    current = {
        "location": weather_data.get("location_name", "Farm Location"),
        "temperature_c": weather_data.get("temperature_c", 30.0),
        "humidity_pct": weather_data.get("humidity_pct", 50.0),
        "rainfall_mm": weather_data.get("rainfall_mm", 0.0),
        "rain_probability_pct": weather_data.get("rain_probability_pct", 10.0),
        "wind_speed_kmh": weather_data.get("wind_speed_kmh", 6.0),
        "uv_index": 7.0,
        "evapotranspiration_et0_mm": 5.2,
        "condition": weather_data.get("weather_condition", "Partly Cloudy"),
        "data_source": weather_data.get("data_source", "LIVE WEATHER"),
        "timestamp": weather_data.get("timestamp")
    }

    forecast = weather_data.get("daily_forecast", [])

    return jsonify({
        "current": current,
        "forecast": forecast,
        "status_badge": weather_data.get("status_badge", "LIVE WEATHER")
    }), 200
