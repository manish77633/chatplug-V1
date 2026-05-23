const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    if (plan !== 'pro') {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const options = {
      amount: 4900, // ₹49
      currency: 'INR',
      receipt: `order_${Date.now()}_${req.user._id}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, ...order });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ success: false, message: 'Could not create order' });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment valid, update user plan
      req.user.plan = {
        type: 'pro',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
      };
      req.user.applyPlanLimits();
      await req.user.save();

      res.json({ success: true, message: 'Payment successful', plan: 'pro' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
