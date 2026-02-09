const express = require("express");
const router = express.Router();
const studioController = require("../controllers/studioController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

// Public routes
router.post("/login", studioController.login);
router.post("/logout", studioController.logout);

// Protected routes - require admin authentication
router.use(verifyAdmin);

// Video routes
router.get("/videos", studioController.getVideos);
router.get("/videos/all", studioController.getAllVideos);
router.get("/videos/search", studioController.searchVideos);
router.get("/video/:id", studioController.getVideo);
router.put("/video/:id", studioController.updateVideo);
router.delete("/video/:id", studioController.deleteVideo);

// Stats route
router.get("/stats", studioController.getStats);

module.exports = router;
