const express = require("express");
const axios = require("axios");
const JobPrediction = require("../models/JobPrediction");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

// Check if Flask API is available
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(
      process.env.PYTHON_API_URL + "/health",
      { timeout: 5000 }
    );
    res.json({ 
      success: true, 
      message: "Flask API is running",
      flaskStatus: response.data.status 
    });
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: "Flask API is not available",
      error: error.message 
    });
  }
});

// Make prediction
router.post("/predict", authMiddleware, async (req, res) => {
  try {
    const { jobDescription, jobTitle, company, inputMethod } = req.body;

    if (!jobDescription || !jobTitle) {
      return res.status(400).json({ success: false, message: "Job description and title required" });
    }

    // Call Python Flask API for prediction
    try {
      const flaskUrl = process.env.PYTHON_API_URL + "/predict-text";
      console.log(`📤 Sending prediction request to: ${flaskUrl}`);
      
      const flaskResponse = await axios.post(
        flaskUrl,
        { text: jobDescription },
        { timeout: 30000 }
      );

      const { prediction, probability } = flaskResponse.data;
      const confidence = Math.round(probability * 100);
      const isFake = prediction === 1;
      const realPercentage = isFake ? 100 - confidence : confidence;
      const fakePercentage = isFake ? confidence : 100 - confidence;

      // Determine risk level
      let riskLevel = "low";
      if (isFake && confidence > 70) riskLevel = "high";
      else if (isFake && confidence > 50) riskLevel = "medium";

      // Save prediction to database
      const jobPrediction = new JobPrediction({
        userId: req.userId,
        jobTitle,
        jobDescription,
        company: company || "Unknown",
        inputMethod: inputMethod || "text",
        rawDetails: jobDescription, // Store the raw job details
        prediction: {
          isFake,
          confidence,
          realPercentage,
          fakePercentage,
          riskLevel
        }
      });

      await jobPrediction.save();

      res.json({
        success: true,
        prediction: {
          isFake,
          confidence,
          realPercentage,
          fakePercentage,
          riskLevel,
          message: isFake ? "⚠️ This job posting appears to be FAKE" : "✓ This job posting appears LEGITIMATE"
        },
        predictionId: jobPrediction._id
      });
    } catch (flaskError) {
      // No fallback - API must be running for predictions
      const errorDetails = {
        message: flaskError.message,
        code: flaskError.code,
        response: flaskError.response?.data,
        status: flaskError.response?.status,
        url: flaskError.config?.url,
        errno: flaskError.errno
      };
      
      console.error("🔴 Flask API Error Details:", errorDetails);
      
      // Determine specific error message
      let userMessage = "🔴 Prediction service is currently unavailable. The analysis engine is not running. Please try again later or contact support.";
      
      if (flaskError.code === 'ECONNREFUSED') {
        userMessage = "🔴 Cannot connect to prediction engine. Please ensure the Flask server is running on port 5000.";
      } else if (flaskError.code === 'ETIMEDOUT' || flaskError.code === 'ENOTFOUND') {
        userMessage = "🔴 Prediction service is not responding. Please check if Flask server is running.";
      }
      
      return res.status(503).json({ 
        success: false, 
        message: userMessage,
        error: "API_UNAVAILABLE",
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Predict from image
router.post("/predict-image", authMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const image = req.files.image;
    const imageBuffer = image.data;
    const imageName = image.name;

    // Send to Python Flask API using axios-friendly FormData
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append("image", imageBuffer, imageName);

    try {
      const flaskResponse = await axios.post(
        process.env.PYTHON_API_URL + "/predict-image",
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000
        }
      );

      const { job_status, confidence } = flaskResponse.data;
      const isFake = job_status === "FAKE";
      const confidencePercent = Math.round((confidence || 0.5) * 100);
      const realPercentage = isFake ? 100 - confidencePercent : confidencePercent;
      const fakePercentage = isFake ? confidencePercent : 100 - confidencePercent;

      let riskLevel = "low";
      if (isFake && confidencePercent > 70) riskLevel = "high";
      else if (isFake && confidencePercent > 50) riskLevel = "medium";

      // Save prediction
      const jobPrediction = new JobPrediction({
        userId: req.userId,
        jobTitle: "Image Analysis",
        jobDescription: flaskResponse.data.extracted_text || "Image analysis result",
        company: "N/A",
        inputMethod: "image",
        rawDetails: flaskResponse.data.extracted_text || "Image analysis result", // Store extracted text
        imageData: `data:${image.mimetype || 'image/jpeg'};base64,${imageBuffer.toString('base64')}`, // Store image as base64
        prediction: {
          isFake,
          confidence: confidencePercent,
          realPercentage,
          fakePercentage,
          riskLevel
        }
      });

      await jobPrediction.save();

      res.json({
        success: true,
        job_status,
        confidence: confidencePercent / 100,
        prediction: {
          isFake,
          confidence: confidencePercent,
          realPercentage,
          fakePercentage,
          riskLevel,
          message: isFake ? "This job posting appears to be fraudulent" : "This job posting appears to be legitimate"
        }
      });
    } catch (flaskError) {
      console.error("Flask API Error for image:", {
        message: flaskError.message,
        code: flaskError.code,
        response: flaskError.response?.data,
        status: flaskError.response?.status,
        url: flaskError.config?.url
      });
      return res.status(503).json({ 
        success: false, 
        message: "🔴 Image analysis service is currently unavailable. The analysis engine is not running. Please try again later or contact support.",
        error: "API_UNAVAILABLE",
        details: process.env.NODE_ENV === 'development' ? flaskError.message : undefined
      });
    }
  } catch (error) {
    console.error("Image prediction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's prediction history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const predictions = await JobPrediction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear user's prediction history
router.delete("/history", authMiddleware, async (req, res) => {
  try {
    const result = await JobPrediction.deleteMany({ userId: req.userId });

    res.json({
      success: true,
      message: "History cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get prediction details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const prediction = await JobPrediction.findById(req.params.id);
    
    if (!prediction) {
      return res.status(404).json({ success: false, message: "Prediction not found" });
    }

    if (prediction.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
