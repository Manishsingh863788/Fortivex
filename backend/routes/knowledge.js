import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { ragService } from '../services/ragService.js';
import { supabaseService } from '../services/supabaseService.js';
import { openAIService } from '../services/openaiService.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// GET /api/knowledge - List knowledge documents
router.get('/', async (req, res) => {
  try {
    const docs = await supabaseService.getKnowledgeDocuments();
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/knowledge/search - Semantic vector search
router.post('/search', async (req, res) => {
  try {
    const { query, topK = 3, threshold = 0.2 } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query text is required' });
    }

    const result = await ragService.retrieveContext(query, { topK, threshold });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/knowledge/upload - Upload file or direct text content
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    let title = req.body.title || 'Untitled Document';
    let category = req.body.category || 'General';
    let content = req.body.content || '';
    let fileType = 'text';
    let fileSize = 0;

    if (req.file) {
      title = title === 'Untitled Document' ? req.file.originalname : title;
      fileSize = req.file.size;
      
      if (req.file.mimetype === 'application/pdf') {
        fileType = 'pdf';
        const parsed = await pdfParse(req.file.buffer);
        content = parsed.text;
      } else {
        content = req.file.buffer.toString('utf-8');
      }
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Document has no text content to extract' });
    }

    // Chunk text
    const chunks = ragService.chunkText(content, { chunkSize: 350, overlap: 60 });
    const processedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const embedding = await openAIService.getEmbedding(c);
      processedChunks.push({
        content: c,
        embedding: embedding,
        metadata: {
          title,
          category,
          chunkIndex: i
        }
      });
    }

    const saved = await supabaseService.saveKnowledgeDocument(
      { title, category, file_type: fileType, file_size: fileSize, content },
      processedChunks
    );

    res.status(201).json({
      success: true,
      message: `Document processed and split into ${processedChunks.length} searchable vector chunks.`,
      data: saved
    });
  } catch (err) {
    console.error('[KnowledgeUploadError]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
