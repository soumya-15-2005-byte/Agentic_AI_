# Agentic Supply Chain 🤖📦

An intelligent, AI-powered supply chain and inventory management system built for the modern era. This project leverages the power of Large Language Models to autonomously manage inventory, process sales, and place procurement orders simply through natural language commands. 

This project perfectly aligns with the hackathon theme of bringing "Agentic AI" into real-world business operations, reducing manual data entry, and making supply chain management as easy as chatting with an assistant.

## Features
- **Conversational AI Interface:** Manage your entire inventory by just chatting with the AI (e.g., "Sell 2 packets of Maggi" or "Order 5 kg of Aashirvaad Atta").
- **Autonomous Tool Calling:** The AI autonomously triggers backend tools to update databases without human intervention.
- **Real-Time Dashboard:** A dynamic, visually appealing dashboard that shows live inventory and procurement history.
- **Low Stock Alerts:** Automatic visual indicators on the dashboard when items fall below their reorder levels.
- **Auto-Sync:** Seamless integration between the AI chat and the store database.

## Installation / Setup Instructions
To run this project locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/soumya-15-2005-byte/Agentic_AI_.git
   cd Agentic_AI_
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Google Gemini API Key:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   ```

4. **Initialize the Database:**
   *(The SQLite database with dummy products is already included in the repo for demo purposes, but you can generate the Prisma client).*
   ```bash
   npx prisma generate
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage
1. Open the application. On the left side, you'll see a WhatsApp-like Chat UI. On the right, you'll see the Store Dashboard.
2. **To Sell an Item:** Type `"I just sold 2 packets of Maggi"` in the chat. The AI will acknowledge it and automatically deduct the stock in the dashboard.
3. **To Restock an Item:** Type `"Order 5 kg of Aashirvaad Atta"`. The AI will place a procurement order and increase the stock on the dashboard.

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js App Router (API Routes)
- **Database:** SQLite with Prisma ORM
- **AI Integration:** Google Gemini AI Model & Vercel AI SDK (`ai`, `@ai-sdk/google`)

## Open Source Attribution
- **Next.js (14.2.35):** MIT License - Used for the core full-stack framework.
- **Vercel AI SDK (^7.0.18):** MIT License - Used for building the conversational AI interface and managing tool calls.
- **Prisma (^5.22.0):** Apache 2.0 License - Used as the ORM to interact with the SQLite database safely.
- **Tailwind CSS (^3.4.1):** MIT License - Used for rapid UI styling and responsive design.

## Live Demo
[https://agentic-ai-fiep.onrender.com/](https://agentic-ai-fiep.onrender.com/)

## Source Code
[https://github.com/soumya-15-2005-byte/Agentic_AI_](https://github.com/soumya-15-2005-byte/Agentic_AI_)

## Contact
**Email:** your-email@example.com
*(Please feel free to reach out if you have any questions regarding the implementation or the AI logic!)*

## Future Work
- **Multi-Agent System:** Introducing separate specialized agents (e.g., a Sales Agent and a Warehouse Agent) that communicate with each other.
- **Cloud Database:** Migrating from SQLite to PostgreSQL (Supabase) for better scalability across serverless environments.
- **Authentication:** Adding NextAuth for secure access to the dashboard.
