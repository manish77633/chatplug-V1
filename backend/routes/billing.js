const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { protect } = require('../middleware/auth');

router.get('/usage', protect, billingController.getUsage);
router.get('/plans', protect, billingController.getPlans);

module.exports = router;
