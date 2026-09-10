import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.db import db
from database.models import Field, Crop, EnvironmentalData, IrrigationHistory, Alert, Recommendation, MLModelMetric

# Import Blueprints
from routes.field_routes import field_bp
from routes.environment_routes import env_bp
from routes.analysis_routes import analysis_bp
from routes.schedule_routes import schedule_bp
from routes.alert_routes import alert_bp
from routes.history_routes import history_bp
from routes.ml_routes import ml_bp
from routes.weather_routes import weather_bp
from routes.location_routes import location_bp
from routes.water_routes import water_bp
from routes.agent_routes import agent_bp
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(field_bp)
    app.register_blueprint(env_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(ml_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(water_bp)
    app.register_blueprint(agent_bp)
    app.register_blueprint(auth_bp)


    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'status': 'online',
            'system': 'AgriCrop Intelligent Irrigation & Water Management Engine REST API',
            'version': '1.0.0',
            'frontend_ui': 'http://localhost:3000',
            'endpoints': {
                'health': '/api/health',
                'fields': '/api/fields',
                'analyze_irrigation': '/api/analyze-irrigation',
                'predict_soil_moisture': '/api/ml/predict-soil-moisture',
                'model_info': '/api/ml/model-info',
                'schedule': '/api/schedule',
                'alerts': '/api/alerts',
                'history': '/api/irrigation-history',
                'ml_metrics': '/api/ml/metrics',
                'weather': '/api/weather',
                'reverse_geocode': '/api/location/reverse-geocode',
                'water_resources': '/api/water-resources'
            }
        }), 200

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'system': 'AgriCrop Intelligent Irrigation Engine',
            'version': '1.0.0'
        }), 200

    # Seed Database on Initial Startup
    with app.app_context():
        db.create_all()
        seed_initial_data()

    return app

def seed_initial_data():
    if Field.query.count() == 0:
        print("Seeding initial agricultural fields and environmental records...")
        
        # Field 1: D. Yerravaram High Stress Wheat Field
        f1 = Field(
            name="North Wheat Field",
            area_hectares=5.0,
            location="D. Yerravaram, East Godavari",
            latitude=17.1856,
            longitude=81.9685,
            location_name="D. Yerravaram, East Godavari",
            district="East Godavari",
            state="Andhra Pradesh",
            country="India",
            soil_type="Clay",
            irrigation_method="Drip",
            water_source="Borewell",
            available_water_liters=45000.0,
            flow_rate_lpm=100.0,
            field_capacity=42.0,
            wilting_point=22.0,
            root_zone_depth=35.0
        )
        c1 = Crop(crop_name="Wheat", variety="HD-3086", growth_stage="Mid-Season", sowing_date="2026-05-10", expected_harvest_date="2026-10-15")
        e1 = EnvironmentalData(soil_moisture_pct=18.5, temperature_c=34.2, humidity_pct=42.0, rainfall_mm=0.0, rain_probability_pct=10.0, wind_speed_kmh=12.0, source="AI Estimated")
        
        # Field 2: Rajahmundry Rice Paddy
        f2 = Field(
            name="East Rice Paddy",
            area_hectares=3.5,
            location="Rajahmundry River Basin",
            latitude=16.9891,
            longitude=81.7836,
            location_name="Rajahmundry, East Godavari",
            district="East Godavari",
            state="Andhra Pradesh",
            country="India",
            soil_type="Clay",
            irrigation_method="Flood",
            water_source="Canal",
            available_water_liters=120000.0,
            flow_rate_lpm=250.0,
            field_capacity=42.0,
            wilting_point=22.0,
            root_zone_depth=40.0
        )
        c2 = Crop(crop_name="Rice", variety="Basmati 370", growth_stage="Mid-Season", sowing_date="2026-06-01", expected_harvest_date="2026-11-10")
        e2 = EnvironmentalData(soil_moisture_pct=36.0, temperature_c=29.0, humidity_pct=65.0, rainfall_mm=2.0, rain_probability_pct=25.0, wind_speed_kmh=6.0, source="AI Estimated")

        # Field 3: Eluru Corn Plantation expecting Rain
        f3 = Field(
            name="South Corn Plantation",
            area_hectares=4.2,
            location="Eluru Canal Zone",
            latitude=16.7107,
            longitude=81.0952,
            location_name="Eluru, West Godavari",
            district="West Godavari",
            state="Andhra Pradesh",
            country="India",
            soil_type="Loamy",
            irrigation_method="Sprinkler",
            water_source="Rainwater Tank",
            available_water_liters=30000.0,
            flow_rate_lpm=150.0,
            field_capacity=32.0,
            wilting_point=14.0,
            root_zone_depth=30.0
        )
        c3 = Crop(crop_name="Corn", variety="Pioneer P3396", growth_stage="Development", sowing_date="2026-05-20", expected_harvest_date="2026-09-30")
        e3 = EnvironmentalData(soil_moisture_pct=21.0, temperature_c=28.5, humidity_pct=58.0, rainfall_mm=12.0, rain_probability_pct=85.0, wind_speed_kmh=14.0, source="AI Estimated")

        # Field 4: Vijayawada Tomato Polyhouse
        f4 = Field(
            name="Greenhouse Tomatoes",
            area_hectares=1.2,
            location="Vijayawada Polyhouse Block",
            latitude=16.5062,
            longitude=80.6480,
            location_name="Vijayawada, NTR District",
            district="NTR District",
            state="Andhra Pradesh",
            country="India",
            soil_type="Sandy",
            irrigation_method="Drip",
            water_source="Borewell",
            available_water_liters=18000.0,
            flow_rate_lpm=60.0,
            field_capacity=15.0,
            wilting_point=6.0,
            root_zone_depth=25.0
        )
        c4 = Crop(crop_name="Tomato", variety="Arka Rakshak", growth_stage="Mid-Season", sowing_date="2026-04-15", expected_harvest_date="2026-09-15")
        e4 = EnvironmentalData(soil_moisture_pct=15.2, temperature_c=31.0, humidity_pct=52.0, rainfall_mm=0.0, rain_probability_pct=5.0, wind_speed_kmh=4.0, source="AI Estimated")

        f1.crops.append(c1)
        f1.environmental_readings.append(e1)
        f2.crops.append(c2)
        f2.environmental_readings.append(e2)
        f3.crops.append(c3)
        f3.environmental_readings.append(e3)
        f4.crops.append(c4)
        f4.environmental_readings.append(e4)

        db.session.add_all([f1, f2, f3, f4])
        db.session.commit()

        # Seed sample irrigation history
        h1 = IrrigationHistory(field_id=f1.id, date="2026-09-07", water_quantity_liters=12500.0, duration_minutes=125, method="Drip", temperature_c=32.0, soil_moisture_before_pct=17.0, ai_recommendation="Irrigate Now", actual_action="Irrigated", water_saved_liters=1800.0)
        h2 = IrrigationHistory(field_id=f2.id, date="2026-09-05", water_quantity_liters=24000.0, duration_minutes=96, method="Flood", temperature_c=29.5, soil_moisture_before_pct=30.0, ai_recommendation="Irrigate Later", actual_action="Irrigated", water_saved_liters=3200.0)
        h3 = IrrigationHistory(field_id=f3.id, date="2026-09-08", water_quantity_liters=0.0, duration_minutes=0, method="Sprinkler", temperature_c=27.0, soil_moisture_before_pct=22.0, ai_recommendation="Do Not Irrigate", actual_action="Postponed (Rain)", water_saved_liters=9500.0)
        db.session.add_all([h1, h2, h3])
        db.session.commit()

        print("Database initial seeding completed successfully!")

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

