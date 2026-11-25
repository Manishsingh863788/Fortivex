# FORTIVEX AI – INTERVIEW PREPARATION GUIDE
## Round 4 – Individual Technical & 1:1 Discussion Master Reference

This guide contains clear, comprehensive answers to the core questions the technical evaluation panel will ask you about the **Autonomous AI Sales Voice Agent** project.

---

### 1. What is an Autonomous AI Agent?
**Answer:**  
An Autonomous AI Agent is a software system powered by a Large Language Model (LLM) that can perceive its environment (via microphone audio or user input), reason through objectives, retrieve external context (RAG), and autonomously take actions (calling APIs, qualifying leads, booking calendar events) without requiring step-by-step human intervention.  
*Project Example:* In our TechNova agent, the agent listens to the customer, decides what qualifying questions to ask next, checks calendar availability, and books the appointment autonomously.

---

### 2. What is STT and TTS, and how are they used here?
**Answer:**  
- **STT (Speech-To-Text):** Converts acoustic speech signals captured from the microphone into written text. We use Deepgram Nova-2 in Vapi (or Web Speech API in browser) to transcribe user speech with sub-200ms latency.
- **TTS (Text-To-Speech):** Synthesizes natural human-sounding voice audio from text output. We use ElevenLabs Turbo v2 (or browser SpeechSynthesis) to vocalize the agent's responses with natural intonation.

---

### 3. How does Vapi AI work?
**Answer:**  
Vapi acts as a real-time voice orchestration pipeline. Instead of a developer manually handling WebRTC audio streaming, silence detection, turn-taking, interrupting (barge-in), and coordinating STT + LLM + TTS, Vapi orchestrates this loop over low-latency WebSockets. In our project, we also built a zero-cost browser fallback so the prototype can be demonstrated anywhere offline without third-party key dependencies.

---

### 4. What is RAG (Retrieval-Augmented Generation)?
**Answer:**  
RAG is an architectural pattern that enhances an LLM by feeding it verified external documents at query time instead of relying solely on the model's pre-trained weights.  
*Workflow in TechNova:*
1. Company pricing and SLAs are chunked into small paragraphs.
2. When the user asks, *"Can you build an e-commerce website for ₹50,000?"*, the system searches our vector database.
3. It retrieves the exact document snippet: *"Starter e-commerce package is ₹45,000 to ₹60,000"*.
4. This snippet is injected into the LLM's system prompt so the AI gives an accurate answer without hallucination.

---

### 5. What are Embeddings?
**Answer:**  
An embedding is a numerical vector (a list of numbers, like 1,536 floats) representing the semantic meaning of a piece of text. Words and sentences with similar meanings end up close to each other in vector space.  
*Example:* *"How much do you charge?"* and *"What is your pricing?"* have completely different words, but their embedding vectors point in almost the exact same direction.

---

### 6. What is Vector Search and how does `pgvector` work?
**Answer:**  
Vector search calculates the mathematical similarity (typically **Cosine Similarity**) between the query vector and stored document vectors.  
In PostgreSQL, the `pgvector` extension allows us to store vector columns and use the `<=>` operator (cosine distance) with indexing like `ivfflat` or `hnsw`. This enables finding the top 3 most relevant knowledge chunks out of millions in milliseconds.

---

### 7. How does Contextual Memory work across turns?
**Answer:**  
LLMs are stateless by default. To maintain memory across a conversation, our Express backend maintains a session history array containing past exchanges:
```json
[
  { "role": "user", "content": "I want an e-commerce site." },
  { "role": "assistant", "content": "What is your budget?" },
  { "role": "user", "content": "50,000 rupees." }
]
```
When the user subsequently says, *"When can we start?"*, the AI remembers the earlier e-commerce and ₹50,000 details because the full conversation context is supplied with each prompt.

---

### 8. How does Lead Qualification (BANT) work?
**Answer:**  
BANT is an industry-standard enterprise sales qualification framework:
- **Budget (B):** Does the customer have sufficient capital? (e.g. ₹50,000 fits our ₹45,000+ starter tier).
- **Authority (A):** Is the speaker the decision-maker?
- **Need (N):** Is there an acute business requirement (e.g. launching an online apparel store)?
- **Timeline (T):** When is the project deadline? (e.g. "Next month").

Our backend analyzes the completed transcript using structured JSON output from the LLM to score the lead as **HOT**, **WARM**, or **COLD** and generates an explicit rationale.

---

### 9. How does Sentiment Analysis work in real time?
**Answer:**  
As each customer turn arrives, the backend evaluates linguistic markers, polarity, and objection signals. Phrases like *"perfect, let's book it"* trigger a **Positive** score (+0.8), while hesitation around *"too expensive"* registers a **Negative** objection. This score is displayed in real time on the conversation dashboard.

---

### 10. How does the AI call external APIs (Tool Calling / Function Calling)?
**Answer:**  
When using OpenAI or Vapi, we provide a schema of available functions (such as `book_appointment` or `check_pricing`). When the model determines the user wants to book a call, instead of speaking a plain sentence, it emits a structured JSON function call:
```json
{
  "name": "book_appointment",
  "arguments": { "date": "2026-11-27", "time": "14:00", "client_name": "Rahul" }
}
```
Our backend intercepts this payload, executes the Google Calendar API call, and passes the confirmation back to the AI to announce to the user.

---

### 11. How does the Google Calendar Integration work?
**Answer:**  
1. Customer requests a time slot during the call.
2. The agent checks available slots via `GET /api/appointments/slots` to avoid double-booking.
3. On confirmation, the backend invokes the Google Calendar API v3 (`calendar.events.insert`) using an authenticated Service Account or OAuth 2.0 token.
4. Google Calendar generates a unique Google Meet link and calendar invitation, and Supabase stores the booking record.

---

### 12. How would you scale this architecture to 100,000 users?
**Answer:**  
1. **Stateless API Services:** Run Node.js across autoscaling Docker containers in Kubernetes (EKS/GKE) behind an AWS Application Load Balancer.
2. **Asynchronous Background Workers:** Decouple post-call summarization and PDF vector indexing into a Redis-backed BullMQ queue so the voice response loop is never delayed.
3. **Database Connection Pooling:** Place PgBouncer in front of PostgreSQL to handle thousands of concurrent queries without connection limits.
4. **Caching:** Cache high-frequency RAG embedding vectors in Redis.
5. **Cost Optimization:** Use lightweight models like GPT-4o-mini and Deepgram Nova-2, bringing per-call cost down to ~$0.028 per 2-minute call.

---

### 13. What are the key Security and Compliance considerations?
**Answer:**  
- **API Secret Isolation:** No private credentials (OpenAI, Supabase Service Role, Google private keys) are ever bundled into client-side JavaScript.
- **Row-Level Security (RLS):** Supabase database tables enforce strict RLS policies so tenants cannot view each other's leads or recordings.
- **PII Redaction:** Transcripts are scrubbed of phone numbers, credit card sequences, and sensitive personal information before being stored.
- **Encryption:** Enforce TLS 1.3 in transit and AES-256 for all at-rest database storage.
