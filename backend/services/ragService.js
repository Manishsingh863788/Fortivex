import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openAIService } from './openaiService.js';
import { supabaseService } from './supabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_PATH = path.join(__dirname, '..', 'data', 'knowledge_base', 'technova_knowledge.json');

class RAGService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const existingDocs = await supabaseService.getKnowledgeDocuments();
      if (existingDocs.length === 0 && fs.existsSync(KB_PATH)) {
        console.log('[RAGService] Seeding default TechNova knowledge base documents...');
        const raw = fs.readFileSync(KB_PATH, 'utf-8');
        const docs = JSON.parse(raw);

        for (const doc of docs) {
          const chunks = this.chunkText(doc.content, { chunkSize: 350, overlap: 60 });
          const processedChunks = [];
          for (let i = 0; i < chunks.length; i++) {
            const chunkContent = chunks[i];
            const embedding = await openAIService.getEmbedding(chunkContent);
            processedChunks.push({
              content: chunkContent,
              embedding: embedding,
              metadata: {
                title: doc.title,
                category: doc.category,
                chunkIndex: i
              }
            });
          }
          await supabaseService.saveKnowledgeDocument(doc, processedChunks);
        }
        console.log(`[RAGService] Successfully seeded ${docs.length} knowledge documents.`);
      }
      this.initialized = true;
    } catch (err) {
      console.error('[RAGService] Error during initialization:', err);
    }
  }

  // Text chunking with sliding window and overlap
  chunkText(text, { chunkSize = 350, overlap = 60 } = {}) {
    const cleanText = text.replace(/\r\n/g, '\n').trim();
    if (!cleanText) return [];

    const chunks = [];
    let start = 0;

    while (start < cleanText.length) {
      let end = start + chunkSize;
      if (end >= cleanText.length) {
        chunks.push(cleanText.substring(start).trim());
        break;
      }

      // Try to break on newline or sentence end
      let breakPoint = cleanText.lastIndexOf('\n', end);
      if (breakPoint <= start || breakPoint < end - 100) {
        breakPoint = cleanText.lastIndexOf('. ', end);
      }
      if (breakPoint <= start || breakPoint < end - 100) {
        breakPoint = cleanText.lastIndexOf(' ', end);
      }
      if (breakPoint <= start) {
        breakPoint = end;
      }

      chunks.push(cleanText.substring(start, breakPoint).trim());
      start = breakPoint - overlap;
      if (start < 0) start = 0;
      if (start >= cleanText.length) break;
    }

    return chunks.filter(c => c.length > 10);
  }

  // Cosine similarity between two float vectors
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const mag = Math.sqrt(normA) * Math.sqrt(normB);
    return mag === 0 ? 0 : dot / mag;
  }

  // Keyword lexical relevance score (BM25-style term frequency)
  keywordRelevance(query, text) {
    const qTokens = query.toLowerCase().match(/\b\w+\b/g) || [];
    const tLower = text.toLowerCase();
    if (qTokens.length === 0) return 0;

    let matches = 0;
    for (const token of qTokens) {
      if (token.length > 2 && tLower.includes(token)) {
        matches++;
      }
    }
    return matches / qTokens.length;
  }

  // Retrieve top-k relevant knowledge chunks
  async retrieveContext(query, { topK = 3, threshold = 0.25 } = {}) {
    await this.initialize();

    const queryEmbedding = await openAIService.getEmbedding(query);
    const allChunks = await supabaseService.getAllChunks();

    if (!allChunks || allChunks.length === 0) {
      return { chunks: [], formattedContext: '' };
    }

    const scored = allChunks.map(chunk => {
      let vecSim = 0;
      if (chunk.embedding && queryEmbedding) {
        vecSim = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      }
      const kwSim = this.keywordRelevance(query, chunk.content);
      // Hybrid score: 70% dense vector + 30% sparse lexical
      const hybridScore = Number((0.7 * vecSim + 0.3 * kwSim).toFixed(4));

      return {
        id: chunk.id,
        content: chunk.content,
        metadata: chunk.metadata || {},
        similarity: hybridScore,
        denseScore: Number(vecSim.toFixed(4)),
        lexicalScore: Number(kwSim.toFixed(4))
      };
    });

    const relevant = scored
      .filter(s => s.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    const formattedContext = relevant
      .map((c, i) => `[Source ${i + 1} (${c.metadata?.title || 'TechNova Document'})]: ${c.content}`)
      .join('\n\n');

    return {
      chunks: relevant,
      formattedContext,
      query
    };
  }
}

export const ragService = new RAGService();
