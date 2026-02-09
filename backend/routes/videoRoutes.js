const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

// =============================================
// PUBLIC ROUTES (no authentication required)
// =============================================

// Get video info (thumbnail, name, duration) - for embed preview
router.get("/:id/info", videoController.getVideoInfo);

// Get video manifest (requires valid session with completed ad)
router.get("/:id/manifest", videoController.getManifest);

// =============================================
// PROTECTED ROUTES (admin authentication required)
// =============================================

// Get presigned URL for upload
router.post("/upload", verifyAdmin, videoController.uploadVideo);

// Notify backend that upload is complete (triggers transcoding)
router.post("/complete", verifyAdmin, videoController.completeUpload);

module.exports = router;
