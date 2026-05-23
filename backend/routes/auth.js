const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.get('/me',        protect,     getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  // Generate JWT token for the user
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const userJson = JSON.stringify({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    plan: req.user.plan,
    avatar: req.user.avatar
  });

  const clientUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  res.redirect(`${clientUrl}/auth/callback?token=${token}&user=${encodeURIComponent(userJson)}`);
});

module.exports = router;
