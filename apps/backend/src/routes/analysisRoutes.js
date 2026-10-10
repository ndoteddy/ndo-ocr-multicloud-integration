const express = require('express');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

router.use(apiKeyAuth);
router.get('/image', analysisController.getImageAnalysis);
router.post('/image', analysisController.submitImageForAnalysis);

module.exports = router;
