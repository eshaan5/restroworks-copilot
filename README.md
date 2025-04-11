Restroworks Copilot

Restroworks Copilot is an AI-powered assistant integrated into the Restroworks POS system. It helps restaurant teams — including outlet staff, support, product, and tech — access real-time, contextual information from training docs, SOPs, and internal guides using natural language.

🚀 Features

Chat-based Assistant UI integrated into the POS

Voice support for hands-free interaction

RAG Architecture: Combines embedding search + Gemini LLM for accurate answers

Trained on internal onboarding documents, reports, and SOPs

Works across multiple departments (Support, Product, Operations, etc.)

🧩 Tech Stack

Backend: Node.js + Express

Frontend: AngularJS or React (as web component)

AI/Embedding: Gemini API, Pinecone (Vector DB), Hugging Face / Cohere

File Processing: PDF Parser, UUID

🛠 Setup

Clone the repo

Install dependencies: npm install

Configure .env with Gemini + Pinecone keys

Run the app: node server.js

🧠 How it Works

Files (PDFs, CSVs) are parsed and embedded into Pinecone

User asks a question in the chat

Backend retrieves relevant chunks using vector similarity

Gemini generates final response based on retrieved context

📈 Use Cases

Support agents resolving outlet issues

QA testing complex feature setups

Product team exploring current workflows

New joinees onboarding quickly

🧪 Future Scope

Multilingual support

Role-based personalized chat interfaces

Integration with ticketing + audit logs

Web widget for customer FAQs

Copilot isn’t just a chatbot — it’s your go-to product expert, embedded right where you work.

