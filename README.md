# Infosys Fake Job Detection using NLP

A machine learning-powered web application to detect and identify fake job postings using advanced NLP techniques and classification models.

## Features

- **Job Posting Analysis**: Real-time detection of fraudulent job postings
- **OCR Integration**: Extract text from job posting images
- **User Authentication**: Secure login and registration system
- **Admin Panel**: Manage users, feedback, and job predictions
- **Dashboard**: Track job checking history and statistics
- **Feedback System**: Users can report suspicious jobs and provide feedback
- **Export Functionality**: Download analysis results and reports

## Tech Stack

### Frontend
- React.js
- CSS3 for styling
- Context API for state management

### Backend
- Node.js with Express
- MongoDB for database
- Python Flask API for ML models
- JWT authentication

### Machine Learning
- Python with scikit-learn, pandas, numpy
- NLP models for text classification
- Model training and retraining pipelines

## Project Structure

```
JobCheck/
├── client/              # React frontend
├── server/              # Node.js/Express backend
├── Backend/             # Python API and ML utilities
├── Model/               # ML models and training scripts
├── Dataset/             # Training datasets
└── App/                 # Additional application modules
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- Python 3.8+
- MongoDB
- Git

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Backend Setup
```bash
cd server
npm install
```

### Python API Setup
```bash
pip install -r requirements.txt
python app.py
```

## Environment Variables

Create `.env` files in both `server` and `client` directories with necessary configuration:

**server/.env**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
PYTHON_API_URL=http://localhost:5000
```

**client/.env**
```
REACT_APP_API_URL=http://localhost:5001
```

## API Endpoints

- `/api/auth/*` - Authentication routes
- `/api/predictions/*` - Job prediction routes
- `/api/feedback/*` - Feedback submission
- `/api/admin/*` - Admin operations
- `/api/users/*` - User management

## Model Information

The machine learning model is trained on a dataset of legitimate and fake job postings. It uses:
- Text preprocessing and tokenization
- Feature extraction using TF-IDF and word embeddings
- Classification algorithms (XGBoost, Random Forest, etc.)
- Regular retraining pipeline for model improvement

## Contributing

Contributions are welcome! Please follow the existing code structure and submit pull requests for any improvements.

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue in the repository.
