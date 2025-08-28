# nlu_service_simple.py
import json
import re
from pathlib import Path

class SimpleNLU:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        try:
            with open('models/simple_model.json', 'r') as f:
                self.model = json.load(f)
            print(f"✅ Simple model loaded with {len(self.model['intents'])} intents")
        except FileNotFoundError:
            print("⚠️ Simple model not found. Using fallback.")
    
    def predict_intent(self, text):
        if not self.model:
            return self.fallback_intent(text)
        
        text = text.lower()
        best_intent = 'check_balance'
        best_score = 0
        
        for intent in self.model['intents']:
            score = 0
            keywords = self.model['keywords'].get(intent, [])
            
            # Keyword matching
            for keyword in keywords:
                if keyword in text:
                    score += 1
            
            # Pattern matching
            patterns = self.model['patterns'].get(intent, [])
            for pattern in patterns[:3]:  # Check top 3 patterns
                if pattern in text:
                    score += 2
                    break
            
            if score > best_score:
                best_score = score
                best_intent = intent
        
        confidence = min(best_score / 5, 0.95)  # Normalize
        return {
            'intent': best_intent,
            'confidence': confidence,
            'method': 'simple_ml'
        }
    
    def fallback_intent(self, text):
        text = text.lower()
        if any(word in text for word in ['balance', 'money', 'amount']):
            return {'intent': 'check_balance', 'confidence': 0.85, 'method': 'rule'}
        elif any(word in text for word in ['transfer', 'send', 'pay']):
            return {'intent': 'transfer_money', 'confidence': 0.85, 'method': 'rule'}
        elif any(word in text for word in ['loan', 'apply']):
            return {'intent': 'apply_loan', 'confidence': 0.85, 'method': 'rule'}
        else:
            return {'intent': 'check_balance', 'confidence': 0.6, 'method': 'rule'}

# Global instance
simple_nlu = SimpleNLU()

def analyze_query(query):
    result = simple_nlu.predict_intent(query)
    return {
        'intent': result['intent'],
        'confidence': result['confidence'],
        'entities': [],  # Simple version
        'method': result['method']
    }
