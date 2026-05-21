const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

exports.checkPlanLimit = (resource) => async (req, res, next) => {
  const user = req.user;
  const limits = {
    chatbots:  user.limits?.maxChatbots || 2,
    documents: user.limits?.maxDocuments || 10,
    tokens:    user.limits?.maxTokens || 100000,
  };

  let currentCount = 0;
  if (resource === 'chatbots') {
    const Chatbot = require('../models/Chatbot');
    currentCount = await Chatbot.countDocuments({ owner: user._id });
  } else if (resource === 'documents') {
    const Document = require('../models/Document');
    currentCount = await Document.countDocuments({ owner: user._id });
  } else if (resource === 'tokens') {
    currentCount = user.usage?.currentMonth?.tokens || 0;
  }

  if (currentCount >= limits[resource]) {
    return res.status(403).json({
      success: false,
      message: `Plan limit reached for ${resource} (${currentCount}/${limits[resource]}).`,
    });
  }
  next();
};
