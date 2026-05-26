const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Chatbot = require('../models/Chatbot');
const ChatSession = require('../models/ChatSession');

router.use(protect, adminOnly);

// Global stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, chatbots, sessions] = await Promise.all([
      User.countDocuments(),
      Chatbot.countDocuments(),
      ChatSession.countDocuments(),
    ]);
    const tokenUsage = await User.aggregate([
      { 
        $group: { 
          _id: null, 
          total: { 
            $sum: { $ifNull: ['$usage.totalTokens', 0] }
          } 
        } 
      }
    ]);
    res.json({ success: true, stats: { users, chatbots, sessions, totalTokens: tokenUsage[0]?.total || 0 } });
  } catch (err) { next(err); }
});

// All users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? {
      $or: [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ]
    } : {};
    const users = await User.find(query).sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// Single user
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const chatbotsCount = await Chatbot.countDocuments({ owner: req.params.id });
    const sessionsCount = await ChatSession.countDocuments({ owner: req.params.id });

    res.json({
      success: true,
      user,
      chatbotsCount,
      sessionsCount,
      totalMessages: user.usage?.totalMessages || 0,
      totalTokens: user.usage?.totalTokens || 0,
      monthlyTokens: user.usage?.currentMonth?.tokens || 0,
    });
  } catch (err) { next(err); }
});

// All chatbots
router.get('/chatbots', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { name: new RegExp(search, 'i') } : {};
    const chatbotsData = await Chatbot.find(query)
      .populate('owner', 'name email avatar')
      .select('name status documents stats createdAt owner')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Chatbot.countDocuments(query);
    const chatbots = chatbotsData.map(bot => ({
      ...bot.toObject(),
      queries: bot.stats?.totalMessages || bot.stats?.totalChats || 0,
      tokens: bot.stats?.totalTokens || 0,
    }));
    res.json({ success: true, chatbots, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// Ban user
router.patch('/users/:id/ban', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// Revenue stats
router.get('/revenue', async (req, res, next) => {
  try {
    const counts = await User.aggregate([
      { $group: { _id: '$plan.type', count: { $sum: 1 } } }
    ]);

    const stats = { free: 0, pro: 0, enterprise: 0 };
    counts.forEach(c => {
      if (c._id) stats[c._id] = c.count;
    });

    stats.estimatedMRR = stats.pro * 499; // Assume ₹499/mo for pro

    res.json({ success: true, ...stats });
  } catch (err) { next(err); }
});

// Update user plan
router.patch('/users/:id/plan', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { 'plan.type': req.body.plan }, { new: true });
    user.applyPlanLimits();
    await user.save();
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

// Toggle admin role
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    )
    res.json({ success: true, user })
  } catch (err) { next(err) }
})
module.exports = router;
