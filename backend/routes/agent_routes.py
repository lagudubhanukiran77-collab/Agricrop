from flask import Blueprint, request, jsonify
from services.agent_service import process_agent_message

agent_bp = Blueprint('agent_bp', __name__, url_prefix='/api/agent')

@agent_bp.route('/chat', methods=['POST'])
def agent_chat():
    try:
        data = request.get_json() or {}
        message = data.get('message', '')
        context_field_id = data.get('context_field_id')
        history = data.get('history', [])
        language = data.get('language', 'en')

        if not message.strip():
            return jsonify({'error': 'Message parameter is required'}), 400

        response = process_agent_message(message, context_field_id=context_field_id, history=history, language=language)
        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@agent_bp.route('/suggested-prompts', methods=['GET'])
def get_suggested_prompts():
    prompts = [
        "🌾 Which fields need water right now?",
        "🌤️ Get live hyper-local weather forecast",
        "🤖 Inspect ML Soil Moisture Model performance",
        "🧠 Recalculate AI decision for Wheat",
        "💧 Log 10,000 Liters applied to North Field"
    ]
    return jsonify({'suggested_prompts': prompts}), 200
