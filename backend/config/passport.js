const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your_client_id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_client_secret',
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // If user exists, update googleId and avatar if not present
      if (!user.googleId) {
        user.googleId = profile.id;
        if (profile.photos && profile.photos.length > 0) {
           user.avatar = profile.photos[0].value;
        }
        await user.save();
      }
      return done(null, user);
    }

    // If no user exists, create new user
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
      plan: { type: 'free' }
    });
    
    // Apply limits immediately before saving
    user.applyPlanLimits();
    await user.save();

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;
