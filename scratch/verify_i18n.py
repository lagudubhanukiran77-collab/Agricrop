import urllib.request
import json

print("==========================================================")
print("AGRICROP AI — MULTI-LANGUAGE (i18n) VERIFICATION SUITE")
print("==========================================================")

languages_to_test = [
    ('en', 'English'),
    ('te', 'Telugu (తెలుగు)'),
    ('hi', 'Hindi (हिंदी)'),
    ('ta', 'Tamil (தமிழ்)'),
    ('es', 'Spanish (Español)')
]

for lang_code, lang_name in languages_to_test:
    print(f"\n--- Testing Agent Chat Response in {lang_name} ({lang_code}) ---")
    payload = json.dumps({
        'message': 'Which fields need water right now?',
        'language': lang_code,
        'context_field_id': 1
    }).encode('utf-8')

    req = urllib.request.Request('http://127.0.0.1:5000/api/agent/chat', data=payload, headers={'Content-Type': 'application/json'})
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    
    intent = res.get('intent')
    text = res.get('text', '')
    first_line = text.split('\n')[0] if text else ''
    
    print(f"  [Language: {lang_code}] Intent: {intent}")
    print(f"  Header: {first_line}")
    assert intent == 'FIELD_STATUS', f"Expected FIELD_STATUS intent, got {intent}"
    assert len(text) > 20, "Response text should be non-empty"

print("\n==========================================================")
print("SUCCESS: ALL MULTI-LANGUAGE TESTS PASSED PERFECTLY!")
print("==========================================================")
