require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const Chatbot = require('./models/Chatbot');
const Document = require('./models/Document');
const Chunk = require('./models/Chunk');

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const chatbots = await Chatbot.find({}).lean();
    console.log(`Found ${chatbots.length} chatbots:`);
    for (const bot of chatbots) {
      console.log(`- Bot: ${bot.name} (_id: ${bot._id}, embedId: ${bot.embedId}), Status: ${bot.status}`);
      const docs = await Document.find({ chatbot: bot._id }).lean();
      console.log(`  Docs count: ${docs.length}`);
      for (const d of docs) {
        console.log(`    * Doc: ${d.name}, Type: ${d.type}, Status: ${d.status}, ErrorMessage: ${d.errorMessage || 'none'}`);
      }
      const chunks = await Chunk.find({ chatbot: bot._id }).lean();
      console.log(`  Chunks count: ${chunks.length}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Inspect error:", err);
    process.exit(1);
  }
}

inspect();
