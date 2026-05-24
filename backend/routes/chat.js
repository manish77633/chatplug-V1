	const router = require('express').Router();
	const multer = require('multer');
	const path = require('path');
	const fs = require('fs');
	const { chat, uploadContext } = require('../controllers/chatController');
	const { chatLimiter } = require('../middleware/rateLimiter');
	const { checkMessageLimit } = require('../middleware/checkLimits');
	const { protect } = require('../middleware/auth');

	// Ensure temp upload directory exists
	const uploadDir = path.join(__dirname, '..', 'uploads', 'temp');
	if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

	// Multer config — temp file upload for context extraction
	const upload = multer({
	dest: uploadDir,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	fileFilter: (req, file, cb) => {
		const allowed = ['.pdf', '.doc', '.docx', '.txt'];
		const ext = path.extname(file.originalname).toLowerCase();
		if (allowed.includes(ext)) return cb(null, true);
		cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
	}
	});

// Protected - PEHLE rakhna zaroori hai
router.post('/upload-context', protect, upload.single('file'), uploadContext);

// Public - BAAD MEIN
router.post('/:embedId', checkMessageLimit, chatLimiter, chat);

	module.exports = router;
