const mongoose = require("mongoose");

const JobPredictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jobTitle: {
      type: String,
      required: true
    },
    jobDescription: {
      type: String,
      required: true
    },
    company: {
      type: String,
      default: "Unknown"
    },
    inputMethod: {
      type: String,
      enum: ["text", "image"],
      required: true
    },
    // Store raw job details (all user input fields)
    rawDetails: {
      type: String,
      default: null,
      maxlength: 5000
    },
    // Store original image data if uploaded
    imageData: {
      type: String,
      default: null // Base64 or image URL
    },
    prediction: {
      isFake: Boolean,
      confidence: Number, // 0-100
      realPercentage: Number, // 0-100
      fakePercentage: Number, // 0-100
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low"
      }
    },
    imageUrl: {
      type: String,
      default: null
    },
    flags: {
      type: [String],
      default: [] // Red flags detected
    },
    userFlagged: {
      type: Boolean,
      default: false
    },
    flaggedReason: {
      type: String,
      default: null,
      maxlength: 500
    },
    flaggedAt: {
      type: Date,
      default: null
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    adminStatus: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending"
    },
    adminNotes: {
      type: String,
      default: null,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobPrediction", JobPredictionSchema);
