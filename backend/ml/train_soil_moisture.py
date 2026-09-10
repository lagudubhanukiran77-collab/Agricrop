"""
Dedicated Soil Moisture ML Model Training Pipeline
Evaluates RandomForestRegressor vs GradientBoostingRegressor using 5-Fold Cross Validation.
Saves the best-performing model, metadata, and feature importances to disk.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Ensure config paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "ml", "saved_models")

CATEGORICAL_FEATURES = ["soil_type", "crop_name", "growth_stage", "irrigation_method"]
NUMERIC_FEATURES = [
    "temperature", "humidity", "rainfall", "rain_probability", "wind_speed",
    "hours_since_last_irrigation", "previous_irrigation_amount", "previous_soil_moisture",
    "available_water", "field_area", "root_zone_depth", "field_capacity", "wilting_point"
]

SOIL_PHYSICS_PARAMS = {
    "Sandy": {"field_capacity": 15.0, "wilting_point": 6.0},
    "Loamy": {"field_capacity": 32.0, "wilting_point": 14.0},
    "Clay": {"field_capacity": 42.0, "wilting_point": 22.0},
    "Silt": {"field_capacity": 35.0, "wilting_point": 16.0},
    "Peat": {"field_capacity": 48.0, "wilting_point": 25.0}
}

KC_MAP = {"Initial": 0.45, "Development": 0.75, "Mid-Season": 1.15, "Late-Season": 0.70}
EFFICIENCY_MAP = {"Drip": 0.92, "Sprinkler": 0.78, "Flood": 0.52, "Sub-irrigation": 0.85}

def generate_soil_moisture_dataset(num_samples=3000, random_seed=42):
    """
    Generates a scientifically logical synthetic dataset representing physical soil moisture dynamics.
    Labeled as 'Simulated/Synthetic Agricultural Training Data'.
    """
    np.random.seed(random_seed)

    crops = ["Wheat", "Rice", "Corn", "Cotton", "Sugarcane", "Tomato", "Potato", "Soybean"]
    stages = ["Initial", "Development", "Mid-Season", "Late-Season"]
    soils = ["Sandy", "Loamy", "Clay", "Silt", "Peat"]
    methods = ["Drip", "Sprinkler", "Flood", "Sub-irrigation"]

    data = []

    for _ in range(num_samples):
        crop = np.random.choice(crops)
        stage = np.random.choice(stages)
        soil = np.random.choice(soils)
        method = np.random.choice(methods)
        
        fc = SOIL_PHYSICS_PARAMS[soil]["field_capacity"]
        wp = SOIL_PHYSICS_PARAMS[soil]["wilting_point"]
        
        area_ha = round(np.random.uniform(0.5, 10.0), 2)
        root_depth_cm = round(np.random.uniform(20.0, 60.0), 1)
        
        # Environmental drivers
        temp = round(np.random.uniform(14.0, 42.0), 1)
        humidity = round(np.random.uniform(20.0, 95.0), 1)
        rainfall = round(np.random.exponential(scale=4.0), 1) if np.random.rand() > 0.65 else 0.0
        rain_prob = round(np.random.uniform(40.0, 100.0) if rainfall > 0 else np.random.uniform(0.0, 40.0), 1)
        wind = round(np.random.uniform(2.0, 25.0), 1)
        
        hours_since_irrigation = np.random.randint(2, 240)
        previous_soil_moisture = round(np.random.uniform(wp - 2.0, fc + 4.0), 1)
        previous_irrigation_amount = round(np.random.uniform(0.0, 15000.0), 1) if hours_since_irrigation < 72 else 0.0
        available_water = round(np.random.uniform(5000.0, 100000.0), 1)

        # Evapotranspiration physics (Penman-Monteith approximation)
        kc = KC_MAP[stage]
        et0 = (0.045 * temp + 0.1) * (1 + (100.0 - humidity) / 100.0 * 1.5) * (1 + wind / 20.0 * 0.25) + 1.0
        etc = et0 * kc
        
        # Water loss over elapsed time
        days_elapsed = hours_since_irrigation / 24.0
        water_loss_pct = (etc * days_elapsed * 0.4) / (root_depth_cm / 30.0)

        # Water gain from recent irrigation & rainfall
        eff = EFFICIENCY_MAP[method]
        irrigation_gain_pct = (previous_irrigation_amount / (max(1.0, area_ha) * 10000.0 * (root_depth_cm / 100.0))) * 100.0 * eff
        rainfall_gain_pct = (rainfall * 10.0 / root_depth_cm) * 100.0

        # Calculated target soil moisture
        noise = np.random.normal(0, 0.8)
        estimated_moisture = previous_soil_moisture + irrigation_gain_pct + rainfall_gain_pct - water_loss_pct + noise
        
        # Physical bounds clipping
        estimated_moisture = round(max(wp - 3.0, min(fc + 5.0, estimated_moisture)), 1)

        data.append({
            "temperature": temp,
            "humidity": humidity,
            "rainfall": rainfall,
            "rain_probability": rain_prob,
            "wind_speed": wind,
            "hours_since_last_irrigation": hours_since_irrigation,
            "previous_irrigation_amount": previous_irrigation_amount,
            "previous_soil_moisture": previous_soil_moisture,
            "available_water": available_water,
            "field_area": area_ha,
            "root_zone_depth": root_depth_cm,
            "field_capacity": fc,
            "wilting_point": wp,
            "soil_type": soil,
            "crop_name": crop,
            "growth_stage": stage,
            "irrigation_method": method,
            "soil_moisture_percent": estimated_moisture
        })

    return pd.DataFrame(data)

def train_and_select_best_model():
    print("==================================================")
    print("SOIL MOISTURE ML TRAINING PIPELINE (RF vs GB)")
    print("==================================================")

    # 1. Generate & Validate Dataset
    df = generate_soil_moisture_dataset(num_samples=3000)
    print(f"Generated synthetic training dataset: {df.shape[0]} samples, {df.shape[1]} features.")

    X = df[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y = df["soil_moisture_percent"]

    # 2. Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 3. Preprocessor Construction
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )

    # 4. Pipeline Definitions
    rf_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42, n_jobs=-1))
    ])

    gb_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", GradientBoostingRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42))
    ])

    # 5. Model Evaluation (Random Forest)
    print("\n--- Evaluating RandomForestRegressor ---")
    rf_pipeline.fit(X_train, y_train)
    rf_pred = rf_pipeline.predict(X_test)

    rf_mae = float(mean_absolute_error(y_test, rf_pred))
    rf_rmse = float(np.sqrt(mean_squared_error(y_test, rf_pred)))
    rf_r2 = float(r2_score(y_test, rf_pred))
    rf_cv_scores = cross_val_score(rf_pipeline, X, y, cv=5, scoring="r2", n_jobs=-1)

    print(f"RF MAE: {rf_mae:.3f} % | RMSE: {rf_rmse:.3f} % | R2: {rf_r2:.4f} | 5-Fold CV R2: {rf_cv_scores.mean():.4f}")

    # 6. Model Evaluation (Gradient Boosting)
    print("\n--- Evaluating GradientBoostingRegressor ---")
    gb_pipeline.fit(X_train, y_train)
    gb_pred = gb_pipeline.predict(X_test)

    gb_mae = float(mean_absolute_error(y_test, gb_pred))
    gb_rmse = float(np.sqrt(mean_squared_error(y_test, gb_pred)))
    gb_r2 = float(r2_score(y_test, gb_pred))
    gb_cv_scores = cross_val_score(gb_pipeline, X, y, cv=5, scoring="r2", n_jobs=-1)

    print(f"GB MAE: {gb_mae:.3f} % | RMSE: {gb_rmse:.3f} % | R2: {gb_r2:.4f} | 5-Fold CV R2: {gb_cv_scores.mean():.4f}")

    # 7. Model Comparison & Selection
    if rf_r2 >= gb_r2:
        best_pipeline = rf_pipeline
        best_name = "RandomForestRegressor"
        best_mae, best_rmse, best_r2 = rf_mae, rf_rmse, rf_r2
        best_cv_mean, best_cv_std = float(rf_cv_scores.mean()), float(rf_cv_scores.std())
    else:
        best_pipeline = gb_pipeline
        best_name = "GradientBoostingRegressor"
        best_mae, best_rmse, best_r2 = gb_mae, gb_rmse, gb_r2
        best_cv_mean, best_cv_std = float(gb_cv_scores.mean()), float(gb_cv_scores.std())

    print(f"\nBEST MODEL SELECTED: {best_name} (R2: {best_r2:.4f}, MAE: {best_mae:.3f})")

    # 8. Feature Importance Calculation
    ohe_cats = list(best_pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(CATEGORICAL_FEATURES))
    all_feature_names = NUMERIC_FEATURES + ohe_cats
    raw_importances = best_pipeline.named_steps["regressor"].feature_importances_

    importance_map = {}
    for fname, imp in zip(all_feature_names, raw_importances):
        base_name = fname.split("_")[0] if "_" in fname and fname.split("_")[0] in CATEGORICAL_FEATURES else fname
        importance_map[base_name] = round(importance_map.get(base_name, 0.0) + float(imp), 4)

    total_imp = sum(importance_map.values())
    importance_pct = {k: round((v / total_imp) * 100, 1) for k, v in sorted(importance_map.items(), key=lambda x: x[1], reverse=True)}

    # 9. Save Artifacts to Disk
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    model_filepath = os.path.join(SAVED_MODELS_DIR, "soil_moisture_model.joblib")
    metadata_filepath = os.path.join(SAVED_MODELS_DIR, "soil_moisture_metadata.json")

    joblib.dump(best_pipeline, model_filepath)

    metadata = {
        "model_name": best_name,
        "dataset_label": "Simulated/Synthetic Agricultural Training Data",
        "num_samples": len(df),
        "mae": round(best_mae, 3),
        "rmse": round(best_rmse, 3),
        "r2_score": round(best_r2, 4),
        "cv_r2_mean": round(best_cv_mean, 4),
        "cv_r2_std": round(best_cv_std, 4),
        "trained_at": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "feature_importances": importance_pct,
        "evaluation_comparison": {
            "RandomForestRegressor": {"mae": round(rf_mae, 3), "rmse": round(rf_rmse, 3), "r2": round(rf_r2, 4), "cv_r2": round(float(rf_cv_scores.mean()), 4)},
            "GradientBoostingRegressor": {"mae": round(gb_mae, 3), "rmse": round(gb_rmse, 3), "r2": round(gb_r2, 4), "cv_r2": round(float(gb_cv_scores.mean()), 4)}
        }
    }

    with open(metadata_filepath, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved binary model artifact to: {model_filepath}")
    print(f"Saved metadata & metrics to: {metadata_filepath}")

    return metadata

if __name__ == "__main__":
    train_and_select_best_model()
