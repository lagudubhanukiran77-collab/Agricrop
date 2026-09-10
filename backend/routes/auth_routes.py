from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth_bp', __name__)

# Registered users in memory/database table
REGISTERED_USERS = {
    'farmer@agricrop.ai': {
        'id': 1,
        'name': 'Ramesh Patel',
        'email': 'farmer@agricrop.ai',
        'password': 'farmer123',
        'location': 'D. Yerravaram, East Godavari',
        'role': 'Registered Farmer'
    },
    'admin@agricrop.ai': {
        'id': 2,
        'name': 'AgriCrop Admin',
        'email': 'admin@agricrop.ai',
        'password': 'admin123',
        'location': 'East Godavari District',
        'role': 'Platform Administrator'
    }
}

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = REGISTERED_USERS.get(email)
    if not user or user['password'] != password:
        return jsonify({'error': 'Invalid email or password. Access denied.'}), 401

    # Return sanitized user profile without password
    user_profile = {k: v for k, v in user.items() if k != 'password'}
    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'user': user_profile
    }), 200

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    location = (data.get('location') or 'D. Yerravaram, East Godavari').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required for registration.'}), 400

    if '@' not in email or '.' not in email:
        return jsonify({'error': 'Please provide a valid email address.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    if email in REGISTERED_USERS:
        return jsonify({'error': 'Email is already registered. Please sign in instead.'}), 400

    new_id = len(REGISTERED_USERS) + 1
    new_user = {
        'id': new_id,
        'name': name,
        'email': email,
        'password': password,
        'location': location,
        'role': 'Registered Farmer'
    }
    REGISTERED_USERS[email] = new_user

    user_profile = {k: v for k, v in new_user.items() if k != 'password'}
    return jsonify({
        'success': True,
        'message': 'Account registered successfully.',
        'user': user_profile
    }), 201