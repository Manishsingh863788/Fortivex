# FORTIVEX AI – AUTONOMOUS AI SALES VOICE AGENT
### Enterprise AI Prototype for TechNova Solutions
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20pgvector-3ecf8e)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20GPT--4o--mini-purple)](https://openai.com/)
[![Voice](https://img.shields.io/badge/Voice-Vapi%20AI%20%2B%20Web%20Speech-orange)](https://vapi.ai/)

---

## 1. Project Overview
**Fortivex AI Sales Voice Agent** is a full-stack, enterprise-grade autonomous sales assistant developed for **TechNova Solutions**, a software engineering consultancy.

Operating directly through a web interface, the agent listens to prospective clients via microphone, provides contextually grounded answers regarding TechNova's services and pricing using **Retrieval-Augmented Generation (RAG)**, scores leads using the **BANT framework (Budget, Authority, Need, Timeline)**, performs live **sentiment analysis**, and automatically schedules discovery consultations with **Google Calendar** while committing all records to **Supabase PostgreSQL**.

---

## 2. Key Capabilities & Features

1. **Live Bidirectional Voice Interaction:**
   - Real-time Speech-To-Text (STT) and Text-To-Speech (TTS).
   - Dual-engine architecture: Vapi Web SDK for cloud telephony + native browser Web Speech API for instant zero-dependency local demonstration.
   - Interactive 24-band frequency waveform visualizer and speaker status indicators.

2. **RAG-Powered Knowledge Grounding:**
   - Ingests PDF and text documentation containing TechNova pricing, service tiers, warranties, and SLAs.
   - 1536-dimensional vector embeddings with cosine similarity search in `pgvector`.
   - Strict hallucination safeguards: Refuses to fabricate pricing or policies when context is unavailable.

3. **Intelligent Lead Qualification (BANT):**
   - Automatically classifies leads into **HOT**, **WARM**, or **COLD**.
   - Extracts customer name, email, phone, budget, timeline, and business requirements.
   - Generates explicit qualification rationales stored directly in the CRM.

4. **Sentiment & Objection Analysis:**
   - Tracks customer sentiment (Positive, Neutral, Negative) across each conversational exchange.
   - Captures and aggregates customer objections to inform sales leadership.

5. **Automated Appointment Booking:**
   - Integrates with Google Calendar API v3 to query availability and detect schedule conflicts.
   - Books 30-minute discovery sessions and generates Google Meet conference links.

6. **Enterprise SaaS Dashboard:**
   - **Overview:** High-level sales KPIs, conversion rates, and recent calls.
   - **Live AI Voice Agent:** Active call stage, visualizer, live transcript, and qualification card.
   - **Leads CRM:** Searchable, filterable table with full BANT inspection modal.
   - **Call History:** Historical transcripts, sentiment scores, and action items.
   - **Knowledge Base:** Document ingestion, chunk inspection, and semantic search tester.
   - **Appointments:** Calendar view with Google Meet links.
   - **Analytics:** Sentiment breakdown and objection frequency radar.
   - **System Architecture:** Interactive visualization of the end-to-end data pipeline.
   - **Settings:** Live integration health inspector for external APIs.

---

## 3. System Architecture Diagram

```
Customer Microphone
        │
        ▼
React 18 + Vite Frontend (WebRTC / Web Speech API)
        │
        ▼
Node.js + Express REST & Voice Gateway
   ├── Real-Time Sentiment Classifier
   ├── BANT Lead Qualification Engine
   └── RAG Knowledge Retriever
            │
            ├────────► Supabase PostgreSQL (pgvector cosine search)
            ├────────► OpenAI GPT-4o-mini (Contextual Reasoning)
            ├────────► Google Calendar API v3 (Appointment Booking)
            └────────► Leads CRM & Call Transcripts Database
```

---

## 4. End-to-End Business Workflow (Live Demo Script)

During the technical evaluation, execute this complete 14-step workflow:
1. Open dashboard at `http://localhost:5173` and navigate to **Live AI Voice Agent**.
2. Click **Start Voice Call** and allow microphone access.
3. The AI greets: *"Hello! Welcome to TechNova Solutions. How can I help you today?"*
4. Speak: *"I want to develop an e-commerce website for my apparel brand."*
5. The AI asks about your approximate budget.
6. Speak: *"Around 50,000 rupees."*
7. The AI validates the budget against the RAG knowledge base: *"Yes! Our starter e-commerce package is ₹45,000 to ₹60,000..."*
8. Speak: *"I want to launch next month."*
9. The AI qualifies the lead as **HOT** (budget matches, clear 1-month timeline) and proposes a discovery consultation.
10. Confirm by clicking **Book Discovery Call** or saying *"Yes, please book it"*.
11. Select an available time slot; the system books the appointment and generates a Google Meet link.
12. Click **End & Summarize Call**.
13. View the generated executive call summary and recommended action items.
14. Navigate to **Leads CRM** and **Appointments** to see all data persisted.

---

## 5. Quickstart & Installation

### Option A: One-Click Launch (Windows)
Double-click `start.bat` or run in PowerShell:
```powershell
.\start.ps1
```
This launches both backend and frontend and opens `http://localhost:5173` automatically.

### Option B: Manual Terminal Launch

#### Step 1: Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

#### Step 2: Configure Environment (Optional)
Copy `.env.example` to `.env` in the root or `backend` folder:
```bash
cp .env.example backend/.env
```
*(Note: If API keys are omitted, the application automatically runs in local resilient mode with seeded data and offline speech synthesis!)*

#### Step 3: Run Servers
Terminal 1 (Backend):
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 6. Database Schema Setup (Supabase pgvector)

If connecting to your Supabase project:
1. Open the **SQL Editor** in your Supabase dashboard.
2. Run the provided SQL script: `backend/database/schema.sql`.
3. Add your `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `backend/.env`.

---

## 7. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend health check and version |
| `GET` | `/api/leads` | List leads (supports `?status=HOT` filter) |
| `POST`| `/api/leads` | Create or update lead record |
| `GET` | `/api/conversations` | List past call history and summaries |
| `POST`| `/api/conversations` | Save completed call with transcripts |
| `POST`| `/api/ai/chat` | RAG-assisted conversational query |
| `POST`| `/api/ai/qualify-lead` | Run BANT qualification on transcript |
| `POST`| `/api/ai/analyze-sentiment` | Classify sentiment of a message |
| `GET` | `/api/appointments` | List scheduled discovery appointments |
| `GET` | `/api/appointments/slots`| Check available calendar time slots |
| `POST`| `/api/appointments` | Book appointment with conflict check |
| `GET` | `/api/knowledge` | List ingested RAG documents |
| `POST`| `/api/knowledge/upload`| Upload PDF/text document and create vector chunks |
| `POST`| `/api/knowledge/search`| Perform semantic vector similarity search |

---

## 8. Scalability Strategy for 100,000 Users

- **Stateless Express API:** Clustered via Kubernetes HPA behind Cloudflare CDN and AWS ALB.
- **Queue Worker Architecture:** Post-call summarization and embedding ingestion offloaded to **BullMQ / Redis**.
- **Database Connection Pooling:** **PgBouncer** connection pooler preventing PostgreSQL thread exhaustion.
- **Cost Efficiency:** ~$0.028 per 2-minute qualified call utilizing GPT-4o-mini and Deepgram Nova-2.

---

## 9. Security & Compliance

- **No Private Keys in Frontend:** All OpenAI, Google, and Supabase service role keys reside strictly in backend `.env`.
- **Row-Level Security (RLS):** Strict PostgreSQL policies for multi-tenant isolation.
- **PII Redaction:** Automated regex sanitization filters out phone numbers and credit card patterns before long-term storage.
- **Data Encryption:** TLS 1.3 in-transit and AES-256 at-rest.
