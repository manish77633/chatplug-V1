const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  chatbot: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true, index: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  text: { type: String, required: true },
  vector: { type: [Number], required: true },
});

module.exports = mongoose.model('Chunk', chunkSchema);
