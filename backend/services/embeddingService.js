const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const Chunk = require('../models/Chunk');
const { GoogleGenAI } = require('@google/genai');

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

exports.embedDocument = async ({ text, documentId, chatbotId, namespace, metadata = {} }) => {
  const chunks = await splitter.createDocuments([text]);
  
  if (chunks.length === 0) {
    chunks.push({ pageContent: text || ' ', metadata: {} });
  }
  
  console.log(`[Embedding] ${chunks.length} chunks for doc ${documentId}`);

  const chunkIds = [];
  const batchSize = 100;
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(c => c.pageContent);
    
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY });
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: texts
    });
    
    const vectors = result.embeddings.map(e => e.values);
    
    const chunkDocs = batch.map((chunk, j) => {
      return {
        chatbot: chatbotId,
        document: documentId,
        text: chunk.pageContent,
        vector: vectors[j]
      };
    });

    const inserted = await Chunk.insertMany(chunkDocs);
    chunkIds.push(...inserted.map(d => d._id.toString()));
  }

  return { chunkCount: chunks.length, vectorIds: chunkIds };
};

// Calculate cosine similarity
function cosineSimilarity(A, B) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  if (!A || !B || A.length !== B.length) return 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

exports.queryEmbeddings = async ({ query, namespace, topK = 5 }) => {
  const Chatbot = require('../models/Chatbot');
  const chatbot = await Chatbot.findOne({ vectorNamespace: namespace });
  if (!chatbot) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY });
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: query
  });
  const queryVector = result.embeddings[0].values;
  
  const chunks = await Chunk.find({ chatbot: chatbot._id }).lean();
  
  const scoredChunks = chunks.map(chunk => {
    return {
      text: chunk.text,
      score: cosineSimilarity(queryVector, chunk.vector)
    };
  });
  
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
};

exports.deleteDocumentVectors = async ({ vectorIds, namespace }) => {
  if (!vectorIds?.length) return;
  await Chunk.deleteMany({ _id: { $in: vectorIds } });
};

exports.deleteNamespace = async (namespace) => {
  const Chatbot = require('../models/Chatbot');
  const chatbot = await Chatbot.findOne({ vectorNamespace: namespace });
  if (chatbot) {
    await Chunk.deleteMany({ chatbot: chatbot._id });
  }
};
