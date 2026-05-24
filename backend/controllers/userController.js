const crypto = require('crypto');
const User = require('../models/User');
const streamifier = require('streamifier');
const cloudinary = require('../utils/cloudinary');

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Fetch user with password when validating
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password required' });
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return res.status(401).json({ success: false, message: 'Current password incorrect' });
      user.password = newPassword;
    }

    await user.save();

    const out = user.toObject();
    delete out.password;
    return res.json({ success: true, user: out });
  } catch (err) {
    console.error('[updateProfile]', err);
    return next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const defaults = {
      newQueries: true,
      weeklyDigest: true,
      botStatusAlerts: true,
      billing: false,
      marketing: false,
    };
    const user = req.user;
    const preferences = user.notifications || defaults;
    return res.json({ success: true, preferences });
  } catch (err) {
    console.error('[getNotifications]', err);
    return next(err);
  }
};

exports.patchNotification = async (req, res, next) => {
  try {
    // Accept either { key, value } or partial body like { newQueries: true }
    const allowed = ['newQueries','weeklyDigest','botStatusAlerts','billing','marketing'];
    let updates = {};

    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'key')) {
      const { key, value } = req.body;
      if (!allowed.includes(key)) return res.status(400).json({ success: false, message: 'Invalid notification key' });
      updates[key] = !!value;
    } else {
      // Pick allowed keys from body
      for (const k of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, k)) {
          updates[k] = !!req.body[k];
        }
      }
      if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: 'No valid notification keys provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.notifications = user.notifications || {};
    for (const [k, v] of Object.entries(updates)) user.notifications[k] = v;
    await user.save();
    return res.json({ success: true, preferences: user.notifications });
  } catch (err) {
    console.error('[patchNotification]', err);
    return next(err);
  }
};

exports.getApiKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.apiKey) {
      user.apiKey = 'sk-chatplug-' + crypto.randomBytes(24).toString('hex');
      await user.save({ validateBeforeSave: false });
    }
    return res.json({ success: true, apiKey: user.apiKey });
  } catch (err) {
    console.error('[getApiKey]', err);
    return next(err);
  }
};

exports.regenerateApiKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.apiKey = 'sk-chatplug-' + crypto.randomBytes(24).toString('hex');
    await user.save({ validateBeforeSave: false });
    return res.json({ success: true, apiKey: user.apiKey });
  } catch (err) {
    console.error('[regenerateApiKey]', err);
    return next(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const buffer = req.file.buffer;

    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: 'avatars', resource_type: 'image' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    const result = await uploadFromBuffer(buffer);
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const out = user.toObject ? user.toObject() : user;
    delete out.password;
    return res.json({ success: true, avatar: user.avatar, user: out });
  } catch (err) {
    console.error('[uploadAvatar]', err);
    return next(err);
  }
};

exports.reapplyLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.applyPlanLimits();
    await user.save({ validateBeforeSave: false });
    const out = user.toObject ? user.toObject() : user;
    if (out.password) delete out.password;
    return res.json({ success: true, user: out, message: 'Limits reapplied' });
  } catch (err) {
    console.error('[reapplyLimits]', err);
    return next(err);
  }
};

module.exports = {
  updateProfile: exports.updateProfile,
  getNotifications: exports.getNotifications,
  patchNotification: exports.patchNotification,
  getApiKey: exports.getApiKey,
  regenerateApiKey: exports.regenerateApiKey,
  uploadAvatar: exports.uploadAvatar,
};
