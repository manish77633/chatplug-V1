const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check daily message limit
exports.checkMessageLimit = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return next();

    const token = auth.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return next();
    }

    if (!decoded?.id) return next();

    const user = await User.findById(decoded.id).select('usage limits');
    if (!user) return next();

    // Ensure usage.today exists
    const today = new Date();
    const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const usageDate = user.usage?.today?.date ? new Date(user.usage.today.date) : null;
    const usageDateKey = usageDate ? new Date(usageDate.getFullYear(), usageDate.getMonth(), usageDate.getDate()).toISOString() : null;

    if (usageDateKey !== todayKey) {
      // reset today's counter
      await User.findByIdAndUpdate(user._id, {
        $set: { 'usage.today.date': today, 'usage.today.messages': 0 }
      });
      user.usage.today = { messages: 0, date: today };
    }

    const maxPerDay = user.limits?.maxMessagesPerDay ?? 20;
    const used = user.usage?.today?.messages || 0;
    if (used >= maxPerDay) {
      return res.status(429).json({ success: false, message: 'Daily message limit reached. Upgrade to Pro.' });
    }

    // attach user to req for further handlers
    req.user = req.user || user;
    return next();
  } catch (err) {
    console.error('[checkMessageLimit]', err);
    return next(err);
  }
};
