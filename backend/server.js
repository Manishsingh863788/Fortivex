import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import leadsRouter from './routes/leads.js';
import conversationsRouter from './routes/conversations.js';
import aiRouter from './routes/ai.js';
import knowledgeRouter from './routes/knowledge.js';
import appointmentsRouter from './routes/appointments.js';
import analyticsRouter from './routes/analytics.js';
import { ragService } from './services/ragService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/leads', leadsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/analytics', analyticsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Fortivex AI - TechNova Autonomous Sales Voice Agent',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint info
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 40px; background: #0b132b; color: #fff; min-height: 100vh;">
      <h1 style="color: #60a5fa;">Fortivex AI - Autonomous Voice Sales Agent Backend</h1>
      <p style="color: #94a3b8;">REST APIs & RAG Engine are running live on port ${PORT}.</p>
      <ul>
        <li><a style="color: #38bdf8;" href="/api/health">/api/health</a> - Health check</li>
        <li><a style="color: #38bdf8;" href="/api/leads">/api/leads</a> - CRM Leads</li>
        <li><a style="color: #38bdf8;" href="/api/analytics">/api/analytics</a> - Analytics</li>
        <li><a style="color: #38bdf8;" href="/api/appointments">/api/appointments</a> - Appointments</li>
        <li><a style="color: #38bdf8;" href="/api/knowledge">/api/knowledge</a> - RAG Knowledge Documents</li>
      </ul>
    </div>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[UnhandledError]', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`========================================================`);
  console.log(`🚀 Fortivex AI Sales Agent Backend running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`========================================================`);

  // Initialize RAG knowledge base seeding
  await ragService.initialize();
});
