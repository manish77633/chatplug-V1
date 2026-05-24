	const express = require('express');
	const router = express.Router();
	const multer = require('multer');
	const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
	const userController = require('../controllers/userController');
	const { protect } = require('../middleware/auth');

	router.put('/profile', protect, userController.updateProfile);
	router.get('/notifications', protect, userController.getNotifications);
	router.patch('/notifications', protect, userController.patchNotification);
	router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
	router.get('/api-key', protect, userController.getApiKey);
	router.post('/api-key/regenerate', protect, userController.regenerateApiKey);
	router.post('/apply-limits', protect, userController.reapplyLimits);

	module.exports = router;
