const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (plan !== 'pro') return res.status(400).json({ success: false, message: 'Invalid plan' });

    const options = {
      amount: 49900, // in paise (₹499)
      currency: 'INR',
      // Razorpay requires receipt length <= 40. Use a short random receipt id.
      receipt: `rcpt_${crypto.randomBytes(8).toString('hex')}`,
    };

    const order = await razor.orders.create(options);
    return res.json({ success: true, id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('[createOrder]', err);
    return next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Upgrade user to Pro
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.plan = { type: 'pro', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
    if (typeof user.applyPlanLimits === 'function') user.applyPlanLimits();
    await user.save();

    const out = user.toObject ? user.toObject() : user;
    if (out.password) delete out.password;

    return res.json({ success: true, user: out });
  } catch (err) {
    console.error('[verifyPayment]', err);
    return next(err);
  }
};

module.exports = exports;
