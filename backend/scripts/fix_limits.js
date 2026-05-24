require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in environment. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to MongoDB');

  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    let fixed = 0;
    for (const u of users) {
      const before = JSON.stringify(u.limits || {});
      u.applyPlanLimits();
      const after = JSON.stringify(u.limits || {});
      if (before !== after) {
        await u.save({ validateBeforeSave: false });
        fixed++;
      }
    }
    console.log(`Updated limits for ${fixed} users`);
  } catch (err) {
    console.error('Error updating users:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
