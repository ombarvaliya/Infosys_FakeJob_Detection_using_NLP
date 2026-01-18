const express = require("express");
const User = require("../models/User");
const JobPrediction = require("../models/JobPrediction");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const router = express.Router();

// Admin middleware chain
router.use(authMiddleware, adminMiddleware);

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const predictionCount = await JobPrediction.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          predictionCount
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get users with no activity (never made a prediction)
router.get("/users/no-activity/list", async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    // Filter users who have no predictions
    const usersWithNoActivity = await Promise.all(
      users.map(async (user) => {
        const predictionCount = await JobPrediction.countDocuments({ userId: user._id });
        if (predictionCount === 0) {
          return {
            ...user.toObject(),
            predictionCount,
            daysInactive: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          };
        }
        return null;
      })
    );

    const noActivityUsers = usersWithNoActivity.filter(user => user !== null);

    res.json({
      success: true,
      data: noActivityUsers,
      count: noActivityUsers.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Deactivate user
router.put("/users/:id/deactivate", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "User deactivated",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Activate user
router.put("/users/:id/activate", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "User activated",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Promote user to admin
router.put("/users/:id/promote", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User promoted to admin",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Demote admin to user
router.put("/users/:id/demote", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "user" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Admin demoted to user",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user activity
router.get("/users/:id/activity", async (req, res) => {
  try {
    const predictions = await JobPrediction.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: "admin" });
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalPredictions = await JobPrediction.countDocuments();
    const fakePredictions = await JobPrediction.countDocuments({ "prediction.isFake": true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        adminUsers,
        activeUsers,
        totalPredictions,
        fakePredictions,
        realPredictions: totalPredictions - fakePredictions,
        detectionRate: totalPredictions > 0 ? ((fakePredictions / totalPredictions) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get daily analysis statistics
router.get("/dashboard/daily-stats", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30; // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all predictions in the date range
    const predictions = await JobPrediction.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select("createdAt prediction");

    // Group by date
    const dailyStats = {};
    predictions.forEach(pred => {
      const date = new Date(pred.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, real: 0, fake: 0 };
      }
      dailyStats[date].total++;
      if (pred.prediction.isFake) {
        dailyStats[date].fake++;
      } else {
        dailyStats[date].real++;
      }
    });

    // Convert to array format sorted by date
    const dailyArray = Object.keys(dailyStats)
      .sort()
      .map(date => ({
        date,
        total: dailyStats[date].total,
        real: dailyStats[date].real,
        fake: dailyStats[date].fake
      }));

    res.json({
      success: true,
      data: dailyArray
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent activity across all users (with full details)
router.get("/activity/recent", async (req, res) => {
  try {
    const activity = await JobPrediction.find()
      .populate("userId", "fullName email")
      .populate("flaggedBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all flagged predictions with details
router.get("/flagged-posts", async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userFlagged: true };
    
    if (status) {
      query.adminStatus = status;
    }

    const flaggedPosts = await JobPrediction.find(query)
      .populate("userId", "fullName email")
      .populate("flaggedBy", "fullName email")
      .sort({ flaggedAt: -1 });

    res.json({
      success: true,
      data: flaggedPosts,
      count: flaggedPosts.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific job details by ID
router.get("/job-details/:id", async (req, res) => {
  try {
    const prediction = await JobPrediction.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("flaggedBy", "fullName email");

    if (!prediction) {
      return res.status(404).json({ 
        success: false, 
        message: "Job prediction not found" 
      });
    }

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update flagged post status
router.put("/flagged-posts/:id/status", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    if (!["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    const prediction = await JobPrediction.findById(id);
    
    if (!prediction || !prediction.userFlagged) {
      return res.status(404).json({ 
        success: false, 
        message: "Flagged prediction not found" 
      });
    }

    prediction.adminStatus = status;
    if (notes) {
      prediction.adminNotes = notes;
    }
    if (status !== "pending") {
      prediction.reviewedAt = new Date();
    }

    await prediction.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      prediction: {
        id: prediction._id,
        status: prediction.adminStatus,
        notes: prediction.adminNotes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all feedback
router.get("/feedback", async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const feedback = await Feedback.find(query)
      .populate("userId", "fullName email")
      .populate("predictionId", "jobTitle company")
      .populate("reviewedBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: feedback,
      count: feedback.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update feedback status
router.put("/feedback/:id/status", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    if (!["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: "Feedback not found" 
      });
    }

    feedback.status = status;
    if (notes) {
      feedback.adminNotes = notes;
    }
    feedback.reviewedAt = new Date();
    feedback.reviewedBy = req.userId;

    await feedback.save();

    res.json({
      success: true,
      message: "Feedback status updated successfully",
      feedback: {
        id: feedback._id,
        status: feedback.status,
        notes: feedback.adminNotes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
