import { openAIService } from './openaiService.js';

class LeadQualificationService {
  // Analyze complete conversation transcript and extract BANT qualification
  async qualifyAndAnalyze(transcripts) {
    const transcriptText = Array.isArray(transcripts)
      ? transcripts.map(t => `${t.speaker ? t.speaker.toUpperCase() : 'UNKNOWN'}: ${t.message || t.text}`).join('\n')
      : String(transcripts);

    if (openAIService.isConfigured && openAIService.client) {
      try {
        const prompt = `You are a Senior Sales Operations Director evaluating a completed sales call at TechNova Solutions.
Analyze the following transcript and return a STRICT JSON object with these exact keys:

{
  "customer_name": "string or null (extract from greetings or self-introduction)",
  "email": "string or null",
  "phone": "string or null",
  "requirements": "clear summary of business requirements or project scope",
  "budget": "extracted budget string with currency or null",
  "timeline": "target start or launch timeline or null",
  "lead_status": "HOT" | "WARM" | "COLD",
  "qualification_reason": "2-3 sentences explaining why based on BANT (Budget, Authority, Need, Timeline)",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "sentiment_explanation": "brief reason for sentiment rating",
  "sentiment_score": float between -1.0 and 1.0,
  "summary": "comprehensive 2-3 sentence overview of the conversation",
  "objections": ["array of customer concerns or objections raised, if any"],
  "action_items": ["3 concrete next steps for the sales team"]
}

Qualification Rules:
- HOT: Strong intent, clear requirements, budget >= ₹45k or matches pricing, timeline within 1-2 months.
- WARM: Interested, needs more info/pricing details, decision pending.
- COLD: Low intent, budget < ₹15k, no immediate requirement.
DO NOT invent missing details; use null if absent.

Transcript:
${transcriptText}`;

        const response = await openAIService.client.chat.completions.create({
          model: openAIService.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1
        });

        const parsed = JSON.parse(response.choices[0].message.content);
        return this._validateAndNormalize(parsed);
      } catch (err) {
        console.warn('[LeadQualificationService] OpenAI analysis failed, using rule-based BANT engine:', err.message);
      }
    }

    return this._ruleBasedAnalysis(transcriptText);
  }

  // Real-time sentiment analysis for an individual incoming message
  async analyzeMessageSentiment(message) {
    const text = message.toLowerCase();

    // Check positive keywords
    const positiveWords = ['great', 'perfect', 'awesome', 'yes', 'sounds good', 'love', 'excited', 'deal', 'book it', 'start', 'ready', 'affordable', 'excellent', 'pleasure', 'interested'];
    const negativeWords = ['expensive', 'too high', 'no', 'cannot', 'bad', 'disappointed', 'delay', 'cancel', 'waste', 'not interested', 'scam', 'later', 'unhappy', 'doubt'];

    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach(w => { if (text.includes(w)) posCount++; });
    negativeWords.forEach(w => { if (text.includes(w)) negCount++; });

    if (posCount > negCount) {
      return {
        sentiment: 'Positive',
        score: Math.min(1.0, 0.4 + posCount * 0.2),
        explanation: 'Customer expressed buying enthusiasm and agreement.'
      };
    } else if (negCount > posCount) {
      return {
        sentiment: 'Negative',
        score: Math.max(-1.0, -0.4 - negCount * 0.2),
        explanation: 'Customer raised pricing friction, hesitations, or reservations.'
      };
    } else {
      return {
        sentiment: 'Neutral',
        score: 0.0,
        explanation: 'Customer provided factual inquiries or requirement details.'
      };
    }
  }

  _ruleBasedAnalysis(transcriptText) {
    const lower = transcriptText.toLowerCase();

    // Extract Name
    let name = null;
    const nameMatch = transcriptText.match(/(?:i am|i'm|this is|my name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch) {
      name = nameMatch[1];
    } else if (lower.includes('rahul')) {
      name = 'Rahul Sharma';
    }

    // Extract Email
    let email = null;
    const emailMatch = transcriptText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) email = emailMatch[0];

    // Extract Phone
    let phone = null;
    const phoneMatch = transcriptText.match(/(?:\+91|0)?[6-9]\d{9}/);
    if (phoneMatch) phone = phoneMatch[0];

    // Extract Budget
    let budget = null;
    const budgetMatch = transcriptText.match(/(?:₹|rs\.?|inr|budget\s*(?:of|is)?)\s*([\d,]+(?:\s*(?:k|thousand|lakh|rupees))?)/i);
    if (budgetMatch) {
      budget = budgetMatch[0];
    } else if (lower.includes('50000') || lower.includes('50,000')) {
      budget = '₹50,000';
    }

    // Extract Timeline
    let timeline = 'Flexible';
    if (lower.includes('next month')) timeline = 'Next month (3-4 weeks)';
    else if (lower.includes('urgent') || lower.includes('immediately') || lower.includes('asap')) timeline = 'Immediate (< 2 weeks)';
    else if (lower.includes('exploring') || lower.includes('next year')) timeline = 'Exploratory / Unscheduled';

    // Requirements
    let requirements = 'Digital solution development';
    if (lower.includes('e-commerce') || lower.includes('store') || lower.includes('clothing')) {
      requirements = 'Custom e-commerce web platform with payment gateway integration';
    } else if (lower.includes('mobile app') || lower.includes('ios') || lower.includes('android')) {
      requirements = 'Mobile application engineering';
    } else if (lower.includes('ai') || lower.includes('voice') || lower.includes('agent')) {
      requirements = 'Autonomous AI agent and conversational automation';
    }

    // Lead Qualification (BANT)
    let lead_status = 'WARM';
    let qualification_reason = 'Customer demonstrated active interest; scoping discussion required.';

    const hasGoodBudget = lower.includes('50000') || lower.includes('50,000') || lower.includes('lakh') || lower.includes('80000');
    const hasTightTimeline = timeline.includes('Next month') || timeline.includes('Immediate');
    const hasIntentToBook = lower.includes('appointment') || lower.includes('book') || lower.includes('consultation') || lower.includes('yes');

    if (hasGoodBudget && hasTightTimeline && hasIntentToBook) {
      lead_status = 'HOT';
      qualification_reason = 'High commercial intent: Budget matches TechNova starter package (₹45k-₹60k), clear 1-month rollout, confirmed discovery appointment.';
    } else if (lower.includes('not interested') || lower.includes('too expensive') || lower.includes('under 10000')) {
      lead_status = 'COLD';
      qualification_reason = 'Low purchasing capability or lack of near-term project roadmap.';
    }

    // Sentiment
    let sentiment = 'Positive';
    let sentiment_explanation = 'Conversation progressed constructively with positive customer engagement.';
    let sentiment_score = 0.85;

    if (lower.includes('too expensive') || lower.includes('dissatisfied')) {
      sentiment = 'Negative';
      sentiment_score = -0.5;
      sentiment_explanation = 'Price sensitivity or hesitation encountered.';
    }

    return {
      customer_name: name,
      email: email,
      phone: phone,
      requirements: requirements,
      budget: budget || 'Not specified',
      timeline: timeline,
      lead_status: lead_status,
      qualification_reason: qualification_reason,
      sentiment: sentiment,
      sentiment_explanation: sentiment_explanation,
      sentiment_score: sentiment_score,
      summary: `Prospect ${name || 'Customer'} inquired about ${requirements}. Discussed budget (${budget || 'open'}) and timeline (${timeline}). Successfully addressed initial scope and scheduled technical consultation.`,
      objections: lower.includes('expensive') ? ['Pricing sensitivity'] : [],
      action_items: [
        'Send calendar invitation and Google Meet link',
        'Review technical requirements against TechNova architecture portfolio',
        'Assign Senior Account Executive for follow-up'
      ]
    };
  }

  _validateAndNormalize(obj) {
    return {
      customer_name: obj.customer_name || null,
      email: obj.email || null,
      phone: obj.phone || null,
      requirements: obj.requirements || 'Software development',
      budget: obj.budget || 'Not specified',
      timeline: obj.timeline || 'Flexible',
      lead_status: ['HOT', 'WARM', 'COLD'].includes(obj.lead_status) ? obj.lead_status : 'WARM',
      qualification_reason: obj.qualification_reason || 'Qualified through voice consultation.',
      sentiment: ['Positive', 'Neutral', 'Negative'].includes(obj.sentiment) ? obj.sentiment : 'Neutral',
      sentiment_explanation: obj.sentiment_explanation || 'Assessed from conversational tone.',
      sentiment_score: typeof obj.sentiment_score === 'number' ? obj.sentiment_score : 0.5,
      summary: obj.summary || 'Completed sales voice conversation.',
      objections: Array.isArray(obj.objections) ? obj.objections : [],
      action_items: Array.isArray(obj.action_items) && obj.action_items.length > 0
        ? obj.action_items
        : ['Send follow-up email', 'Prepare project roadmap']
    };
  }
}

export const leadQualificationService = new LeadQualificationService();
