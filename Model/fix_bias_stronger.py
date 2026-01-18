#!/usr/bin/env python3
"""
Stronger bias fix - reduce the model's fake prediction tendency more aggressively
"""
import joblib
import numpy as np

print("Loading existing model...")
model = joblib.load('logistic_regression_model.pkl')

print(f"Original intercept: {model.intercept_[0]:.4f}")
print(f"Original coef mean: {model.coef_[0].mean():.6f}")
print(f"Original coef max: {model.coef_[0].max():.6f}")
print(f"Original coef min: {model.coef_[0].min():.6f}")

# More aggressive fix
# The intercept is heavily biased toward 1 (FAKE), so reduce it significantly
model.intercept_[0] = 0.0  # Set to neutral

# Reduce coefficients more - scale by 0.3 (was 0.7, now even lower)
model.coef_[0] = model.coef_[0] * 0.3

print(f"\nAdjusted intercept: {model.intercept_[0]:.4f}")
print(f"Adjusted coef mean: {model.coef_[0].mean():.6f}")

# Save
joblib.dump(model, 'logistic_regression_model.pkl')
print("\n✓ Stronger bias fix applied!")
print("  - Set decision bias to neutral (0.0)")
print("  - Reduced feature weights to 30% of original")
print("\nThe model should now be much less aggressive about predicting FAKE.")
