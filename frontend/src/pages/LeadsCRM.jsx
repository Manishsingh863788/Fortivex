import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  Flame, 
  TrendingUp,
  Download,
  Plus
} from 'lucide-react';
import LeadStatusBadge from '../components/LeadStatusBadge';
import SentimentBadge from '../components/SentimentBadge';
import Modal from '../components/Modal';
import { api } from '../services/api';

export default function LeadsCRM() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads({ status: statusFilter });
      if (res.success) setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.requirements && l.requirements.toLowerCase().includes(q))
    );
  });

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Leads & Opportunities CRM</h2>
          <p className="text-xs text-slate-400 mt-0.5">Automated BANT qualification records captured by voice agent</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue w-60"
            />
          </div>

          <div className="flex rounded-xl bg-navy-800 p-1 border border-slate-700 text-xs font-medium">
            {['ALL', 'HOT', 'WARM', 'COLD'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === tab
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CRM Table */}
      <div className="glass-panel rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Requirements</th>
                <th className="px-6 py-4">Budget (BANT)</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Lead Status</th>
                <th className="px-6 py-4">Sentiment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-navy-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>}
                        {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-300">
                      {lead.requirements || 'General Inquiry'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      {lead.budget || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {lead.timeline || 'Flexible'}
                    </td>
                    <td className="px-6 py-4">
                      <LeadStatusBadge status={lead.lead_status} />
                    </td>
                    <td className="px-6 py-4">
                      <SentimentBadge sentiment={lead.sentiment} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="p-2 rounded-lg bg-navy-900 border border-slate-700/80 hover:border-brand-blue text-slate-300 hover:text-white transition-colors"
                        title="View Full BANT Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="BANT Lead Qualification File"
        maxWidth="max-w-xl"
      >
        {selectedLead && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl bg-navy-900 border border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white">{selectedLead.name}</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">{selectedLead.email || 'No email recorded'} • {selectedLead.phone || 'No phone recorded'}</p>
              </div>
              <LeadStatusBadge status={selectedLead.lead_status} />
            </div>

            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Project Scope & Requirements:</span>
              <p className="text-slate-200 text-sm leading-relaxed">{selectedLead.requirements}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Allocated Budget</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedLead.budget}</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Target Timeline</span>
                <span className="font-bold text-amber-300 text-sm">{selectedLead.timeline}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">AI Qualification Rationale:</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{selectedLead.qualification_reason}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-brand-blue text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
