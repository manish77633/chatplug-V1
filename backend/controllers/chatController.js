const { GoogleGenAI } = require('@google/genai');
const { queryEmbeddings } = require('../services/embeddingService');
const Chatbot     = require('../models/Chatbot');
const ChatSession = require('../models/ChatSession');
const User        = require('../models/User');
const jwt         = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

exports.chat = async (req, res, next) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY });
    const { embedId } = req.params;
    const { message, sessionId = uuidv4(), history = [] } = req.body;

    // Try to identify if the caller is the owner (playground mode)
    let isOwner = false;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        isOwner = !!decoded?.id;
      }
    } catch {}

    // Get chatbot config - owners can test even if not ready/public
    let chatbot;
    if (isOwner) {
      chatbot = await Chatbot.findOne({ embedId });
    } else {
      chatbot = await Chatbot.findOne({ embedId, isPublic: true });
    }

    if (!chatbot) {
      return res.status(404).json({ success: false, message: 'Bot not found or not public' });
    }

    if (!isOwner && chatbot.allowedDomains && chatbot.allowedDomains.length > 0) {
      const origin = req.headers.origin || req.headers.referer;
      if (origin) {
        try {
          const originUrl = new URL(origin);
          if (!chatbot.allowedDomains.includes(originUrl.hostname)) {
            return res.status(403).json({ success: false, message: 'Domain not allowed' });
          }
        } catch (e) {}
      }
    }

    // RAG: Get relevant context from Pinecone
    let context = 'No relevant context found.';
    try {
      const relevantChunks = await queryEmbeddings({
        query: message,
        namespace: chatbot.vectorNamespace,
        topK: 5,
      });
      if (relevantChunks.length > 0) {
        context = relevantChunks.map(c => c.text).join('\n\n---\n\n');
      }
    } catch (e) {
      console.warn('[RAG] Could not query embeddings:', e.message);
    }

    // Build prompt
    const systemPrompt = `${chatbot.settings.systemPrompt}

Context from knowledge base:
${context}

Rules:
- Base your answer primarily on the context provided above.
- If the context does not contain the answer, use your general knowledge and AI research capabilities to provide the best possible answer.
- If you absolutely cannot answer based on context or general knowledge, say: "${chatbot.settings.fallbackMessage}"
- Be concise and helpful`;

    try {
      // Stream response via SSE — allow any origin (public embed API)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.flushHeaders();

      const contents = [];
      const recentHistory = history.slice(-6);
      
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const config = {
        systemInstruction: systemPrompt
      };

      if (chatbot.settings?.enableGoogleSearch !== false) {
        config.tools = [{ googleSearch: {} }];
      }

      const streamResult = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config
      });

      let fullResponse = '';

      for await (const chunk of streamResult) {
        const delta = chunk.text;
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      // Save session async (don't block response)
      setImmediate(async () => {
        try {
          const totalTokens = Math.ceil((message.length + fullResponse.length) / 4);
          await ChatSession.findOneAndUpdate(
            { sessionId },
            {
              $setOnInsert: { chatbot: chatbot._id, sessionId, sourceDomain: req.headers.referer },
              $push: {
                messages: [
                  { role: 'user',      content: message,      tokens: Math.ceil(message.length / 4) },
                  { role: 'assistant', content: fullResponse,  tokens: Math.ceil(fullResponse.length / 4) },
                ],
              },
              $inc: { 'stats.totalMessages': 2, 'stats.totalTokens': totalTokens },
            },
            { upsert: true, new: true }
          );
          await Chatbot.findByIdAndUpdate(chatbot._id, {
            $inc: { 'stats.totalMessages': 2, 'stats.totalTokens': totalTokens },
          });
          // Update user usage: totalMessages, currentMonth.messages, today.messages and tokens
          try {
            const userUsage = await User.findById(chatbot.owner).select('usage');
            const today = new Date();
            const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            let usageDateKey = null;
            if (userUsage?.usage?.today?.date) {
              const ud = new Date(userUsage.usage.today.date);
              usageDateKey = new Date(ud.getFullYear(), ud.getMonth(), ud.getDate()).toISOString();
            }

            const update = { $inc: { 'usage.totalMessages': 1, 'usage.currentMonth.messages': 1, 'usage.currentMonth.tokens': totalTokens } };
            if (usageDateKey !== todayKey) {
              update.$set = { 'usage.today.date': today, 'usage.today.messages': 1 };
            } else {
              update.$inc['usage.today.messages'] = 1;
            }

            await User.findByIdAndUpdate(chatbot.owner, update, { validateBeforeSave: false });
          } catch (e) { console.error('[ChatUserUpdate]', e.message); }
        } catch (e) { console.error('[ChatSave]', e.message); }
      });
    } catch (apiErr) {
      console.error('[Chat] API Error:', apiErr.message);
      res.write(`data: ${JSON.stringify({ error: "API Error: " + apiErr.message })}\n\n`);
      res.end();
    }

  } catch (err) { next(err); }
};
