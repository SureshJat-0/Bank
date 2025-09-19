import json
import re
from pathlib import Path
from datetime import datetime
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

class EnhancedNLU:
    def __init__(self):
        self.model = None
        self.chitchat_model = None
        self.context_history = {}  # Store conversation context
        self.slot_templates = {}
        self.load_models()
        self.initialize_slot_templates()

    def load_models(self):
        """Load ML models and fallback data"""
        try:
            # Load main intent model
            with open('models/intent_model.pkl', 'rb') as f:
                self.model = pickle.load(f)
            print("✅ ML Intent model loaded successfully")
        except FileNotFoundError:
            print("⚠️ ML model not found, training new model...")
            self.train_model()

        try:
            # Load chitchat patterns
            with open('models/chitchat_patterns.json', 'r') as f:
                self.chitchat_patterns = json.load(f)
        except FileNotFoundError:
            # Initialize default chitchat patterns
            self.chitchat_patterns = {
                'greeting': ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
                'goodbye': ['bye', 'goodbye', 'see you', 'thanks', 'thank you', 'tata'],
                'how_are_you': ['how are you', 'how do you do', 'kaise ho', 'kaisa hai'],
                'compliment': ['good', 'great', 'excellent', 'nice', 'wonderful', 'amazing'],
                'complaint': ['bad', 'terrible', 'awful', 'poor', 'worst'],
                'help': ['help me', 'can you help', 'assist me', 'support'],
                'name': ['what is your name', 'who are you', 'aap kaun ho']
            }

    def initialize_slot_templates(self):
        """Initialize slot filling templates for different intents"""
        self.slot_templates = {
            'transfer_money': {
                'required_slots': ['amount', 'recipient'],
                'slot_questions': {
                    'amount': "How much money would you like to transfer?",
                    'recipient': "To which account or person would you like to transfer?"
                }
            },
            'apply_loan': {
                'required_slots': ['loan_type', 'amount'],
                'slot_questions': {
                    'loan_type': "What type of loan are you interested in? (Personal, Home, Car, Business)",
                    'amount': "What loan amount are you looking for?"
                }
            },
            'lost_card': {
                'required_slots': ['card_type'],
                'slot_questions': {
                    'card_type': "Which card did you lose? (Credit Card, Debit Card, ATM Card)"
                }
            }
        }

    def train_model(self):
        """Train the intent classification model"""
        try:
            df = pd.read_csv('banking_queries.csv')
            df['text'] = df['text'].apply(self.preprocess_text)
            df = df.dropna(subset=['text', 'intent'])
            
            X = df['text']
            y = df['intent']
            
            # Create and train pipeline
            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english')),
                ('classifier', LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced'))
            ])
            
            pipeline.fit(X, y)
            
            # Save model
            Path('models').mkdir(exist_ok=True)
            with open('models/intent_model.pkl', 'wb') as f:
                pickle.dump(pipeline, f)
            
            self.model = pipeline
            print("✅ Model trained and saved successfully")
            
        except Exception as e:
            print(f"❌ Model training failed: {e}")

    def preprocess_text(self, text):
        """Clean and preprocess text"""
        if not isinstance(text, str):
            return ""
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\d+', 'NUM', text)
        return text.strip()

    def detect_chitchat(self, text):
        """Detect if query is chitchat"""
        text_lower = text.lower()
        
        for intent, patterns in self.chitchat_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    return intent
        return None

    def extract_entities(self, text, intent):
        """Extract entities from text based on intent"""
        entities = []
        text_lower = text.lower()
        
        # Amount extraction
        amount_pattern = r'₹?(\d+(?:,\d+)*(?:\.\d+)?)'
        amounts = re.findall(amount_pattern, text)
        for amount in amounts:
            entities.append({
                'label': 'AMOUNT',
                'value': amount.replace(',', ''),
                'start': text.find(amount),
                'end': text.find(amount) + len(amount)
            })
        
        # Account number extraction
        account_pattern = r'\b\d{10,12}\b'
        accounts = re.findall(account_pattern, text)
        for account in accounts:
            entities.append({
                'label': 'ACCOUNT_NUMBER',
                'value': account,
                'start': text.find(account),
                'end': text.find(account) + len(account)
            })
        
        # Card type extraction
        card_types = ['credit card', 'debit card', 'atm card', 'visa', 'mastercard', 'rupay']
        for card_type in card_types:
            if card_type in text_lower:
                entities.append({
                    'label': 'CARD_TYPE',
                    'value': card_type,
                    'start': text_lower.find(card_type),
                    'end': text_lower.find(card_type) + len(card_type)
                })
        
        # Loan type extraction
        loan_types = ['personal loan', 'home loan', 'car loan', 'business loan', 'education loan']
        for loan_type in loan_types:
            if loan_type in text_lower:
                entities.append({
                    'label': 'LOAN_TYPE',
                    'value': loan_type,
                    'start': text_lower.find(loan_type),
                    'end': text_lower.find(loan_type) + len(loan_type)
                })
        
        return entities

    def get_conversation_context(self, session_id):
        """Get conversation context for session"""
        return self.context_history.get(session_id, {
            'last_intent': None,
            'pending_slots': {},
            'filled_slots': {},
            'conversation_stage': 'initial'
        })

    def update_conversation_context(self, session_id, intent, entities, pending_slots=None):
        """Update conversation context"""
        if session_id not in self.context_history:
            self.context_history[session_id] = {}
        
        context = self.context_history[session_id]
        context['last_intent'] = intent
        context['last_update'] = datetime.now().isoformat()
        
        # Update filled slots from entities
        for entity in entities:
            if entity['label'] == 'AMOUNT':
                context.setdefault('filled_slots', {})['amount'] = entity['value']
            elif entity['label'] == 'ACCOUNT_NUMBER':
                context.setdefault('filled_slots', {})['recipient'] = entity['value']
            elif entity['label'] == 'CARD_TYPE':
                context.setdefault('filled_slots', {})['card_type'] = entity['value']
            elif entity['label'] == 'LOAN_TYPE':
                context.setdefault('filled_slots', {})['loan_type'] = entity['value']
        
        if pending_slots:
            context['pending_slots'] = pending_slots

    def check_slot_filling(self, intent, filled_slots):
        """Check if all required slots are filled for an intent"""
        if intent not in self.slot_templates:
            return True, {}
        
        required_slots = self.slot_templates[intent]['required_slots']
        pending_slots = {}
        
        for slot in required_slots:
            if slot not in filled_slots or not filled_slots[slot]:
                pending_slots[slot] = self.slot_templates[intent]['slot_questions'][slot]
        
        return len(pending_slots) == 0, pending_slots

    def generate_chitchat_response(self, chitchat_intent):
        """Generate appropriate chitchat response"""
        responses = {
            'greeting': [
                "Hello! I'm your AI banking assistant. How can I help you today?",
                "Hi there! Welcome to SecureBank. What can I do for you?",
                "Good day! I'm here to assist with your banking needs."
            ],
            'goodbye': [
                "Thank you for banking with us! Have a great day!",
                "Goodbye! Feel free to return anytime for banking assistance.",
                "Take care! Your financial security is our priority."
            ],
            'how_are_you': [
                "I'm doing great and ready to help with your banking needs!",
                "I'm here and ready to assist you with any banking questions.",
                "Excellent! I'm fully operational and here to help."
            ],
            'compliment': [
                "Thank you! I'm glad I could help. Is there anything else you need?",
                "I appreciate your kind words! How else can I assist you today?",
                "Thank you for the feedback! What other banking services can I help with?"
            ],
            'complaint': [
                "I apologize for any inconvenience. Let me help make this better for you.",
                "I'm sorry to hear that. Please let me know how I can assist you better.",
                "I understand your concern. How can I help resolve this for you?"
            ],
            'help': [
                "I'm here to help! I can assist with balance inquiries, transfers, loans, and more.",
                "Of course! What specific banking service would you like help with?",
                "I'd be happy to help! What would you like to know about your banking?"
            ],
            'name': [
                "I'm your AI banking assistant from SecureBank, here to help with all your banking needs!",
                "I'm SecureBank's AI assistant, designed to make banking easier for you.",
                "I'm your virtual banking assistant, ready to help 24/7!"
            ]
        }
        
        import random
        return random.choice(responses.get(chitchat_intent, ["I'm here to help with your banking needs!"]))

    def predict_intent(self, text, session_id=None):
        """Main intent prediction with context and slot filling"""
        if not text or not text.strip():
            return self.fallback_response()
        
        # Get conversation context
        context = self.get_conversation_context(session_id) if session_id else {}
        
        # Check for chitchat first
        chitchat_intent = self.detect_chitchat(text)
        if chitchat_intent:
            response = self.generate_chitchat_response(chitchat_intent)
            return {
                'intent': 'chitchat',
                'confidence': 0.95,
                'entities': [],
                'method': 'chitchat',
                'response': response,
                'needs_slot_filling': False
            }
        
        # Check if user is providing slot information
        if context.get('pending_slots'):
            return self.handle_slot_filling(text, context, session_id)
        
        # Regular intent prediction
        try:
            if self.model:
                processed_text = self.preprocess_text(text)
                intent = self.model.predict([processed_text])[0]
                confidence = max(self.model.predict_proba([processed_text])[0])
                entities = self.extract_entities(text, intent)
                
                # Check slot filling requirements
                filled_slots = context.get('filled_slots', {})
                
                # Add entities to filled slots
                for entity in entities:
                    if entity['label'] == 'AMOUNT':
                        filled_slots['amount'] = entity['value']
                    elif entity['label'] == 'ACCOUNT_NUMBER':
                        filled_slots['recipient'] = entity['value']
                    elif entity['label'] == 'CARD_TYPE':
                        filled_slots['card_type'] = entity['value']
                    elif entity['label'] == 'LOAN_TYPE':
                        filled_slots['loan_type'] = entity['value']
                
                slots_complete, pending_slots = self.check_slot_filling(intent, filled_slots)
                
                if session_id:
                    self.update_conversation_context(session_id, intent, entities, pending_slots)
                
                return {
                    'intent': intent,
                    'confidence': confidence,
                    'entities': entities,
                    'method': 'ml',
                    'needs_slot_filling': not slots_complete,
                    'pending_slots': pending_slots,
                    'filled_slots': filled_slots
                }
            else:
                return self.fallback_intent_prediction(text)
                
        except Exception as e:
            print(f"Error in intent prediction: {e}")
            return self.fallback_response()

    def handle_slot_filling(self, text, context, session_id):
        """Handle slot filling process"""
        pending_slots = context.get('pending_slots', {})
        filled_slots = context.get('filled_slots', {})
        last_intent = context.get('last_intent')
        
        # Try to extract information from user response
        entities = self.extract_entities(text, last_intent)
        
        # Update filled slots
        for entity in entities:
            if entity['label'] == 'AMOUNT':
                filled_slots['amount'] = entity['value']
                pending_slots.pop('amount', None)
            elif entity['label'] == 'ACCOUNT_NUMBER':
                filled_slots['recipient'] = entity['value']
                pending_slots.pop('recipient', None)
            elif entity['label'] == 'CARD_TYPE':
                filled_slots['card_type'] = entity['value']
                pending_slots.pop('card_type', None)
            elif entity['label'] == 'LOAN_TYPE':
                filled_slots['loan_type'] = entity['value']
                pending_slots.pop('loan_type', None)
        
        # If no entities found, treat as direct answer
        if not entities:
            # Get the first pending slot and fill it with the user's response
            if pending_slots:
                slot_name = list(pending_slots.keys())[0]
                filled_slots[slot_name] = text.strip()
                pending_slots.pop(slot_name, None)
        
        # Update context
        if session_id:
            self.update_conversation_context(session_id, last_intent, entities, pending_slots)
        
        return {
            'intent': last_intent,
            'confidence': 0.9,
            'entities': entities,
            'method': 'slot_filling',
            'needs_slot_filling': len(pending_slots) > 0,
            'pending_slots': pending_slots,
            'filled_slots': filled_slots
        }

    def fallback_intent_prediction(self, text):
        """Fallback intent prediction using rules"""
        text_lower = text.lower()
        
        # Rule-based intent detection
        if any(word in text_lower for word in ['balance', 'money', 'amount', 'check']):
            return {
                'intent': 'check_balance',
                'confidence': 0.8,
                'entities': self.extract_entities(text, 'check_balance'),
                'method': 'rule',
                'needs_slot_filling': False
            }
        elif any(word in text_lower for word in ['transfer', 'send', 'pay', 'move']):
            entities = self.extract_entities(text, 'transfer_money')
            filled_slots = {}
            for entity in entities:
                if entity['label'] == 'AMOUNT':
                    filled_slots['amount'] = entity['value']
                elif entity['label'] == 'ACCOUNT_NUMBER':
                    filled_slots['recipient'] = entity['value']
            
            slots_complete, pending_slots = self.check_slot_filling('transfer_money', filled_slots)
            
            return {
                'intent': 'transfer_money',
                'confidence': 0.8,
                'entities': entities,
                'method': 'rule',
                'needs_slot_filling': not slots_complete,
                'pending_slots': pending_slots,
                'filled_slots': filled_slots
            }
        elif any(word in text_lower for word in ['loan', 'apply', 'borrow']):
            entities = self.extract_entities(text, 'apply_loan')
            filled_slots = {}
            for entity in entities:
                if entity['label'] == 'LOAN_TYPE':
                    filled_slots['loan_type'] = entity['value']
                elif entity['label'] == 'AMOUNT':
                    filled_slots['amount'] = entity['value']
            
            slots_complete, pending_slots = self.check_slot_filling('apply_loan', filled_slots)
            
            return {
                'intent': 'apply_loan',
                'confidence': 0.8,
                'entities': entities,
                'method': 'rule',
                'needs_slot_filling': not slots_complete,
                'pending_slots': pending_slots,
                'filled_slots': filled_slots
            }
        elif any(word in text_lower for word in ['lost', 'stolen', 'block', 'card']):
            entities = self.extract_entities(text, 'lost_card')
            filled_slots = {}
            for entity in entities:
                if entity['label'] == 'CARD_TYPE':
                    filled_slots['card_type'] = entity['value']
            
            slots_complete, pending_slots = self.check_slot_filling('lost_card', filled_slots)
            
            return {
                'intent': 'lost_card',
                'confidence': 0.8,
                'entities': entities,
                'method': 'rule',
                'needs_slot_filling': not slots_complete,
                'pending_slots': pending_slots,
                'filled_slots': filled_slots
            }
        else:
            return self.fallback_response()

    def fallback_response(self):
        """Generate fallback response for unrecognized queries"""
        fallback_responses = [
            "I understand you need banking assistance. Could you please be more specific about what you'd like to do?",
            "I'm here to help with your banking needs. Could you rephrase your request?",
            "I can help with balance inquiries, money transfers, loan applications, and more. What would you like to do?",
            "I didn't quite understand that. Could you please tell me what banking service you need help with?"
        ]
        
        import random
        return {
            'intent': 'fallback',
            'confidence': 0.3,
            'entities': [],
            'method': 'fallback',
            'response': random.choice(fallback_responses),
            'needs_slot_filling': False
        }

# Global instance
enhanced_nlu = EnhancedNLU()

def analyze_query(query, session_id=None):
    """Main analysis function with enhanced features"""
    result = enhanced_nlu.predict_intent(query, session_id)
    return {
        'intent': result['intent'],
        'confidence': result['confidence'],
        'entities': result.get('entities', []),
        'method': result['method'],
        'needs_slot_filling': result.get('needs_slot_filling', False),
        'pending_slots': result.get('pending_slots', {}),
        'filled_slots': result.get('filled_slots', {}),
        'response': result.get('response', '')
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--train':
        print("🚀 Training enhanced NLU model...")
        enhanced_nlu.train_model()
        print("✅ Training complete!")
    else:
        # Test the enhanced NLU
        test_queries = [
            "Hi there!",
            "What's my balance?",
            "Transfer 5000",
            "I lost my credit card",
            "Apply for home loan",
            "Thank you",
            "Help me"
        ]
        
        print("🧪 Testing Enhanced NLU:")
        print("=" * 50)
        for query in test_queries:
            result = analyze_query(query, "test_session")
            print(f"Query: '{query}'")
            print(f"→ Intent: {result['intent']} (Confidence: {result['confidence']:.2%})")
            if result['needs_slot_filling']:
                print(f"→ Pending Slots: {list(result['pending_slots'].keys())}")
            if result.get('response'):
                print(f"→ Response: {result['response']}")
            print("-" * 30)
