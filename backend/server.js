require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const app = express();
const passport = require('passport');
const Chatbot = require('./models/Chatbot');
require('./config/passport');

// ─── Environment Validation ──────────────────────────────────────────────────
const required = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CLIENT_ORIGIN || 'https://chatplug.io')
    : true,
  credentials: true,
}));
app.use(passport.initialize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.set('trust proxy', 1);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/chatbots',      require('./routes/chatbots'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/chat',          require('./routes/chat'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/webhooks',      require('./routes/webhooks'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/payment',       require('./routes/payment'));
app.use('/api/user',          require('./routes/user'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/notifications', require('./routes/notifications'));

// ─── Embed Script ─────────────────────────────────────────────────────────────
app.get('/embed/:botId/widget.js', require('./controllers/embedController').serveWidget);

// ─── Serve Frontend in Production ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/embed')) return next();
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages[0] });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field' });
  }
  if (err.message?.includes('Only PDF')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Duplicate key error (MongoDB code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  // Log all 500s
  console.error('[Error]', err);

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

async function connectDB(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error('❌ Failed to connect to MongoDB after retries');
  process.exit(1);
}

connectDB().then(async () => {
  if (process.env.FIX_DRAFT_BOTS_ONCE === 'true') {
    try {
      const result = await Chatbot.updateMany({ status: 'draft' }, { $set: { status: 'active' } });
      console.log(`Fixed draft bots: ${result.modifiedCount}`);
    } catch (err) {
      console.error('Failed to fix draft bots:', err.message);
    }
  }

  if (process.env.FIX_LIMITS === 'true') {
    try {
      const User = require('./models/User');
      const users = await User.find({});
      let fixed = 0;
      for (const u of users) {
        u.applyPlanLimits();
        await u.save({ validateBeforeSave: false });
        fixed++;
      }
      console.log(`Fixed limits for users: ${fixed}`);
    } catch (err) {
      console.error('Failed to fix user limits:', err.message);
    }
  }

  app.listen(PORT, HOST, () => console.log(`🚀 ChatPlug API on ${HOST}:${PORT}`));
});

// Handle mongoose disconnect events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;