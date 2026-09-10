"""
Location Intelligence Service
Handles reverse-geocoding (lat, lon -> location name, district, state, country)
and location search using Open-Meteo Geocoding / Nominatim API with offline fallbacks.
"""

import urllib.request
import urllib.parse
import json

def reverse_geocode(latitude, longitude):
    """
    Converts latitude & longitude into readable agricultural location name:
    Village/Area, District, State, Country.
    """
    try:
        # OpenStreetMap Nominatim Reverse API
        url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json&zoom=14"
        req = urllib.request.Request(url, headers={'User-Agent': 'AgriCrop-Platform/1.0'})
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.loads(response.read().decode('utf-8'))
            address = data.get('address', {})

            village = address.get('village') or address.get('town') or address.get('suburb') or address.get('county') or "Farm Area"
            mandal = address.get('mandal') or address.get('taluk') or address.get('state_district') or ""
            district = address.get('district') or address.get('county') or mandal or "District"
            state = address.get('state', 'State')
            country = address.get('country', 'India')

            location_name = f"{village}"
            if mandal and mandal != village:
                location_name += f", {mandal}"

            return {
                "latitude": latitude,
                "longitude": longitude,
                "location_name": location_name,
                "district": district,
                "state": state,
                "country": country,
                "formatted_address": f"{location_name}, {district}, {state}"
            }
    except Exception as e:
        print(f"Reverse geocoding API warning: {e}. Using fallback location parser.")
        # Fallback approximation for Indian agricultural regions or generic coordinates
        return {
            "latitude": latitude,
            "longitude": longitude,
            "location_name": f"Farm Sector ({latitude:.2f}N, {longitude:.2f}E)",
            "district": "Agricultural Zone",
            "state": "Andhra Pradesh",
            "country": "India",
            "formatted_address": f"Farm Sector ({latitude:.2f}N, {longitude:.2f}E), Andhra Pradesh"
        }

def search_location(query):
    """
    Searches locations by name query and returns matching coordinates & location names.
    """
    return search_locations(query)

def search_locations(query):
    """
    Searches locations by name query and returns matching coordinates & location names.
    """
    if not query or len(query.strip()) < 2:
        return []

    try:
        encoded_q = urllib.parse.quote(query.strip())
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded_q}&count=5&language=en&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'AgriCrop-Platform/1.0'})
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.loads(response.read().decode('utf-8'))
            results = data.get('results', [])

            formatted_results = []
            for r in results:
                formatted_results.append({
                    "name": r.get('name'),
                    "district": r.get('admin2') or r.get('admin1') or "",
                    "state": r.get('admin1', ''),
                    "country": r.get('country', ''),
                    "latitude": r.get('latitude'),
                    "longitude": r.get('longitude'),
                    "formatted": f"{r.get('name')}, {r.get('admin1', '')}, {r.get('country', '')}"
                })
            return formatted_results
    except Exception as e:
        print(f"Location search API warning: {e}")
        # Static search fallback for common Indian agricultural hubs
        sample_hubs = [
            {"name": "D. Yerravaram", "district": "East Godavari", "state": "Andhra Pradesh", "country": "India", "latitude": 17.1856, "longitude": 81.9685, "formatted": "D. Yerravaram, Andhra Pradesh, India"},
            {"name": "Kakinada", "district": "Kakinada", "state": "Andhra Pradesh", "country": "India", "latitude": 16.9891, "longitude": 82.2475, "formatted": "Kakinada, Andhra Pradesh, India"},
            {"name": "Guntur", "district": "Guntur", "state": "Andhra Pradesh", "country": "India", "latitude": 16.3067, "longitude": 80.4365, "formatted": "Guntur, Andhra Pradesh, India"},
            {"name": "Vijayawada", "district": "NTR", "state": "Andhra Pradesh", "country": "India", "latitude": 16.5062, "longitude": 80.6480, "formatted": "Vijayawada, Andhra Pradesh, India"},
            {"name": "Ludhiana", "district": "Ludhiana", "state": "Punjab", "country": "India", "latitude": 30.9010, "longitude": 75.8573, "formatted": "Ludhiana, Punjab, India"}
        ]
        return [h for h in sample_hubs if query.lower() in h["name"].lower() or query.lower() in h["state"].lower()]
