#!/usr/bin/env python3
"""
Retrain the fake job detection model with improved parameters
to fix the bias issue where all jobs are predicted as FAKE.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import re
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score, roc_curve
import matplotlib.pyplot as plt

# ============================================================================
# STEP 1: LOAD AND PREPARE DATA
# ============================================================================
print("=" * 80)
print("RETRAINING FAKE JOB DETECTION MODEL")
print("=" * 80)

# Load the merged dataset
df = pd.read_csv('merged_job_dataset.csv')
print(f"\n✓ Loaded dataset with {len(df)} samples")
print(f"  - Fake jobs (1): {(df['fraudulent'] == 1).sum()}")
print(f"  - Real jobs (0): {(df['fraudulent'] == 0).sum()}")

# Select features and target
required_columns = [
    "title", "description", "requirements", "company_profile",
    "employment_type", "industry", "benefits", "salary_range", "fraudulent"
]

df = df[required_columns].fillna("")

# Combine text fields for better predictions
df['text'] = (
    df['title'].fillna("") + " " +
    df['description'].fillna("") + " " +
    df['requirements'].fillna("") + " " +
    df['company_profile'].fillna("") + " " +
    df['employment_type'].fillna("") + " " +
    df['industry'].fillna("") + " " +
    df['benefits'].fillna("") + " " +
    df['salary_range'].fillna("")
)

# ============================================================================
# STEP 2: CLEAN TEXT
# ============================================================================
print("\nCleaning text data...")

def clean_text(text):
    """Clean and preprocess text"""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', ' urltoken ', text)
    text = re.sub(r'\S+@\S+', ' emailtoken ', text)
    text = re.sub(r'\d+', ' numbertoken ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df['clean_text'] = df['text'].apply(clean_text)
print(f"✓ Text cleaned for {len(df)} samples")

# ============================================================================
# STEP 3: SPLIT DATA (Stratified to maintain class balance)
# ============================================================================
print("\nSplitting data with stratification...")
X_train, X_test, y_train, y_test = train_test_split(
    df['clean_text'],
    df['fraudulent'],
    test_size=0.2,
    random_state=42,
    stratify=df['fraudulent']
)

print(f"✓ Training set: {len(X_train)} samples")
print(f"  - Fake: {(y_train == 1).sum()} ({(y_train == 1).sum()/len(y_train)*100:.1f}%)")
print(f"  - Real: {(y_train == 0).sum()} ({(y_train == 0).sum()/len(y_train)*100:.1f}%)")
print(f"✓ Test set: {len(X_test)} samples")
print(f"  - Fake: {(y_test == 1).sum()} ({(y_test == 1).sum()/len(y_test)*100:.1f}%)")
print(f"  - Real: {(y_test == 0).sum()} ({(y_test == 0).sum()/len(y_test)*100:.1f}%)")

# ============================================================================
# STEP 4: VECTORIZE TEXT (TF-IDF)
# ============================================================================
print("\nVectorizing text with TF-IDF...")
tfidf = TfidfVectorizer(
    max_features=2000,  # Reduced from 5000 for faster processing
    ngram_range=(1, 2),
    min_df=2,  # Reduced from 1 to skip rare tokens
    max_df=0.95,  # Reduced from 0.99
    sublinear_tf=True,
    lowercase=True,
    strip_accents='ascii',
    token_pattern=r'\b[a-z]{2,}\b'  # Only words with 2+ chars
)

X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)

print(f"✓ TF-IDF vectorizer created")
print(f"  - Vocabulary size: {len(tfidf.get_feature_names_out()):,} features")
print(f"  - Training matrix shape: {X_train_tfidf.shape}")
print(f"  - Test matrix shape: {X_test_tfidf.shape}")

# ============================================================================
# STEP 5: TRAIN OPTIMIZED MODEL
# ============================================================================
print("\n" + "=" * 80)
print("TRAINING LOGISTIC REGRESSION WITH BALANCED PARAMETERS")
print("=" * 80)

# FIXED PARAMETERS:
# - class_weight: 2.0 instead of 50 (much more balanced)
# - C: 1.0 instead of 0.01 (less regularization for better fit)
model = LogisticRegression(
    max_iter=1000,
    class_weight={0: 1, 1: 2.0},  # ← FIXED: 2x penalty (balanced, not 50x!)
    solver='lbfgs',
    C=1.0,  # ← FIXED: Better regularization parameter
    tol=1e-4,
    random_state=42,
    n_jobs=-1
)

print("\n✓ Model Configuration:")
print(f"  - Class weight: 2.0x penalty for missing fake jobs (↓ from 50x)")
print(f"  - C: 1.0 (↑ from 0.01 - less aggressive regularization)")
print(f"  - Solver: lbfgs")
print(f"  - Max iterations: 1,000")
print(f"\nTraining model...")

model.fit(X_train_tfidf, y_train)
print("✓ Model training complete!")

# ============================================================================
# STEP 6: EVALUATE MODEL
# ============================================================================
print("\n" + "=" * 80)
print("MODEL EVALUATION")
print("=" * 80)

y_pred = model.predict(X_test_tfidf)
y_pred_proba = model.predict_proba(X_test_tfidf)

accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_proba[:, 1])

print(f"\n✓ Test Set Performance:")
print(f"  - Accuracy: {accuracy:.4f}")
print(f"  - ROC-AUC: {roc_auc:.4f}")

print(f"\n✓ Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Real (0)', 'Fake (1)']))

print(f"\n✓ Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"  - True Negatives (Correct Real): {cm[0, 0]}")
print(f"  - False Positives (Real → Fake): {cm[0, 1]}")
print(f"  - False Negatives (Fake → Real): {cm[1, 0]}")
print(f"  - True Positives (Correct Fake): {cm[1, 1]}")

# ============================================================================
# STEP 7: SAVE MODEL
# ============================================================================
print("\n" + "=" * 80)
print("SAVING MODEL")
print("=" * 80)

model_path = Path('logistic_regression_model.pkl')
vectorizer_path = Path('tfidf_vectorizer.pkl')

joblib.dump(model, str(model_path))
joblib.dump(tfidf, str(vectorizer_path))

print(f"\n✓ Model saved to: {model_path}")
print(f"✓ Vectorizer saved to: {vectorizer_path}")

# ============================================================================
# STEP 8: TEST ON SAMPLE DATA
# ============================================================================
print("\n" + "=" * 80)
print("SAMPLE PREDICTIONS")
print("=" * 80)

# Get a few real and fake examples from test set
real_indices = np.where(y_test == 0)[0][:2]
fake_indices = np.where(y_test == 1)[0][:2]

print("\n✓ Real Job Examples (should predict REAL):")
for idx in real_indices:
    text = X_test.iloc[idx][:100]
    pred_proba = model.predict_proba(tfidf.transform([X_test.iloc[idx]]))[0]
    pred = "REAL" if pred_proba[0] > pred_proba[1] else "FAKE"
    print(f"  - Prediction: {pred} (Real confidence: {pred_proba[0]:.2%}, Fake: {pred_proba[1]:.2%})")
    print(f"    Text: '{text}...'")

print("\n✓ Fake Job Examples (should predict FAKE):")
for idx in fake_indices:
    text = X_test.iloc[idx][:100]
    pred_proba = model.predict_proba(tfidf.transform([X_test.iloc[idx]]))[0]
    pred = "REAL" if pred_proba[0] > pred_proba[1] else "FAKE"
    print(f"  - Prediction: {pred} (Real confidence: {pred_proba[0]:.2%}, Fake: {pred_proba[1]:.2%})")
    print(f"    Text: '{text}...'")

print("\n" + "=" * 80)
print("✓ RETRAINING COMPLETE!")
print("=" * 80)
print("\nYour model has been retrained with better balanced parameters.")
print("The 50x class weight penalty has been reduced to 2x, which should fix")
print("the false positive issue where all jobs were being predicted as FAKE.")
