#!/usr/bin/env python
"""
Test script to verify image OCR integration is working correctly
Run this before using the image classification endpoints
"""

import sys
from pathlib import Path

def test_imports():
    """Test if all required libraries are installed"""
    print("\n" + "="*70)
    print("1. TESTING LIBRARY IMPORTS")
    print("="*70)
    
    libraries = {
        'cv2': 'OpenCV',
        'pytesseract': 'Pytesseract',
        'numpy': 'NumPy',
        'PIL': 'Pillow',
        'flask': 'Flask',
        'joblib': 'Joblib'
    }
    
    all_ok = True
    for lib, name in libraries.items():
        try:
            __import__(lib)
            print(f"  ✓ {name:20} imported successfully")
        except ImportError as e:
            print(f"  ✗ {name:20} FAILED: {e}")
            all_ok = False
    
    return all_ok

def test_tesseract():
    """Test if Tesseract OCR engine is installed"""
    print("\n" + "="*70)
    print("2. TESTING TESSERACT OCR ENGINE")
    print("="*70)
    
    try:
        import pytesseract
        # Try to get Tesseract version
        version = pytesseract.get_tesseract_version()
        print(f"  ✓ Tesseract found")
        print(f"    Version: {version}")
        return True
    except Exception as e:
        print(f"  ✗ Tesseract NOT found: {e}")
        print(f"\n    Installation Instructions:")
        print(f"    Windows: Download from https://github.com/UB-Mannheim/tesseract/releases")
        print(f"    macOS:   brew install tesseract")
        print(f"    Linux:   sudo apt-get install tesseract-ocr")
        return False

def test_ocr_module():
    """Test if OCR extractor module works"""
    print("\n" + "="*70)
    print("3. TESTING OCR EXTRACTOR MODULE")
    print("="*70)
    
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from Backend.Utils.ocr_extractor import ImageOCRExtractor
        from Backend.Utils.error_handler import TextProcessingException
        print(f"  ✓ ImageOCRExtractor imported successfully")
        print(f"    Available methods:")
        print(f"      - extract_text_from_image()")
        print(f"      - extract_text_from_multiple_images()")
        print(f"      - extract_and_combine_text()")
        print(f"      - preprocess_image()")
        print(f"      - get_image_info()")
        return True
    except Exception as e:
        print(f"  ✗ OCR module import FAILED: {e}")
        return False

def test_models():
    """Test if model files are available"""
    print("\n" + "="*70)
    print("4. TESTING MODEL FILES")
    print("="*70)
    
    base_dir = Path(__file__).parent
    model_path = base_dir / "Model" / "logistic_regression_model.pkl"
    vec_path = base_dir / "Model" / "tfidf_vectorizer.pkl"
    
    model_ok = model_path.exists()
    vec_ok = vec_path.exists()
    
    if model_ok:
        print(f"  ✓ Model file found: {model_path}")
    else:
        print(f"  ✗ Model file NOT found: {model_path}")
    
    if vec_ok:
        print(f"  ✓ Vectorizer file found: {vec_path}")
    else:
        print(f"  ✗ Vectorizer file NOT found: {vec_path}")
    
    return model_ok and vec_ok

def test_api_endpoint():
    """Test if Flask app can run"""
    print("\n" + "="*70)
    print("5. TESTING FLASK APP")
    print("="*70)
    
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from app import app, READY
        
        if READY:
            print(f"  ✓ Flask app initialized successfully")
            print(f"  ✓ Model is READY for predictions")
            
            # Check new endpoints
            with app.app_context():
                with app.test_client() as client:
                    # Test health endpoint
                    response = client.get('/health')
                    if response.status_code == 200:
                        print(f"  ✓ /health endpoint working")
                    
                    # Check if new endpoints exist
                    print(f"\n  Available endpoints:")
                    for rule in app.url_map.iter_rules():
                        if rule.endpoint != 'static':
                            print(f"    - {rule.rule} [{','.join(rule.methods - {'HEAD', 'OPTIONS'})}]")
            return True
        else:
            print(f"  ✗ Model NOT ready - check your model files")
            return False
    except Exception as e:
        print(f"  ✗ Flask app error: {e}")
        return False

def test_sample_ocr():
    """Test OCR with sample image if available"""
    print("\n" + "="*70)
    print("6. TESTING SAMPLE OCR (if image available)")
    print("="*70)
    
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from Backend.Utils.ocr_extractor import ImageOCRExtractor
        
        # Look for test image
        test_images = list(Path(__file__).parent.glob("**/*.jpg")) + \
                     list(Path(__file__).parent.glob("**/*.png"))
        
        if test_images:
            test_image = test_images[0]
            print(f"  Found test image: {test_image.name}")
            
            # Try to get image info
            info = ImageOCRExtractor.get_image_info(str(test_image))
            print(f"    Image size: {info['width']}x{info['height']}")
            print(f"  ✓ Image processing works")
            
            # Try OCR extraction
            text = ImageOCRExtractor.extract_text_from_image(str(test_image))
            if text:
                print(f"  ✓ OCR extraction successful ({len(text)} characters)")
                print(f"    Preview: {text[:100]}...")
            else:
                print(f"  ⚠ OCR returned empty text (image may not contain readable text)")
            return True
        else:
            print(f"  ℹ No test images found (skipping)")
            return True
    except Exception as e:
        print(f"  ✗ OCR test error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "IMAGE OCR INTEGRATION TEST SUITE" + " "*21 + "║")
    print("╚" + "="*68 + "╝")
    
    results = {
        "Library Imports": test_imports(),
        "Tesseract OCR": test_tesseract(),
        "OCR Module": test_ocr_module(),
        "Model Files": test_models(),
        "Flask App": test_api_endpoint(),
        "Sample OCR": test_sample_ocr()
    }
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {test_name:25} {status}")
    
    print("\n" + "-"*70)
    print(f"Overall: {passed}/{total} tests passed")
    print("="*70)
    
    if passed == total:
        print("\n✓ All tests passed! Your setup is ready for image OCR classification.")
        print("\nNext steps:")
        print("  1. Run: python app.py")
        print("  2. Test endpoints:")
        print("     - POST /extract-text-from-image")
        print("     - POST /predict-image")
        print("  3. Use Model/image_ocr_classification.ipynb for batch processing")
        return 0
    else:
        print("\n✗ Some tests failed. Please fix the issues above.")
        print("\nDocumentation:")
        print("  - IMAGE_OCR_GUIDE.md - Full setup guide")
        print("  - QUICKSTART_IMAGE_OCR.md - Quick reference")
        print("  - OCR_REQUIREMENTS.txt - Dependencies")
        return 1

if __name__ == "__main__":
    sys.exit(main())
