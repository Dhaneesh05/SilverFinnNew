const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Chroma } = require("@langchain/community/vectorstores/chroma");

// Dummy embedder so we can connect to Chroma without a real key
class ZhipuEmbeddings {
  async embedDocuments(texts) { return texts.map(() => new Array(1536).fill(Math.random())); }
  async embedQuery(text) { return new Array(1536).fill(Math.random()); }
}

async function processChat(vehicleId, workshopId, userMessage, chatHistory = []) {
  let vehicleContext = "";
  let manualContext = "";

  // 1. Gather Internal Context (Mini-RAG)
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
      console.error("DB Context Error:", e);
    }
  }

  // 2. Gather External Knowledge (ChromaDB Full RAG)
  try {
    const vectorStore = await Chroma.fromExistingCollection(new ZhipuEmbeddings(), {
      collectionName: "workshop_manuals",
      url: "http://localhost:8000"
    });
    
    // Search vector store for relevant chunks
    const results = await vectorStore.similaritySearch(userMessage, 2);
    if (results && results.length > 0) {
      manualContext = "\nRelevant Manual Excerpts:\n" + results.map(r => r.pageContent).join("\n");
    }
  } catch (error) {
    console.warn("ChromaDB not available or manual collection missing. Skipping external manual retrieval.");
  }

  const systemPrompt = `You are Silver Finn AI, an expert automotive technician assistant.
You provide concise, highly technical advice to mechanics.
Always use metric units and specify torque settings or exact specifications when possible.

Current Vehicle Context:
${vehicleContext || "No specific vehicle selected."}
${manualContext}

Answer the following user query professionally.`;

  const payload = {
    model: "glm-4",
    messages: [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: userMessage }
    ],
    temperature: 0.3
  };

  const API_KEY = process.env.ZHIPUAI_API_KEY || 'dummy_key';
  
  // If no real key, mock the response
  if (API_KEY === 'dummy_key') {
    return `[MOCK AI RESPONSE]\nContext used: ${vehicleContext ? 'Yes' : 'No'}\nManuals used: ${manualContext ? 'Yes' : 'No'}\nI am currently operating in test mode without a ZhipuAI key. For "${userMessage}", I would normally analyze the DB history and ChromaDB manuals.`;
  }

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "ZhipuAI API Error");

  return data.choices[0].message.content;
}

module.exports = { processChat };
