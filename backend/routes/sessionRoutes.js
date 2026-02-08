
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/init', sessionController.initSession);

module.exports = router;
