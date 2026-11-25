import OpenAI from 'openai';

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.client = null;
    this.isConfigured = false;

    if (this.apiKey && !this.apiKey.includes('your_openai') && this.apiKey.startsWith('sk-')) {
      try {
        this.client = new OpenAI({ apiKey: this.apiKey });
        this.isConfigured = true;
        console.log('[OpenAIService] Connected to OpenAI API with model:', this.model);
      } catch (err) {
        console.warn('[OpenAIService] Failed to initialize OpenAI client:', err.message);
      }
    } else {
      console.log('[OpenAIService] No valid OPENAI_API_KEY detected. Running with intelligent deterministic fallback engine.');
    }
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      model: this.model,
      embeddingModel: this.embeddingModel,
      provider: this.isConfigured ? 'OpenAI Cloud (Live)' : 'Local Heuristic AI Engine (Offline Ready)'
    };
  }

  // Generate vector embeddings (1536 dim)
  async getEmbedding(text) {
    if (this.isConfigured && this.client) {
      try {
        const response = await this.client.embeddings.create({
          model: this.embeddingModel,
          input: text.replace(/\n/g, ' ')
        });
        return response.data[0].embedding;
      } catch (err) {
        console.warn('[OpenAIService] OpenAI embedding failed, using local hash-vectorizer:', err.message);
      }
    }

    // Local deterministic pseudo-embedding vector for offline RAG
    return this._generateLocalEmbedding(text);
  }

  // Chat completion for RAG-assisted response
  async generateChatResponse({ messages, context = '', systemPrompt = '' }) {
    if (this.isConfigured && this.client) {
      try {
        const defaultSystem = `You are Alex, an autonomous AI sales voice agent representing TechNova Solutions, a top software engineering and AI consultancy.
Your goal is to converse naturally with potential clients over voice, understand their requirements, quote accurate pricing from TechNova's official knowledge base, qualify the lead, and encourage booking a complimentary 30-minute discovery consultation.

CRITICAL RULES:
1. Always base service offerings, pricing, timelines and policies ONLY on the provided Knowledge Context.
2. If relevant information is not in the context, do NOT invent facts. Politely state: "I don't have that specific information in my records, but our technical director can clarify that in our complimentary discovery call."
3. Keep spoken replies concise, friendly, professional, and conversational (1 to 3 sentences suitable for audio speech).
4. Actively qualify BANT (Budget, Authority, Need, Timeline).

Knowledge Context:
${context || 'No specific document retrieved.'}`;

        const apiMessages = [
          { role: 'system', content: systemPrompt || defaultSystem },
          ...messages
        ];

        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: apiMessages,
          temperature: 0.3,
          max_tokens: 350
        });

        return response.choices[0].message.content.trim();
      } catch (err) {
        console.warn('[OpenAIService] OpenAI chat completion failed, using intelligent local engine:', err.message);
      }
    }

    // Intelligent local fallback response generator
    return this._generateLocalChatResponse(messages, context);
  }

  // --- LOCAL FALLBACK HELPERS ---
  _generateLocalEmbedding(text) {
    const dim = 1536;
    const vec = new Array(dim).fill(0);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dim;
      vec[idx] += 1;
    }
    
    // Normalize vector
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map(v => Number((v / norm).toFixed(6)));
  }

  _generateLocalChatResponse(messages, context) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content.toLowerCase() || '';
    
    if (lastUserMsg.includes('e-commerce') || lastUserMsg.includes('store') || lastUserMsg.includes('shop') || lastUserMsg.includes('clothing')) {
      if (lastUserMsg.includes('50000') || lastUserMsg.includes('50,000') || lastUserMsg.includes('budget')) {
        return "Yes, absolutely! TechNova's starter e-commerce package is ₹45,000 to ₹60,000, including responsive design, product catalog up to 100 items, and secure payment integration. When would you like to start your project?";
      }
      return "We build high-converting e-commerce and Shopify platforms starting at ₹45,000, typically delivered in 3 to 4 weeks. What is your approximate budget and timeline?";
    }

    if (lastUserMsg.includes('next month') || lastUserMsg.includes('soon') || lastUserMsg.includes('week') || lastUserMsg.includes('asap')) {
      return "Next month sounds like an ideal timeline! I can arrange a free 30-minute discovery consultation with our technical architect. Would you like me to book an appointment for you?";
    }

    if (lastUserMsg.includes('yes') || lastUserMsg.includes('book') || lastUserMsg.includes('sure') || lastUserMsg.includes('schedule')) {
      return "Great! I have reserved a 30-minute discovery slot with our team. Please provide your preferred date and your email address so I can confirm the calendar invitation.";
    }

    if (lastUserMsg.includes('price') || lastUserMsg.includes('cost') || lastUserMsg.includes('charge')) {
      return "Our e-commerce projects start at ₹45,000, custom web/mobile platforms range from ₹80,000 to ₹3,50,000, and AI voice solutions start at ₹75,000. Which service best fits your goals?";
    }

    if (lastUserMsg.includes('hello') || lastUserMsg.includes('hi') || lastUserMsg.includes('hey')) {
      return "Hello! Welcome to TechNova Solutions. I'm Alex, your sales assistant. Are you looking to develop an e-commerce platform, a custom web app, or an AI solution?";
    }

    return "Thank you for sharing that with TechNova Solutions. To tailor the best solution for you, what is your approximate budget and target launch date?";
  }
}

export const openAIService = new OpenAIService();
