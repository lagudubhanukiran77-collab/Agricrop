from flask import Blueprint, request, jsonify
from database.db import db
from database.models import EnvironmentalData, Field
from services.alert_service import evaluate_and_generate_alerts

env_bp = Blueprint('env_bp', __name__)

@env_bp.route('/api/environment', methods=['POST'])
def add_environment_reading():
    data = request.get_json() or {}
    field_id = data.get('field_id')

    if not field_id:
        return jsonify({'error': 'field_id is required'}), 400

    field = Field.query.get_or_404(field_id)

    env = EnvironmentalData(
        field_id=field.id,
        soil_moisture_pct=float(data.get('soil_moisture_pct', 25.0)),
        temperature_c=float(data.get('temperature_c', 28.0)),
        humidity_pct=float(data.get('humidity_pct', 50.0)),
        rainfall_mm=float(data.get('rainfall_mm', 0.0)),
        rain_probability_pct=float(data.get('rain_probability_pct', 0.0)),
        wind_speed_kmh=float(data.get('wind_speed_kmh', 5.0)),
        source=data.get('source', 'Manual Entry')
    )
    db.session.add(env)
    db.session.commit()

    # Trigger real-time alert evaluation
    evaluate_and_generate_alerts()

    return jsonify(env.to_dict()), 201

@env_bp.route('/api/environment/iot', methods=['POST'])
def receive_iot_telemetry():
    """
    IoT Sensor telemetry endpoint ready for ESP32 / LoRaWAN payloads.
    Format: {"field_id": 1, "soil_moisture_pct": 21.5, "temperature_c": 32.1, "humidity_pct": 42.0}
    """
    data = request.get_json() or {}
    field_id = data.get('field_id', 1)

    field = Field.query.get(field_id)
    if not field:
        return jsonify({'error': f'Field {field_id} not found for IoT stream'}), 404

    env = EnvironmentalData(
        field_id=field.id,
        soil_moisture_pct=float(data.get('soil_moisture_pct', 22.0)),
        temperature_c=float(data.get('temperature_c', 29.0)),
        humidity_pct=float(data.get('humidity_pct', 48.0)),
        rainfall_mm=float(data.get('rainfall_mm', 0.0)),
        rain_probability_pct=float(data.get('rain_probability_pct', 5.0)),
        wind_speed_kmh=float(data.get('wind_speed_kmh', 7.0)),
        source="IoT ESP32 Sensor"
    )
    db.session.add(env)
    db.session.commit()

    evaluate_and_generate_alerts()

    return jsonify({
        'status': 'success',
        'message': 'IoT telemetry ingested successfully',
        'data': env.to_dict()
    }), 200

@env_bp.route('/api/environment/<int:field_id>', methods=['GET'])
def get_field_environment_history(field_id):
    readings = EnvironmentalData.query.filter_by(field_id=field_id).order_by(EnvironmentalData.timestamp.desc()).limit(30).all()
    return jsonify([r.to_dict() for r in readings]), 200
