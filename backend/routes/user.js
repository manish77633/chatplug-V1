const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.put('/profile', protect, [
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name must be under 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], validate, userController.updateProfile);

router.get('/notifications', protect, userController.getNotifications);
router.patch('/notifications', protect, userController.patchNotification);
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
router.get('/api-key', protect, userController.getApiKey);
router.post('/api-key/regenerate', protect, userController.regenerateApiKey);
router.post('/apply-limits', protect, userController.reapplyLimits);

module.exports = router;