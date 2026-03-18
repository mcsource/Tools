import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { SummaryPoint, VisualMoment } from './supabase';

export interface GeminiAnalysis {
  title: string;
  channel_name: string;
  duration: string;
  summary: SummaryPoint[];
  key_insights: string[];
  categories: string[];
  visual_moments: VisualMoment[];
}

const CATEGORY_LIST = [
  'stock_market', 'trading_signals', 'investing_strategies',
  'geopolitical', 'ai_agents', 'macro_economics', 'crypto', 'real_estate', 'other',
].join(', ');

function buildPrompt(transcriptText: string | null, hasTranscript: boolean): string {
  const transcriptSection = hasTranscript
    ? `\n\nTRANSCRIPT (timestamped — use for accurate quotes and moment timing):\n${transcriptText}`
    : `\n\nNOTE: No transcript available. Watch the full video carefully. Transcribe key spoken points and describe important visual moments yourself.`;

  return `You are an elite financial research analyst and content intelligence system.

Analyze this YouTube video thoroughly. Watch the full video including any charts, screen shares, price levels, ticker symbols, and on-screen graphics.
${transcriptSection}

Return ONLY a valid JSON object (no markdown fences, no explanation text) with this exact structure:

{
  "title": "full video title",
  "channel_name": "channel name",
  "duration": "H:MM:SS or MM:SS",
  "summary": [
    {
      "timestamp": "M:SS",
      "timestamp_ms": 12000,
      "point": "Concise actionable cliff-note (1-2 sentences — what was said/shown and why it matters)",
      "visual_context": "ONLY if a chart, ticker, price level, or graphic adds important context. Omit field if not applicable."
    }
  ],
  "key_insights": [
    "Top-level takeaway #1",
    "Top-level takeaway #2",
    "Top-level takeaway #3"
  ],
  "categories": ["pick all that apply from: ${CATEGORY_LIST}"],
  "visual_moments": [
    {
      "timestamp": "M:SS",
      "timestamp_ms": 45000,
      "description": "Specific description of a chart, price action, screen share, or graphic that adds context beyond words"
    }
  ]
}

Rules:
- summary: 8–20 bullet points covering the full video arc, in chronological order
- timestamp_ms: integer milliseconds from start (e.g. 1:23 = 83000)
- key_insights: 3–6 high-signal takeaways only — the "so what"
- visual_moments: only if visuals add meaningful context beyond speech
- Be specific — include ticker symbols ($AAPL), price levels, percentages, names, dates when mentioned
- For trading/investing content: call out entry signals, setups, risk levels, catalysts, timeframes`;
}

export async function analyzeVideo(
  videoUrl: string,
  transcriptText: string | null,
  hasTranscript: boolean
): Promise<GeminiAnalysis> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  const parts: Part[] = [
    // Pass the YouTube URL directly — Gemini watches the video natively
    {
      fileData: {
        mimeType: 'video/*',
        fileUri: videoUrl,
      },
    },
    // Analysis prompt (includes transcript if available)
    { text: buildPrompt(transcriptText, hasTranscript) },
  ];

  const result = await model.generateContent(parts);
  const content = result.response.text();

  if (!content) throw new Error('No content returned from Gemini');

  try {
    const parsed = JSON.parse(content) as GeminiAnalysis;
    parsed.summary       = parsed.summary       || [];
    parsed.key_insights  = parsed.key_insights  || [];
    parsed.categories    = parsed.categories    || ['other'];
    parsed.visual_moments = parsed.visual_moments || [];
    return parsed;
  } catch {
    throw new Error(`Failed to parse Gemini response: ${content.slice(0, 300)}`);
  }
}
