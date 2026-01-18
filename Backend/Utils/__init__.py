"""Utils package for Fake Job Detection API"""

from .error_handler import (
    FakeJobDetectionException,
    ModelNotLoadedException,
    ValidationException,
    MissingFieldException,
    PredictionException,
    TextProcessingException,
    format_error_response,
    validate_prediction_input,
    validate_text_input,
    safe_cast_value
)

from .model_utils import (
    ModelManager,
    TextProcessor,
    PredictionProcessor
)

__all__ = [
    'FakeJobDetectionException',
    'ModelNotLoadedException',
    'ValidationException',
    'MissingFieldException',
    'PredictionException',
    'TextProcessingException',
    'format_error_response',
    'validate_prediction_input',
    'validate_text_input',
    'safe_cast_value',
    'ModelManager',
    'TextProcessor',
    'PredictionProcessor'
]
