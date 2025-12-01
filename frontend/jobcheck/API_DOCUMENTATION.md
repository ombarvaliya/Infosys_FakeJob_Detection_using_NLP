# Backend API Mock Documentation

This document describes the API endpoints and mock implementation used in the frontend.

## Overview

The frontend includes a built-in mock API service for demonstration purposes. This allows the frontend to work independently without needing the actual backend running. The mock API simulates realistic delays and responses.

## Mock API Service

**File**: `src/services/predictionService.js`

### Functions

#### `predictJobPost(text, useRealAPI = false)`

Analyzes a job post text and returns prediction results.

**Parameters:**
- `text` (string): The job posting description to analyze
- `useRealAPI` (boolean): Set to `true` to use real API, `false` for mock

**Returns:**
```javascript
Promise<{
  success: boolean,
  data?: {
    label: 'real' | 'fake',
    probability: number (0-1),
    suspiciousWords: string[]
  },
  error?: string
}>
```

**Example:**
```javascript
const result = await predictJobPost(
  "Senior Developer position. $500k salary. No experience needed."
);

// Result
{
  success: true,
  data: {
    label: 'fake',
    probability: 0.95,
    suspiciousWords: ['no experience needed', 'high salary']
  }
}
```

#### `predictFromFile(file, useRealAPI = false)`

Analyzes a job post from a file (PDF or image).

**Parameters:**
- `file` (File): The file object containing the job posting
- `useRealAPI` (boolean): Set to `true` to use real API, `false` for mock

**Returns:**
```javascript
Promise<{
  success: boolean,
  data?: {
    label: 'real' | 'fake',
    probability: number (0-1),
    suspiciousWords: string[]
  },
  error?: string
}>
```

## Real Backend Integration

To integrate with a real backend API:

### 1. Update Service Configuration

Edit `src/services/predictionService.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:5000/api'

// In functions, change:
const useRealAPI = true // or read from environment
```

### 2. Required API Endpoints

Your backend must implement these endpoints:

#### `POST /api/predict`

Analyzes job post text.

**Request:**
```json
{
  "text": "Full job posting description..."
}
```

**Response (Success):**
```json
{
  "label": "fake",
  "probability": 0.87,
  "suspiciousWords": ["easy money", "work from home"],
  "explanation": "Optional detailed explanation"
}
```

**Response (Error):**
```json
{
  "error": "Failed to analyze post",
  "message": "Detailed error message"
}
```

#### `POST /api/predict-file`

Analyzes job post from uploaded file.

**Request:**
```
Content-Type: multipart/form-data
file: <binary file content>
```

**Response:**
Same as `/predict` endpoint

**Supported file types:**
- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)

**File size limit:** 5MB

## Mock API Examples

The mock API includes predefined responses for common keywords:

```javascript
// These phrases trigger fake predictions
const mockPredictions = {
  'work from home easy money': { label: 'fake', probability: 0.87 },
  'no experience required high salary': { label: 'fake', probability: 0.95 },
  // ... more examples
}
```

### Random Fake Detection

If input text doesn't match predefined patterns, the mock API randomly returns:
- Real: 50% chance
- Fake: 50% chance
- Probability: 70-95%

## Integrating Real Backend

### Example Flask Backend

```python
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

app = Flask(__name__)

# Load your trained model
model = load_model()
vectorizer = load_vectorizer()

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    # Make prediction
    features = vectorizer.transform([text])
    prediction = model.predict(features)[0]
    probability = max(model.predict_proba(features)[0])
    
    # Extract suspicious words (implement your own logic)
    suspicious_words = extract_suspicious_words(text)
    
    return jsonify({
        'label': 'fake' if prediction == 1 else 'real',
        'probability': float(probability),
        'suspiciousWords': suspicious_words
    })

@app.route('/api/predict-file', methods=['POST'])
def predict_file():
    file = request.files.get('file')
    
    if not file:
        return jsonify({'error': 'No file provided'}), 400
    
    # Extract text from file (PDF or image with OCR)
    text = extract_text_from_file(file)
    
    # Process same as /predict endpoint
    # ... (same logic)
    
    return jsonify(result)
```

## Testing the API

### Using cURL

```bash
# Test text prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Easy money work from home"}'

# Test file prediction
curl -X POST http://localhost:5000/api/predict-file \
  -F "file=@job_posting.pdf"
```

### Using JavaScript/Fetch

```javascript
// Text prediction
const response = await fetch('/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Job description here' })
});
const data = await response.json();

// File prediction
const formData = new FormData();
formData.append('file', fileObject);
const response = await fetch('/api/predict-file', {
  method: 'POST',
  body: formData
});
const data = await response.json();
```

## Error Handling

The service handles various error scenarios:

- **Network errors**: Returns error message
- **Invalid file type**: Frontend validation prevents upload
- **File too large**: Frontend validation enforces size limit
- **Empty input**: Frontend validation prevents submission
- **Server errors**: Returns server error message

## Performance Considerations

- **Mock API**: 2-second simulated delay for realistic UX
- **Real API**: Should respond within 1-2 seconds
- **File processing**: Optimize for large PDFs/images
- **Rate limiting**: Consider implementing API rate limits

## Security Notes

When integrating with a real backend:

1. **Enable CORS** for frontend domain
2. **Validate input** on server side
3. **Sanitize data** before storage
4. **Use HTTPS** in production
5. **Implement authentication** if needed
6. **Add rate limiting** to prevent abuse
7. **Log requests** for monitoring

## Environment Variables

Create `.env` file for backend configuration:

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=5000
VITE_USE_REAL_API=false
```

## Troubleshooting

### Mock API not working
- Check browser console for errors
- Verify `predictionService.js` is imported correctly

### Real API not connecting
- Verify backend is running
- Check `VITE_API_URL` is correct
- Enable CORS on backend
- Check network tab for failed requests

### Slow responses
- Check backend performance
- Verify file size limits
- Optimize text processing

---

For more information, see the main README.md
