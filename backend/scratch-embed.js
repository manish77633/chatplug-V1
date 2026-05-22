require('dotenv').config({ path: 'backend/.env' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    console.log("Using API Key starting with:", (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY)?.substring(0, 5));
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY });
    
    console.log("Testing embedContent with single string...");
    const result = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: 'hello'
    });
    console.log("Result keys:", Object.keys(result));
    console.log("Result structure:", JSON.stringify(result).substring(0, 500));
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
