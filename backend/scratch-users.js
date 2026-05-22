require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}).lean();
  console.log("Users:", users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}
checkUsers();
