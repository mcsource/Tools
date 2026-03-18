import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  offset: number; // ms
  duration: number;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // bare video ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function buildTimestampLink(videoId: string, ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}

export async function fetchTranscript(
  videoId: string
): Promise<{ segments: TranscriptSegment[]; available: boolean }> {
  try {
    const raw = await YoutubeTranscript.fetchTranscript(videoId);
    const segments: TranscriptSegment[] = raw.map((s) => ({
      text: s.text,
      offset: s.offset,
      duration: s.duration,
    }));
    return { segments, available: true };
  } catch {
    return { segments: [], available: false };
  }
}

export function transcriptToText(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${formatTimestamp(s.offset)}] ${s.text}`)
    .join('\n');
}
