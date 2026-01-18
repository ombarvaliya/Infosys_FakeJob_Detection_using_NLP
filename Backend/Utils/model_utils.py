"""
Model loading and text processing utilities
"""

import joblib
import re
import os
from pathlib import Path
from typing import Tuple, Optional
from .error_handler import ModelNotLoadedException, TextProcessingException


class ModelManager:
    """Manage ML model loading and caching"""
    
    _model = None
    _vectorizer = None
    _model_paths = None
    _vectorizer_paths = None
    
    @classmethod
    def initialize_paths(cls, base_dir: str = None):
        """Initialize model file search paths"""
        if base_dir is None:
            base_dir = Path(__file__).parent.parent.parent
        else:
            base_dir = Path(base_dir)
        
        cls._model_paths = [
            base_dir / 'Model' / 'logistic_regression_model.pkl',
            base_dir / 'Backend' / 'Models' / 'logistic_regression_model.pkl',
            base_dir / 'logistic_regression_model.pkl',
            Path('logistic_regression_model.pkl'),
        ]
        
        cls._vectorizer_paths = [
            base_dir / 'Model' / 'tfidf_vectorizer.pkl',
            base_dir / 'Backend' / 'Models' / 'tfidf_vectorizer.pkl',
            base_dir / 'tfidf_vectorizer.pkl',
            Path('tfidf_vectorizer.pkl'),
        ]
    
    @classmethod
    def load_model(cls):
        """Load ML model from disk"""
        if cls._model is not None:
            return cls._model
        
        if cls._model_paths is None:
            cls.initialize_paths()
        
        for path in cls._model_paths:
            try:
                if os.path.exists(path):
                    cls._model = joblib.load(path)
                    print(f"✓ Model loaded from: {path}")
                    return cls._model
            except Exception as e:
                print(f"✗ Failed to load model from {path}: {e}")
                continue
        
        raise ModelNotLoadedException("LogisticRegression Model")
    
    @classmethod
    def load_vectorizer(cls):
        """Load TF-IDF vectorizer from disk"""
        if cls._vectorizer is not None:
            return cls._vectorizer
        
        if cls._vectorizer_paths is None:
            cls.initialize_paths()
        
        for path in cls._vectorizer_paths:
            try:
                if os.path.exists(path):
                    cls._vectorizer = joblib.load(path)
                    print(f"✓ Vectorizer loaded from: {path}")
                    return cls._vectorizer
            except Exception as e:
                print(f"✗ Failed to load vectorizer from {path}: {e}")
                continue
        
        raise ModelNotLoadedException("TF-IDF Vectorizer")
    
    @classmethod
    def get_model(cls):
        """Get loaded model (load if not already loaded)"""
        if cls._model is None:
            cls.load_model()
        return cls._model
    
    @classmethod
    def get_vectorizer(cls):
        """Get loaded vectorizer (load if not already loaded)"""
        if cls._vectorizer is None:
            cls.load_vectorizer()
        return cls._vectorizer


class TextProcessor:
    """Process and clean text for model input"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and preprocess text
        
        Args:
            text: Raw text to clean
            
        Returns:
            Cleaned text
        """
        try:
            # Convert to lowercase
            text = text.lower()
            
            # Replace URLs
            text = re.sub(r'http\S+|www\S+|https\S+', ' urltoken ', text)
            
            # Replace emails
            text = re.sub(r'\S+@\S+', ' emailtoken ', text)
            
            # Replace numbers
            text = re.sub(r'\d+', ' numbertoken ', text)
            
            # Remove special characters (keep only alphanumeric and spaces)
            text = re.sub(r'[^\w\s]', ' ', text)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            return text
        except Exception as e:
            raise TextProcessingException(f"Failed to clean text: {str(e)}")
    
    @staticmethod
    def combine_fields(title: str, description: str, requirements: str, 
                      company_profile: str, employment_type: str, 
                      industry: str, benefits: str, salary_range: str) -> str:
        """
        Combine multiple text fields into a single text
        
        Args:
            Various job posting fields
            
        Returns:
            Combined text
        """
        try:
            combined = " ".join([
                str(title or ""),
                str(description or ""),
                str(requirements or ""),
                str(company_profile or ""),
                str(employment_type or ""),
                str(industry or ""),
                str(benefits or ""),
                str(salary_range or "")
            ])
            return combined
        except Exception as e:
            raise TextProcessingException(f"Failed to combine fields: {str(e)}")


class PredictionProcessor:
    """Process predictions and format responses"""
    
    @staticmethod
    def process_prediction(prediction: int, probability: list) -> dict:
        """
        Process raw prediction into formatted response
        
        Args:
            prediction: Model prediction (0 or 1)
            probability: Probability array [real_prob, fake_prob]
            
        Returns:
            Formatted prediction response
        """
        is_fake = bool(prediction)
        confidence = float(max(probability)) * 100
        
        return {
            'prediction': int(prediction),
            'is_fake': is_fake,
            'label': 'FAKE' if is_fake else 'LEGITIMATE',
            'probability': {
                'legitimate': float(probability[0]),
                'fake': float(probability[1])
            },
            'confidence': round(confidence, 2)
        }
