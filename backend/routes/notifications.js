const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all notifications for current user
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
});

// Mark all as read
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

// Mark single as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, notification });
  } catch (err) { next(err); }
});

// Delete single notification
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
});

// Bulk delete notifications
router.delete('/bulk', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }
    const result = await Notification.deleteMany({
      _id: { $in: ids },
      user: req.user._id
    });
    res.json({ success: true, message: `${result.deletedCount} notifications deleted` });
  } catch (err) { next(err); }
});

module.exports = router;