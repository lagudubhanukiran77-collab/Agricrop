"""
Location Routes
API endpoints for reverse geocoding coordinates and location search autocomplete.
"""

from flask import Blueprint, request, jsonify
from services.location_service import reverse_geocode, search_locations

location_bp = Blueprint('location_bp', __name__)

@location_bp.route('/api/location/reverse-geocode', methods=['GET', 'POST'])
def handle_reverse_geocode():
    """
    Supports POST with JSON body: { "latitude": 17.1856, "longitude": 81.9685 }
    Or GET with query params: ?lat=17.1856&lon=81.9685 or ?latitude=17.1856&longitude=81.9685
    Returns structured location details.
    """
    if request.method == 'POST':
        data = request.get_json() or {}
        lat = data.get('latitude') or data.get('lat')
        lon = data.get('longitude') or data.get('lon')
    else:
        lat = request.args.get('latitude') or request.args.get('lat')
        lon = request.args.get('longitude') or request.args.get('lon')

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required."}), 400

    try:
        lat = float(lat)
        lon = float(lon)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid numeric coordinates provided."}), 400

    result = reverse_geocode(lat, lon)
    return jsonify(result), 200

@location_bp.route('/api/location/search', methods=['GET'])
def handle_location_search():
    """
    Accepts query param: ?query=Yerravaram
    Returns list of matching location candidates.
    """
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify([]), 200

    results = search_locations(query)
    return jsonify(results), 200
