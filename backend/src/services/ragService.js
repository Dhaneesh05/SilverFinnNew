const { ChatOpenAI } = require('@langchain/openai');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const prisma = require('../lib/prisma');

// Initialize ZhipuAI (GLM-4) using OpenAI SDK compatibility
// Zhipu's base URL: https://open.bigmodel.cn/api/paas/v4/
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.ZHIPUAI_API_KEY || 'dummy_key_if_not_set',
  configuration: {
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
  },
  modelName: 'glm-4', 
  temperature: 0.3, // Low temp for technical/mechanic advice
});

/**
 * Handles chat requests from the mechanic.
 * Injects vehicle context into the prompt (Mini-RAG).
 */
async function processChat(vehicleId, workshopId, userMessage, chatHistory = []) {
  // 1. Retrieve Context (The "R" in RAG)
  let contextText = "No specific vehicle selected.";
  
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, workshopId },
      include: {
        alerts: { where: { status: 'ACTIVE' } },
        sessions: {
          take: 3,
          orderBy: { sessionDate: 'desc' },
          include: { replacedParts: true }
        }
      }
    });

    if (vehicle) {
      contextText = `
Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year})
Odometer: ${vehicle.currentMileage} km
Engine: ${vehicle.engineType || 'Unknown'} | Transmission: ${vehicle.transmissionType || 'Unknown'}

ACTIVE PREDICTIVE ALERTS:
${vehicle.alerts.map(a => `- ${a.alertType} (${Math.round(a.probability * 100)}% probability)`).join('\n') || 'None'}

RECENT REPLACED PARTS (Last 3 sessions):
${vehicle.sessions.flatMap(s => s.replacedParts.map(p => `- ${p.partName} (at ${s.mileageAtVisit}km)`)).join('\n') || 'None'}
`;
    }
  }

  // 2. Build the System Prompt
  const systemPrompt = `You are Silver Finn Assistant, an expert automotive mechanic AI helping a technician in the workshop.
You have access to the following live context about the vehicle they are currently inspecting:

<vehicle_context>
${contextText}
</vehicle_context>

Guidelines:
1. Provide highly technical, concise, and accurate advice.
2. If asked about part specifications, oil grades, or torque settings, provide standard industry recommendations for the specific Make/Model if known, or explain how to check.
3. If the technician asks about the vehicle's predictive alerts, reference the active alerts from the context.
4. Keep responses brief and formatting clean (use bullet points) because the mechanic is reading this on an iPad while working.`;

  // 3. Assemble Messages
  const messages = [
    new SystemMessage(systemPrompt),
    ...chatHistory.map(msg => 
      msg.role === 'user' ? new HumanMessage(msg.content) : new SystemMessage(msg.content)
    ),
    new HumanMessage(userMessage)
  ];

  // 4. Generate (The "G" in RAG)
  try {
    const response = await chatModel.invoke(messages);
    return response.content;
  } catch (error) {
    console.error("[RAG Service] LLM Error:", error.message);
    if (error.message.includes('401')) {
      return "System Error: Zhipu AI API Key is invalid or missing in .env.";
    }
    return "I'm having trouble connecting to the knowledge base right now. Please try again.";
  }
}

module.exports = { processChat };
