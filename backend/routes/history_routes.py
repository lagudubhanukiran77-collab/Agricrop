from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db import db
from database.models import IrrigationHistory, Field

history_bp = Blueprint('history_bp', __name__)

@history_bp.route('/api/irrigation-history', methods=['GET'])
def get_irrigation_history():
    field_id = request.args.get('field_id')
    if field_id:
        logs = IrrigationHistory.query.filter_by(field_id=field_id).order_by(IrrigationHistory.timestamp.desc()).all()
    else:
        logs = IrrigationHistory.query.order_by(IrrigationHistory.timestamp.desc()).all()

    # Calculate summary metrics
    total_water_used = sum(l.water_quantity_liters for l in logs)
    total_water_saved = sum(l.water_saved_liters for l in logs)
    avg_efficiency = round((total_water_saved / max(1.0, total_water_used + total_water_saved)) * 100, 1)

    return jsonify({
        "logs": [l.to_dict() for l in logs],
        "summary": {
            "total_water_used_liters": round(total_water_used, 1),
            "total_water_saved_liters": round(total_water_saved, 1),
            "water_efficiency_pct": avg_efficiency,
            "total_events": len(logs)
        }
    }), 200

@history_bp.route('/api/irrigation-history', methods=['POST'])
def log_irrigation_event():
    data = request.get_json() or {}
    field_id = data.get('field_id')

    if not field_id:
        return jsonify({'error': 'field_id is required'}), 400

    field = Field.query.get_or_404(field_id)
    water_used = float(data.get('water_quantity_liters', 0.0))

    # Deduct water used from available field water
    field.available_water_liters = max(0.0, field.available_water_liters - water_used)

    log = IrrigationHistory(
        field_id=field.id,
        date=data.get('date', datetime.now().strftime("%Y-%m-%d")),
        water_quantity_liters=water_used,
        duration_minutes=int(data.get('duration_minutes', 45)),
        method=data.get('method', field.irrigation_method),
        temperature_c=float(data.get('temperature_c', 28.0)),
        soil_moisture_before_pct=float(data.get('soil_moisture_before_pct', 20.0)),
        ai_recommendation=data.get('ai_recommendation', 'Irrigate Now'),
        actual_action=data.get('actual_action', 'Irrigated'),
        water_saved_liters=float(data.get('water_saved_liters', 500.0))
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(log.to_dict()), 201
