const router = require('express').Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verifyPayment);

module.exports = router;
