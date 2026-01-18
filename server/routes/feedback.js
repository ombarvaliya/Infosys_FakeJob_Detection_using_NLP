const express = require("express");
const Feedback = require("../models/Feedback");
const JobPrediction = require("../models/JobPrediction");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

// Submit feedback
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { type, subject, message, predictionId } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Subject and message are required" 
      });
    }

    // Validate predictionId if provided
    if (predictionId) {
      const prediction = await JobPrediction.findById(predictionId);
      if (!prediction) {
        return res.status(404).json({ 
          success: false, 
          message: "Prediction not found" 
        });
      }
      // Verify user owns the prediction
      if (prediction.userId.toString() !== req.userId) {
        return res.status(403).json({ 
          success: false, 
          message: "Unauthorized" 
        });
      }
    }

    const feedback = new Feedback({
      userId: req.userId,
      type: type || "general",
      subject,
      message,
      predictionId: predictionId || null
    });

    await feedback.save();

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: {
        id: feedback._id,
        type: feedback.type,
        subject: feedback.subject,
        status: feedback.status
      }
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's feedback history
router.get("/my-feedback", authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("predictionId", "jobTitle company");

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Flag a prediction as incorrect
router.post("/flag-prediction/:id", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const predictionId = req.params.id;

    const prediction = await JobPrediction.findById(predictionId);
    
    if (!prediction) {
      return res.status(404).json({ 
        success: false, 
        message: "Prediction not found" 
      });
    }

    // Verify user owns the prediction
    if (prediction.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Check if already flagged
    if (prediction.userFlagged) {
      return res.status(400).json({ 
        success: false, 
        message: "This prediction has already been flagged" 
      });
    }

    // Update prediction
    prediction.userFlagged = true;
    prediction.flaggedReason = reason || "User reported incorrect prediction";
    prediction.flaggedAt = new Date();
    prediction.flaggedBy = req.userId;
    prediction.adminStatus = "pending";

    await prediction.save();

    res.json({
      success: true,
      message: "Prediction flagged successfully. Our team will review it.",
      prediction: {
        id: prediction._id,
        flagged: true,
        status: prediction.adminStatus
      }
    });
  } catch (error) {
    console.error("Flag prediction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unflag a prediction
router.post("/unflag-prediction/:id", authMiddleware, async (req, res) => {
  try {
    const predictionId = req.params.id;

    const prediction = await JobPrediction.findById(predictionId);
    
    if (!prediction) {
      return res.status(404).json({ 
        success: false, 
        message: "Prediction not found" 
      });
    }

    // Verify user owns the prediction
    if (prediction.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Check if flagged
    if (!prediction.userFlagged) {
      return res.status(400).json({ 
        success: false, 
        message: "This prediction is not flagged" 
      });
    }

    // Only allow unflagging if status is pending
    if (prediction.adminStatus !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot unflag. This prediction is already under review." 
      });
    }

    // Reset flag
    prediction.userFlagged = false;
    prediction.flaggedReason = null;
    prediction.flaggedAt = null;
    prediction.flaggedBy = null;
    prediction.adminStatus = null;

    await prediction.save();

    res.json({
      success: true,
      message: "Flag removed successfully",
      prediction: {
        id: prediction._id,
        flagged: false
      }
    });
  } catch (error) {
    console.error("Unflag prediction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

