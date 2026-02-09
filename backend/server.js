require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Database Connection
const pool = require("./config/db");
const redisClient = require("./config/redis");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const videoRoutes = require("./routes/videoRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const adRoutes = require("./routes/adRoutes");
const studioRoutes = require("./routes/studioRoutes");
const folderRoutes = require("./routes/folderRoutes");

// Routes
app.use("/api/video", videoRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/studio", studioRoutes);
app.use("/api/folders", folderRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, pool, redisClient };
