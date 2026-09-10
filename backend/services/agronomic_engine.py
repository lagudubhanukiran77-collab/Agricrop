"""
Agronomic Intelligence Engine
Implements FAO-56 Penman-Monteith evapotranspiration calculations,
soil moisture deficit calculations, and crop stage coefficient adjustments.
"""

SOIL_PROPERTIES = {
    "Sandy": {"field_capacity": 18.0, "wilting_point": 6.0, "mad_threshold": 12.0, "root_depth_m": 0.5},
    "Loamy": {"field_capacity": 28.0, "wilting_point": 12.0, "mad_threshold": 20.0, "root_depth_m": 0.6},
    "Clay": {"field_capacity": 38.0, "wilting_point": 20.0, "mad_threshold": 28.0, "root_depth_m": 0.7},
    "Silt": {"field_capacity": 32.0, "wilting_point": 15.0, "mad_threshold": 22.0, "root_depth_m": 0.6},
    "Peat": {"field_capacity": 45.0, "wilting_point": 25.0, "mad_threshold": 32.0, "root_depth_m": 0.5}
}

IRRIGATION_EFFICIENCY = {
    "Drip": 0.92,
    "Sprinkler": 0.78,
    "Flood": 0.52,
    "Sub-irrigation": 0.85
}

CROP_STAGE_KC = {
    "Initial": 0.45,
    "Development": 0.75,
    "Mid-Season": 1.15,
    "Late-Season": 0.70
}

CROP_BASE_KC = {
    "Wheat": 1.0,
    "Rice": 1.15,
    "Corn": 1.05,
    "Cotton": 1.0,
    "Sugarcane": 1.25,
    "Tomato": 1.10,
    "Potato": 1.05,
    "Soybean": 1.0,
    "Vegetables": 0.95
}

def calculate_et0(temperature_c, humidity_pct, wind_speed_kmh):
    """
    Calculates reference crop evapotranspiration ET0 (mm/day)
    based on atmospheric parameters (FAO-56 derived formulation).
    """
    # Base temperature effect
    temp_factor = max(0.5, 0.045 * temperature_c + 0.1)
    
    # Vapor pressure deficit effect from humidity
    humidity_factor = max(0.2, (100.0 - humidity_pct) / 100.0)
    
    # Wind speed factor
    wind_factor = 1.0 + (wind_speed_kmh / 20.0) * 0.25
    
    et0 = temp_factor * (1 + humidity_factor * 1.5) * wind_factor + 1.2
    return round(max(1.0, min(14.0, et0)), 2)

def calculate_crop_water_requirement(
    crop_name, growth_stage, soil_type, current_moisture_pct,
    temperature_c, humidity_pct, wind_speed_kmh, area_hectares, irrigation_method
):
    """
    Computes exact crop evapotranspiration (ETc), soil water deficit,
    and required irrigation volume in Liters.
    """
    soil_info = SOIL_PROPERTIES.get(soil_type, SOIL_PROPERTIES["Loamy"])
    efficiency = IRRIGATION_EFFICIENCY.get(irrigation_method, 0.80)
    
    # Get Kc multiplier based on growth stage & crop base
    stage_kc = CROP_STAGE_KC.get(growth_stage, 1.0)
    crop_base = CROP_BASE_KC.get(crop_name, 1.0)
    total_kc = stage_kc * crop_base

    # ET0 and ETc
    et0 = calculate_et0(temperature_c, humidity_pct, wind_speed_kmh)
    etc_mm_day = round(et0 * total_kc, 2)

    # Soil moisture deficit calculation
    threshold_moisture = soil_info["mad_threshold"]
    moisture_deficit_pct = max(0.0, threshold_moisture - current_moisture_pct)
    
    # Calculate depth needed in mm
    # 1% moisture deficit across root depth = (deficit_pct/100) * root_depth_m * 1000 mm
    deficit_depth_mm = (moisture_deficit_pct / 100.0) * soil_info["root_depth_m"] * 1000.0
    
    # Total net depth required considering daily crop evapotranspiration demand
    total_depth_mm = deficit_depth_mm + (etc_mm_day if current_moisture_pct <= threshold_moisture else 0.0)
    
    # Area in m²: 1 hectare = 10,000 m²
    area_m2 = area_hectares * 10000.0
    
    # 1 mm depth over 1 m² = 1 Liter
    net_water_liters = total_depth_mm * area_m2
    gross_water_liters = round(net_water_liters / efficiency, 1) if efficiency > 0 else net_water_liters

    # Estimate duration in minutes based on typical flow rates (e.g. 50 L/min per hectare for drip, 120 L/min for sprinkler)
    flow_rate_lpm = 80.0 * area_hectares if irrigation_method == "Drip" else (150.0 * area_hectares if irrigation_method == "Sprinkler" else 300.0 * area_hectares)
    recommended_duration_mins = int(round(gross_water_liters / max(10.0, flow_rate_lpm))) if gross_water_liters > 0 else 0

    # Calculate Water Stress Index (0 - 100%)
    wilting = soil_info["wilting_point"]
    field_cap = soil_info["field_capacity"]
    if current_moisture_pct >= threshold_moisture:
        stress_score = max(0.0, 10.0 * (field_cap - current_moisture_pct) / (field_cap - threshold_moisture))
    else:
        # Scale between threshold and wilting point
        stress_range = max(1.0, threshold_moisture - wilting)
        stress_score = 10.0 + 90.0 * ((threshold_moisture - current_moisture_pct) / stress_range)
    
    stress_score = round(min(100.0, max(0.0, stress_score)), 1)

    return {
        "et0_mm_day": et0,
        "kc_factor": round(total_kc, 2),
        "etc_mm_day": etc_mm_day,
        "soil_threshold_moisture": threshold_moisture,
        "moisture_deficit_pct": round(moisture_deficit_pct, 1),
        "gross_water_liters": gross_water_liters,
        "net_water_liters": round(net_water_liters, 1),
        "recommended_duration_mins": min(480, max(0, recommended_duration_mins)),
        "stress_score": stress_score,
        "irrigation_efficiency": efficiency
    }
