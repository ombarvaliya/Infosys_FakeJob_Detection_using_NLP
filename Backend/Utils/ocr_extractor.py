"""
OCR (Optical Character Recognition) utilities for extracting text from job form images
Uses OpenCV for image processing and Tesseract for text extraction
"""

import cv2
import numpy as np
import pytesseract
from pathlib import Path
from typing import Optional, Tuple, List
from .error_handler import TextProcessingException


class ImageOCRExtractor:
    """Extract text from job form images using OpenCV and Tesseract OCR"""
    
    # Image preprocessing configurations
    SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    
    @staticmethod
    def validate_image_path(image_path: str) -> Path:
        """Validate that image file exists and is supported format"""
        path = Path(image_path)
        
        if not path.exists():
            raise TextProcessingException(f"Image file not found: {image_path}")
        
        if path.suffix.lower() not in ImageOCRExtractor.SUPPORTED_FORMATS:
            raise TextProcessingException(
                f"Unsupported image format: {path.suffix}. "
                f"Supported: {ImageOCRExtractor.SUPPORTED_FORMATS}"
            )
        
        return path
    
    @staticmethod
    def preprocess_image(image: np.ndarray) -> np.ndarray:
        """
        Preprocess image for better OCR results
        - Convert to grayscale
        - Apply thresholding
        - Denoise
        """
        try:
            # Convert to grayscale if color image
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            
            # Apply bilateral filter to reduce noise while keeping edges
            denoised = cv2.bilateralFilter(enhanced, 11, 17, 17)
            
            # Apply thresholding for better text detection
            _, binary = cv2.threshold(denoised, 150, 255, cv2.THRESH_BINARY)
            
            return binary
        except Exception as e:
            raise TextProcessingException(f"Image preprocessing failed: {str(e)}")
    
    @staticmethod
    def extract_text_from_image(image_path: str, preprocess: bool = True) -> str:
        """
        Extract text from image using Tesseract OCR
        
        Args:
            image_path: Path to the image file
            preprocess: Whether to apply image preprocessing
            
        Returns:
            Extracted text from the image
        """
        try:
            # Validate image path
            image_path = ImageOCRExtractor.validate_image_path(image_path)
            
            # Read image
            image = cv2.imread(str(image_path))
            if image is None:
                raise TextProcessingException(f"Failed to read image: {image_path}")
            
            # Preprocess if requested
            if preprocess:
                image = ImageOCRExtractor.preprocess_image(image)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(image)
            
            return text.strip()
        
        except TextProcessingException:
            raise
        except Exception as e:
            raise TextProcessingException(f"OCR extraction failed: {str(e)}")
    
    @staticmethod
    def extract_text_from_multiple_images(image_paths: List[str], 
                                         preprocess: bool = True) -> dict:
        """
        Extract text from multiple images
        
        Args:
            image_paths: List of image file paths
            preprocess: Whether to apply image preprocessing
            
        Returns:
            Dictionary mapping image paths to extracted text
        """
        results = {}
        errors = {}
        
        for image_path in image_paths:
            try:
                text = ImageOCRExtractor.extract_text_from_image(
                    image_path, 
                    preprocess=preprocess
                )
                results[image_path] = text
            except TextProcessingException as e:
                errors[image_path] = str(e.message)
        
        return {
            "successful": results,
            "failed": errors
        }
    
    @staticmethod
    def extract_and_combine_text(image_paths: List[str], 
                                preprocess: bool = True) -> str:
        """
        Extract text from multiple images and combine into single text
        
        Args:
            image_paths: List of image file paths
            preprocess: Whether to apply image preprocessing
            
        Returns:
            Combined text from all images
        """
        extracted_texts = []
        
        for image_path in image_paths:
            try:
                text = ImageOCRExtractor.extract_text_from_image(
                    image_path, 
                    preprocess=preprocess
                )
                if text:
                    extracted_texts.append(text)
            except TextProcessingException as e:
                # Log error but continue with other images
                print(f"Warning: Failed to extract text from {image_path}: {e.message}")
                continue
        
        return " ".join(extracted_texts)
    
    @staticmethod
    def get_image_info(image_path: str) -> dict:
        """Get metadata about an image"""
        try:
            image_path = ImageOCRExtractor.validate_image_path(image_path)
            image = cv2.imread(str(image_path))
            
            if image is None:
                raise TextProcessingException(f"Failed to read image: {image_path}")
            
            height, width = image.shape[:2]
            
            return {
                "path": str(image_path),
                "width": int(width),
                "height": int(height),
                "size_pixels": int(width * height),
                "channels": image.shape[2] if len(image.shape) == 3 else 1
            }
        except Exception as e:
            raise TextProcessingException(f"Failed to get image info: {str(e)}")
