const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ChatSession = require('../models/ChatSession');
const Chatbot     = require('../models/Chatbot');

router.use(protect);

// Helper: get user's chatbot IDs (optionally filtered by botId)
async function getUserChatbotIds(userId, botId) {
  const query = { owner: userId };
  if (botId) query._id = botId;
  const bots = await Chatbot.find(query).select('_id');
  return bots.map(b => b._id);
}

// ─── GET /api/analytics/stats ─────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const chatbotIds = await getUserChatbotIds(req.user._id);

    if (chatbotIds.length === 0) {
      return res.json({
        success: true,
        totalMessages: 0,
        totalSessions: 0,
        avgTime: 0,
        satisfaction: 0,
      });
    }

    const pipeline = [
      { $match: { chatbot: { $in: chatbotIds } } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$stats.totalMessages' },
          totalSessions: { $sum: 1 },
          avgTime: { $avg: '$stats.duration' },
          ratings: { $push: '$rating' },
        },
      },
    ];

    const result = await ChatSession.aggregate(pipeline);
    const data = result[0] || { totalMessages: 0, totalSessions: 0, avgTime: 0, ratings: [] };

    // Calculate satisfaction from ratings (count sessions with rating >= 4)
    const rated = (data.ratings || []).filter(r => r != null);
    const satisfaction = rated.length > 0
      ? Math.round((rated.filter(r => r >= 4).length / rated.length) * 100)
      : 0;

    res.json({
      success: true,
      totalMessages: data.totalMessages || 0,
      totalSessions: data.totalSessions || 0,
      avgTime: Math.round(data.avgTime || 0),
      satisfaction,
    });
  } catch (err) { next(err); }
});

// ─── GET /api/analytics/messages?range=7d&botId=xxx ──────────────────────────
router.get('/messages', async (req, res, next) => {
  try {
    const { range = '7d', botId } = req.query;

    // Calculate start date based on range (include today)
    const now = new Date();
    let days = 7;
    switch (range) {
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 7; break;
    }
    const startDate = new Date(new Date().setHours(0,0,0,0));
    startDate.setDate(startDate.getDate() - (days - 1)); // include today

    const chatbotIds = await getUserChatbotIds(req.user._id, botId);

    if (chatbotIds.length === 0) {
      return res.json({ success: true, chartData: [] });
    }

    // Unwind messages and count only user messages by day.
    // Use message.createdAt when present, otherwise fall back to the session createdAt.
    const pipeline = [
      { $match: { chatbot: { $in: chatbotIds } } },
      { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
      { $addFields: { msgDate: { $ifNull: [ '$messages.createdAt', '$createdAt' ] }, msgRole: '$messages.role' } },
      { $match: { msgRole: 'user', msgDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$msgDate' } },
          queries: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
    ];

    const rawData = await ChatSession.aggregate(pipeline);

    // Build a map of date -> queries
    const countsByDate = {};
    rawData.forEach(d => { countsByDate[d._id] = d.queries; });

    // Build full chart data for the range (one entry per day)
    const chartData = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const iso = day.toISOString().slice(0,10); // YYYY-MM-DD
      chartData.push({
        date: iso,
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        queries: countsByDate[iso] || 0,
      });
    }

    res.json({ success: true, chartData });
  } catch (err) { next(err); }
});

// ─── GET /api/analytics/top-questions?botId=xxx&page=1&limit=10 ──────────────
router.get('/top-questions', async (req, res, next) => {
  try {
    const { botId, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const chatbotIds = await getUserChatbotIds(req.user._id, botId);

    if (chatbotIds.length === 0) {
      return res.json({ success: true, questions: [], total: 0, page: 1, totalPages: 0 });
    }

    // Get all chatbots for bot name mapping
    const chatbots = await Chatbot.find({ _id: { $in: chatbotIds } }).select('name');
    const botMap = {};
    chatbots.forEach(b => { botMap[b._id.toString()] = b.name; });

    // Find ALL sessions (not date-filtered — top questions ever)
    const sessions = await ChatSession.find(
      { chatbot: { $in: chatbotIds } },
      { messages: 1, chatbot: 1 }
    );

    // Extract user messages, group by content
    const questionCounts = {};
    for (const session of sessions) {
      for (const msg of session.messages) {
        if (msg.role === 'user') {
          const content = msg.content.trim();
          if (!content) continue;
          if (!questionCounts[content]) {
            questionCounts[content] = { count: 0, botId: session.chatbot.toString(), botName: botMap[session.chatbot.toString()] || 'Unknown' };
          }
          questionCounts[content].count++;
        }
      }
    }

    // Sort by count descending
    const sorted = Object.entries(questionCounts)
      .sort((a, b) => b[1].count - a[1].count);

    const total = sorted.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIdx = (pageNum - 1) * limitNum;
    const paged = sorted.slice(startIdx, startIdx + limitNum);

    // Sentiment analysis via keyword detection
    const negativeWords = ['error', 'broken', 'not working', 'fail', 'wrong', 'issue', 'problem', 'bug'];
    const positiveWords = ['thanks', 'great', 'awesome', 'perfect', 'good', 'love', 'excellent'];

    const questions = paged.map(([q, data], i) => {
      const lower = q.toLowerCase();
      let sentiment = 'Neutral';
      if (positiveWords.some(w => lower.includes(w))) sentiment = 'Positive';
      if (negativeWords.some(w => lower.includes(w))) sentiment = 'Negative';

      return {
        id: startIdx + i + 1,
        q: q.length > 80 ? q.slice(0, 80) + '...' : q,
        bot: data.botName,
        count: data.count,
        sentiment,
      };
    });

    res.json({ success: true, questions, total, page: pageNum, totalPages });
  } catch (err) { next(err); }
});

// ─── GET /api/analytics/chatbot/:chatbotId/sessions?limit=50 ──────────────────
router.get('/chatbot/:chatbotId/sessions', async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, owner: req.user._id });
    if (!chatbot) return res.status(404).json({ success: false, message: 'Not found' });
    
    const { page = 1, limit = 50 } = req.query;
    const sessions = await ChatSession.find({ chatbot: chatbot._id })
      .select('sessionId messages stats createdAt updatedAt endedAt')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ChatSession.countDocuments({ chatbot: chatbot._id });
    res.json({ success: true, sessions, total });
  } catch (err) { next(err); }
});

// ─── GET /api/analytics/activity?limit=10 ─────────────────────────────────────
router.get('/activity', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const chatbots = await Chatbot.find({ owner: req.user._id }).select('name createdAt');
    const chatbotIds = chatbots.map(b => b._id);
    const botNameMap = {};
    chatbots.forEach(b => { botNameMap[b._id.toString()] = b.name; });

    const activities = [];

    // a) Bot created events
    for (const bot of chatbots) {
      activities.push({
        type: 'bot',
        action: `Chatbot "${bot.name}" created`,
        time: bot.createdAt,
      });
    }

    // b) Recent chat sessions (last 5)
    if (chatbotIds.length > 0) {
      const recentSessions = await ChatSession.find({ chatbot: { $in: chatbotIds } })
        .sort('-createdAt')
        .limit(5)
        .select('chatbot createdAt');
      
      for (const session of recentSessions) {
        const botName = botNameMap[session.chatbot.toString()] || 'Unknown';
        activities.push({
          type: 'message',
          action: `New conversation on "${botName}"`,
          time: session.createdAt,
        });
      }

      // c) Recent document uploads (last 5)
      try {
        const Document = require('../models/Document');
        const recentDocs = await Document.find({ chatbot: { $in: chatbotIds } })
          .sort('-createdAt')
          .limit(5)
          .select('chatbot createdAt');
        
        for (const doc of recentDocs) {
          const botName = botNameMap[doc.chatbot.toString()] || 'Unknown';
          activities.push({
            type: 'file',
            action: `Document uploaded to "${botName}"`,
            time: doc.createdAt,
          });
        }
      } catch {}
    }

    // Sort all by time descending, slice to limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const sliced = activities.slice(0, limitNum);

    res.json({ success: true, activities: sliced });
  } catch (err) { next(err); }
});

// ─── GET /api/analytics/overview (existing - keep for compatibility) ───────────
router.get('/overview', async (req, res, next) => {
  try {
    const chatbots = await Chatbot.find({ owner: req.user._id }).select('name stats status');
    const totalMessages = chatbots.reduce((a, b) => a + b.stats.totalMessages, 0);
    const totalTokens   = chatbots.reduce((a, b) => a + b.stats.totalTokens,   0);
    res.json({ success: true, overview: { chatbots: chatbots.length, totalMessages, totalTokens, chatbotList: chatbots } });
  } catch (err) { next(err); }
});

// ─── GET /api/analytics/sessions/:sessionId ───────────────────────────────────
router.get('/sessions/:sessionId', async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) { next(err); }
});

// ─── DELETE /api/analytics/sessions/:sessionId ────────────────────────────────
router.delete('/sessions/:sessionId', async (req, res, next) => {
  try {
    const session = await ChatSession.findOneAndDelete({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── DELETE /api/analytics/chatbot/:chatbotId/sessions ────────────────────────
router.delete('/chatbot/:chatbotId/sessions', async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, owner: req.user._id });
    if (!chatbot) return res.status(404).json({ success: false, message: 'Not found' });
    await ChatSession.deleteMany({ chatbot: chatbot._id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;