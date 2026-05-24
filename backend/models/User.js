const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  googleId: { type: String, sparse: true, unique: true },
  avatar:   { type: String },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  plan: {
    type:      { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    expiresAt: { type: Date },
  },

  usage: {
    totalTokens:    { type: Number, default: 0 },
    totalMessages:  { type: Number, default: 0 },
    totalDocuments: { type: Number, default: 0 },
    currentMonth: {
      tokens:   { type: Number, default: 0 },
      messages: { type: Number, default: 0 },
    },
    today: {
      messages: { type: Number, default: 0 },
      date:     { type: Date },
    },
  },

  limits: {
    maxChatbots:        { type: Number, default: 3 },
    maxDocuments:       { type: Number, default: 5 },
    maxTokens:          { type: Number, default: 50000 },
    maxMessagesPerDay:  { type: Number, default: 20 },
  },
  
  // Notification preferences
  notifications: {
    newQueries:      { type: Boolean, default: true },
    weeklyDigest:    { type: Boolean, default: true },
    botStatusAlerts: { type: Boolean, default: true },
    billing:         { type: Boolean, default: false },
    marketing:       { type: Boolean, default: false },
  },

  apiKey:          { type: String, unique: true, sparse: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin:       { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set limits based on plan
userSchema.methods.applyPlanLimits = function () {
  const limits = {
    free:       { maxChatbots: 3,   maxDocuments: 5,   maxTokens: 50_000,    maxMessagesPerDay: 20   },
    pro:        { maxChatbots: 10,  maxDocuments: 50,  maxTokens: 500_000,   maxMessagesPerDay: 500  },
    enterprise: { maxChatbots: 999, maxDocuments: 999, maxTokens: 9_999_999,  maxMessagesPerDay: 9999 },
  };
  this.limits = limits[this.plan.type] || limits.free;
};

module.exports = mongoose.model('User', userSchema);
