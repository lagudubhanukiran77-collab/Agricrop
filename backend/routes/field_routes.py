from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Field, Crop, EnvironmentalData, IrrigationHistory, Recommendation, Alert
from services.alert_service import evaluate_and_generate_alerts
from services.weather_service import fetch_live_field_weather
from ml.predict_soil_moisture import predict_estimated_soil_moisture

field_bp = Blueprint('field_bp', __name__)

@field_bp.route('/api/fields', methods=['GET'])
def get_fields():
    fields = Field.query.all()
    return jsonify([f.to_dict() for f in fields]), 200

@field_bp.route('/api/fields', methods=['POST'])
def create_field():
    data = request.get_json() or {}
    raw_name = data.get('name', '').strip()
    
    if not raw_name:
        return jsonify({'error': 'Field name is required'}), 400

    # Enforce meaningful field names (minimum 3 characters)
    if len(raw_name) < 3:
        clean_name = f"Field Sector {raw_name.upper()}"
    else:
        clean_name = raw_name

    lat = float(data.get('latitude')) if data.get('latitude') is not None else 17.1856
    lon = float(data.get('longitude')) if data.get('longitude') is not None else 81.9685
    loc_name = data.get('location_name') or data.get('location', 'D. Yerravaram, Andhra Pradesh')

    flow_rate = float(data.get('flow_rate_lpm')) if data.get('flow_rate_lpm') is not None else 80.0
    fc = float(data.get('field_capacity', 32.0))
    wp = float(data.get('wilting_point', 14.0))
    root_depth = float(data.get('root_zone_depth', 30.0))

    field = Field(
        name=clean_name,
        area_hectares=max(0.1, float(data.get('area_hectares', 1.0))),
        location=loc_name,
        latitude=lat,
        longitude=lon,
        location_name=loc_name,
        district=data.get('district', 'East Godavari'),
        state=data.get('state', 'Andhra Pradesh'),
        country=data.get('country', 'India'),
        soil_type=data.get('soil_type', 'Loamy'),
        irrigation_method=data.get('irrigation_method', 'Drip'),
        water_source=data.get('water_source', 'Borewell'),
        available_water_liters=max(0.0, float(data.get('available_water_liters', 50000.0))),
        flow_rate_lpm=flow_rate,
        field_capacity=fc,
        wilting_point=wp,
        root_zone_depth=root_depth
    )
    db.session.add(field)
    db.session.commit()

    # Add crop info if provided
    crop_name = data.get('crop_name', 'Wheat')
    growth_stage = data.get('growth_stage', 'Mid-Season')
    crop = Crop(
        field_id=field.id,
        crop_name=crop_name,
        variety=data.get('variety', 'Standard Hybrid'),
        growth_stage=growth_stage,
        sowing_date=data.get('sowing_date', '2026-05-15'),
        expected_harvest_date=data.get('expected_harvest_date', '2026-10-20')
    )
    db.session.add(crop)

    # Initial live weather + ML estimated soil moisture calculation
    w_data = fetch_live_field_weather(field.id, lat, lon, force_refresh=True)
    sm_res = predict_estimated_soil_moisture({
        "soil_type": field.soil_type,
        "crop_name": crop_name,
        "growth_stage": growth_stage,
        "temperature_c": w_data.get('temperature_c', 30.0),
        "humidity_pct": w_data.get('humidity_pct', 50.0),
        "field_capacity": fc,
        "wilting_point": wp,
        "root_zone_depth": root_depth
    })
    
    estimated_moisture = sm_res.get('estimated_soil_moisture', 24.0)

    env = EnvironmentalData(
        field_id=field.id,
        soil_moisture_pct=estimated_moisture,
        temperature_c=w_data.get('temperature_c', 30.0),
        humidity_pct=w_data.get('humidity_pct', 50.0),
        rainfall_mm=w_data.get('rainfall_mm', 0.0),
        rain_probability_pct=w_data.get('rain_probability_pct', 10.0),
        wind_speed_kmh=w_data.get('wind_speed_kmh', 8.0),
        source="AI Estimated"
    )
    db.session.add(env)
    db.session.commit()

    evaluate_and_generate_alerts()

    return jsonify(field.to_dict()), 201

@field_bp.route('/api/fields/<int:field_id>', methods=['GET'])
def get_field_detail(field_id):
    field = Field.query.get_or_404(field_id)
    f_dict = field.to_dict()
    
    env_history = EnvironmentalData.query.filter_by(field_id=field.id).order_by(EnvironmentalData.timestamp.desc()).limit(15).all()
    f_dict['environmental_history'] = [e.to_dict() for e in env_history]

    recs = Recommendation.query.filter_by(field_id=field.id).order_by(Recommendation.created_at.desc()).limit(10).all()
    f_dict['recommendations_history'] = [r.to_dict() for r in recs]

    irrs = IrrigationHistory.query.filter_by(field_id=field.id).order_by(IrrigationHistory.timestamp.desc()).limit(15).all()
    f_dict['irrigation_history'] = [i.to_dict() for i in irrs]

    return jsonify(f_dict), 200

@field_bp.route('/api/fields/<int:field_id>', methods=['PUT'])
def update_field(field_id):
    field = Field.query.get_or_404(field_id)
    data = request.get_json() or {}

    if 'name' in data:
        raw_name = data['name'].strip()
        field.name = f"Field Sector {raw_name.upper()}" if len(raw_name) < 3 else raw_name
    if 'area_hectares' in data: field.area_hectares = max(0.1, float(data['area_hectares']))
    if 'location' in data: field.location = data['location']
    if 'location_name' in data: field.location_name = data['location_name']
    if 'latitude' in data and data['latitude'] is not None: field.latitude = float(data['latitude'])
    if 'longitude' in data and data['longitude'] is not None: field.longitude = float(data['longitude'])
    if 'district' in data: field.district = data['district']
    if 'state' in data: field.state = data['state']
    if 'country' in data: field.country = data['country']
    if 'soil_type' in data: field.soil_type = data['soil_type']
    if 'irrigation_method' in data: field.irrigation_method = data['irrigation_method']
    if 'water_source' in data: field.water_source = data['water_source']
    if 'available_water_liters' in data: field.available_water_liters = float(data['available_water_liters'])
    if 'flow_rate_lpm' in data: field.flow_rate_lpm = float(data['flow_rate_lpm']) if data['flow_rate_lpm'] is not None else None
    if 'field_capacity' in data: field.field_capacity = float(data['field_capacity'])
    if 'wilting_point' in data: field.wilting_point = float(data['wilting_point'])
    if 'root_zone_depth' in data: field.root_zone_depth = float(data['root_zone_depth'])

    if field.crops:
        crop = field.crops[0]
        if 'crop_name' in data: crop.crop_name = data['crop_name']
        if 'variety' in data: crop.variety = data['variety']
        if 'growth_stage' in data: crop.growth_stage = data['growth_stage']

    db.session.commit()
    return jsonify(field.to_dict()), 200

@field_bp.route('/api/fields/<int:field_id>', methods=['DELETE'])
def delete_field(field_id):
    field = Field.query.get_or_404(field_id)
    db.session.delete(field)
    db.session.commit()
    return jsonify({'message': f'Field {field_id} deleted successfully'}), 200
