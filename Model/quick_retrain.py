#!/usr/bin/env python3
"""Quick model retraining with optimized parameters"""
import pandas as pd
import numpy as np
import joblib
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

print("Loading data...")
df = pd.read_csv('merged_job_dataset.csv')

# Combine text
df['text'] = (df.get('title', '') + " " + df.get('description', '') + " " + 
              df.get('requirements', '') + " " + df.get('company_profile', '')).fillna("")

# Clean
def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' url ', text)
    text = re.sub(r'\S+@\S+', ' email ', text)
    text = re.sub(r'\d+', ' num ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df['text'] = df['text'].apply(clean_text)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    df['text'], df['fraudulent'], test_size=0.2, random_state=42, 
    stratify=df['fraudulent']
)

# Vectorize - SIMPLE AND FAST
print("Vectorizing (this may take 1-2 minutes)...")
tfidf = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), min_df=2)
X_train_v = tfidf.fit_transform(X_train)
X_test_v = tfidf.transform(X_test)

# Train with FIXED parameters
print("\nTraining model with balanced parameters...")
model = LogisticRegression(
    class_weight={0: 1, 1: 2.0},  # 2x weight (NOT 50x!)
    C=1.0,  # Less strong regularization
    max_iter=500,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_v, y_train)

# Evaluate
y_pred = model.predict(X_test_v)
acc = accuracy_score(y_test, y_pred)

print(f"\n✓ Model trained! Test Accuracy: {acc:.2%}")
print(classification_report(y_test, y_pred))

# Save
joblib.dump(model, 'logistic_regression_model.pkl')
joblib.dump(tfidf, 'tfidf_vectorizer.pkl')
print("\n✓ Model and vectorizer saved!")
