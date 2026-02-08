
const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const auth = require('../middlewares/authMiddleware');

router.post('/event', adController.trackEvent);

module.exports = router;
