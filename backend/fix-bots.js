const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const Chatbot = require('./models/Chatbot');
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Chatbot.updateMany({}, { status: 'ready' });
  console.log('Fixed');
  process.exit();
}
run();
