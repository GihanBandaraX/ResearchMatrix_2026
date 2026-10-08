# ResearchMatrix AI (AI-Powered Academic Literature & Thesis Synthesis Hub) 🔬

**Developer:** GihanBandaraX  
**Timeline:** September 25, 2026  
**Repository:** [ResearchMatrix_2026](https://github.com/GihanBandaraX/ResearchMatrix_2026)  
🚀 **Live Demo:** [View Live App](#)

ResearchMatrix AI is an advanced, deep-tech academic literature and thesis synthesis platform designed for researchers, academics, and graduate students (MSc) to manage, compare, and synthesize research papers using modern web technologies. It bridges the gap between basic document storage and intelligent research automation.

## ✨ Core Features

* 📄 **Smart Paper Ingestion & Automated Literature Matrix:** Automatically extracts methodology, datasets, key findings, and research gaps from uploaded research PDFs via Gemini multimodal models into a structured comparison matrix.
* 🔍 **Internal Duplicate & Similarity Checker:** Built-in token-overlap/Jaccard similarity algorithm that compares newly uploaded papers against existing documents in MongoDB to calculate real similarity and AI probabilities without expensive external paid APIs.
* 🤖 **Multi-Model Fallback Support:** Native integration with multiple Gemini flash variants (`gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.5-flash`, etc.) with dynamic fallback mechanisms to ensure high availability and robust JSON parsing.
* 📌 **Persistent Workspace Management:** Full CRUD capabilities with database-backed persistence for bookmarking/pinning papers (`isPinned`), renaming titles, and permanently deleting records synced securely via NextAuth.
* 💬 **Context-Aware Hybrid RAG Chat:** Leverages MongoDB Atlas Vector Search to query your paper library with exact citations (`[Paper Title - Page X]`) to prevent hallucinations.
* 🌐 **Interactive Research Knowledge Graph:** Uses React Flow to visualize semantic connections, shared methodologies, and citation links between uploaded papers.
* 📑 **Automated Thesis Chapter Synthesizer:** Aggregates database insights to generate comprehensive literature review and thesis chapter synthesis paragraphs.
* 🎨 **Adaptive Glassmorphic UI/UX:** Responsive wide-layout dashboard featuring synchronized Light/Dark mode and section-level quick-copy utilities tailored for efficient academic research note-taking.

## 🛠️ Tech Stack

* **Frontend & Backend:** Next.js 16 (App Router), Serverless API Routes deployed on Vercel
* **Database & Persistence:** MongoDB Atlas, Mongoose ODM, Atlas Vector Search
* **AI Engine & Parsing:** Google Gemini API (`@google/generative-ai`), `pdf2json` for multimodal PDF parsing and structured JSON outputs
* **Authentication:** NextAuth.js (Google OAuth) for secure user sessions
* **UI & Visuals:** Tailwind CSS, glassmorphic wide layout, and React Flow
