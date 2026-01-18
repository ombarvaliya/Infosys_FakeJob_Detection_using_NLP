from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import joblib
import re
from werkzeug.utils import secure_filename
import os
from Backend.Utils.ocr_extractor import ImageOCRExtractor
from Backend.Utils.error_handler import TextProcessingException

app = Flask(__name__)
CORS(app)

# Configure file upload
UPLOAD_FOLDER = Path(__file__).resolve().parent / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}

# Load model & vectorizer
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "Model" / "logistic_regression_model.pkl"
VEC_PATH = BASE_DIR / "Model" / "tfidf_vectorizer.pkl"

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
    READY = True
    print("✓ Model & Vectorizer Loaded Successfully")
except Exception as e:
    READY = False
    print(f"✗ Failed to Load Model or Vectorizer: {e}")


def clean_text(text):
    """Clean and preprocess text"""
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+|[^\w\s]", " ", text)
    return " ".join(text.split())


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "ready" if READY else "error",
        "message": "Fake Job Detection API"
    }), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy" if READY else "down"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    """Predict fake/real using full structured input"""
    if not READY:
        return jsonify({"status": "error", "message": "Model not loaded"}), 503

    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No JSON data provided"}), 400

    required_fields = [
        "title", "description", "requirements", "company_profile",
        "employment_type", "industry", "benefits", "salary_range"
    ]

    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"status": "error", "missing_fields": missing}), 400

    try:
        combined_text = " ".join([str(data.get(field, "")) for field in required_fields])
        cleaned = clean_text(combined_text)

        X = vectorizer.transform([cleaned])
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]
        
        # Get confidence for the predicted class
        confidence = float(probability[int(prediction)])

        return jsonify({
            "prediction": int(prediction),
            "probability": confidence,
            "job_status": "FAKE" if prediction == 1 else "REAL"
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/predict-text", methods=["POST"])
def predict_text():
    """Predict from plain text or combined job fields"""
    if not READY:
        return jsonify({"status": "error", "message": "Model not loaded"}), 503

    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    try:
        # Accept either 'text' field or combine all provided fields
        if "text" in data:
            text = data["text"]
        else:
            # Combine all string fields
            text = " ".join([str(v) for v in data.values() if isinstance(v, str)])
        
        if not text or not text.strip():
            return jsonify({"status": "error", "message": "No text to process"}), 400
        
        cleaned = clean_text(text)
        X = vectorizer.transform([cleaned])
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]
        
        # Get confidence for the predicted class
        confidence = float(probability[int(prediction)])

        return jsonify({
            "prediction": int(prediction),
            "probability": confidence,
            "job_status": "FAKE" if prediction == 1 else "REAL"
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/predict-image", methods=["POST"])
def predict_image():
    """
    Extract text from job form image(s) and predict fake/real
    
    Accepts:
    - Single file: 'image' field with image file
    - Multiple files: 'images' field with multiple image files
    """
    if not READY:
        return jsonify({"status": "error", "message": "Model not loaded"}), 503
    
    try:
        # Handle single or multiple image uploads
        uploaded_files = []
        
        if 'image' in request.files:
            uploaded_files = [request.files['image']]
        elif 'images' in request.files:
            uploaded_files = request.files.getlist('images')
        else:
            return jsonify({
                "status": "error", 
                "message": "No image(s) provided. Use 'image' or 'images' field"
            }), 400
        
        if not uploaded_files:
            return jsonify({"status": "error", "message": "No files selected"}), 400
        
        # Save uploaded files and extract text
        extracted_texts = []
        saved_paths = []
        errors = []
        
        for file in uploaded_files:
            if file.filename == '':
                errors.append("Empty filename")
                continue
            
            # Validate file extension
            if not ('.' in file.filename and 
                    file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS):
                errors.append(f"Invalid file type: {file.filename}")
                continue
            
            try:
                # Save file temporarily
                filename = secure_filename(file.filename)
                file_path = Path(app.config['UPLOAD_FOLDER']) / filename
                file.save(str(file_path))
                saved_paths.append(str(file_path))
                
                # Extract text using OCR
                text = ImageOCRExtractor.extract_text_from_image(str(file_path))
                if text:
                    extracted_texts.append(text)
                else:
                    errors.append(f"No text found in {file.filename}")
            
            except TextProcessingException as e:
                errors.append(f"{file.filename}: {e.message}")
            except Exception as e:
                errors.append(f"{file.filename}: {str(e)}")
        
        # Combine extracted text
        if not extracted_texts:
            return jsonify({
                "status": "error",
                "message": "Failed to extract text from image(s)",
                "errors": errors
            }), 400
        
        combined_text = " ".join(extracted_texts)
        cleaned = clean_text(combined_text)
        
        # Make prediction
        X = vectorizer.transform([cleaned])
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]
        
        # Get confidence for the predicted class
        confidence = float(probability[int(prediction)])
        
        response = {
            "prediction": int(prediction),
            "probability": confidence,
            "job_status": "FAKE" if prediction == 1 else "REAL",
            "confidence": confidence,
            "extracted_text": combined_text[:500] + "..." if len(combined_text) > 500 else combined_text,
            "images_processed": len(saved_paths)
        }
        
        if errors:
            response["warnings"] = errors
        
        # Clean up temporary files
        for path in saved_paths:
            try:
                Path(path).unlink()
            except:
                pass
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/extract-text-from-image", methods=["POST"])
def extract_text_from_image():
    """
    Extract text from job form image without classification
    
    Useful for:
    - Previewing extracted text before classification
    - Combining with other data fields
    """
    if 'image' not in request.files:
        return jsonify({
            "status": "error", 
            "message": "No image provided. Use 'image' field"
        }), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400
    
    # Validate file extension
    if not ('.' in file.filename and 
            file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS):
        return jsonify({
            "status": "error",
            "message": f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}"
        }), 400
    
    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        file_path = Path(app.config['UPLOAD_FOLDER']) / filename
        file.save(str(file_path))
        
        # Extract text
        text = ImageOCRExtractor.extract_text_from_image(str(file_path))
        
        # Get image info
        image_info = ImageOCRExtractor.get_image_info(str(file_path))
        
        # Clean up
        file_path.unlink()
        
        return jsonify({
            "status": "success",
            "extracted_text": text,
            "text_length": len(text),
            "image_info": image_info
        }), 200
    
    except TextProcessingException as e:
        return jsonify({
            "status": "error",
            "message": e.message
        }), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"status": "error", "message": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"status": "error", "message": "Server error"}), 500


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Fake Job Detection API")
    print("=" * 60)
    print(f"Model Status: {'✓ Loaded' if READY else '✗ Failed'}")
    print("Running on: http://localhost:5000")
    print("\nEndpoints:")
    print("  GET  /health")
    print("  POST /predict (structured job fields)")
    print("  POST /predict-text (plain text)")
    print("  POST /predict-image (image OCR + classification)")
    print("  POST /extract-text-from-image (OCR only)")
    print("=" * 60 + "\n")

    app.run(debug=False, host="127.0.0.1", port=5000)
