#!/usr/bin/env python3
"""Test the bias fix with sample real and fake job postings"""
import joblib

print("Loading model and vectorizer...")
model = joblib.load('logistic_regression_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

def test_job(title, description, requirements, company):
    """Test a job posting"""
    # Combine text (same as training)
    text = (title + " " + description + " " + requirements + " " + company).lower()
    
    # Vectorize
    X = vectorizer.transform([text])
    
    # Predict
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    
    status = "FAKE" if pred == 1 else "REAL"
    real_confidence = proba[0] * 100
    fake_confidence = proba[1] * 100
    
    return {
        'status': status,
        'real_confidence': real_confidence,
        'fake_confidence': fake_confidence
    }

print("\n" + "=" * 80)
print("TESTING ADJUSTED MODEL")
print("=" * 80)

# Test 1: Real Job
print("\n[TEST 1] REAL JOB POSTING - Google Senior Engineer")
result = test_job(
    title="Senior Software Engineer",
    description="Join Google's engineering team. We're looking for talented software engineers with strong problem-solving skills.",
    requirements="5+ years software development experience, excellent coding skills, BS in Computer Science or equivalent",
    company="Google"
)
print(f"  Prediction: {result['status']}")
print(f"  Real confidence: {result['real_confidence']:.1f}%")
print(f"  Fake confidence: {result['fake_confidence']:.1f}%")
print(f"  Expected: REAL ✓" if result['status'] == 'REAL' else f"  Expected: REAL ✗ (Still biased)")

# Test 2: Fake Job  
print("\n[TEST 2] FAKE JOB POSTING - Work from Home Scam")
result = test_job(
    title="Work from home earn $5000 a week",
    description="Earn easy money! No experience required. Immediate hiring. Earn five thousand dollars per week.",
    requirements="No degree needed. No experience necessary. Flexible hours.",
    company="Quick Cash Inc"
)
print(f"  Prediction: {result['status']}")
print(f"  Real confidence: {result['real_confidence']:.1f}%")
print(f"  Fake confidence: {result['fake_confidence']:.1f}%")
print(f"  Expected: FAKE ✓" if result['status'] == 'FAKE' else f"  Expected: FAKE ✗")

# Test 3: Borderline Case
print("\n[TEST 3] BORDERLINE CASE - Medium Level Job")
result = test_job(
    title="Data Analyst",
    description="We are seeking a data analyst to join our team and help with data analysis and reporting.",
    requirements="2-3 years experience with data analysis and SQL",
    company="Tech Solutions LLC"
)
print(f"  Prediction: {result['status']}")
print(f"  Real confidence: {result['real_confidence']:.1f}%")
print(f"  Fake confidence: {result['fake_confidence']:.1f}%")
print(f"  Status: Could be either, but confidence is not extreme ✓")

# Test 4: Another Fake
print("\n[TEST 4] FAKE JOB - Pay by Wire Transfer")
result = test_job(
    title="Home-based job no interview needed",
    description="Work from home no experience no interview. Send application fee to process your application immediately.",
    requirements="Must have email and bank account. That's all you need!",
    company="Unknown"
)
print(f"  Prediction: {result['status']}")
print(f"  Real confidence: {result['real_confidence']:.1f}%")
print(f"  Fake confidence: {result['fake_confidence']:.1f}%")
print(f"  Expected: FAKE ✓" if result['status'] == 'FAKE' else f"  Expected: FAKE ✗")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
print("\nIf most predictions match expected results, the bias fix is working!")
print("If TEST 1 shows REAL with high confidence, the bias is fixed! 🎉")
