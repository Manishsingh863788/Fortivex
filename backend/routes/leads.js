import express from 'express';
import { supabaseService } from '../services/supabaseService.js';

const router = express.Router();

// GET /api/leads - List all leads with optional status or search query
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let leads = await supabaseService.getLeads();

    if (status && status !== 'ALL') {
      leads = leads.filter(l => l.lead_status?.toUpperCase() === status.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.requirements && l.requirements.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/leads/:id - Fetch single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await supabaseService.getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/leads - Create a new lead
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, requirements, budget, timeline, lead_status, sentiment, qualification_reason } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    const lead = await supabaseService.createLead({
      name,
      email,
      phone,
      requirements,
      budget,
      timeline,
      lead_status,
      sentiment,
      qualification_reason
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/leads/:id - Update lead details or status
router.put('/:id', async (req, res) => {
  try {
    const updated = await supabaseService.updateLead(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
