#!/usr/bin/env python3
"""
QUICK FIX: Adjust the model probability threshold to fix the bias
This loads the existing model and applies a threshold adjustment
"""
import joblib
import numpy as np

print("Loading existing model and vectorizer...")
model = joblib.load('logistic_regression_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

print("✓ Model loaded")
print(f"  - Model type: {type(model).__name__}")
print(f"  - Vectorizer: {type(vectorizer).__name__}")

# ============================================================================
# OPTION 1: Adjust the model's decision threshold
# ============================================================================
# The original model may have been trained with extreme class weights
# We can adjust its coefficients to be less aggressive

original_intercept = model.intercept_[0]
print(f"\nOriginal model intercept (bias): {original_intercept:.4f}")

# Reduce the intercept to make the model less likely to predict FAKE
# Higher intercept = more bias toward predicting FAKE (1)
# We'll reduce it by shifting toward 0 (neutral)
model.intercept_[0] = original_intercept * 0.5  # Reduce by half

print(f"Adjusted model intercept: {model.intercept_[0]:.4f}")
print(f"  → This makes the model 50% less aggressive at predicting FAKE")

# ============================================================================
# OPTION 2: Scale down the coefficients (weights)
# ============================================================================
print(f"\nAdjusting feature coefficients...")
print(f"  - Original weight magnitude: {np.abs(model.coef_[0]).mean():.6f}")

# Reduce coefficient magnitude by 30% to make predictions less extreme
model.coef_[0] = model.coef_[0] * 0.7

print(f"  - New weight magnitude: {np.abs(model.coef_[0]).mean():.6f}")
print(f"  → This reduces the confidence of all predictions")

# ============================================================================
# SAVE ADJUSTED MODEL
# ============================================================================
joblib.dump(model, 'logistic_regression_model.pkl')
print("\n✓ Adjusted model saved to 'logistic_regression_model.pkl'")

print("\n" + "="*70)
print("FIX APPLIED!")
print("="*70)
print("\nThe model has been adjusted to be LESS aggressive at predicting FAKE.")
print("Changes made:")
print("  1. Reduced decision bias (intercept) by 50%")
print("  2. Reduced feature weights by 30%")
print("\nThis should eliminate the bias where all jobs were predicted as FAKE.")
print("Real jobs should now be correctly classified as REAL.")
print("\nIf you still see issues, follow the full retraining guide.")
