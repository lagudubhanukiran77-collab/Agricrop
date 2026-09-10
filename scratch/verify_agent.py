import urllib.request
import json

print("==========================================================")
print("AGRICROP AI AGENT — END-TO-END VERIFICATION SUITE")
print("==========================================================")

# 1. Test Suggested Prompts Endpoint
print("\n--- 1. Testing GET /api/agent/suggested-prompts ---")
req = urllib.request.urlopen('http://127.0.0.1:5000/api/agent/suggested-prompts')
prompts = json.loads(req.read().decode('utf-8')).get('suggested_prompts', [])
print(f"Returned {len(prompts)} suggested prompts:")
for p in prompts:
    print(f"  • {p}")
assert len(prompts) >= 3, "Expected at least 3 suggested prompts"
print(">>> PASS: Suggested prompts API operational.")

# 2. Test Agent Chat Intents
test_queries = [
    ("Field Water Requirements Query", "Which fields need water right now?", "FIELD_STATUS"),
    ("Hyper-Local Weather Forecast", "Show me live weather forecast for North Wheat Field", "WEATHER_BRIEF"),
    ("Scikit-Learn ML Model Accuracy", "What is the ML model accuracy and R2 score?", "ML_METRICS"),
    ("Hybrid Decision Analysis", "Calculate irrigation decision for North Wheat Field", "IRRIGATION_ANALYSIS"),
    ("Log Irrigation Action", "Log 12000 liters applied to North Wheat Field", "LOG_IRRIGATION"),
    ("Water Reservoir Query", "How much water is available in storage?", "WATER_RESOURCES")
]

print("\n--- 2. Testing POST /api/agent/chat Multi-Intent Execution ---")
for title, query, expected_intent in test_queries:
    payload = json.dumps({'message': query, 'context_field_id': 1}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:5000/api/agent/chat', data=payload, headers={'Content-Type': 'application/json'})
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    intent = res.get('intent')
    text_preview = res.get('text', '').replace('\n', ' ')[:100]
    data_card = res.get('data_card')
    print(f"\n[Test: {title}]")
    print(f"  User Query: '{query}'")
    print(f"  Returned Intent: '{intent}' (Expected: '{expected_intent}')")
    print(f"  Agent Text: {text_preview}...")
    print(f"  Returned Data Card: {data_card}")
    assert intent == expected_intent, f"Intent mismatch! Got {intent}, expected {expected_intent}"

print("\n==========================================================")
print("SUCCESS: AGENT VERIFICATION COMPLETE & 100% FUNCTIONAL!")
print("==========================================================")
