"""
ML Predictor Module
Loads saved joblib pipelines to perform inference for field input data.
Handles model auto-training if binaries are missing.
"""

import os
import joblib
import pandas as pd
import config
from ml.train import train_and_evaluate_models

_MODELS_LOADED = False
_ACTION_CLF = None
_WATER_REG = None
_STRESS_REG = None
_FEATURE_IMPORTANCES = {}

def load_models(force_retrain=False):
    global _MODELS_LOADED, _ACTION_CLF, _WATER_REG, _STRESS_REG, _FEATURE_IMPORTANCES
    
    save_dir = config.SAVED_MODELS_DIR
    clf_path = os.path.join(save_dir, "best_action_classifier.joblib")
    wat_path = os.path.join(save_dir, "best_water_regressor.joblib")
    str_path = os.path.join(save_dir, "best_stress_regressor.joblib")
    imp_path = os.path.join(save_dir, "feature_importances.joblib")

    if force_retrain or not (os.path.exists(clf_path) and os.path.exists(wat_path)):
        print("Training ML models...")
        train_and_evaluate_models()

    _ACTION_CLF = joblib.load(clf_path)
    _WATER_REG = joblib.load(wat_path)
    _STRESS_REG = joblib.load(str_path)
    _FEATURE_IMPORTANCES = joblib.load(imp_path) if os.path.exists(imp_path) else {}
    _MODELS_LOADED = True

def predict_irrigation(data):
    """
    Predicts irrigation action, required water quantity (liters), and crop stress score
    for a given dictionary of field and environmental attributes.
    """
    if not _MODELS_LOADED:
        load_models()

    df_input = pd.DataFrame([{
        "crop": data.get("crop_name", "Wheat"),
        "growth_stage": data.get("growth_stage", "Mid-Season"),
        "soil_type": data.get("soil_type", "Loamy"),
        "irrigation_method": data.get("irrigation_method", "Drip"),
        "area_hectares": float(data.get("area_hectares", 1.0)),
        "soil_moisture_pct": float(data.get("soil_moisture_pct", 25.0)),
        "temperature_c": float(data.get("temperature_c", 30.0)),
        "humidity_pct": float(data.get("humidity_pct", 50.0)),
        "rainfall_mm": float(data.get("rainfall_mm", 0.0)),
        "rain_probability_pct": float(data.get("rain_probability_pct", 0.0)),
        "wind_speed_kmh": float(data.get("wind_speed_kmh", 5.0)),
        "days_since_last_irrigation": int(data.get("days_since_last_irrigation", 3)),
        "available_water_pct": float(data.get("available_water_pct", 80.0))
    }])

    action_pred = _ACTION_CLF.predict(df_input)[0]
    water_pred = float(_WATER_REG.predict(df_input)[0])
    stress_pred = float(_STRESS_REG.predict(df_input)[0])

    water_pred = round(max(0.0, water_pred), 1)
    stress_pred = round(max(0.0, min(100.0, stress_pred)), 1)

    return {
        "ml_action": action_pred,
        "ml_water_liters": water_pred,
        "ml_stress_score": stress_pred,
        "feature_importances": _FEATURE_IMPORTANCES
    }
