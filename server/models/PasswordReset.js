const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    code: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600 // Auto-delete after 10 minutes
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);

