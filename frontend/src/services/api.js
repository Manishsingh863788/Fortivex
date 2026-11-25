const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

export const api = {
  // System Health
  async getStatus() {
    const res = await fetch(`${API_BASE}/ai/status`);
    return res.json();
  },

  // Analytics & Overview
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  // Leads CRM
  async getLeads(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/leads?${qs}`);
    return res.json();
  },

  async getLeadById(id) {
    const res = await fetch(`${API_BASE}/leads/${id}`);
    return res.json();
  },

  async createLead(leadData) {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return res.json();
  },

  async updateLead(id, updates) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Conversations & Call History
  async getConversations() {
    const res = await fetch(`${API_BASE}/conversations`);
    return res.json();
  },

  async getTranscripts(conversationId) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/transcripts`);
    return res.json();
  },

  async saveConversation(convData) {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(convData)
    });
    return res.json();
  },

  // AI & RAG Engine
  async sendChatMessage(payload) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async qualifyLead(transcripts) {
    const res = await fetch(`${API_BASE}/ai/qualify-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcripts })
    });
    return res.json();
  },

  async analyzeSentiment(message) {
    const res = await fetch(`${API_BASE}/ai/analyze-sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async summarizeCall(transcripts) {
    const res = await fetch(`${API_BASE}/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcripts })
    });
    return res.json();
  },

  // Knowledge Base & RAG
  async getKnowledgeDocuments() {
    const res = await fetch(`${API_BASE}/knowledge`);
    return res.json();
  },

  async searchKnowledge(query) {
    const res = await fetch(`${API_BASE}/knowledge/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return res.json();
  },

  async uploadKnowledge(formData) {
    const res = await fetch(`${API_BASE}/knowledge/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Appointments & Calendar
  async getAppointments() {
    const res = await fetch(`${API_BASE}/appointments`);
    return res.json();
  },

  async getAvailableSlots(date) {
    const res = await fetch(`${API_BASE}/appointments/slots?date=${encodeURIComponent(date || '')}`);
    return res.json();
  },

  async bookAppointment(bookingData) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  }
};
