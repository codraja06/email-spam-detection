import pandas as pd
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import urllib.request
import os

# Download NLTK data
print("Downloading NLTK data...")
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# URL for a standard SMS spam dataset
DATA_URL = "https://raw.githubusercontent.com/justmarkham/pycon-2016-tutorial/master/data/sms.tsv"
DATA_FILE = "sms.tsv"

def load_data():
    if not os.path.exists(DATA_FILE):
        print(f"Downloading dataset from {DATA_URL}...")
        urllib.request.urlretrieve(DATA_URL, DATA_FILE)
    
    print("Loading dataset...")
    # The dataset has no header, we define names
    df = pd.read_csv(DATA_FILE, sep='\t', header=None, names=['label', 'message'])
    return df

def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenization and Stop words removal
    words = text.split()
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word not in stop_words]
    
    # Lemmatization
    lemmatizer = WordNetLemmatizer()
    words = [lemmatizer.lemmatize(word) for word in words]
    
    return ' '.join(words)

def main():
    # 1. Load Data
    df = load_data()
    
    # Encode labels: spam=1, ham=0
    df['label'] = df['label'].map({'spam': 1, 'ham': 0})
    
    print("Preprocessing text data...")
    # 2. Preprocess text
    df['clean_message'] = df['message'].apply(preprocess_text)
    
    # 3. Split data
    X_train, X_test, y_train, y_test = train_test_split(df['clean_message'], df['label'], test_size=0.2, random_state=42)
    
    # 4. TF-IDF Vectorization
    print("Vectorizing text data...")
    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # 5. Train Models
    models = {
        "Naive Bayes": MultinomialNB(),
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42)
    }
    
    best_model = None
    best_accuracy = 0
    best_model_name = ""
    
    print("\n--- Model Training and Evaluation ---")
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train_tfidf, y_train)
        
        y_pred = model.predict(X_test_tfidf)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        
        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        print(f"Confusion Matrix:\n{cm}")
        
        if acc > best_accuracy:
            best_accuracy = acc
            best_model = model
            best_model_name = name
            
    print(f"\nBest Model: {best_model_name} with Accuracy: {best_accuracy:.4f}")
    
    # 6. Save Model and Vectorizer
    print("Saving the best model and vectorizer...")
    joblib.dump(best_model, 'spam_model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')
    print("Files saved successfully as 'spam_model.pkl' and 'vectorizer.pkl'.")

if __name__ == "__main__":
    main()
