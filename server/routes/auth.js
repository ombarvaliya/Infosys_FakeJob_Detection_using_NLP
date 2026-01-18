const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const VerificationCode = require("../models/VerificationCode");
const PasswordReset = require("../models/PasswordReset");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/emailService");
const router = express.Router();

// Generate random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register Step 1: Send verification code
router.post("/register-request", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || fullName.trim() === "") {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }
    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Save verification request
    let verificationRecord = await VerificationCode.findOne({ email: email.toLowerCase() });
    if (verificationRecord) {
      verificationRecord.code = code;
      verificationRecord.fullName = fullName.trim();
      verificationRecord.password = password;
      verificationRecord.attempts = 0;
      verificationRecord.createdAt = new Date();
      await verificationRecord.save();
    } else {
      verificationRecord = new VerificationCode({
        email: email.toLowerCase().trim(),
        code,
        fullName: fullName.trim(),
        password
      });
      await verificationRecord.save();
    }

    // Send verification email via Resend
    console.log('\n📧 SENDING VERIFICATION EMAIL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const emailResult = await sendVerificationEmail(email.toLowerCase(), code);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(200).json({
      success: emailResult.success,
      message: emailResult.message,
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error("Registration request error:", error);
    res.status(500).json({ success: false, message: error.message || "Registration request failed" });
  }
});

// Register Step 2: Verify code and complete registration
router.post("/register", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and verification code required" });
    }

    // Find verification record
    const verificationRecord = await VerificationCode.findOne({ email: email.toLowerCase() });
    if (!verificationRecord) {
      return res.status(400).json({ success: false, message: "Verification request expired or not found" });
    }

    // Increment attempts
    verificationRecord.attempts += 1;
    if (verificationRecord.attempts > 5) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({ success: false, message: "Too many attempts. Please request a new verification code." });
    }

    // Check code
    if (verificationRecord.code !== code.toString()) {
      await verificationRecord.save();
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // Create user
    const user = new User({
      fullName: verificationRecord.fullName,
      email: verificationRecord.email,
      password: verificationRecord.password
    });
    await user.save();

    // Delete verification record
    await VerificationCode.deleteOne({ _id: verificationRecord._id });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: error.message || "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Update last login using updateOne instead of save to avoid full validation
    await User.updateOne(
      { _id: user._id },
      { lastLogin: new Date() }
    );

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Forgot Password: Request reset code
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email is not registered" });
    }

    // Generate reset code
    const code = generateVerificationCode();

    // Save or update reset request
    let resetRecord = await PasswordReset.findOne({ email: email.toLowerCase() });
    if (resetRecord) {
      resetRecord.code = code;
      resetRecord.attempts = 0;
      resetRecord.createdAt = new Date();
      await resetRecord.save();
    } else {
      resetRecord = new PasswordReset({
        email: email.toLowerCase().trim(),
        code
      });
      await resetRecord.save();
    }

    // Send password reset email
    console.log('\n📧 SENDING PASSWORD RESET EMAIL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const emailResult = await sendPasswordResetEmail(email.toLowerCase(), code);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(200).json({
      success: emailResult.success,
      message: emailResult.message,
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to send reset code" });
  }
});

// Reset Password: Verify code and set new password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Find reset record
    const resetRecord = await PasswordReset.findOne({ email: email.toLowerCase() });
    if (!resetRecord) {
      return res.status(400).json({ success: false, message: "Reset request expired or not found" });
    }

    // Increment attempts
    resetRecord.attempts += 1;
    if (resetRecord.attempts > 5) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({ success: false, message: "Too many attempts. Please request a new reset code." });
    }

    // Check code
    if (resetRecord.code !== code.toString()) {
      await resetRecord.save();
      return res.status(400).json({ success: false, message: "Invalid reset code" });
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Delete reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to reset password" });
  }
});

// Test email endpoint (for debugging)
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const testCode = "123456";
    const result = await sendVerificationEmail(email, testCode);
    
    if (result.success) {
      res.json({ success: true, message: "Test email sent successfully" });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
