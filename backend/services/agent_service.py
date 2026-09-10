import re
from datetime import datetime
from database.models import Field, EnvironmentalData, IrrigationHistory, Alert, db
from services.hybrid_decision_engine import analyze_field_irrigation
from ml.predict_soil_moisture import predict_estimated_soil_moisture
import requests

def get_localized_prompts(lang='en'):
    prompts = {
        'en': [
            "🌾 Which fields need water right now?",
            "🌤️ Get live hyper-local weather forecast",
            "🤖 Inspect ML Soil Moisture Model performance",
            "🧠 Recalculate AI decision for active field"
        ],
        'te': [
            "🌾 ఏ పొలాలకు ఇప్పుడు నీరు అవసరం?",
            "🌤️ ప్రత్యక్ష ప్రాంతీయ వాతావరణం పొందు",
            "🤖 మృత్తిక తేమ ML మోడల్ ఫలితాలు పరిశీలించు",
            "🧠 ప్రస్తుత పొలానికి AI నీటిపారుదల నిర్ణయం లెక్కించు"
        ],
        'hi': [
            "🌾 किन खेतों को अभी पानी की आवश्यकता है?",
            "🌤️ लाइव स्थानीय मौसम पूर्वानुमान प्राप्त करें",
            "🤖 मृदा नमी ML मॉडल प्रदर्शन की जांच करें",
            "🧠 सक्रिय खेत के लिए AI निर्णय की पुनर्गणना करें"
        ],
        'ta': [
            "🌾 எந்த வயல்களுக்கு இப்போது பாசனம் தேவை?",
            "🌤️ நிகழ்நேர உள்ளூர் வானிலை முன்னறிவிப்பு",
            "🤖 மண் ஈரம் ML மாதிரி திறனை ஆய்வு செய்",
            "🧠 தற்போதைய வயலுக்கான AI பாசன முடிவை கணக்கிடு"
        ],
        'es': [
            "🌾 ¿Qué campos necesitan agua ahora mismo?",
            "🌤️ Obtener pronóstico del clima en vivo",
            "🤖 Inspeccionar rendimiento del modelo ML",
            "🧠 Recalcular decisión AI para el campo activo"
        ]
    }
    return prompts.get(lang, prompts['en'])

def process_agent_message(user_message, context_field_id=None, history=None, language='en'):
    msg_lower = user_message.strip().lower()
    lang = (language or 'en').lower()
    
    fields = Field.query.all()
    field_dict = {f.id: f for f in fields}
    target_field = field_dict.get(context_field_id) if context_field_id else (fields[0] if fields else None)
    
    for f in fields:
        crop_obj = f.crops[0] if f.crops else None
        if f.name.lower() in msg_lower or (crop_obj and crop_obj.crop_name.lower() in msg_lower):
            target_field = f
            break

    if any(k in msg_lower for k in ['need water', 'action required', 'field status', 'all fields', 'fields list', 'status summary', 'పొలాలు', 'पानी', 'பாசன', 'campos']):
        return handle_field_status_query(fields, lang)

    if any(k in msg_lower for k in ['weather', 'temperature', 'rain', 'forecast', 'climate', 'wind', 'వాతావరణం', 'मौसम', 'வானிலை', 'clima']):
        return handle_weather_query(target_field, lang)

    if any(k in msg_lower for k in ['ml', 'model', 'r2', 'mae', 'rmse', 'accuracy', 'predict', 'algorithm', 'scikit', 'gradient boosting']):
        return handle_ml_model_query(lang)

    if any(k in msg_lower for k in ['reservoir', 'storage', 'saved', 'water source', 'lake', 'river', 'canal', 'available in storage', 'storage available', 'నిల్వ', 'భండారణ', 'almacenamiento']):
        return handle_water_resources_query(target_field, lang)

    if any(k in msg_lower for k in ['log', 'record', 'applied', 'irrigation logged', 'water applied']):
        return handle_log_irrigation_intent(user_message, target_field, lang)

    if any(k in msg_lower for k in ['irrigate', 'decision', 'water recommendation', 'should i water', 'how much water', 'calculate', 'నిర్ణయం', 'సిंचाई', 'regar']):
        return handle_irrigation_decision_query(target_field, lang)

    return handle_general_agronomic_query(user_message, target_field, lang)

def handle_field_status_query(fields, lang='en'):
    if not fields:
        return {"text": "🌾 No active agricultural fields are currently registered in AgriCrop AI.", "intent": "FIELD_STATUS", "suggested_prompts": get_localized_prompts(lang)}

    critical_fields, healthy_fields = [], []
    for f in fields:
        latest_env = f.environmental_readings[-1] if f.environmental_readings else None
        m_val = latest_env.soil_moisture_pct if latest_env else 25.0
        wp = f.wilting_point or 20.0
        if m_val < (wp + 3.0):
            critical_fields.append({'field': f, 'moisture': m_val})
        else:
            healthy_fields.append({'field': f, 'moisture': m_val})

    headers = {
        'en': f"🌾 **Farm Telemetry Status Overview** ({len(fields)} Total Managed Fields):\n\n",
        'te': f"🌾 **పొలం సమాచార స్థితి శోధన** ({len(fields)} మొత్తం పొలాలు):\n\n",
        'hi': f"🌾 **खेत टेलीमेट्री स्थिति सिंहावलोकन** ({len(fields)} कुल खेत):\n\n",
        'ta': f"🌾 **விவசாய நிலை உரை மேலோட்டம்** ({len(fields)} வயல்கள்):\n\n",
        'es': f"🌾 **Resumen del Estado de Telemetría Agrícola** ({len(fields)} Campos Gestores):\n\n"
    }

    text = headers.get(lang, headers['en'])
    if critical_fields:
        crit_lbl = {
            'en': f"⚠️ **{len(critical_fields)} Field(s) Require Irrigation Action:**\n",
            'te': f"⚠️ **{len(critical_fields)} పొలం(లు) నీటిపారుదల అవసరం:**\n",
            'hi': f"⚠️ **{len(critical_fields)} खेत में सिंचाई की आवश्यकता है:**\n",
            'ta': f"⚠️ **{len(critical_fields)} வயலுக்கு பாசனம் தேவை:**\n",
            'es': f"⚠️ **{len(critical_fields)} Campo(s) Requieren Riego:**\n"
        }
        text += crit_lbl.get(lang, crit_lbl['en'])
        for cf in critical_fields:
            f = cf['field']
            crop_name = f.crops[0].crop_name if f.crops else 'Crop'
            text += f"• **{f.name}** ({crop_name}) — Moisture **{cf['moisture']}%** (Wilting Point {f.wilting_point or 20}%)\n"
    else:
        text += "✅ **All fields maintain optimal moisture levels!**\n"

    return {
        "text": text,
        "intent": "FIELD_STATUS",
        "data_card": {"type": "FIELD_STATUS_LIST", "total": len(fields), "critical_count": len(critical_fields)},
        "suggested_prompts": get_localized_prompts(lang)
    }

def handle_weather_query(field, lang='en'):
    if not field:
        return {"text": "Please select a field to check live weather.", "intent": "WEATHER_BRIEF", "suggested_prompts": get_localized_prompts(lang)}

    lat, lon = field.latitude, field.longitude
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_probability_max&timezone=auto"
        res = requests.get(url, timeout=4).json()
        current = res.get('current', {})
        daily = res.get('daily', {})
        temp = current.get('temperature_2m', 28.5)
        rh = current.get('relative_humidity_2m', 60)
        wind = current.get('wind_speed_10m', 10)
        rain_prob = daily.get('precipitation_probability_max', [10])[0] if daily.get('precipitation_probability_max') else 10

        texts = {
            'en': f"🌤️ **Live Weather for {field.name}** ({field.location_name or field.location}):\n\n• **Temperature:** `{temp}°C`\n• **Humidity:** `{rh}%`\n• **Rain Probability:** `{rain_prob}%`\n• **Wind:** `{wind} km/h`",
            'te': f"🌤️ **{field.name} ప్రత్యక్ష వాతావరణం** ({field.location_name or field.location}):\n\n• **ఉష్ణోగ్రత:** `{temp}°C`\n• **ఆర్ద్రత:** `{rh}%`\n• **వర్ష సూచన:** `{rain_prob}%`\n• **గాలి వేగం:** `{wind} km/h`",
            'hi': f"🌤️ **{field.name} लाइव मौसम** ({field.location_name or field.location}):\n\n• **तापमान:** `{temp}°C`\n• **आर्द्रता:** `{rh}%`\n• **बारिश की संभावना:** `{rain_prob}%`\n• **हवा की गति:** `{wind} km/h`",
            'ta': f"🌤️ **{field.name} நிகழ்நேர வானிலை** ({field.location_name or field.location}):\n\n• **வெப்பநிலை:** `{temp}°C`\n• **ஈரப்பதம்:** `{rh}%`\n• **மழை வாய்ப்பு:** `{rain_prob}%`\n• **காற்றின் வேகம்:** `{wind} km/h`",
            'es': f"🌤️ **Clima en Vivo para {field.name}** ({field.location_name or field.location}):\n\n• **Temperatura:** `{temp}°C`\n• **Humedad:** `{rh}%`\n• **Probabilidad de Lluvia:** `{rain_prob}%`\n• **Viento:** `{wind} km/h`"
        }

        return {"text": texts.get(lang, texts['en']), "intent": "WEATHER_BRIEF", "suggested_prompts": get_localized_prompts(lang)}
    except Exception as e:
        return {"text": f"🌤️ Weather data for {field.name}: Live satellite feed sync failed.", "intent": "WEATHER_BRIEF", "suggested_prompts": get_localized_prompts(lang)}

def handle_ml_model_query(lang='en'):
    texts = {
        'en': "🤖 **AgriCrop Soil Moisture ML Engine Summary:**\n\n• **Production Regressor:** `GradientBoostingRegressor` (R² = 0.9865, MAE = 1.016%)\n• **Training Data Provenance:** 3,000 FAO-56 simulated agricultural samples",
        'te': "🤖 **మృత్తిక తేమ ML మోడల్ విశ్లేషణ:**\n\n• **ప్రొడక్షన్ మోడల్:** `GradientBoostingRegressor` (R² = 0.9865, MAE = 1.016%)\n• **శిక్షణ డేటా:** 3,000 FAO-56 అనుకరణ నమూనాలు",
        'hi': "🤖 **मृदा नमी ML मॉडल सारांश:**\n\n• **मॉडल:** `GradientBoostingRegressor` (R² = 0.9865, MAE = 1.016%)\n• **प्रशिक्षण डेटा:** 3,000 FAO-56 नमूने",
        'ta': "🤖 **மண் ஈரம் ML மாதிரி சுருக்கம்:**\n\n• **மாதிரி:** `GradientBoostingRegressor` (R² = 0.9865, MAE = 1.016%)\n• **பயிற்சி தரவு:** 3,000 FAO-56 மாதிரிகள்",
        'es': "🤖 **Resumen del Modelo ML de Humedad del Suelo:**\n\n• **Modelo:** `GradientBoostingRegressor` (R² = 0.9865, MAE = 1.016%)\n• **Datos de Entrenamiento:** 3,000 muestras FAO-56"
    }
    return {"text": texts.get(lang, texts['en']), "intent": "ML_METRICS", "suggested_prompts": get_localized_prompts(lang)}

def handle_irrigation_decision_query(field, lang='en'):
    if not field:
        return {"text": "Please select a field to run irrigation decision analysis.", "intent": "IRRIGATION_ANALYSIS", "suggested_prompts": get_localized_prompts(lang)}

    field_dict = field.to_dict()
    env_dict = field_dict.get('latest_environment') or {'soil_moisture_pct': 22.0, 'temperature_c': 32.0, 'humidity_pct': 45.0, 'rainfall_mm': 0.0, 'rain_probability_pct': 10.0, 'wind_speed_kmh': 10.0}
    crop_dict = field_dict.get('crop') or {'crop_name': 'Wheat', 'growth_stage': 'Mid-Season'}

    result = analyze_field_irrigation(field_dict, env_dict, crop_dict)
    dec = result.get('decision', 'Evaluate')
    vol = result.get('recommended_water_volume_liters')
    dur = result.get('recommended_duration_minutes')

    vol_text = f"`{vol:,.0f} Liters`" if vol is not None else "`N/A`"
    dur_text = f"`{dur} minutes`" if dur is not None else "`0 minutes`"

    texts = {
        'en': f"🧠 **Hybrid AI Decision Analysis for {field.name}:**\n\n📌 **Recommendation:** `{dec.upper()}`\n💧 **Water Required:** {vol_text}\n⏱️ **Duration:** {dur_text}",
        'te': f"🧠 **{field.name} కోసం AI నీటిపారుదల నిర్ణయం:**\n\n📌 **సిఫార్సు:** `{dec.upper()}`\n💧 **నీటి పరిమాణం:** {vol_text}\n⏱️ **సమయం:** {dur_text}",
        'hi': f"🧠 **{field.name} के लिए AI सिंचाई निर्णय:**\n\n📌 **सिफारिश:** `{dec.upper()}`\n💧 **आवश्यक जल:** {vol_text}\n⏱️ **अवधि:** {dur_text}",
        'ta': f"🧠 **{field.name} க்கான AI பாசன முடிவு:**\n\n📌 **பரிந்துரை:** `{dec.upper()}`\n💧 **தேவையான நீர்:** {vol_text}\n⏱️ **நேரம்:** {dur_text}",
        'es': f"🧠 **Análisis de Decisión AI para {field.name}:**\n\n📌 **Recomendación:** `{dec.upper()}`\n💧 **Agua Requerida:** {vol_text}\n⏱️ **Duración:** {dur_text}"
    }

    return {"text": texts.get(lang, texts['en']), "intent": "IRRIGATION_ANALYSIS", "suggested_prompts": get_localized_prompts(lang)}

def handle_log_irrigation_intent(user_message, field, lang='en'):
    if not field:
        field = Field.query.first()
    match = re.search(r'(\d+[\d,.]*)', user_message)
    amount = float(match.group(1).replace(',', '')) if match else 10000.0
    dur = round(amount / (field.flow_rate_lpm or 100.0), 1)

    try:
        hist = IrrigationHistory(
            field_id=field.id,
            date=datetime.now().strftime('%Y-%m-%d'),
            water_quantity_liters=amount,
            duration_minutes=dur,
            method=field.irrigation_method or 'Drip',
            temperature_c=28.0,
            soil_moisture_before_pct=20.0,
            ai_recommendation='Irrigate Now',
            actual_action='Irrigated via Agent',
            water_saved_liters=round(amount * 0.15, 1)
        )
        db.session.add(hist)
        db.session.commit()

        texts = {
            'en': f"✅ **Irrigation Logged Successfully for {field.name}!**\n\n• **Water Applied:** `{amount:,.0f} Liters`\n• **Duration:** `{dur} min`",
            'te': f"✅ **{field.name} కోసం నీటిపారుదల వివరాలు నమోదు చేయబడ్డాయి!**\n\n• **అందించిన నీరు:** `{amount:,.0f} లీటర్లు`\n• **సమయం:** `{dur} నిమిషాలు`",
            'hi': f"✅ **{field.name} के लिए सिंचाई सफलतापूर्वक दर्ज की गई!**\n\n• **जल की मात्रा:** `{amount:,.0f} लीटर`\n• **अवधि:** `{dur} मिनट`",
            'ta': f"✅ **{field.name} க்கான பாசனம் பதிவு செய்யப்பட்டது!**\n\n• **பயன்படுத்தப்பட்ட நீர்:** `{amount:,.0f} லிட்டர்கள்`\n• **நேரம்:** `{dur} நிமிடங்கள்`",
            'es': f"✅ **¡Riego Registrado con Éxito para {field.name}!**\n\n• **Agua Aplicada:** `{amount:,.0f} Litros`\n• **Duración:** `{dur} min`"
        }

        return {"text": texts.get(lang, texts['en']), "intent": "LOG_IRRIGATION", "suggested_prompts": get_localized_prompts(lang)}
    except Exception as e:
        return {"text": f"Error logging irrigation: {str(e)}", "intent": "LOG_IRRIGATION", "suggested_prompts": get_localized_prompts(lang)}

def handle_water_resources_query(field, lang='en'):
    if not field:
        field = Field.query.first()
    avail = field.available_water_liters if field else 45000
    texts = {
        'en': f"💧 **Water Resources & Storage for {field.name if field else 'Farm'}:**\n\n• **Reservoir Storage Available:** `{avail:,.0f} Liters`\n• **Flow Rate:** `{field.flow_rate_lpm if field else 100} L/min`",
        'te': f"💧 **{field.name if field else 'పొలం'} నీటి వనరులు & నిల్వ:**\n\n• **అందుబాటులో ఉన్న నీటి నిల్వ:** `{avail:,.0f} లీటర్లు`\n• **ప్రవాహ వేగం:** `{field.flow_rate_lpm if field else 100} లీటర్లు/నిమిషం`",
        'hi': f"💧 **{field.name if field else 'खेत'} जल संसाधन और भंडारण:**\n\n• **उपलब्ध जल भंडारण:** `{avail:,.0f} लीटर`\n• **प्रवाह दर:** `{field.flow_rate_lpm if field else 100} एल/मिनट`",
        'ta': f"💧 **{field.name if field else 'வயல்'} நீர் ஆதாரங்கள் & சேமிப்பு:**\n\n• **கிடைக்கும் நீர் சேமிப்பு:** `{avail:,.0f} லிட்டர்கள்`\n• **பாய்வு வீதம்:** `{field.flow_rate_lpm if field else 100} லிட்டர்/நிமிடம்`",
        'es': f"💧 **Recursos Hídricos y Almacenamiento para {field.name if field else 'Granja'}:**\n\n• **Almacenamiento Disponible:** `{avail:,.0f} Litros`\n• **Caudal de Flujo:** `{field.flow_rate_lpm if field else 100} L/min`"
    }
    return {"text": texts.get(lang, texts['en']), "intent": "WATER_RESOURCES", "suggested_prompts": get_localized_prompts(lang)}

def handle_general_agronomic_query(user_message, field, lang='en'):
    texts = {
        'en': f"🌱 **AgriCrop AI Assistant:** Analyzing request: *'{user_message}'*\n\nI can assist you with:\n1. 🌾 Field Status Checks\n2. 🧠 AI Decision Calculations\n3. 🌤️ Live Weather Updates\n4. 🤖 ML Model Metrics\n5. 💧 Logging Irrigation Actions",
        'te': f"🌱 **అగ్రిపంట AI సహాయకుడు:** శోధిస్తోంది: *'{user_message}'*\n\nనేను సహాయం చేయగలను:\n1. 🌾 పొలాల సమాచారం\n2. 🧠 AI నీటిపారుదల నిర్ణయాలు\n3. 🌤️ ప్రత్యక్ష వాతావరణం\n4. 🤖 ML మోడల్ కొలమానాలు\n5. 💧 నీటిపారుదల నమోదు",
        'hi': f"🌱 **एग्रीक्रॉप AI सहायक:** अनुरोध का विश्लेषण: *'{user_message}'*\n\nमैं सहायता कर सकता हूँ:\n1. 🌾 खेत की स्थिति\n2. 🧠 AI सिंचाई निर्णय\n3. 🌤️ लाइव मौसम अपडेट\n4. 🤖 ML मॉडल मेट्रिक्स\n5. 💧 सिंचाई रिकॉर्ड करना",
        'ta': f"🌱 **அக்ரிபாட் AI உதவியாளர்:** ஆய்வு செய்கிறது: *'{user_message}'*\n\nநான் உதவ முடியும்:\n1. 🌾 வயல் நிலை\n2. 🧠 AI பாசன முடிவுகள்\n3. 🌤️ வானிலை தகவல்கள்\n4. 🤖 ML மாதிரி அளவீடுகள்\n5. 💧 பாசனப் பதிவு",
        'es': f"🌱 **Asistente AI AgriCrop:** Analizando solicitud: *'{user_message}'*\n\nPuedo ayudarle con:\n1. 🌾 Estado de Campos\n2. 🧠 Decisiones AI de Riego\n3. 🌤️ Clima en Vivo\n4. 🤖 Métricas del Modelo ML\n5. 💧 Registrar Riego"
    }
    return {"text": texts.get(lang, texts['en']), "intent": "GENERAL_QUERY", "suggested_prompts": get_localized_prompts(lang)}
