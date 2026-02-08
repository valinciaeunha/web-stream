const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// All studio routes are protected by admin key
router.use(verifyAdmin);

router.get('/videos', studioController.getVideos);
router.delete('/video/:id', studioController.deleteVideo);

module.exports = router;
