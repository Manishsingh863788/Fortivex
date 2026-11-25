import express from 'express';
import { supabaseService } from '../services/supabaseService.js';

const router = express.Router();

// GET /api/conversations - List all call logs
router.get('/', async (req, res) => {
  try {
    const conversations = await supabaseService.getConversations();
    res.json({ success: true, count: conversations.length, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/conversations/:id/transcripts
router.get('/:id/transcripts', async (req, res) => {
  try {
    const transcripts = await supabaseService.getTranscriptsByConversationId(req.params.id);
    res.json({ success: true, count: transcripts.length, data: transcripts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/conversations - Store completed conversation
router.post('/', async (req, res) => {
  try {
    const { lead_id, call_duration, status, sentiment, sentiment_score, summary, action_items, objections, transcripts } = req.body;

    const conversation = await supabaseService.createConversation({
      lead_id,
      call_duration,
      status: status || 'completed',
      sentiment: sentiment || 'Neutral',
      sentiment_score: sentiment_score || 0.0,
      summary: summary || '',
      action_items: action_items || [],
      objections: objections || []
    });

    // If transcripts array is provided, insert each line
    if (Array.isArray(transcripts) && transcripts.length > 0) {
      for (const t of transcripts) {
        await supabaseService.addTranscript({
          conversation_id: conversation.id,
          speaker: t.speaker || 'agent',
          message: t.message || t.text || '',
          timestamp: t.timestamp || new Date().toISOString(),
          sentiment: t.sentiment || 'Neutral'
        });
      }
    }

    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
