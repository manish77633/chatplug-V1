const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/chatbotController');
const { protect, checkPlanLimit } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');

router.use(protect, apiLimiter);

router.get('/',    ctrl.getAll);
router.post('/',   checkPlanLimit('chatbots'), [
  body('name').trim().notEmpty().withMessage('Chatbot name is required').isLength({ max: 50 }).withMessage('Name must be under 50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
], validate, ctrl.create);

router.patch('/:id/activate', ctrl.activate);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

// Public - for embed widget
router.get('/public/:embedId', ctrl.getPublicConfig);

module.exports = router;