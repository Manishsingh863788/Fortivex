import express from 'express';
import { googleCalendarService } from '../services/googleCalendarService.js';
import { supabaseService } from '../services/supabaseService.js';

const router = express.Router();

// GET /api/appointments - List all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await supabaseService.getAppointments();
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/appointments/slots - Available time slots for a date
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    const slots = await googleCalendarService.getAvailableSlots(date);
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/appointments - Book appointment
router.post('/', async (req, res) => {
  try {
    const { lead_id, customer_name, customer_email, scheduled_time, notes, title } = req.body;

    if (!customer_name || !scheduled_time) {
      return res.status(400).json({ success: false, error: 'customer_name and scheduled_time are required' });
    }

    const appointment = await googleCalendarService.bookAppointment({
      lead_id,
      customer_name,
      customer_email,
      scheduled_time,
      notes,
      title
    });

    res.status(201).json({
      success: true,
      message: 'Appointment successfully confirmed and synced!',
      data: appointment
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
