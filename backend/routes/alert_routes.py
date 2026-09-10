from flask import Blueprint, jsonify, request
from database.db import db
from database.models import Alert
from services.alert_service import evaluate_and_generate_alerts

alert_bp = Blueprint('alert_bp', __name__)

@alert_bp.route('/api/alerts', methods=['GET'])
def get_alerts():
    # Scan and trigger fresh alerts
    evaluate_and_generate_alerts()
    alerts = Alert.query.order_by(Alert.is_resolved.asc(), Alert.created_at.desc()).all()
    return jsonify([a.to_dict() for a in alerts]), 200

@alert_bp.route('/api/alerts/<int:alert_id>/resolve', methods=['PUT'])
def resolve_alert(alert_id):
    alert = Alert.query.get_or_404(alert_id)
    alert.is_resolved = True
    db.session.commit()
    return jsonify(alert.to_dict()), 200
