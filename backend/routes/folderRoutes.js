const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

// =============================================
// PUBLIC ROUTES (no authentication required)
// These are used for folder sharing functionality
// =============================================

// Get folder info (public - for share pages)
router.get("/public/:id", folderController.getFolder);

// Get folder contents (public - for share pages)
router.get("/public/:id/contents", folderController.getFolderContents);

// =============================================
// PROTECTED ROUTES (admin authentication required)
// =============================================
router.use(verifyAdmin);

// Create a new folder
router.post("/", folderController.createFolder);

// Get all folders (optionally filtered by parent_id query param)
router.get("/", folderController.getFolders);

// Get folder contents (subfolders + videos) - use 'root' for root level
router.get("/:id/contents", folderController.getFolderContents);

// Get single folder by ID
router.get("/:id", folderController.getFolder);

// Update folder (rename)
router.put("/:id", folderController.updateFolder);

// Delete folder
router.delete("/:id", folderController.deleteFolder);

// Move folder to another folder
router.post("/:id/move", folderController.moveFolder);

// Move video to folder
router.post("/video/move", folderController.moveVideoToFolder);

module.exports = router;
