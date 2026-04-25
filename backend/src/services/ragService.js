const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { Document } = require("@langchain/core/documents");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

let vectorStore = null;
let isVectorStoreInitialized = false;

// Initialize the local MemoryVectorStore from the .txt files
async function initVectorStore() {
  if (isVectorStoreInitialized) return;
  try {
    const manualsPath = path.join(__dirname, '../../car_manuals');
    if (!fs.existsSync(manualsPath)) {
      fs.mkdirSync(manualsPath, { recursive: true });
    }

    const files = fs.readdirSync(manualsPath).filter(file => file.endsWith('.txt'));
    
    let docs = [];
    for (const file of files) {
      const text = fs.readFileSync(path.join(manualsPath, file), 'utf8');
      docs.push(new Document({ pageContent: text, metadata: { source: file } }));
    }

    if (docs.length > 0) {
      const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
      const splitDocs = await textSplitter.splitDocuments(docs);
      
      const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey: process.env.GEMINI_API_KEY
      });

      vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
      console.log(`Initialized MemoryVectorStore with ${splitDocs.length} chunks from ${files.length} files.`);
    } else {
      console.log("No .txt files found in car_manuals directory.");
    }
  } catch (err) {
    console.error("Failed to initialize vector store:", err);
  } finally {
    isVectorStoreInitialized = true;
  }
}

// Call it eagerly in the background when the file is loaded
initVectorStore();

async function processChat(vehicleId, workshopId, userMessage, chatHistory = []) {
  // Ensure initialized
  if (!isVectorStoreInitialized) await initVectorStore();

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

  // 2. Gather External Knowledge (MemoryVectorStore RAG)
  if (vectorStore) {
    try {
      const results = await vectorStore.similaritySearch(userMessage, 3);
      if (results && results.length > 0) {
        manualContext = "\nRelevant Manual Excerpts:\n" + results.map(r => r.pageContent).join("\n\n");
      }
    } catch (err) {
      console.error("Error searching vector store:", err);
    }
  }

  const systemPrompt = `You are Silver Finn AI, an expert automotive technician assistant powered by Google Gemini 2.0.
You provide concise, highly technical advice to mechanics.
Always use metric units and specify torque settings or exact specifications when possible.

Current Vehicle Context:
${vehicleContext || "No specific vehicle selected."}
${manualContext}

Answer the following user query professionally.`;

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return `[MOCK AI RESPONSE]\nContext used: ${vehicleContext ? 'Yes' : 'No'}\nManuals used: ${manualContext ? 'Yes' : 'No'}\nNo GEMINI_API_KEY found in .env!`;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: userMessage }
  ].map(msg => [msg.role, msg.content]);

  try {
    const chat = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      temperature: 0.3,
      apiKey: API_KEY,
    });

    const response = await chat.invoke(messages);
    return response.content;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Gemini API Error");
  }
}

module.exports = { processChat };
