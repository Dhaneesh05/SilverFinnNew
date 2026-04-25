const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

// In-memory store: plain text chunks, no embeddings needed
let manualChunks = [];
let isStoreInitialized = false;

// Simple keyword-based scorer (BM25-lite): counts matching words
function keywordScore(text, query) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();
  let score = 0;
  for (const word of queryWords) {
    const matches = textLower.split(word).length - 1;
    score += matches;
  }
  return score;
}

// Load all txt files into memory as plain text chunks (no API calls needed)
function initManualStore() {
  if (isStoreInitialized) return;
  try {
    const manualsPath = path.join(__dirname, '../../car_manuals');
    if (!fs.existsSync(manualsPath)) {
      fs.mkdirSync(manualsPath, { recursive: true });
    }

    const files = fs.readdirSync(manualsPath).filter(f => f.endsWith('.txt'));
    manualChunks = [];

    for (const file of files) {
      const text = fs.readFileSync(path.join(manualsPath, file), 'utf8');
      // Split into paragraphs/sections for better retrieval
      const sections = text.split(/\n\n+/).filter(s => s.trim().length > 20);
      for (const section of sections) {
        manualChunks.push({ text: section.trim(), source: file });
      }
    }

    console.log(`Loaded ${manualChunks.length} manual sections from ${files.length} files.`);
  } catch (err) {
    console.error("Failed to load manuals:", err.message);
  } finally {
    isStoreInitialized = true;
  }
}

// Call on startup (synchronous, no API calls)
initManualStore();

// Retrieve top-k most relevant sections using keyword matching
function retrieveRelevantContext(query, topK = 5) {
  if (manualChunks.length === 0) return "";

  const scored = manualChunks.map(chunk => ({
    text: chunk.text,
    score: keywordScore(chunk.text, query)
  }));

  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.filter(c => c.score > 0).slice(0, topK);

  if (topChunks.length === 0) return "";
  return "\nRelevant Manual Sections:\n" + topChunks.map(c => c.text).join("\n\n");
}

async function processChat(vehicleId, workshopId, userMessage, chatHistory = []) {
  if (!isStoreInitialized) initManualStore();

  let vehicleContext = "";

  // 1. Gather vehicle context from DB
  if (vehicleId) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { sessions: { include: { predictiveAlerts: true } } }
      });
      if (vehicle) {
        vehicleContext = `Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year}). Plate: ${vehicle.plateNumber}.\n`;
        const recentSession = vehicle.sessions[0];
        if (recentSession && recentSession.predictiveAlerts.length > 0) {
          vehicleContext += `Active Alerts: ${recentSession.predictiveAlerts.map(a => a.component + ' (' + a.probability + '% risk)').join(', ')}.\n`;
        }
      }
    } catch (e) {
      console.error("DB Context Error:", e.message);
    }
  }

  // 2. Retrieve relevant manual context (no API calls!)
  const manualContext = retrieveRelevantContext(userMessage);

  const systemPrompt = `You are Silver Finn AI, an expert automotive technician assistant powered by Google Gemini 2.0.
You provide concise, highly technical advice to mechanics and workshop advisors.
Always use metric units and specify torque settings or exact specifications when possible.
If asked about a specific car model, refer to the manual sections provided.

Current Vehicle Context:
${vehicleContext || "No specific vehicle selected."}
${manualContext}

Answer the following user query professionally.`;

  const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return `[MOCK] No GOOGLE_API_KEY found in .env!`;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: userMessage }
  ].map(msg => [msg.role === "system" ? "user" : msg.role, msg.content]);

  try {
    const chat = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite",
      temperature: 0.3,
      apiKey: API_KEY,
      maxRetries: 0
    });

    const response = await chat.invoke(messages);
    return response.content;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(error.message || "Gemini API Error");
  }
}

module.exports = { processChat };
