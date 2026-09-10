"""
Hybrid Decision Intelligence Engine
Combines ML Soil Moisture Estimation & ML Predictions with agronomic laws (FAO-56),
live weather forecasts, flow rate equations, and real-time water budget constraints.
"""

from services.agronomic_engine import calculate_crop_water_requirement, SOIL_PROPERTIES
from ml.predictor import predict_irrigation
from ml.predict_soil_moisture import predict_estimated_soil_moisture

def analyze_field_irrigation(field_dict, env_dict, crop_dict):
    """
    Main decision workflow:
    Field & Crop info -> Live Weather -> ML Soil Moisture Estimation -> Hybrid Rules -> Decision
    """
    # 1. Extract inputs
    area_ha = float(field_dict.get("area_hectares", 1.0))
    soil_type = field_dict.get("soil_type", "Loamy")
    method = field_dict.get("irrigation_method", "Drip")
    available_water_l = float(field_dict.get("available_water_liters", 50000.0))
    flow_rate_lpm = float(field_dict.get("flow_rate_lpm")) if field_dict.get("flow_rate_lpm") is not None else None
    
    crop_name = crop_dict.get("crop_name", "Wheat") if crop_dict else "Wheat"
    growth_stage = crop_dict.get("growth_stage", "Mid-Season") if crop_dict else "Mid-Season"

    temp_c = float(env_dict.get("temperature_c", 28.0))
    humidity = float(env_dict.get("humidity_pct", 50.0))
    rainfall_mm = float(env_dict.get("rainfall_mm", 0.0))
    rain_prob = float(env_dict.get("rain_probability_pct", 0.0))
    wind_speed = float(env_dict.get("wind_speed_kmh", 8.0))
    days_since_irr = int(env_dict.get("days_since_last_irrigation", 3))
    data_source = env_dict.get("source", "AI Estimated")

    # 2. Get Estimated Soil Moisture from ML Model
    ml_sm_res = predict_estimated_soil_moisture({
        "soil_type": soil_type,
        "crop_name": crop_name,
        "growth_stage": growth_stage,
        "irrigation_method": method,
        "temperature_c": temp_c,
        "humidity_pct": humidity,
        "rainfall_mm": rainfall_mm,
        "rain_probability_pct": rain_prob,
        "wind_speed_kmh": wind_speed,
        "hours_since_last_irrigation": days_since_irr * 24.0,
        "area_hectares": area_ha,
        "available_water_liters": available_water_l,
        "previous_soil_moisture": float(env_dict.get("soil_moisture_pct", 24.0)),
        "field_capacity": float(field_dict.get("field_capacity", 32.0)),
        "wilting_point": float(field_dict.get("wilting_point", 14.0)),
        "root_zone_depth": float(field_dict.get("root_zone_depth", 30.0))
    })

    soil_moisture = ml_sm_res.get("estimated_soil_moisture") if ml_sm_res.get("estimated_soil_moisture") is not None else float(env_dict.get("soil_moisture_pct", 24.0))

    # 3. Compute Agronomic baseline calculations
    agronomic_calc = calculate_crop_water_requirement(
        crop_name=crop_name,
        growth_stage=growth_stage,
        soil_type=soil_type,
        current_moisture_pct=soil_moisture,
        temperature_c=temp_c,
        humidity_pct=humidity,
        wind_speed_kmh=wind_speed,
        area_hectares=area_ha,
        irrigation_method=method
    )

    # 4. Call ML Action & Water Predictor
    ml_input = {
        "crop_name": crop_name,
        "growth_stage": growth_stage,
        "soil_type": soil_type,
        "irrigation_method": method,
        "area_hectares": area_ha,
        "soil_moisture_pct": soil_moisture,
        "temperature_c": temp_c,
        "humidity_pct": humidity,
        "rainfall_mm": rainfall_mm,
        "rain_probability_pct": rain_prob,
        "wind_speed_kmh": wind_speed,
        "days_since_last_irrigation": days_since_irr,
        "available_water_pct": min(100.0, (available_water_l / max(1000.0, area_ha * 20000.0)) * 100.0)
    }
    ml_result = predict_irrigation(ml_input)

    # 5. Hybrid Synthesis Logic
    threshold_moisture = agronomic_calc["soil_threshold_moisture"]
    agro_water = agronomic_calc["gross_water_liters"]
    ml_water = ml_result["ml_water_liters"]

    # Hybrid water requirement: 60% Agronomic + 40% ML
    combined_water_l = round(0.6 * agro_water + 0.4 * ml_water, 1)

    # Stress score synthesis
    combined_stress = round(0.6 * agronomic_calc["stress_score"] + 0.4 * ml_result["ml_stress_score"], 1)

    # Decision Matrix & Priority Alignment
    if rain_prob >= 75.0 and (rainfall_mm >= 8.0 or combined_stress < 40.0):
        final_decision = "Do Not Irrigate"
        priority_level = "Low"
        decision_reason_code = "HEAVY_RAIN_EXPECTED"
        combined_water_l = 0.0
    elif soil_moisture < threshold_moisture and combined_stress > 35.0:
        if rain_prob >= 55.0 and rainfall_mm >= 5.0:
            final_decision = "Irrigate Later"
            priority_level = "Medium"
            decision_reason_code = "LIGHT_RAIN_POSTPONE"
            min_required = round(1800.0 * area_ha, 1)
            combined_water_l = max(min_required, round(combined_water_l * 0.5, 1))
        else:
            final_decision = "Irrigate Now"
            priority_level = "Critical" if combined_stress > 65.0 else "High"
            decision_reason_code = "HIGH_STRESS_DEFICIT"
            min_required = round(2500.0 * area_ha, 1)
            combined_water_l = max(min_required, combined_water_l)
    elif soil_moisture < (threshold_moisture + 4.0) or temp_c >= 34.0:
        final_decision = "Irrigate Later"
        priority_level = "Medium"
        decision_reason_code = "PREVENTATIVE_IRRIGATION"
        min_required = round(1500.0 * area_ha, 1)
        combined_water_l = max(min_required, round(combined_water_l * 0.6, 1))
    else:
        final_decision = "Do Not Irrigate" if combined_stress < 15.0 else "Monitor Field"
        priority_level = "Low"
        decision_reason_code = "ADEQUATE_MOISTURE"
        combined_water_l = 0.0

    # Water budget constraint adjustment
    water_scarcity_flag = False
    if combined_water_l > available_water_l and combined_water_l > 0:
        water_scarcity_flag = True
        combined_water_l = max(500.0, available_water_l)
        if final_decision == "Irrigate Now":
            final_decision = "Irrigate Later"
            priority_level = "High"

    # Duration & Water volume calculation based on FAO-56 Crop Water Demand
    eff_flow_rate = flow_rate_lpm if (flow_rate_lpm and flow_rate_lpm > 0) else 80.0
    baseline_crop_water_l = round(agro_water, 1) if agro_water > 0 else round(area_ha * 16000.0, 1)

    display_water_l = combined_water_l if combined_water_l > 0 else baseline_crop_water_l
    display_duration_mins = max(15, int(round(display_water_l / eff_flow_rate))) if eff_flow_rate > 0 else 30

    # Best time window
    if temp_c > 30.0:
        rec_time = "Early Morning (05:30 - 07:30)"
    else:
        rec_time = "Evening (17:30 - 19:30)"

    # Confidence score & data status calculation
    confidence = 85.0
    if "Live" in str(data_source) or "Open-Meteo" in str(data_source):
        confidence += 8.0
        data_status = "Live Weather + ML Soil Moisture + Agronomic Rules"
    elif "Cached" in str(data_source):
        confidence += 4.0
        data_status = "Cached Weather + ML Soil Moisture"
    else:
        data_status = "AI Estimated Soil Moisture + Field Rules"

    confidence_score = min(96.0, max(70.0, round(confidence, 1)))

    return {
        "decision": final_decision,
        "estimated_soil_moisture": soil_moisture,
        "estimated_water_liters": display_water_l,
        "action_water_liters": combined_water_l,
        "recommended_duration_mins": min(480, display_duration_mins),
        "duration_status_msg": None,
        "flow_rate_lpm": flow_rate_lpm,
        "recommended_time": rec_time,
        "priority_level": priority_level,
        "stress_score": combined_stress,
        "confidence_score": confidence_score,
        "data_status": data_status,
        "ml_soil_moisture_info": ml_sm_res,
        "agronomic_details": agronomic_calc,
        "ml_details": ml_result,
        "decision_code": decision_reason_code,
        "water_scarcity_flag": water_scarcity_flag,
        "data_source": data_source,
        "inputs": {
            "soil_moisture_pct": soil_moisture,
            "temperature_c": temp_c,
            "humidity_pct": humidity,
            "rainfall_mm": rainfall_mm,
            "rain_probability_pct": rain_prob,
            "soil_threshold_moisture": threshold_moisture,
            "crop_name": crop_name,
            "growth_stage": growth_stage,
            "area_hectares": area_ha,
            "available_water_liters": available_water_l,
            "flow_rate_lpm": flow_rate_lpm,
            "data_source": data_source
        }
    }
