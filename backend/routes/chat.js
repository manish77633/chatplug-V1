const router = require('express').Router();
const { chat } = require('../controllers/chatController');
const { chatLimiter } = require('../middleware/rateLimiter');
const { checkMessageLimit } = require('../middleware/checkLimits');

// Public - called from embedded widget on any site
router.post('/:embedId', checkMessageLimit, chatLimiter, chat);

module.exports = router;
