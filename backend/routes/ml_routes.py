import json
from flask import Blueprint, request, jsonify
from database.db import db
from database.models import MLModelMetric, MLPrediction
from ml.predict_soil_moisture import predict_estimated_soil_moisture, get_model_info
from ml.train_soil_moisture import train_and_select_best_model
from ml.predictor import predict_irrigation
from ml.train import train_and_evaluate_models

ml_bp = Blueprint('ml_bp', __name__)

@ml_bp.route('/api/ml/predict-soil-moisture', methods=['POST'])
def predict_soil_moisture_route():
    """
    POST /api/ml/predict-soil-moisture
    Predicts Estimated Soil Moisture using trained ML Joblib model.
    """
    data = request.get_json() or {}
    res = predict_estimated_soil_moisture(data)

    field_id = data.get('field_id')
    if field_id and res.get('estimated_soil_moisture') is not None:
        rec = MLPrediction(
            field_id=field_id,
            model_name=res.get('model_name', 'GradientBoostingRegressor'),
            estimated_soil_moisture=res.get('estimated_soil_moisture'),
            data_confidence=res.get('data_confidence', 'Medium'),
            input_snapshot=json.dumps(data),
            model_version='1.0.0'
        )
        db.session.add(rec)
        db.session.commit()

    return jsonify(res), 200

@ml_bp.route('/api/ml/model-info', methods=['GET'])
def get_soil_moisture_model_info_route():
    """
    GET /api/ml/model-info
    Returns genuine ML model evaluation metrics (MAE, RMSE, R2), training sample count, and feature importances.
    """
    info = get_model_info()
    return jsonify(info), 200

@ml_bp.route('/api/ml/metrics', methods=['GET'])
def get_ml_metrics():
    metrics = MLModelMetric.query.order_by(MLModelMetric.trained_at.desc()).all()
    if not metrics:
        # Run training once to populate database metrics
        summary, importances = train_and_evaluate_models()
        for item in summary:
            rec = MLModelMetric(
                model_name=item["model_name"],
                model_type=item["model_type"],
                rmse=item.get("rmse"),
                mae=item.get("mae"),
                r2_score=item.get("r2_score"),
                accuracy=item.get("accuracy"),
                f1_score=item.get("f1_score"),
                feature_importances_json=json.dumps(importances)
            )
            db.session.add(rec)
        db.session.commit()
        metrics = MLModelMetric.query.order_by(MLModelMetric.trained_at.desc()).all()

    # Combine with soil moisture metadata
    soil_info = get_model_info()

    return jsonify({
        "legacy_metrics": [m.to_dict() for m in metrics],
        "soil_moisture_model": soil_info
    }), 200

@ml_bp.route('/api/ml/predict', methods=['POST'])
def direct_ml_predict():
    data = request.get_json() or {}
    result = predict_irrigation(data)
    return jsonify(result), 200

@ml_bp.route('/api/ml/retrain', methods=['POST'])
def retrain_ml_models():
    """
    Triggers explicit model retraining pipeline using latest historical field data.
    """
    sm_meta = train_and_select_best_model()
    summary, importances = train_and_evaluate_models()
    
    # Save newly evaluated metrics to database
    for item in summary:
        rec = MLModelMetric(
            model_name=item["model_name"],
            model_type=item["model_type"],
            rmse=item.get("rmse"),
            mae=item.get("mae"),
            r2_score=item.get("r2_score"),
            accuracy=item.get("accuracy"),
            f1_score=item.get("f1_score"),
            feature_importances_json=json.dumps(importances)
        )
        db.session.add(rec)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'ML Models retrained and evaluated successfully',
        'soil_moisture_model': sm_meta,
        'action_metrics': summary
    }), 200
