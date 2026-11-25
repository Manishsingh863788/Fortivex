# FORTIVEX AI – AUTONOMOUS AI SALES VOICE AGENT
## Executive Project Report & Technical Evaluation Summary
**Company Context:** TechNova Solutions  
**Candidate Evaluation:** Round 3 – Advanced AI Project Challenge & Technical Discussion  
**Date:** November 2026 | **Venue:** 32-313  

---

### 1. Executive Summary & Problem Statement
Modern B2B and software consulting firms face severe top-of-funnel conversion leakage:
- **Delayed Response Times:** Over 78% of enterprise inbound buyers buy from the vendor that responds first; manual SDR callback times often exceed 4 to 24 hours.
- **Inconsistent Discovery Scoping:** Human SDR qualification across Budget, Authority, Need, and Timeline (BANT) is erratic and prone to inaccurate pricing promises.
- **High SDR Operational Costs:** Maintaining round-the-clock sales discovery teams costs \$6,000–\$9,000/month per representative with high turnover.

**Proposed Solution:**  
**TechNova Autonomous AI Sales Voice Agent** is a full-stack, voice-native intelligent sales copilot. Operating directly through the browser via WebRTC and bidirectional audio, it interacts conversationally with prospective buyers, answers technical queries with strict Retrieval-Augmented Generation (RAG) grounding, performs live BANT lead qualification, classifies conversational sentiment, checks calendar availability in real time, and books confirmed discovery appointments directly into Google Calendar while synchronizing records into Supabase PostgreSQL.

---

### 2. System Architecture & High-Level Flow
```
Customer Speech (Mic) ──► React/Vite (WebRTC/Audio) ──► Voice Engine (Vapi / WebSpeech)
                                                                 │
                                                       Audio-to-Text (STT)
                                                                 ▼
Supabase (pgvector) ◄── Hybrid Search (Cosine/BM25) ◄── Express Backend (REST/WS)
        │                                                        │
Document Chunks ────────────────────────────────────────► Context Injection
                                                                 ▼
Customer Audio (TTS) ◄── Voice Synthesis (TTS) ◄────── OpenAI LLM (GPT-4o-mini)
        ▲                                                        │
        └──────────── Google Calendar Event Booking ◄────────────┘
```

---

### 3. Core Technology Stack
| Layer | Technologies Selected | Justification |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS, Lucide Icons | Sub-second HMR, responsive dark navy enterprise SaaS styling, zero bundle bloat. |
| **Voice Pipeline** | Vapi Web SDK + Browser Web Speech API fallback | Dual-mode resilience: instant zero-cost local voice demo on any laptop with cloud Vapi support. |
| **Backend & APIs** | Node.js, Express.js (ES Modules) | Asynchronous non-blocking I/O ideal for real-time speech and webhook handling. |
| **Reasoning & LLM**| OpenAI GPT-4o-mini + Local Heuristic BANT Engine | Deterministic structured JSON output, low latency (sub-400ms), and high reasoning accuracy. |
| **Vector DB & RAG**| Supabase PostgreSQL with `pgvector` (1536-dim) | Relational integrity with IVFFlat approximate nearest neighbor cosine vector search. |
| **Calendar Sync**  | Google Calendar API v3 | Conflict-aware calendar slot discovery, event insertion, and Google Meet generation. |

---

### 4. Key Functional Features
1. **Real-Time Voice Interaction:** Full-duplex speech interaction with real-time waveform visualization, speaking status indicators, and duration timer.
2. **Contextual Memory & BANT Scoping:** Tracks customer budget, scope, and timeline across conversational turns.
3. **Grounded RAG Knowledge Base:** Chunks and indexes company pricing and SLAs; strictly prohibits hallucinations by declaring information gaps when data is missing.
4. **Automated BANT Lead Scoring:** Categorizes leads dynamically into **HOT** (budget matches, immediate launch), **WARM** (interested, exploring), and **COLD** (budget under threshold).
5. **Google Calendar Booking:** Checks conflict-free 30-minute slots and books meetings with auto-generated Google Meet video conference links.
6. **Executive Call Summaries:** Summarizes conversations, logs objections, and generates 3 actionable sales next steps immediately on call termination.

---

### 5. Scalability Strategy (Up to 100,000 Users)
- **Stateless Application Tier:** Containerized Node.js backend deployed across Kubernetes pods with horizontal pod autoscalers (HPA) behind Cloudflare CDN and an AWS Application Load Balancer.
- **Database Connection Pooling:** Supabase/PostgreSQL connection pooling via PgBouncer, preventing connection exhaustion under heavy concurrent spikes.
- **Asynchronous Task Offloading:** Heavy post-call summarization and vector chunk embedding decoupled via BullMQ / Redis queues.
- **Vector Search Optimization:** Partitioned pgvector tables with HNSW / IVFFlat indexes cached in Redis for recurring frequent queries.

---

### 6. Security, Compliance & Governance
- **Zero Client-Side Key Exposure:** All OpenAI, Supabase Service Role, and Google credentials reside strictly in backend `.env` files.
- **Row-Level Security (RLS):** Supabase tables enforce strict tenant-isolation policies.
- **Regulatory Readiness:** Built for SOC 2 Type II and GDPR compliance with automated transcript PII scrubbing (masking credit cards and national IDs) and encrypted TLS 1.3 in-transit and AES-256 at-rest.
