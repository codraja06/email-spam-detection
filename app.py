from flask import Flask, render_template, request, jsonify
import joblib
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import os

# Make sure nltk data is available
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'spam_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'vectorizer.pkl')

model = None
vectorizer = None

if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
else:
    print("Warning: Model or Vectorizer not found. Please run model_training.py first.")

# Common spam keywords for highlighting in UI
SPAM_KEYWORDS = [
    'win', 'winner', 'won', 'prize', 'free', 'cash', 'money', 'urgent', 
    'guaranteed', 'congratulations', 'claim', 'offer', 'selected', 
    'credit', 'debt', 'lottery', 'investment', 'casino', 'viagra', 'cheap',
    'buy', 'earn', 'income', 'work from home', 'bonus', 'alert'
]

def preprocess_text(text):
    if not text:
        return ""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenization and Stop words removal
    words = text.split()
    try:
        stop_words = set(stopwords.words('english'))
        words = [word for word in words if word not in stop_words]
    except Exception:
        pass # fallback if nltk download failed
    
    # Lemmatization
    try:
        lemmatizer = WordNetLemmatizer()
        words = [lemmatizer.lemmatize(word) for word in words]
    except Exception:
        pass
    
    return ' '.join(words)

def highlight_keywords(text):
    # This just returns the list of found keywords to the frontend
    found_keywords = []
    text_lower = text.lower()
    for word in SPAM_KEYWORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            found_keywords.append(word)
    return found_keywords

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or vectorizer is None:
        return jsonify({'error': 'Model not trained yet.'}), 500
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
        
    subject = data.get('subject', '')
    content = data.get('content', '')
    
    # Combine subject and content for analysis
    full_text = f"{subject} {content}"
    
    # Preprocess
    cleaned_text = preprocess_text(full_text)
    
    # Vectorize
    vectorized_text = vectorizer.transform([cleaned_text])
    
    # Predict
    prediction = model.predict(vectorized_text)[0]
    
    # Probability
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(vectorized_text)[0]
        confidence = float(proba[prediction]) * 100
        spam_probability = float(proba[1]) * 100
    else:
        # Fallback if model doesn't support predict_proba
        confidence = 100.0
        spam_probability = 100.0 if prediction == 1 else 0.0
    
    # Find suspicious keywords
    suspicious_words = highlight_keywords(full_text)
    
    result = 'Spam' if prediction == 1 else 'Not Spam'
    
    return jsonify({
        'prediction': result,
        'confidence': round(confidence, 2),
        'spam_probability': round(spam_probability, 2),
        'suspicious_words': suspicious_words
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
