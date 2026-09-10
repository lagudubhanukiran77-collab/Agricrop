"""
Water Resource Routes
API endpoints for listing nearby rivers, canals, lakes, and reservoirs.
"""

from flask import Blueprint, request, jsonify
from services.water_resource_service import get_nearby_water_resources
from database.models import Field

water_bp = Blueprint('water_bp', __name__)

@water_bp.route('/api/water-resources/<int:field_id>', methods=['GET'])
def get_field_water_resources(field_id):
    """
    Returns nearby water bodies for a specific field.
    """
    field = Field.query.get(field_id)
    if not field:
        return jsonify({"error": f"Field with ID {field_id} not found"}), 404

    res = get_nearby_water_resources(field.latitude, field.longitude)
    res["field_id"] = field.id
    res["field_name"] = field.name
    res["location_name"] = field.location_name or f"{field.latitude}, {field.longitude}"
    return jsonify(res), 200

@water_bp.route('/api/water-resources', methods=['GET'])
def get_location_water_resources():
    """
    Returns nearby water bodies for arbitrary query parameters lat & lon.
    """
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    res = get_nearby_water_resources(lat, lon)
    return jsonify(res), 200
