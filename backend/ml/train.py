"""
Machine Learning Training Pipeline
Trains, evaluates, and selects best-performing models (Random Forest vs Gradient Boosting)
for irrigation classification and water requirement regression.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, mean_absolute_error, r2_score

from ml.dataset_generator import generate_agricultural_dataset
import config

CATEGORICAL_FEATURES = ["crop", "growth_stage", "soil_type", "irrigation_method"]
NUMERIC_FEATURES = [
    "area_hectares", "soil_moisture_pct", "temperature_c", "humidity_pct",
    "rainfall_mm", "rain_probability_pct", "wind_speed_kmh",
    "days_since_last_irrigation", "available_water_pct"
]

def train_and_evaluate_models(custom_df=None):
    """
    Trains Classification & Regression ML models, performs comparison,
    saves the best model binaries and returns evaluation metrics.
    """
    df = custom_df if custom_df is not None and len(custom_df) >= 100 else generate_agricultural_dataset()

    X = df[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y_action = df["irrigation_action"]
    y_water = df["water_quantity_liters"]
    y_stress = df["crop_stress_score"]

    # Train/Test Split (80/20)
    X_train, X_test, y_act_train, y_act_test, y_wat_train, y_wat_test, y_str_train, y_str_test = train_test_split(
        X, y_action, y_water, y_stress, test_size=0.2, random_state=42
    )

    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )

    metrics_summary = []

    # ==========================================
    # 1. CLASSIFICATION MODELS (Irrigation Action)
    # ==========================================
    clf_rf = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42))
    ])
    clf_gb = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", GradientBoostingClassifier(n_estimators=100, max_depth=6, random_state=42))
    ])

    clf_rf.fit(X_train, y_act_train)
    clf_gb.fit(X_train, y_act_train)

    rf_act_pred = clf_rf.predict(X_test)
    gb_act_pred = clf_gb.predict(X_test)

    rf_act_acc = accuracy_score(y_act_test, rf_act_pred)
    rf_act_f1 = f1_score(y_act_test, rf_act_pred, average="weighted")

    gb_act_acc = accuracy_score(y_act_test, gb_act_pred)
    gb_act_f1 = f1_score(y_act_test, gb_act_pred, average="weighted")

    # Select Best Classifier
    if gb_act_f1 > rf_act_f1:
        best_clf = clf_gb
        best_clf_name = "Gradient Boosting Classifier"
        best_clf_acc, best_clf_f1 = gb_act_acc, gb_act_f1
    else:
        best_clf = clf_rf
        best_clf_name = "Random Forest Classifier"
        best_clf_acc, best_clf_f1 = rf_act_acc, rf_act_f1

    metrics_summary.append({
        "model_name": best_clf_name,
        "model_type": "Classifier",
        "accuracy": round(float(best_clf_acc), 4),
        "f1_score": round(float(best_clf_f1), 4),
        "rmse": None, "mae": None, "r2_score": None
    })

    # ==========================================
    # 2. REGRESSION MODELS (Water Quantity)
    # ==========================================
    reg_rf = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])
    reg_gb = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", GradientBoostingRegressor(n_estimators=100, max_depth=6, random_state=42))
    ])

    reg_rf.fit(X_train, y_wat_train)
    reg_gb.fit(X_train, y_wat_train)

    rf_wat_pred = reg_rf.predict(X_test)
    gb_wat_pred = reg_gb.predict(X_test)

    rf_wat_rmse = np.sqrt(mean_squared_error(y_wat_test, rf_wat_pred))
    rf_wat_mae = mean_absolute_error(y_wat_test, rf_wat_pred)
    rf_wat_r2 = r2_score(y_wat_test, rf_wat_pred)

    gb_wat_rmse = np.sqrt(mean_squared_error(y_wat_test, gb_wat_pred))
    gb_wat_mae = mean_absolute_error(y_wat_test, gb_wat_pred)
    gb_wat_r2 = r2_score(y_wat_test, gb_wat_pred)

    # Select Best Water Regressor
    if gb_wat_r2 > rf_wat_r2:
        best_reg = reg_gb
        best_reg_name = "Gradient Boosting Regressor"
        best_reg_rmse, best_reg_mae, best_reg_r2 = gb_wat_rmse, gb_wat_mae, gb_wat_r2
    else:
        best_reg = reg_rf
        best_reg_name = "Random Forest Regressor"
        best_reg_rmse, best_reg_mae, best_reg_r2 = rf_wat_rmse, rf_wat_mae, rf_wat_r2

    metrics_summary.append({
        "model_name": best_reg_name,
        "model_type": "Regressor",
        "rmse": round(float(best_reg_rmse), 2),
        "mae": round(float(best_reg_mae), 2),
        "r2_score": round(float(best_reg_r2), 4),
        "accuracy": None, "f1_score": None
    })

    # ==========================================
    # 3. STRESS SCORE REGRESSION MODEL
    # ==========================================
    reg_stress = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42))
    ])
    reg_stress.fit(X_train, y_str_train)

    # Extract Feature Importances from best classifier
    ohe_cats = list(best_clf.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(CATEGORICAL_FEATURES))
    feature_names = NUMERIC_FEATURES + ohe_cats
    
    if hasattr(best_clf.named_steps["classifier"], "feature_importances_"):
        raw_importances = best_clf.named_steps["classifier"].feature_importances_
        importance_dict = {}
        for name, imp in zip(feature_names, raw_importances):
            # Group categorical names back to main feature
            clean_name = name.split("_")[0] if "_" in name and name.split("_")[0] in CATEGORICAL_FEATURES else name
            importance_dict[clean_name] = round(importance_dict.get(clean_name, 0.0) + float(imp), 4)
    else:
        importance_dict = {f: round(1.0 / len(NUMERIC_FEATURES), 3) for f in NUMERIC_FEATURES}

    # Normalize importances to sum to 100%
    total_imp = sum(importance_dict.values())
    if total_imp > 0:
        importance_dict = {k: round((v / total_imp) * 100, 1) for k, v in importance_dict.items()}

    # Save trained pipelines to disk
    save_dir = config.SAVED_MODELS_DIR
    os.makedirs(save_dir, exist_ok=True)

    joblib.dump(best_clf, os.path.join(save_dir, "best_action_classifier.joblib"))
    joblib.dump(best_reg, os.path.join(save_dir, "best_water_regressor.joblib"))
    joblib.dump(reg_stress, os.path.join(save_dir, "best_stress_regressor.joblib"))
    joblib.dump(importance_dict, os.path.join(save_dir, "feature_importances.joblib"))

    print(f"Models successfully trained and saved to {save_dir}")
    print(f"Action Classifier: {best_clf_name} (Accuracy: {best_clf_acc:.4f}, F1: {best_clf_f1:.4f})")
    print(f"Water Regressor: {best_reg_name} (R2: {best_reg_r2:.4f}, RMSE: {best_reg_rmse:.2f})")

    return metrics_summary, importance_dict

if __name__ == "__main__":
    train_and_evaluate_models()
