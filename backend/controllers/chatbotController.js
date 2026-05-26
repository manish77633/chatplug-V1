const Chatbot  = require('../models/Chatbot');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const { deleteNamespace } = require('../services/embeddingService');
const { sendChatbotCreatedEmail, sendChatbotDeletedEmail } = require('../utils/emailService');

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Enforce limits
    const currentCount = await Chatbot.countDocuments({ owner: req.user._id });
    const limit = req.user.limits?.maxChatbots || 3;
    
    if (currentCount >= limit) {
      return res.status(403).json({ success: false, message: 'Upgrade to Pro to create more chatbots' });
    }

    const chatbot = await Chatbot.create({ owner: req.user._id, name, description, status: 'draft' });
    
    // In-app Notification
    await Notification.create({
      user: req.user._id,
      title: 'Chatbot Created',
      message: `Your new chatbot "${chatbot.name}" was successfully created.`,
      type: 'success',
      link: `/dashboard/bots/${chatbot._id}`
    }).catch(e => console.error('Failed to create chatbot notification', e));

    // Notify owner by email (best-effort)
    if (req.user && req.user.email) {
      sendChatbotCreatedEmail(req.user, chatbot, currentCount + 1)
        .catch(e => console.error('Bot-created email failed', e));
    }

    res.status(201).json({ success: true, chatbot });
  } catch (err) { next(err); }
};

exports.activate = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status: 'active' },
      { new: true, runValidators: true }
    );
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });
    res.json({ success: true, chatbot });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const chatbots = await Chatbot.find({ owner: req.user._id, isArchived: false })
      .populate('documents', 'name status type stats')
      .sort('-createdAt');
    res.json({ success: true, chatbots });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('documents');
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });
    res.json({ success: true, chatbot });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, settings, widget, allowedDomains } = req.body;
    const chatbot = await Chatbot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { name, description, settings, widget, allowedDomains } },
      { new: true, runValidators: true }
    );
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });
    res.json({ success: true, chatbot });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });

    // In-app notification
    Notification.create({
      user: req.user._id,
      title: 'Chatbot Deleted',
      message: `Your chatbot "${chatbot.name}" has been deleted.`,
      type: 'info',
    }).catch(e => console.error('Failed to create chatbot-deleted notification', e));

    // Send deletion email BEFORE deleting (need the name)
    if (req.user && req.user.email && chatbot.name) {
      sendChatbotDeletedEmail(req.user, chatbot.name)
        .catch(e => console.error('Bot-deleted email failed', e));
    }

    // Delete all Pinecone vectors for this chatbot
    await deleteNamespace(chatbot.vectorNamespace);

    // Delete all documents
    await Document.deleteMany({ chatbot: chatbot._id });

    await chatbot.deleteOne();
    res.json({ success: true, message: 'Chatbot deleted' });
  } catch (err) { next(err); }
};

// Public endpoint - get chatbot config for embed widget
exports.getPublicConfig = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ embedId: req.params.embedId, isPublic: true })
      .select('widget settings.fallbackMessage settings.language name');
    if (!chatbot) return res.status(404).json({ success: false, message: 'Bot not found' });
    res.json({ success: true, chatbot });
  } catch (err) { next(err); }
};
