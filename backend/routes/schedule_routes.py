from flask import Blueprint, jsonify
from database.models import Field
from services.schedule_service import generate_smart_schedule

schedule_bp = Blueprint('schedule_bp', __name__)

@schedule_bp.route('/api/schedule', methods=['GET'])
def get_irrigation_schedule():
    fields = Field.query.all()
    schedule = generate_smart_schedule(fields)
    return jsonify(schedule), 200
