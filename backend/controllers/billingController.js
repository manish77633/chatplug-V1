const Document = require('../models/Document');

exports.getUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Chatbots count
    let chatbotsCount = 0;
    try {
      const Chatbot = require('../models/Chatbot');
      chatbotsCount = await Chatbot.countDocuments({ owner: userId, isArchived: { $ne: true } });
    } catch (e) {
      console.warn('[getUsage] Chatbot model not available, defaulting chatbotsCount=0');
    }

    const metrics = [
      { label: 'Chatbots', used: chatbotsCount, max: req.user?.limits?.maxChatbots || 0 },
      { label: 'Documents', used: req.user?.usage?.totalDocuments || 0, max: req.user?.limits?.maxDocuments || 0 },
      { label: 'Messages Today', used: req.user?.usage?.today?.messages || 0, max: req.user?.limits?.maxMessagesPerDay || 0 },
      { label: 'Tokens this month', used: req.user?.usage?.currentMonth?.tokens || 0, max: req.user?.limits?.maxTokens || 0 },
    ];

    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return res.json({ success: true, metrics, resetDate: resetDate.toISOString() });
  } catch (err) {
    console.error('[getUsage]', err);
    return next(err);
  }
};

exports.getPlans = async (_req, res, next) => {
  try {
    const plans = [
      {
        name: 'Free', type: 'free', price: process.env.PLAN_FREE_PRICE || '₹0', period: '/mo', popular: false,
        features: ['3 Chatbots', '5 Documents', '20 messages/day', '50K tokens/mo', 'Standard support']
      },
      {
        name: 'Pro', type: 'pro', price: process.env.PLAN_PRO_PRICE || '₹499', period: '/mo', popular: true,
        features: ['10 Chatbots', '50 Documents', '500 messages/day', '500K tokens/mo', 'Priority support', 'Remove branding']
      },
      {
        name: 'Enterprise', type: 'enterprise', price: process.env.PLAN_ENTERPRISE_PRICE || 'Custom', period: '', popular: false,
        features: ['Unlimited chatbots', 'Unlimited documents', 'Unlimited messages', '24/7 support', 'Dedicated manager']
      },
    ];
    return res.json({ success: true, plans });
  } catch (err) {
    console.error('[getPlans]', err);
    return next(err);
  }
};

module.exports = {
  getUsage: exports.getUsage,
  getPlans: exports.getPlans,
};
