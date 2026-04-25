# Silver Finn AI 🚀

**Silver Finn AI** is a next-generation, AI-powered mechanic assistant and workshop management platform. Built to revolutionize how auto repair shops operate, it combines 3D interactive vehicle inspections, predictive maintenance intelligence, and a powerful Retrieval-Augmented Generation (RAG) AI assistant to help mechanics work faster, smarter, and with greater precision.

Created for **UMHackathon2026-The_Hacktivists**.

## ✨ Key Features

- **🏎️ 3D Interactive Garage:** A fully immersive 3D interface built with `react-three-fiber`. Mechanics can visually select and inspect specific vehicle zones (Engine, Undercarriage, Interior, etc.) dynamically.
- **🔮 Predictive Maintenance Intelligence:** The system analyzes historical service records to calculate statistical failure probabilities based on a vehicle's specific make, model, and current odometer reading. If a part has a high risk of failure, a warning banner dynamically alerts the mechanic *before* and *during* the inspection checklist.
- **📋 Guided Inspection Checklists:** Zone-by-zone interactive checklists that enforce a thorough, sequential inspection process. 
- **🤖 RAG-Powered AI Assistant:** A built-in chat interface powered by Google's Gemini 2.0. By using vectorized car manuals and repair guides, the AI provides instant, context-aware answers to complex mechanical questions (e.g., torque specs, wiring diagrams).
- **📄 Automated PDF Reporting:** Upon completing an inspection, the platform instantly generates a professional, branded PDF service report detailing passed/failed items, replaced parts, and total costs.
- **📈 Advanced Analytics:** A comprehensive dashboard visualizing parts lifecycle, replacement frequencies, and workshop revenue metrics.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Glassmorphism & modern UI patterns)
- Zustand (Global state management)
- React-Three-Fiber / Three.js (3D Rendering)
- jsPDF (Report generation)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- Prisma ORM
- PostgreSQL
- LangChain & Google Generative AI (RAG embeddings & chat)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dhaneesh05/SilverFinnNew.git
   cd SilverFinnNew
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/silverfinn?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   GEMINI_API_KEY="your_google_gemini_api_key"
   ```
   Run database migrations and seed the mock data:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`. Use the default login provided by the seed script:
   - **Username:** `admin`
   - **Password:** `admin123`

## 🧠 How Predictive Intelligence Works
When a mechanic adjusts a vehicle's odometer in the Garage view, a debounced API request fetches predictions. The backend queries `ServiceSession` records for the same Make/Model within a ±20% mileage band. It calculates the frequency of part replacements in those historical sessions. If a part was replaced in >30% of similar sessions, the system flags it as a **High Risk of Failure** both in the vehicle info overlay and directly within the inspection checklist items.

## 🤖 How the RAG Assistant Works
The `/backend/car_manuals/` directory contains PDF/TXT repair manuals. The backend uses `langchain` and Google's embedding models to chunk and index these documents into a vector store. When a mechanic asks a question, the system retrieves the most relevant technical chunks and injects them into the context window for Gemini to provide an accurate, manual-backed answer.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

---
*Developed with ❤️ during the UM Hackathon 2026*
