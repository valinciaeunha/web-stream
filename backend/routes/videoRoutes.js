
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const auth = require('../middlewares/authMiddleware');

// Public Access (with session check)
router.get('/:id/manifest', videoController.getManifest);

// Admin Access
router.post('/upload', videoController.uploadVideo);
router.post('/upload/complete', videoController.completeUpload);

module.exports = router;
