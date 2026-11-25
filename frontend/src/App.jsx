import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Overview from './pages/Overview';
import VoiceAgent from './pages/VoiceAgent';
import LeadsCRM from './pages/LeadsCRM';
import CallHistory from './pages/CallHistory';
import KnowledgeBase from './pages/KnowledgeBase';
import Appointments from './pages/Appointments';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ArchitectureView from './pages/ArchitectureView';

const PAGE_TITLES = {
  'overview': 'Executive Sales Overview',
  'voice-agent': 'Autonomous AI Voice Agent',
  'leads-crm': 'Leads & BANT Pipeline CRM',
  'call-history': 'Call History & Transcripts',
  'knowledge-base': 'RAG Knowledge Base & Embeddings',
  'appointments': 'Calendar & Consultations',
  'analytics': 'Sales Intelligence & Analytics',
  'architecture': 'System Architecture & Flow',
  'settings': 'Settings & Integrations'
};

export default function App() {
  const [activePage, setActivePage] = useState('overview');

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview setActivePage={setActivePage} />;
      case 'voice-agent':
        return <VoiceAgent setActivePage={setActivePage} />;
      case 'leads-crm':
        return <LeadsCRM />;
      case 'call-history':
        return <CallHistory />;
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'appointments':
        return <Appointments />;
      case 'analytics':
        return <Analytics />;
      case 'architecture':
        return <ArchitectureView />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-900 text-slate-100 selection:bg-brand-blue selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activePageTitle={PAGE_TITLES[activePage] || 'Dashboard'} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
