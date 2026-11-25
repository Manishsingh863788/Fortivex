import express from 'express';
import { supabaseService } from '../services/supabaseService.js';

const router = express.Router();

// GET /api/analytics - Aggregated dashboard analytics
router.get('/', async (req, res) => {
  try {
    const [leads, conversations, appointments] = await Promise.all([
      supabaseService.getLeads(),
      supabaseService.getConversations(),
      supabaseService.getAppointments()
    ]);

    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.lead_status === 'HOT').length;
    const warmLeads = leads.filter(l => l.lead_status === 'WARM').length;
    const coldLeads = leads.filter(l => l.lead_status === 'COLD').length;

    const totalCalls = conversations.length;
    const appointmentsBooked = appointments.length;

    const conversionRate = totalLeads > 0
      ? Number(((hotLeads + appointmentsBooked) / (totalLeads * 1.5) * 100).toFixed(1))
      : 0;

    // Sentiment breakdown
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;

    conversations.forEach(c => {
      const s = (c.sentiment || '').toLowerCase();
      if (s.includes('pos')) posCount++;
      else if (s.includes('neg')) negCount++;
      else neuCount++;
    });

    const totalSentiment = posCount + neuCount + negCount || 1;
    const sentimentBreakdown = {
      positive: Math.round((posCount / totalSentiment) * 100),
      neutral: Math.round((neuCount / totalSentiment) * 100),
      negative: Math.round((negCount / totalSentiment) * 100)
    };

    // Objections radar
    const objectionsMap = {};
    conversations.forEach(c => {
      if (Array.isArray(c.objections)) {
        c.objections.forEach(obj => {
          objectionsMap[obj] = (objectionsMap[obj] || 0) + 1;
        });
      }
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalCalls,
          totalLeads,
          hotLeads,
          warmLeads,
          coldLeads,
          appointmentsBooked,
          conversionRate
        },
        sentimentBreakdown,
        objectionsMap,
        recentConversations: conversations.slice(0, 5),
        recentLeads: leads.slice(0, 5)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
