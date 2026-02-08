const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', studioController.login);
router.post('/logout', studioController.logout);

// Protected routes
router.use(verifyAdmin);
router.get('/videos', studioController.getVideos);
router.delete('/video/:id', studioController.deleteVideo);

module.exports = router;
