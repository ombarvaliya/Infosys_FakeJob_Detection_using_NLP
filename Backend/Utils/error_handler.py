"""
Error handling utilities for the Fake Job Detection API
Provides custom exceptions and error response formatting
"""

class FakeJobDetectionException(Exception):
    """Base exception for Fake Job Detection API"""
    pass


class ModelNotLoadedException(FakeJobDetectionException):
    """Raised when ML model files are not found or failed to load"""
    def __init__(self, model_name: str = "Model"):
        self.model_name = model_name
        self.message = f"{model_name} files not found or failed to load"
        super().__init__(self.message)


class ValidationException(FakeJobDetectionException):
    """Raised when input validation fails"""
    def __init__(self, field: str = None, message: str = None):
        if message:
            self.message = message
        else:
            self.message = f"Validation failed for field: {field}"
        super().__init__(self.message)


class MissingFieldException(ValidationException):
    """Raised when required field is missing"""
    def __init__(self, fields: list):
        self.fields = fields
        self.message = f"Missing required fields: {', '.join(fields)}"
        super().__init__(message=self.message)


class PredictionException(FakeJobDetectionException):
    """Raised when prediction fails"""
    def __init__(self, message: str = "Prediction failed"):
        self.message = message
        super().__init__(self.message)


class TextProcessingException(FakeJobDetectionException):
    """Raised when text processing fails"""
    def __init__(self, message: str = "Text processing failed"):
        self.message = message
        super().__init__(self.message)


def format_error_response(error: Exception, status_code: int = 500) -> dict:
    """
    Format exception into standardized API response
    
    Args:
        error: Exception instance
        status_code: HTTP status code
        
    Returns:
        Dictionary with error details
    """
    error_type = type(error).__name__
    
    response = {
        'status': 'error',
        'error_type': error_type,
        'message': str(error),
        'status_code': status_code
    }
    
    # Add specific error details based on exception type
    if isinstance(error, MissingFieldException):
        response['missing_fields'] = error.fields
        response['status_code'] = 400
    elif isinstance(error, ValidationException):
        response['status_code'] = 400
    elif isinstance(error, ModelNotLoadedException):
        response['status_code'] = 503
        response['action'] = 'Please run the notebook to save model files'
    elif isinstance(error, PredictionException):
        response['status_code'] = 500
    
    return response


def validate_prediction_input(data: dict, required_fields: list) -> tuple[bool, list]:
    """
    Validate if all required fields are present in input data
    
    Args:
        data: Dictionary containing input data
        required_fields: List of field names that are required
        
    Returns:
        Tuple of (is_valid: bool, missing_fields: list)
    """
    if not data:
        return False, required_fields
    
    missing_fields = [field for field in required_fields if field not in data or not data.get(field)]
    
    if missing_fields:
        return False, missing_fields
    
    return True, []


def validate_text_input(text: str, min_length: int = 10) -> tuple[bool, str]:
    """
    Validate text input
    
    Args:
        text: Text to validate
        min_length: Minimum length of text
        
    Returns:
        Tuple of (is_valid: bool, error_message: str)
    """
    if not text or not isinstance(text, str):
        return False, "Text must be a non-empty string"
    
    if len(text.strip()) < min_length:
        return False, f"Text must be at least {min_length} characters long"
    
    return True, ""


def safe_cast_value(value, expected_type=str):
    """
    Safely cast value to expected type
    
    Args:
        value: Value to cast
        expected_type: Expected type
        
    Returns:
        Casted value or None if casting fails
    """
    try:
        if expected_type == str:
            return str(value).strip()
        elif expected_type == float:
            return float(value)
        elif expected_type == int:
            return int(value)
        return value
    except (ValueError, TypeError):
        return None
