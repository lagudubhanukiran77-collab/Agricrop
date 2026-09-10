"""
Explainable AI Service
Generates detailed, structured, human-readable explanations titled
'Why AI Recommends This Decision' with explicit data source labeling.
"""

def generate_recommendation_explanation(analysis_result):
    inputs = analysis_result["inputs"]
    decision = analysis_result["decision"]
    stress_score = analysis_result["stress_score"]
    decision_code = analysis_result.get("decision_code", "")
    water_scarcity_flag = analysis_result.get("water_scarcity_flag", False)
    data_source = inputs.get("data_source", "AI Estimated")

    soil_m = inputs["soil_moisture_pct"]
    soil_thresh = inputs["soil_threshold_moisture"]
    temp = inputs["temperature_c"]
    rain_prob = inputs["rain_probability_pct"]
    rainfall_mm = inputs["rainfall_mm"]
    stage = inputs["growth_stage"]
    crop = inputs["crop_name"]

    reasons = []

    # 1. Primary Soil Moisture Rationale (AI Estimated Disclaimer)
    if soil_m < soil_thresh:
        diff = round(soil_thresh - soil_m, 1)
        reasons.append(f"[AI Soil Moisture Model] Estimated Soil Moisture is {soil_m}% ({diff}% below threshold {soil_thresh}% for {crop}). Note: AI-predicted, not a direct sensor measurement.")
    else:
        diff = round(soil_m - soil_thresh, 1)
        reasons.append(f"[AI Soil Moisture Model] Estimated Soil Moisture ({soil_m}%) is in optimal range ({diff}% above threshold {soil_thresh}%). Note: AI-predicted, not a direct sensor measurement.")

    # 2. Crop Growth Stage Influence
    if stage == "Mid-Season":
        reasons.append(f"[Agronomic FAO-56] Crop '{crop}' is in peak 'Mid-Season' growth stage (Kc = 1.15), requiring maximum water intake.")
    elif stage == "Development":
        reasons.append(f"[Agronomic FAO-56] Crop '{crop}' is in 'Development' stage (Kc = 0.75) with accelerating vegetative growth.")
    elif stage == "Late-Season":
        reasons.append(f"[Agronomic FAO-56] Crop '{crop}' is in 'Late-Season' ripening stage (Kc = 0.70); water intake is naturally lower.")
    else:
        reasons.append(f"[Agronomic FAO-56] Crop '{crop}' is in 'Initial' establishment stage (Kc = 0.45); lower root-zone water requirement.")

    # 3. Evapotranspiration & Temperature Impact
    if temp >= 32.0:
        reasons.append(f"[Weather API] High temperature ({temp}°C) elevates daily evapotranspiration (ET0), accelerating soil drying.")
    elif temp <= 20.0:
        reasons.append(f"[Weather API] Mild ambient temperature ({temp}°C) limits evapotranspiration water loss.")

    # 4. Rain Forecast & Postponement Logic
    if rain_prob >= 75.0 and rainfall_mm >= 5.0:
        reasons.append(f"[Weather API Forecast] Heavy rain forecast ({rainfall_mm}mm, {rain_prob}% probability); irrigation is postponed to conserve water and prevent runoff.")
    elif rain_prob >= 50.0:
        reasons.append(f"[Weather API Forecast] Moderate rain probability ({rain_prob}%); irrigation volume is reduced to prevent soil over-saturation.")
    else:
        reasons.append(f"[Weather API Forecast] Low rain probability ({rain_prob}%); relying on controlled irrigation.")

    # 5. Flow Rate & Water Storage Constraint
    if analysis_result.get("duration_status_msg"):
        reasons.append(f"[Irrigation Flow Rate] {analysis_result['duration_status_msg']}")
    elif inputs.get("flow_rate_lpm"):
        reasons.append(f"[Irrigation Flow Rate] Calculated duration based on field flow rate ({inputs['flow_rate_lpm']} L/min).")

    if water_scarcity_flag:
        reasons.append(f"[Water Storage] Available reservoir storage is limited ({inputs['available_water_liters']} L); irrigation duration is rationed for water conservation.")

    if stress_score > 60.0:
        reasons.append(f"[ML Stress Model] Crop Water Stress Index is high ({stress_score}/100); hydration recommended to safeguard crop yield.")

    # 6. ML Model Feature Contribution Breakdown
    ml_importances = analysis_result.get("ml_soil_moisture_info", {}).get("feature_importances") or analysis_result["ml_details"].get("feature_importances", {})
    if ml_importances:
        top_factors = sorted(ml_importances.items(), key=lambda x: x[1], reverse=True)[:3]
        top_str = ", ".join([f"{k.replace('_', ' ')} ({v}%)" for k, v in top_factors])
        reasons.append(f"[ML Model Weights] Major decision drivers: {top_str}.")

    return reasons
