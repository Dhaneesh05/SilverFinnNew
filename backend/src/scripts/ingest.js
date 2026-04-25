const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { Document } = require("@langchain/core/documents");
require("dotenv").config();

// Since we are using ZhipuAI, we need a custom embedder wrapper for LangChain
// because ZhipuAI embeddings might not be natively supported in LangChain JS standard package
// For demonstration, we'll create a simple wrapper or use a fallback.
// In a real scenario, you'd use the official ZhipuAI embedding API.
class ZhipuEmbeddings {
  async embedDocuments(texts) {
    // Mock embeddings for demonstration since actual Zhipu API might require specific setup
    return texts.map(() => new Array(1536).fill(Math.random()));
  }
  async embedQuery(text) {
    return new Array(1536).fill(Math.random());
  }
}

const mockManuals = [
  {
    pageContent: "Proton X70 1.8 TGDI: Engine oil capacity is 5.5 Liters with filter change. Recommended oil viscosity is 5W-30 fully synthetic. Oil drain plug torque is 35 Nm.",
    metadata: { make: "Proton", model: "X70", category: "Fluids" }
  },
  {
    pageContent: "Proton X70: Front brake pad minimum thickness is 2.0 mm. Wheel lug nut torque spec is 110 Nm. Replace brake fluid every 2 years or 40,000 km using DOT 4.",
    metadata: { make: "Proton", model: "X70", category: "Brakes" }
  },
  {
    pageContent: "Toyota Vios NCP150: Engine oil capacity 3.3L. CVT transmission fluid capacity is 2.5L drain and refill. Use Toyota Genuine CVT Fluid FE.",
    metadata: { make: "Toyota", model: "Vios", category: "Fluids" }
  },
  {
    pageContent: "Perodua Myvi Gen 3: Front disc brake torque for caliper bolts is 34 Nm. Recommended spark plug gap is 1.0-1.1 mm (Iridium).",
    metadata: { make: "Perodua", model: "Myvi", category: "Engine" }
  }
];

async function run() {
  console.log("Starting knowledge base ingestion...");
  
  try {
    const docs = mockManuals.map(doc => new Document(doc));
    const embeddings = new ZhipuEmbeddings();
    
    console.log("Connecting to ChromaDB at http://localhost:8000...");
    const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
      collectionName: "workshop_manuals",
      url: "http://localhost:8000"
    });
    
    console.log("Ingestion complete. Documents added to 'workshop_manuals' collection.");
  } catch (error) {
    console.error("Ingestion failed. Ensure ChromaDB is running via Docker (docker run -p 8000:8000 chromadb/chroma).");
    console.error(error.message);
  }
}

run();
