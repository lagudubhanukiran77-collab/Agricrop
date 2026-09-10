from datetime import datetime
import json
from database.db import db

class Field(db.Model):
    __tablename__ = 'fields'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    area_hectares = db.Column(db.Float, nullable=False, default=1.0)
    location = db.Column(db.String(150), nullable=True) # Legacy location text fallback
    
    # Location Intelligence Extensions
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_name = db.Column(db.String(200), nullable=True) # Village/Area
    district = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)

    soil_type = db.Column(db.String(50), nullable=False, default="Loamy") # Sandy, Loamy, Clay, Silt, Peat
    irrigation_method = db.Column(db.String(50), nullable=False, default="Drip") # Drip, Sprinkler, Flood, Sub-irrigation
    water_source = db.Column(db.String(50), nullable=False, default="Borewell") # Borewell, Canal, Rainwater Tank, River
    available_water_liters = db.Column(db.Float, nullable=False, default=50000.0)

    # Agronomic & Flow Rate Extensions
    flow_rate_lpm = db.Column(db.Float, nullable=True, default=80.0) # Flow rate in Liters per minute
    field_capacity = db.Column(db.Float, nullable=False, default=32.0) # % moisture at field capacity
    wilting_point = db.Column(db.Float, nullable=False, default=14.0) # % moisture at permanent wilting point
    root_zone_depth = db.Column(db.Float, nullable=False, default=30.0) # Root zone depth in cm

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    crops = db.relationship('Crop', backref='field', cascade='all, delete-orphan', lazy=True)
    environmental_readings = db.relationship('EnvironmentalData', backref='field', cascade='all, delete-orphan', lazy=True)
    irrigation_histories = db.relationship('IrrigationHistory', backref='field', cascade='all, delete-orphan', lazy=True)
    recommendations = db.relationship('Recommendation', backref='field', cascade='all, delete-orphan', lazy=True)
    alerts = db.relationship('Alert', backref='field', cascade='all, delete-orphan', lazy=True)
    weather_records = db.relationship('WeatherData', backref='field', cascade='all, delete-orphan', lazy=True)
    ml_predictions = db.relationship('MLPrediction', backref='field', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        active_crop = self.crops[0].to_dict() if self.crops else None
        latest_env = self.environmental_readings[-1].to_dict() if self.environmental_readings else None
        latest_weather = self.weather_records[-1].to_dict() if self.weather_records else None
        latest_ml = self.ml_predictions[-1].to_dict() if self.ml_predictions else None

        display_location = self.location_name or self.location or "Sector A1"
        if self.state and self.state not in display_location:
            display_location = f"{display_location}, {self.state}"

        return {
            'id': self.id,
            'name': self.name,
            'area_hectares': self.area_hectares,
            'location': display_location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location_name': self.location_name,
            'district': self.district,
            'state': self.state,
            'country': self.country,
            'soil_type': self.soil_type,
            'irrigation_method': self.irrigation_method,
            'water_source': self.water_source,
            'available_water_liters': self.available_water_liters,
            'flow_rate_lpm': self.flow_rate_lpm,
            'field_capacity': self.field_capacity,
            'wilting_point': self.wilting_point,
            'root_zone_depth': self.root_zone_depth,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'crop': active_crop,
            'latest_environment': latest_env,
            'latest_weather': latest_weather,
            'latest_ml_prediction': latest_ml
        }

class Crop(db.Model):
    __tablename__ = 'crops'

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    crop_name = db.Column(db.String(100), nullable=False)
    variety = db.Column(db.String(100), nullable=True)
    growth_stage = db.Column(db.String(50), nullable=False, default="Mid-Season") # Initial, Development, Mid-Season, Late-Season
    sowing_date = db.Column(db.String(20), nullable=True)
    expected_harvest_date = db.Column(db.String(20), nullable=True)
    kc_factor = db.Column(db.Float, nullable=False, default=1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'field_id': self.field_id,
            'crop_name': self.crop_name,
            'variety': self.variety,
            'growth_stage': self.growth_stage,
            'sowing_date': self.sowing_date,
            'expected_harvest_date': self.expected_harvest_date,
            'kc_factor': self.kc_factor,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class WeatherData(db.Model):
    __tablename__ = 'weather_data'

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    temperature_c = db.Column(db.Float, nullable=False)
    humidity_pct = db.Column(db.Float, nullable=False)
    rainfall_mm = db.Column(db.Float, nullable=False, default=0.0)
    rain_probability_pct = db.Column(db.Float, nullable=False, default=0.0)
    wind_speed_kmh = db.Column(db.Float, nullable=False, default=5.0)
    weather_condition = db.Column(db.String(100), default="Clear Sky")
    forecast_summary = db.Column(db.String(255), default="Rain unlikely for next 12 hours")
    data_source = db.Column(db.String(50), default="LIVE WEATHER") # LIVE WEATHER, CACHED WEATHER, WEATHER UNAVAILABLE
    hourly_json = db.Column(db.Text, nullable=True)
    daily_json = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'field_id': self.field_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'temperature_c': self.temperature_c,
            'humidity_pct': self.humidity_pct,
            'rainfall_mm': self.rainfall_mm,
            'rain_probability_pct': self.rain_probability_pct,
            'wind_speed_kmh': self.wind_speed_kmh,
            'weather_condition': self.weather_condition,
            'forecast_summary': self.forecast_summary,
            'data_source': self.data_source,
            'hourly_forecast': json.loads(self.hourly_json) if self.hourly_json else [],
            'daily_forecast': json.loads(self.daily_json) if self.daily_json else [],
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class EnvironmentalData(db.Model):
    __tablename__ = 'environmental_data'

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    soil_moisture_pct = db.Column(db.Float, nullable=False)
    temperature_c = db.Column(db.Float, nullable=False)
    humidity_pct = db.Column(db.Float, nullable=False)
    rainfall_mm = db.Column(db.Float, nullable=False, default=0.0)
    rain_probability_pct = db.Column(db.Float, nullable=False, default=0.0)
    wind_speed_kmh = db.Column(db.Float, nullable=False, default=5.0)
    source = db.Column(db.String(50), default="AI Estimated") # AI Estimated, Manual Input, IoT Sensor
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'field_id': self.field_id,
            'soil_moisture_pct': self.soil_moisture_pct,
            'temperature_c': self.temperature_c,
            'humidity_pct': self.humidity_pct,
            'rainfall_mm': self.rainfall_mm,
            'rain_probability_pct': self.rain_probability_pct,
            'wind_speed_kmh': self.wind_speed_kmh,
            'source': self.source,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class MLPrediction(db.Model):
    __tablename__ = 'ml_predictions'

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=True)
    model_name = db.Column(db.String(100), nullable=False, default="RandomForestRegressor")
    estimated_soil_moisture = db.Column(db.Float, nullable=False)
    data_confidence = db.Column(db.String(50), default="Medium") # High, Medium, Low
    input_snapshot = db.Column(db.Text, nullable=True)
    model_version = db.Column(db.String(50), default="1.0.0")
    prediction_timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        snapshot = {}
        if self.input_snapshot:
            try:
                snapshot = json.loads(self.input_snapshot)
            except Exception:
                snapshot = {}
        return {
            'id': self.id,
            'field_id': self.field_id,
            'model_name': self.model_name,
            'estimated_soil_moisture': self.estimated_soil_moisture,
            'data_confidence': self.data_confidence,
            'input_snapshot': snapshot,
            'model_version': self.model_version,
            'prediction_timestamp': self.prediction_timestamp.isoformat() if self.prediction_timestamp else None
        }

class IrrigationHistory(db.Model):
    __tablename__ = 'irrigation_history'

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    date = db.Column(db.String(30), nullable=False)
    water_quantity_liters = db.Column(db.Float, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    method = db.Column(db.String(50), nullable=False)
    temperature_c = db.Column(db.Float, nullable=True)
    soil_moisture_before_pct = db.Column(db.Float, nullable=True)
    ai_recommendation = db.Column(db.String(50), nullable=True)
    actual_action = db.Column(db.String(50), nullable=False)
    water_saved_liters = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'field_id': self.field_id,
            'date': self.date,
            'water_quantity_liters': self.water_quantity_liters,
            'duration_minutes': self.duration_minutes,
            'method': self.method,
            'temperature_c': self.temperature_c,
            'soil_moisture_before_pct': self.soil_moisture_before_pct,
            'ai_recommendation': self.ai_recommendation,
            'actual_action': self.actual_action,
            'water_saved_liters': self.water_saved_liters,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    decision = db.Column(db.String(50), nullable=False) # Irrigate Now, Irrigate Later, Do Not Irrigate, Monitor Field
    estimated_water_liters = db.Column(db.Float, nullable=False)
    recommended_duration_mins = db.Column(db.Integer, nullable=False)
    recommended_time = db.Column(db.String(50), nullable=False)
    priority_level = db.Column(db.String(20), nullable=False) # Low, Medium, High, Critical
    stress_score = db.Column(db.Float, nullable=False) # 0 to 100
    confidence_score = db.Column(db.Float, default=85.0) # 0 to 100
    data_status = db.Column(db.String(100), default="Live Weather + User Field Data + ML Prediction")
    explanation_json = db.Column(db.Text, nullable=False)
    feature_importance_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'field_id': self.field_id,
            'decision': self.decision,
            'estimated_water_liters': self.estimated_water_liters,
            'recommended_duration_mins': self.recommended_duration_mins,
            'recommended_time': self.recommended_time,
            'priority_level': self.priority_level,
            'stress_score': self.stress_score,
            'confidence_score': self.confidence_score,
            'data_status': self.data_status,
            'reasons': json.loads(self.explanation_json) if self.explanation_json else [],
            'feature_importance': json.loads(self.feature_importance_json) if self.feature_importance_json else {},
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), nullable=False) # Low, Medium, High, Critical
    is_resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'field_id': self.field_id,
            'title': self.title,
            'message': self.message,
            'severity': self.severity,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class MLModelMetric(db.Model):
    __tablename__ = 'ml_model_metrics'

    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), nullable=False)
    model_type = db.Column(db.String(50), nullable=False) # Regressor / Classifier
    rmse = db.Column(db.Float, nullable=True)
    mae = db.Column(db.Float, nullable=True)
    r2_score = db.Column(db.Float, nullable=True)
    accuracy = db.Column(db.Float, nullable=True)
    f1_score = db.Column(db.Float, nullable=True)
    feature_importances_json = db.Column(db.Text, nullable=True)
    trained_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        feat_imp = {}
        if self.feature_importances_json:
            try:
                feat_imp = json.loads(self.feature_importances_json)
            except Exception:
                try:
                    import ast
                    feat_imp = ast.literal_eval(self.feature_importances_json)
                except Exception:
                    feat_imp = {}
        return {
            'id': self.id,
            'model_name': self.model_name,
            'model_type': self.model_type,
            'rmse': self.rmse,
            'mae': self.mae,
            'r2_score': self.r2_score,
            'accuracy': self.accuracy,
            'f1_score': self.f1_score,
            'feature_importances': feat_imp,
            'trained_at': self.trained_at.isoformat() if self.trained_at else None
        }
