import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  UploadCloud, 
  Search, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Services');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Semantic Search Tester State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await api.getKnowledgeDocuments();
      if (res.success) setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!textContent && !file) return;

    setUploadLoading(true);
    setUploadMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title || (file ? file.name : 'Custom TechNova Document'));
      formData.append('category', category);
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('content', textContent);
      }

      const res = await api.uploadKnowledge(formData);
      if (res.success) {
        setUploadMsg(res.message);
        setTitle('');
        setTextContent('');
        setFile(null);
        loadDocuments();
      }
    } catch (err) {
      setUploadMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTestSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await api.searchKnowledge(searchQuery);
      if (res.success) setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">RAG Knowledge Base & Embeddings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Powering the AI voice agent with verified company policies, service pricing, and SLAs stored in Supabase pgvector
        </p>
      </div>

      {/* Grid: Upload Document + Semantic Search Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Ingestion & Chunking Form */}
        <div className="glass-panel p-6 rounded-3xl border space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <UploadCloud className="w-5 h-5 text-brand-blue" />
            <h3 className="font-bold text-white text-base">Ingest New Sales Document</h3>
          </div>

          {uploadMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise SLA Tiers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
                >
                  <option value="Services">Services Catalog</option>
                  <option value="Pricing">Pricing & Terms</option>
                  <option value="Policies">SLAs & Policies</option>
                  <option value="FAQs">FAQs & Objections</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Upload PDF / TXT File</label>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/20 file:text-brand-blue hover:file:bg-brand-blue/30"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Or Paste Document Text Directly</label>
              <textarea
                rows="4"
                placeholder="Paste company service details, pricing tiers, or project policies..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={uploadLoading || (!file && !textContent)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold text-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-brand-blue/20"
            >
              {uploadLoading ? 'Chunking & Embedding Vectors...' : 'Extract, Chunk & Save to pgvector'}
            </button>
          </form>
        </div>

        {/* Live Semantic Search Tester */}
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Test Vector Semantic Retrieval</h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Verify how the RAG engine matches conversational queries against knowledge chunks with cosine similarity.
            </p>

            <form onSubmit={handleTestSearch} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="e.g. Can you build an e-commerce website for ₹50,000?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs disabled:opacity-50"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Results Display */}
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {searchResults?.chunks?.length > 0 ? (
                searchResults.chunks.map((chunk, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-blue">{chunk.metadata?.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px]">
                        Match: {Math.round(chunk.similarity * 100)}%
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{chunk.content}</p>
                  </div>
                ))
              ) : searchResults ? (
                <p className="text-xs text-slate-500 text-center py-6">No matching chunks above threshold.</p>
              ) : (
                <div className="p-6 rounded-2xl bg-navy-900/40 border border-slate-800/80 text-center text-xs text-slate-500">
                  Try sample query: "e-commerce pricing" or "warranty support policy"
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-brand-purple" /> 1536-dim OpenAI Embeddings</span>
            <span className="text-emerald-400 font-medium">Hybrid Cosine + BM25</span>
          </div>
        </div>
      </div>

      {/* Existing Ingested Documents Table */}
      <div className="glass-panel p-6 rounded-3xl border">
        <h3 className="font-bold text-white text-base mb-4">Ingested TechNova Knowledge Documents</h3>
        <div className="divide-y divide-slate-800/60 text-xs">
          {documents.map((doc) => (
            <div key={doc.id} className="py-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-semibold text-white text-sm">{doc.title}</p>
                <p className="text-slate-400 text-[11px]">{doc.category} • {doc.chunk_count || 3} Vector Chunks</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand-blue/15 text-brand-blue font-semibold text-[11px] border border-brand-blue/30">
                ACTIVE IN RAG
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
