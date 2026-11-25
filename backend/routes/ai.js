import express from 'express';
import { openAIService } from '../services/openaiService.js';
import { leadQualificationService } from '../services/leadQualificationService.js';
import { ragService } from '../services/ragService.js';
import { supabaseService } from '../services/supabaseService.js';
import { googleCalendarService } from '../services/googleCalendarService.js';

const router = express.Router();

// GET /api/ai/status - Overall system health & provider status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    openai: openAIService.getStatus(),
    database: supabaseService.isConfigured(),
    calendar: googleCalendarService.getStatus(),
    vapi: {
      hasPublicKey: Boolean(process.env.VITE_VAPI_PUBLIC_KEY && !process.env.VITE_VAPI_PUBLIC_KEY.includes('your_')),
      hasPrivateApiKey: Boolean(process.env.VAPI_PRIVATE_API_KEY && !process.env.VAPI_PRIVATE_API_KEY.includes('your_')),
      assistantId: process.env.VAPI_ASSISTANT_ID || null
    }
  });
});

// POST /api/ai/qualify-lead - Extract BANT & lead classification
router.post('/qualify-lead', async (req, res) => {
  try {
    const { transcripts } = req.body;
    if (!transcripts) {
      return res.status(400).json({ success: false, error: 'Transcripts are required' });
    }

    const qualification = await leadQualificationService.qualifyAndAnalyze(transcripts);
    res.json({ success: true, data: qualification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/analyze-sentiment - Individual message sentiment
router.post('/analyze-sentiment', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const result = await leadQualificationService.analyzeMessageSentiment(message);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/summarize - Call summarization
router.post('/summarize', async (req, res) => {
  try {
    const { transcripts } = req.body;
    const result = await leadQualificationService.qualifyAndAnalyze(transcripts);
    res.json({
      success: true,
      data: {
        summary: result.summary,
        sentiment: result.sentiment,
        sentiment_score: result.sentiment_score,
        action_items: result.action_items,
        objections: result.objections,
        lead_status: result.lead_status,
        budget: result.budget,
        timeline: result.timeline,
        requirements: result.requirements
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/chat - Live conversational RAG endpoint for voice agent
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], customer_context = {} } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'User message is required' });
    }

    // 1. Retrieve knowledge from RAG system
    const ragResult = await ragService.retrieveContext(message, { topK: 3, threshold: 0.2 });

    // 2. Format conversational history for LLM
    const formattedMessages = [
      ...history.map(h => ({
        role: h.speaker === 'agent' ? 'assistant' : 'user',
        content: h.message || h.text
      })),
      { role: 'user', content: message }
    ];

    // 3. Generate answer using retrieved RAG context
    const replyText = await openAIService.generateChatResponse({
      messages: formattedMessages,
      context: ragResult.formattedContext
    });

    // 4. Real-time sentiment check on user's message
    const sentiment = await leadQualificationService.analyzeMessageSentiment(message);

    res.json({
      success: true,
      data: {
        reply: replyText,
        sentiment: sentiment.sentiment,
        sentiment_score: sentiment.score,
        sentiment_explanation: sentiment.explanation,
        retrieved_chunks: ragResult.chunks
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
