-- ==========================================================
-- FORTIVEX AI – AUTONOMOUS AI SALES VOICE AGENT
-- Supabase PostgreSQL Schema with pgvector
-- Company: TechNova Solutions
-- ==========================================================

-- 1. Enable the pgvector extension for semantic similarity search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    requirements TEXT,
    budget VARCHAR(100),
    timeline VARCHAR(100),
    lead_status VARCHAR(20) DEFAULT 'WARM' CHECK (lead_status IN ('HOT', 'WARM', 'COLD')),
    sentiment VARCHAR(20) DEFAULT 'Neutral' CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
    qualification_reason TEXT,
    source VARCHAR(50) DEFAULT 'Voice Agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast status and created_at filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 3. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    call_duration INTEGER DEFAULT 0, -- Duration in seconds
    status VARCHAR(50) DEFAULT 'completed',
    sentiment VARCHAR(20) DEFAULT 'Neutral',
    sentiment_score NUMERIC(3, 2) DEFAULT 0.0,
    summary TEXT,
    action_items TEXT[],
    objections TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- 4. CALL TRANSCRIPTS TABLE
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    speaker VARCHAR(20) NOT NULL CHECK (speaker IN ('agent', 'customer', 'system')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sentiment VARCHAR(20) DEFAULT 'Neutral'
);

CREATE INDEX IF NOT EXISTS idx_transcripts_conv_id ON call_transcripts(conversation_id);

-- 5. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
    google_calendar_event_id VARCHAR(255),
    google_meet_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(scheduled_time);

-- 6. KNOWLEDGE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    file_type VARCHAR(50) DEFAULT 'text',
    file_size INTEGER DEFAULT 0,
    content TEXT,
    chunk_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. KNOWLEDGE CHUNKS TABLE (with pgvector embedding vector)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- 1536 dimensions for OpenAI text-embedding-3-small or ada-002
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IVFFlat or HNSW index for high-speed approximate nearest neighbor vector similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 8. RPC FUNCTION FOR COSINE SIMILARITY SEARCH
CREATE OR REPLACE FUNCTION match_knowledge_chunks (
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    similarity float,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        knowledge_chunks.id,
        knowledge_chunks.document_id,
        knowledge_chunks.content,
        1 - (knowledge_chunks.embedding <=> query_embedding) AS similarity,
        knowledge_chunks.metadata
    FROM knowledge_chunks
    WHERE 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users and public demo access policies
CREATE POLICY "Public read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update leads" ON leads FOR UPDATE USING (true);

CREATE POLICY "Public read conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Public insert conversations" ON conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read transcripts" ON call_transcripts FOR SELECT USING (true);
CREATE POLICY "Public insert transcripts" ON call_transcripts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Public insert appointments" ON appointments FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read knowledge" ON knowledge_documents FOR SELECT USING (true);
CREATE POLICY "Public read chunks" ON knowledge_chunks FOR SELECT USING (true);
