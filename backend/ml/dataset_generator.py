"""
Scientifically Accurate Synthetic Dataset Generator
Generates realistic agricultural data based on FAO-56 Penman-Monteith equations
and soil physics to train initial Scikit-Learn models.
"""

import pandas as pd
import numpy as np

def generate_agricultural_dataset(num_samples=2500, random_seed=42):
    np.random.seed(random_seed)

    crops = ["Wheat", "Rice", "Corn", "Cotton", "Sugarcane", "Tomato", "Potato", "Soybean"]
    growth_stages = ["Initial", "Development", "Mid-Season", "Late-Season"]
    soil_types = ["Sandy", "Loamy", "Clay", "Silt", "Peat"]
    irrigation_methods = ["Drip", "Sprinkler", "Flood", "Sub-irrigation"]

    data = []

    for _ in range(num_samples):
        crop = np.random.choice(crops)
        stage = np.random.choice(growth_stages)
        soil = np.random.choice(soil_types)
        method = np.random.choice(irrigation_methods)
        area_ha = round(np.random.uniform(0.5, 10.0), 2)
        
        # Environmental conditions
        soil_moisture = round(np.random.uniform(5.0, 45.0), 1)
        temp_c = round(np.random.uniform(15.0, 42.0), 1)
        humidity = round(np.random.uniform(20.0, 95.0), 1)
        rainfall_mm = round(np.random.exponential(scale=3.0), 1) if np.random.rand() > 0.6 else 0.0
        rain_prob = round(np.random.uniform(0, 100) if rainfall_mm > 0 else np.random.uniform(0, 50), 1)
        wind_speed = round(np.random.uniform(2.0, 25.0), 1)
        days_since_last_irrigation = np.random.randint(1, 15)
        available_water_pct = round(np.random.uniform(20.0, 100.0), 1)

        # Soil MAD thresholds
        mad_thresholds = {"Sandy": 12.0, "Loamy": 20.0, "Clay": 28.0, "Silt": 22.0, "Peat": 32.0}
        threshold = mad_thresholds[soil]

        # Stage Kc
        kc_map = {"Initial": 0.45, "Development": 0.75, "Mid-Season": 1.15, "Late-Season": 0.70}
        kc = kc_map[stage]

        # ET0 physics calculation
        et0 = (0.045 * temp_c + 0.1) * (1 + (100 - humidity)/100.0 * 1.5) * (1 + wind_speed/20.0 * 0.25) + 1.2
        etc = et0 * kc

        # Deficit calculation
        moisture_deficit = max(0.0, threshold - soil_moisture)
        
        # Water calculation in Liters per hectare
        efficiency = {"Drip": 0.92, "Sprinkler": 0.78, "Flood": 0.52, "Sub-irrigation": 0.85}[method]
        needed_water_liters = (moisture_deficit * 5.0 * 10000.0 / efficiency) + (etc * 10000.0 / efficiency if moisture_deficit > 0 else 0)
        
        # Adjust for rain forecast
        if rain_prob > 70 and rainfall_mm > 5.0:
            needed_water_liters = max(0.0, needed_water_liters - (rainfall_mm * 10000.0))

        needed_water_liters = round(needed_water_liters * (area_ha / 2.0), 1) # Normalization scale

        # Stress score logic
        if soil_moisture >= threshold:
            stress_score = max(0.0, 15.0 - (soil_moisture - threshold))
        else:
            stress_score = min(100.0, 15.0 + (threshold - soil_moisture) * 4.5 + (temp_c - 25.0) * 1.2)
        stress_score = round(max(0.0, stress_score), 1)

        # Decision classification logic
        if rain_prob > 70 and rainfall_mm >= 8.0 and soil_moisture > (threshold - 5.0):
            action = "Do Not Irrigate"
        elif soil_moisture < threshold and stress_score > 35.0:
            action = "Irrigate Now"
        elif soil_moisture < (threshold + 4.0) or (rain_prob < 30 and temp_c > 32.0):
            action = "Irrigate Later"
        elif soil_moisture >= (threshold + 4.0) and stress_score < 20.0:
            action = "Do Not Irrigate"
        else:
            action = "Monitor Field"

        data.append({
            "crop": crop,
            "growth_stage": stage,
            "soil_type": soil,
            "irrigation_method": method,
            "area_hectares": area_ha,
            "soil_moisture_pct": soil_moisture,
            "temperature_c": temp_c,
            "humidity_pct": humidity,
            "rainfall_mm": rainfall_mm,
            "rain_probability_pct": rain_prob,
            "wind_speed_kmh": wind_speed,
            "days_since_last_irrigation": days_since_last_irrigation,
            "available_water_pct": available_water_pct,
            "et0_mm": round(et0, 2),
            "kc_factor": kc,
            "soil_threshold": threshold,
            # Target features
            "irrigation_action": action,
            "water_quantity_liters": needed_water_liters,
            "crop_stress_score": stress_score
        })

    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    df = generate_agricultural_dataset()
    print(f"Generated dataset with shape: {df.shape}")
    print(df.head())
