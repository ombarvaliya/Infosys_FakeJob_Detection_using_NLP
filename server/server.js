const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const path = require("path");
const axios = require("axios");

// Load environment variables
dotenv.config();

// Log configuration
console.log("🔧 Configuration:");
console.log(`   - Flask API URL: ${process.env.PYTHON_API_URL || 'NOT SET'}`);
console.log(`   - MongoDB URI: ${process.env.MONGODB_URI || 'NOT SET'}`);
console.log(`   - Server Port: ${process.env.PORT || 5001}`);

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true
}));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✓ MongoDB Connected"))
  .catch((err) => {
    console.error("✗ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Check Flask API availability on startup
const checkFlaskAPI = async () => {
  try {
    const response = await axios.get(process.env.PYTHON_API_URL + "/health", {
      timeout: 5000
    });
    console.log("✓ Flask API Connected");
  } catch (error) {
    console.warn(`⚠️ Flask API not available at ${process.env.PYTHON_API_URL}`);
    console.warn(`   Error: ${error.message}`);
  }
};

// Check Flask after server starts
setTimeout(checkFlaskAPI, 2000);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/predictions", require("./routes/predictions"));
app.use("/api/feedback", require("./routes/feedback"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server running", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
