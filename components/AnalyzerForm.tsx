'use client';

import { useState } from 'react';
import { Search, Loader2, Youtube } from 'lucide-react';

interface Props {
  onResult: (analysis: unknown) => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function AnalyzerForm({ onResult, onError, loading, setLoading }: Props) {
  const [url, setUrl] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    onError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.error || 'Analysis failed. Please try again.');
        return;
      }

      onResult(data.analysis);
    } catch {
      onError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const exampleUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/VIDEO_ID',
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-3">
        {/* URL Input */}
        <div className="flex-1 relative">
          <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any YouTube URL..."
            className="w-full bg-[#111118] border border-[#1e1e2e] rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all text-base"
            disabled={loading}
            required
          />
        </div>

        {/* Analyze Button */}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl text-sm transition-all duration-150 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-[#6b7280] mt-2 pl-1">
        Supports youtube.com/watch, youtu.be, youtube.com/shorts, and raw video IDs
      </p>

      {/* Loading state detail */}
      {loading && (
        <div className="mt-4 flex items-center gap-3 text-sm text-[#94a3b8] bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Gemini is watching and analyzing the video — this may take 15–60 seconds...</span>
        </div>
      )}
    </form>
  );
}
