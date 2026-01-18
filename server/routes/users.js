const express = require("express");
const User = require("../models/User");
const JobPrediction = require("../models/JobPrediction");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    const predictionCount = await JobPrediction.countDocuments({ userId: req.userId });
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        predictionCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, email },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const predictions = await JobPrediction.find({ userId: req.userId });
    const fakeCount = predictions.filter(p => p.prediction.isFake).length;
    const realCount = predictions.filter(p => !p.prediction.isFake).length;

    res.json({
      success: true,
      stats: {
        totalPredictions: predictions.length,
        fakeDetected: fakeCount,
        realDetected: realCount,
        highRiskCount: predictions.filter(p => p.prediction.riskLevel === "high").length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
