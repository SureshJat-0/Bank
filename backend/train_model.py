import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import re
import os


def preprocess_text(text):
    """Clean and preprocess text"""
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    text = re.sub(r'\d+', 'NUM', text)   # Replace numbers with NUM
    return text.strip()


def train_intent_model():
    """Train intent classification model from CSV data"""
    print("🚀 Training Banking Intent Classification Model...")
    
    # Load CSV data
    try:
        df = pd.read_csv('banking_queries.csv')
        print(f"✅ Loaded {len(df)} training samples")
    except FileNotFoundError:
        print("❌ banking_queries.csv file not found!")
        return None, None
    
    # Preprocess data
    df['text'] = df['text'].apply(preprocess_text)
    df = df.dropna(subset=['text', 'intent'])
    
    print(f"📊 Intent distribution:")
    intent_counts = df['intent'].value_counts()
    print(intent_counts.head(10))
    
    # Prepare features and labels
    X = df['text']
    y = df['intent']
    
    # Split data (without stratify to avoid classes with single samples error)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"📈 Training samples: {len(X_train)}")
    print(f"🧪 Test samples: {len(X_test)}")
    
    # Create pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words='english',
            lowercase=True
        )),
        ('classifier', LogisticRegression(
            random_state=42,
            max_iter=1000,
            class_weight='balanced'
        ))
    ])
    
    # Train model
    print("🔄 Training model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"✅ Model Training Complete!")
    print(f"📈 Accuracy: {accuracy:.2%}")
    print(f"🎯 Total Classes: {len(pipeline.named_steps['classifier'].classes_)}")
    
    # Save model
    os.makedirs('models', exist_ok=True)
    with open('models/intent_model.pkl', 'wb') as f:
        pickle.dump(pipeline, f)
    
    # Save class mapping and metadata
    classes = list(pipeline.named_steps['classifier'].classes_)
    metadata = {
        'classes': classes,
        'accuracy': accuracy,
        'total_samples': len(df),
        'intents': intent_counts.to_dict()
    }
    
    with open('models/model_metadata.pkl', 'wb') as f:
        pickle.dump(metadata, f)
    
    print("💾 Model saved to models/intent_model.pkl")
    
    # Print detailed report
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred))
    
    return pipeline, metadata


if __name__ == "__main__":
    model, metadata = train_intent_model()
    
    if model is None:
        exit(1)
    
    # Test with sample queries
    test_queries = [
        "What's my balance?",
        "Transfer 5000 to my friend",
        "I lost my credit card",
        "Apply for home loan",
        "Show branch details"
    ]
    
    print("\n🧪 Testing model with sample queries:")
    print("=" * 50)
    for query in test_queries:
        processed = preprocess_text(query)
        prediction = model.predict([processed])[0]
        confidence = max(model.predict_proba([processed])[0])
        print(f"Query: '{query}'")
        print(f"→ Intent: {prediction} (Confidence: {confidence:.2%})")
        print("-" * 30)
