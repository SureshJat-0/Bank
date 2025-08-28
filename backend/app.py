from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from functools import wraps
import jwt
import bcrypt
import random
import uuid
import csv
import io
import re

# Import ML NLU service
try:
    from nlu_service import analyze_query
    print("✅ ML NLU Service imported successfully")
except ImportError:
    print("⚠️ ML NLU Service not available, using fallback")
    analyze_query = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'securebank_jwt_secret_key_2024'
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

@app.route("/")
def root():
    return jsonify({"status": "ML-Powered Banking API", "version": "2.0", "ml_enabled": analyze_query is not None}), 200

# Users DB
USERS_DB = {
    "admin@securebank.com": {
        "id": "admin_001",
        "name": "Admin User",
        "email": "admin@securebank.com",
        "password": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()),
        "role": "admin",
        "account_number": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    "rajesh@securebank.com": {
        "id": "user_001",
        "name": "Rajesh Kumar",
        "email": "rajesh@securebank.com",
        "password": bcrypt.hashpw("user123".encode('utf-8'), bcrypt.gensalt()),
        "role": "user",
        "account_number": "1234567890",
        "balance": 150000,
        "account_type": "Savings",
        "phone": "9876543210",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    "priya@securebank.com": {
        "id": "user_002",
        "name": "Priya Sharma",
        "email": "priya@securebank.com",
        "password": bcrypt.hashpw("user123".encode('utf-8'), bcrypt.gensalt()),
        "role": "user",
        "account_number": "2345678901",
        "balance": 85000,
        "account_type": "Current",
        "phone": "8765432109",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    "amit@securebank.com": {
        "id": "user_003",
        "name": "Amit Singh",
        "email": "amit@securebank.com",
        "password": bcrypt.hashpw("user123".encode('utf-8'), bcrypt.gensalt()),
        "role": "user",
        "account_number": "3456789012",
        "balance": 220000,
        "account_type": "Savings",
        "phone": "7654321098",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
}

CHAT_SESSIONS = {}
FAQS_DB = [
    {"_id": "faq_001", "question": "How do I check my account balance?", "answer": "You can check your account balance by asking me 'What is my balance?' or 'Show my account balance'. I'll provide you with real-time balance information.", "created_at": datetime.now(timezone.utc).isoformat()},
    {"_id": "faq_002", "question": "How can I transfer money?", "answer": "To transfer money, simply tell me 'Transfer [amount] to [recipient]'. I'll guide you through the secure transfer process.", "created_at": datetime.now(timezone.utc).isoformat()},
    {"_id": "faq_003", "question": "What loan options are available?", "answer": "We offer Personal, Home, and Car loans. Ask for details.", "created_at": datetime.now(timezone.utc).isoformat()},
    {"_id": "faq_004", "question": "How secure is this chatbot?", "answer": "Bank-grade security with ML-powered understanding.", "created_at": datetime.now(timezone.utc).isoformat()}
]

USER_MESSAGES = []
BOT_MESSAGES = []

def create_token(user_data):
    """Create JWT token for user"""
    payload = {
        'user_id': user_data['id'],
        'email': user_data['email'],
        'role': user_data['role'],
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator for token authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1] # Remove 'Bearer ' prefix
            payload = verify_token(token)
            if not payload:
                return jsonify({'message': 'Token is invalid'}), 401
            # Find user data
            user_email = payload['email']
            if user_email not in USERS_DB:
                return jsonify({'message': 'User not found'}), 401
            request.current_user = USERS_DB[user_email]
        except Exception:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator for admin-only access"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.current_user.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        role = data.get('role', 'user')

        # Validation
        if not all([name, email, password]):
            return jsonify({'message': 'All fields are required'}), 400
        if email in USERS_DB:
            return jsonify({'message': 'User already exists'}), 400
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400

        # Create new user
        user_id = f"user_{len(USERS_DB)+1:03d}"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        USERS_DB[email] = {
            "id": user_id,
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "account_number": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        # If user role, create banking details
        if role == 'user':
            account_number = str(random.randint(1000000000, 9999999999))
            USERS_DB[email].update({
                "account_number": account_number,
                "balance": random.randint(10000, 100000),
                "account_type": random.choice(["Savings", "Current"]),
                "phone": f"{random.randint(6000000000, 9999999999)}"
            })

        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        user = None

        # Handle both email and banking login
        if 'email' in data:
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            if email not in USERS_DB:
                return jsonify({'message': 'Invalid credentials'}), 401
            user = USERS_DB[email]
            if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
                return jsonify({'message': 'Invalid credentials'}), 401
        elif 'accountNumber' in data:
            # Banking login with account number and PIN
            account_number = data.get('accountNumber', '')
            pin = data.get('pin', '')
            # Find user by account number
            for email, user_data in USERS_DB.items():
                if user_data.get('account_number') == account_number:
                    # For demo purposes, PIN is stored in a simple format
                    if (user_data.get('account_number') == '1234567890' and pin == '1234') or \
                       (user_data.get('account_number') == '2345678901' and pin == '5678'):
                        user = user_data
                        break
            if not user:
                return jsonify({'message': 'Invalid account number or PIN'}), 401
        else:
            return jsonify({'message': 'Invalid login data'}), 400

        # Create token
        token = create_token(user)

        # Return user data
        user_response = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }

        return jsonify({
            'token': token,
            'user': user_response
        }), 200
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

# Session Management Routes
@app.route('/api/session/create', methods=['POST'])
@token_required
def create_session():
    """Create new chat session"""
    session_id = str(uuid.uuid4())
    greeting_message = f"Hello {request.current_user['name']}! I'm your ML-powered AI banking assistant. How can I help you today?"
    
    CHAT_SESSIONS[session_id] = {
        'id': session_id,
        'user_id': request.current_user['id'],
        'messages': [{
            'sender': 'bot',
            'text': greeting_message,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'intent': 'greeting',
            'confidence': 1.0
        }],
        'created_at': datetime.now(timezone.utc).isoformat()
    }

    return jsonify({
        'sessionId': session_id,
        'message': 'Session created successfully'
    }), 201

@app.route('/api/session/messages/<session_id>', methods=['GET'])
@token_required
def get_session_messages(session_id):
    """Get messages for a session"""
    if session_id not in CHAT_SESSIONS:
        return jsonify({'message': 'Session not found'}), 404
    
    session = CHAT_SESSIONS[session_id]
    if session['user_id'] != request.current_user['id'] and request.current_user['role'] != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    return jsonify(session['messages']), 200

# Chat Routes
@app.route('/api/chat/message', methods=['POST'])
@token_required
def send_message():
    """Send chat message and get bot response"""
    try:
        data = request.get_json()
        session_id = data.get('sessionId')
        message_text = data.get('messageText', '').strip()

        if not message_text:
            return jsonify({'message': 'Message text is required'}), 400

        if session_id not in CHAT_SESSIONS:
            return jsonify({'message': 'Session not found'}), 404

        # Log user message
        user_message = {
            'sender': 'user',
            'text': message_text,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'user_id': request.current_user['id'],
            'session_id': session_id
        }

        CHAT_SESSIONS[session_id]['messages'].append(user_message)
        USER_MESSAGES.append(user_message)

        # Generate bot response using ML
        bot_response = generate_ml_banking_response(message_text, request.current_user)

        bot_message = {
            'sender': 'bot',
            'text': bot_response['text'],
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'intent': bot_response.get('intent', 'general'),
            'confidence': bot_response.get('confidence', 0.8),
            'entities': bot_response.get('entities', []),
            'method': bot_response.get('method', 'ml')
        }

        CHAT_SESSIONS[session_id]['messages'].append(bot_message)
        BOT_MESSAGES.append(bot_message)

        return jsonify({'bot': bot_message}), 200

    except Exception as e:
        return jsonify({'message': f'Error processing message: {str(e)}'}), 500

def generate_ml_banking_response(message, user):
    """ML-powered banking response generator"""
    try:
        # Use ML model for intent detection
        if analyze_query:
            analysis = analyze_query(message)
            intent = analysis['intent']
            confidence = analysis['confidence']
            entities = analysis['entities']
            method = analysis.get('method', 'ml')
        else:
            # Fallback to basic analysis
            intent, confidence, entities, method = fallback_analysis(message)

        # Extract useful entities
        amounts = [e['value'] for e in entities if e['label'] == 'AMOUNT']
        accounts = [e['value'] for e in entities if e['label'] == 'ACCOUNT_NUMBER']
        cards = [e['value'] for e in entities if e['label'] == 'CARD_TYPE']

        # Generate responses based on ML intent
        if intent == 'check_balance':
            if user.get('balance'):
                return {
                    'text': f"Your current account balance is ₹{user['balance']:,}. Account type: {user.get('account_type', 'N/A')}.\n\n📊 ML Confidence: {confidence:.1%}\n\nIs there anything else you'd like to know?",
                    'intent': intent,
                    'confidence': confidence,
                    'entities': entities,
                    'method': method
                }
            else:
                return {
                    'text': "I'd be happy to help you check your balance. Please contact customer service for verification.",
                    'intent': intent,
                    'confidence': confidence,
                    'entities': entities,
                    'method': method
                }

        elif intent == 'transfer_money':
            amount_text = f"of ₹{amounts[0]}" if amounts else ""
            account_text = f"to account {accounts[0]}" if accounts else ""
            return {
                'text': f"I can help you transfer money {amount_text} {account_text}.\n\n🤖 Detected with {confidence:.1%} confidence\n\nFor security, I'll need to verify the recipient details. Please provide the complete account number and recipient name.",
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }

        elif intent == 'apply_loan':
            return {
                'text': f"Great! I can help you with loan applications.\n\n🎯 ML Analysis: {confidence:.1%} confidence\n\nBased on your profile, you're eligible for:\n💰 Personal Loan: Up to ₹5,00,000 @ 10.5%\n🏠 Home Loan: Up to ₹25,00,000 @ 8.5%\n🚗 Car Loan: Up to ₹8,00,000 @ 9.5%\n\nWhich type of loan interests you?",
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }

        elif intent == 'lost_card':
            card_type = cards[0] if cards else "card"
            return {
                'text': f"I understand you need to report a lost/stolen {card_type}.\n\n🔒 Security Alert: {confidence:.1%} confidence\n\nI can block your card immediately for security. Your card will be blocked within 2 minutes. Should I proceed?",
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }

        elif intent == 'get_branch_details':
            return {
                'text': f"I can help you find branch information.\n\n📍 Location Service: {confidence:.1%} confidence\n\nOur main branches:\n🏢 Mumbai - Nariman Point\n🏢 Delhi - Connaught Place\n🏢 Bangalore - MG Road\n🏢 Chennai - Anna Salai\n\nWhich city are you looking for?",
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }

        elif intent == 'greeting_hi':
            return {
                'text': f"Hello {user['name']}! I'm your ML-powered AI banking assistant.\n\n🤖 Analysis: {confidence:.1%} confidence\n\nI can help with balance inquiries, transfers, loans, and much more. What would you like to do today?",
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }

        elif intent == 'greeting_bye':
            return {
                'text': f"Thank you for using SecureBank services!\n\n👋 Detected with {confidence:.1%} confidence\n\nHave a great day. I'm always here to help with your banking needs.",
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }

        else:  # general_inquiry or other
            return {
                'text': f"I understand you're asking about banking services.\n\n🤖 ML Analysis: {confidence:.1%} confidence\n\nI can help with:\n💰 Balance inquiries\n💸 Money transfers\n📊 Loan applications\n💳 Card services\n🏢 Branch information\n\nWhat specifically would you like help with?",
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }

    except Exception as e:
        print(f"Error in ML response generation: {e}")
        return fallback_banking_response(message, user)

def fallback_analysis(message):
    """Fallback analysis when ML is not available"""
    message_lower = message.lower()
    entities = []
    
    if any(word in message_lower for word in ['balance', 'amount', 'money']):
        return 'check_balance', 0.8, entities, 'rule'
    elif any(word in message_lower for word in ['transfer', 'send', 'pay']):
        return 'transfer_money', 0.8, entities, 'rule'
    else:
        return 'check_balance', 0.6, entities, 'rule'

def fallback_banking_response(message, user):
    """Fallback response generator"""
    return {
        'text': f"Hello {user['name']}! I'm here to help with your banking needs. What would you like to do today?",
        'intent': 'general_inquiry',
        'confidence': 0.7,
        'entities': [],
        'method': 'fallback'
    }

@app.route('/api/chat/analyze', methods=['POST'])
@token_required
def analyze_query_api():
    """Analyze query for NLU using trained model"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()

        if not query:
            return jsonify({'message': 'Query is required'}), 400

        # Use ML-based analysis if available
        if analyze_query:
            result = analyze_query(query)
            return jsonify(result), 200
        else:
            # Fallback to simple analysis
            intent, confidence, entities, method = fallback_analysis(query)
            return jsonify({
                'intent': intent,
                'confidence': confidence,
                'entities': entities,
                'method': method
            }), 200

    except Exception as e:
        return jsonify({'message': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/chat/faqs-for-user', methods=['GET'])
@token_required
def get_user_faqs():
    """Get FAQs for regular users"""
    return jsonify(FAQS_DB), 200

# Admin Routes
@app.route('/api/admin/logs', methods=['GET'])
@token_required
@admin_required
def get_admin_logs():
    """Get user messages and bot messages for admin"""
    return jsonify({
        'UserMessages': USER_MESSAGES,
        'BotMessages': BOT_MESSAGES
    }), 200

@app.route('/api/admin/logs/refresh', methods=['GET'])
@token_required
@admin_required
def refresh_analytics():
    """Refresh analytics data"""
    total_queries = len(USER_MESSAGES)
    success_queries = len([msg for msg in BOT_MESSAGES if msg.get('confidence', 0) > 0.7])
    success_rate = (success_queries / total_queries) if total_queries > 0 else 0
    intents = list(set([msg.get('intent', 'unknown') for msg in BOT_MESSAGES]))
    entities = sum(len(msg.get('entities', [])) for msg in BOT_MESSAGES)

    return jsonify({
        'queries': total_queries,
        'success': success_rate,
        'intents': len(intents),
        'entity': entities
    }), 200

@app.route('/api/admin/logs/download', methods=['GET'])
@token_required
@admin_required
def download_logs():
    """Download logs as CSV"""
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(['Timestamp', 'User', 'Message', 'Intent', 'Confidence', 'Method'])

    # Write data
    for i, user_msg in enumerate(USER_MESSAGES):
        bot_msg = BOT_MESSAGES[i] if i < len(BOT_MESSAGES) else {}
        writer.writerow([
            user_msg.get('timestamp', ''),
            user_msg.get('user_id', ''),
            user_msg.get('text', ''),
            bot_msg.get('intent', ''),
            bot_msg.get('confidence', ''),
            bot_msg.get('method', '')
        ])

    output.seek(0)
    response = make_response(output.getvalue())
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = 'attachment; filename=ml_chat_logs.csv'
    return response

@app.route('/api/admin/faq', methods=['GET'])
@token_required
@admin_required
def get_admin_faqs():
    """Get all FAQs for admin management"""
    return jsonify(FAQS_DB), 200

@app.route('/api/admin/faq', methods=['POST'])
@token_required
@admin_required
def create_faq():
    """Create new FAQ"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        answer = data.get('answer', '').strip()

        if not question or not answer:
            return jsonify({'message': 'Question and answer are required'}), 400

        new_faq = {
            '_id': f"faq_{len(FAQS_DB) + 1:03d}",
            'question': question,
            'answer': answer,
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        FAQS_DB.append(new_faq)
        return jsonify(new_faq), 201
    except Exception as e:
        return jsonify({'message': f'Error creating FAQ: {str(e)}'}), 500

@app.route('/api/admin/faq/<faq_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_faq(faq_id):
    """Delete FAQ"""
    try:
        global FAQS_DB
        FAQS_DB = [faq for faq in FAQS_DB if faq['_id'] != faq_id]
        return jsonify({'message': 'FAQ deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error deleting FAQ: {str(e)}'}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '2.0 - ML Enhanced',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'users': len(USERS_DB),
        'sessions': len(CHAT_SESSIONS),
        'faqs': len(FAQS_DB),
        'ml_enabled': analyze_query is not None
    }), 200

if __name__ == '__main__':
    print("🏦 SecureBank ML-Powered AI Chatbot API Starting...")
    print("🤖 Enhanced Banking Features with Machine Learning")
    print("🔐 JWT Authentication Enabled")
    print("📱 CORS Enabled for React Frontend")
    print("🧠 ML Intent Recognition Active")
    print("🌐 Server running at: http://localhost:3000")
    app.run(debug=True, host='0.0.0.0', port=3000)
