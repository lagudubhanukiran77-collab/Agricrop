"""
Live Weather Service (Open-Meteo Integration)
Fetches hyper-local live weather & forecast based on field latitude and longitude.
Implements SQLite caching and offline fallback handling.
"""

import urllib.request
import json
from datetime import datetime
from database.db import db
from database.models import WeatherData, Field

WMO_WEATHER_CODES = {
    0: ("Clear Sky", "Sunny & clear sky"),
    1: ("Mainly Clear", "Mainly clear sky"),
    2: ("Partly Cloudy", "Partly cloudy"),
    3: ("Overcast", "Overcast sky"),
    45: ("Foggy", "Foggy conditions"),
    48: ("Depositing Rime Fog", "Rime fog"),
    51: ("Light Drizzle", "Light drizzle expected"),
    53: ("Moderate Drizzle", "Moderate drizzle expected"),
    55: ("Dense Drizzle", "Dense drizzle expected"),
    61: ("Slight Rain", "Light rainfall expected"),
    63: ("Moderate Rain", "Moderate rainfall expected"),
    65: ("Heavy Rain", "Heavy rainfall expected"),
    80: ("Slight Rain Showers", "Slight rain showers"),
    81: ("Moderate Rain Showers", "Moderate rain showers"),
    82: ("Violent Rain Showers", "Violent rain showers"),
    95: ("Thunderstorm", "Thunderstorm expected"),
    96: ("Thunderstorm with Slight Hail", "Thunderstorm with hail"),
    99: ("Thunderstorm with Heavy Hail", "Severe thunderstorm with hail")
}

def fetch_live_field_weather(field_id, latitude=None, longitude=None, force_refresh=False):
    """
    Fetches live weather from Open-Meteo API for field's specific coordinates.
    Falls back to cached SQLite weather data if network or API fails.
    """
    field = Field.query.get(field_id) if field_id else None
    
    # Resolve coordinates
    lat = latitude if latitude is not None else (field.latitude if field and field.latitude else 17.1856)
    lon = longitude if longitude is not None else (field.longitude if field and field.longitude else 81.9685)

    # 1. Check if cached weather is recent (less than 30 minutes old) unless force_refresh
    if field_id and not force_refresh:
        latest_cache = WeatherData.query.filter_by(field_id=field_id).order_by(WeatherData.timestamp.desc()).first()
        if latest_cache:
            diff_mins = (datetime.utcnow() - latest_cache.timestamp).total_seconds() / 60.0
            if diff_mins < 30.0:
                cache_dict = latest_cache.to_dict()
                cache_dict["status_badge"] = "CACHED WEATHER"
                return cache_dict

    # 2. Call Open-Meteo Live API
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,weather_code,wind_speed_10m"
            f"&hourly=temperature_2m,precipitation_probability,precipitation"
            f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max"
            f"&timezone=auto"
        )
        req = urllib.request.Request(url, headers={'User-Agent': 'AgriCrop-Platform/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            
            curr = res_data.get('current', {})
            daily = res_data.get('daily', {})
            hourly = res_data.get('hourly', {})

            temp_c = float(curr.get('temperature_2m', 30.0))
            humidity = float(curr.get('relative_humidity_2m', 50.0))
            rain_mm = float(curr.get('precipitation', 0.0))
            wind_kmh = float(curr.get('wind_speed_10m', 6.0))
            wmo_code = int(curr.get('weather_code', 0))

            w_cond, f_summary = WMO_WEATHER_CODES.get(wmo_code, ("Partly Cloudy", "Rain unlikely for next 12 hours"))

            # Calculate max daily rain probability
            daily_probs = daily.get('precipitation_probability_max', [10.0])
            rain_prob_pct = float(daily_probs[0]) if daily_probs else 10.0

            # Build forecast lists
            hourly_list = []
            if 'time' in hourly:
                times = hourly.get('time', [])[:12]
                temps = hourly.get('temperature_2m', [])[:12]
                probs = hourly.get('precipitation_probability', [])[:12]
                for i in range(len(times)):
                    time_str = times[i].split('T')[-1] if 'T' in times[i] else times[i]
                    hourly_list.append({
                        "time": time_str,
                        "temperature_c": temps[i] if i < len(temps) else temp_c,
                        "rain_prob_pct": probs[i] if i < len(probs) else rain_prob_pct
                    })

            daily_list = []
            if 'time' in daily:
                dates = daily.get('time', [])[:5]
                t_max = daily.get('temperature_2m_max', [])[:5]
                t_min = daily.get('temperature_2m_min', [])[:5]
                p_sum = daily.get('precipitation_sum', [])[:5]
                p_prob = daily.get('precipitation_probability_max', [])[:5]
                w_codes = daily.get('weather_code', [])[:5]
                for i in range(len(dates)):
                    code = w_codes[i] if i < len(w_codes) else 0
                    cond, _ = WMO_WEATHER_CODES.get(code, ("Clear", "Clear sky"))
                    daily_list.append({
                        "date": dates[i],
                        "temp_max_c": t_max[i] if i < len(t_max) else temp_c,
                        "temp_min_c": t_min[i] if i < len(t_min) else temp_c - 8,
                        "rainfall_mm": p_sum[i] if i < len(p_sum) else 0.0,
                        "rain_prob_pct": p_prob[i] if i < len(p_prob) else 10.0,
                        "condition": cond
                    })

            # 3. Cache weather response into SQLite
            if field_id:
                w_record = WeatherData(
                    field_id=field_id,
                    latitude=lat,
                    longitude=lon,
                    temperature_c=temp_c,
                    humidity_pct=humidity,
                    rainfall_mm=rain_mm,
                    rain_probability_pct=rain_prob_pct,
                    wind_speed_kmh=wind_kmh,
                    weather_condition=w_cond,
                    forecast_summary=f_summary,
                    data_source="LIVE WEATHER",
                    hourly_json=json.dumps(hourly_list),
                    daily_json=json.dumps(daily_list)
                )
                db.session.add(w_record)
                db.session.commit()
                out_dict = w_record.to_dict()
            else:
                out_dict = {
                    "field_id": None,
                    "latitude": lat,
                    "longitude": lon,
                    "temperature_c": temp_c,
                    "humidity_pct": humidity,
                    "rainfall_mm": rain_mm,
                    "rain_probability_pct": rain_prob_pct,
                    "wind_speed_kmh": wind_kmh,
                    "weather_condition": w_cond,
                    "forecast_summary": f_summary,
                    "data_source": "LIVE WEATHER",
                    "hourly_forecast": hourly_list,
                    "daily_forecast": daily_list,
                    "timestamp": datetime.utcnow().isoformat()
                }

            out_dict["status_badge"] = "LIVE WEATHER"
            return out_dict

    except Exception as e:
        print(f"Open-Meteo Live API request exception: {e}. Falling back to cached SQLite weather.")
        
        # 4. Fallback: Retrieve last cached WeatherData from SQLite
        if field_id:
            cached = WeatherData.query.filter_by(field_id=field_id).order_by(WeatherData.timestamp.desc()).first()
            if cached:
                cached_dict = cached.to_dict()
                cached_dict["data_source"] = "CACHED WEATHER"
                cached_dict["status_badge"] = "CACHED WEATHER (Offline Fallback)"
                return cached_dict

        # Fallback dictionary if no cache exists
        return {
            "field_id": field_id,
            "latitude": lat,
            "longitude": lon,
            "temperature_c": 29.5,
            "humidity_pct": 52.0,
            "rainfall_mm": 0.0,
            "rain_probability_pct": 15.0,
            "wind_speed_kmh": 7.0,
            "weather_condition": "Partly Cloudy",
            "forecast_summary": "Weather service temporarily unavailable. Using cached/historical baseline.",
            "data_source": "WEATHER UNAVAILABLE",
            "status_badge": "WEATHER UNAVAILABLE",
            "hourly_forecast": [],
            "daily_forecast": [],
            "timestamp": datetime.utcnow().isoformat()
        }
