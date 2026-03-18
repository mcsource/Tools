import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, fetchTranscript, transcriptToText, getThumbnailUrl } from '@/lib/youtube';
import { analyzeVideo } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 120; // Vercel: allow up to 2 min for long videos

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'A YouTube URL is required.' }, { status: 400 });
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json({ error: 'Could not extract a valid YouTube video ID from that URL.' }, { status: 400 });
    }

    // Check if we already have a cached analysis
    const { data: existing } = await supabaseAdmin
      .from('video_analyses')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ analysis: existing, cached: true });
    }

    // Fetch transcript
    const { segments, available: transcriptAvailable } = await fetchTranscript(videoId);
    const transcriptText = transcriptAvailable ? transcriptToText(segments) : null;

    // Analyze with Gemini
    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const geminiResult = await analyzeVideo(canonicalUrl, transcriptText, transcriptAvailable);

    // Build record
    const record = {
      video_id: videoId,
      url: canonicalUrl,
      title: geminiResult.title || null,
      thumbnail_url: getThumbnailUrl(videoId),
      channel_name: geminiResult.channel_name || null,
      duration: geminiResult.duration || null,
      transcript_available: transcriptAvailable,
      summary: geminiResult.summary,
      key_insights: geminiResult.key_insights,
      categories: geminiResult.categories,
      visual_moments: geminiResult.visual_moments,
      raw_transcript: transcriptText,
    };

    const { data: saved, error: saveError } = await supabaseAdmin
      .from('video_analyses')
      .insert(record)
      .select()
      .single();

    if (saveError) {
      console.error('Supabase save error:', saveError);
      // Return result even if save failed
      return NextResponse.json({ analysis: { ...record, id: 'unsaved', created_at: new Date().toISOString() }, cached: false });
    }

    return NextResponse.json({ analysis: saved, cached: false });
  } catch (err) {
    console.error('Analyze error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
