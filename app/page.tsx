'use client';

import { useState } from 'react';
import { Zap, AlertCircle, X, PanelRight, PanelRightClose } from 'lucide-react';
import AnalyzerForm from '@/components/AnalyzerForm';
import AnalysisResult from '@/components/AnalysisResult';
import VideoHistory from '@/components/VideoHistory';
import type { VideoAnalysis } from '@/lib/supabase';

export default function Home() {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const [historyKey, setHistoryKey] = useState(0);

  function handleResult(data: unknown) {
    setAnalysis(data as VideoAnalysis);
    setHistoryKey((k) => k + 1); // refresh history
  }

  function handleHistorySelect(item: VideoAnalysis) {
    // Fetch full analysis record
    fetch(`/api/analysis/${item.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.analysis) setAnalysis(data.analysis);
        else setAnalysis(item);
      })
      .catch(() => setAnalysis(item));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090f]">
      {/* Sidebar — History */}
      {showHistory && (
        <aside className="w-72 flex-shrink-0 bg-[#111118] border-r border-[#1e1e2e] flex flex-col overflow-hidden">
          <VideoHistory
            key={historyKey}
            onSelect={handleHistorySelect}
            currentId={analysis?.id}
          />
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 text-[#6b7280] hover:text-white hover:bg-[#1e1e2e] rounded-lg transition-all"
            title={showHistory ? 'Hide history' : 'Show history'}
          >
            {showHistory ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">YouTube Video Analyzer</h1>
              <p className="text-xs text-[#6b7280] leading-none mt-0.5">Powered by Gemini 2.0 Flash</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-[#6b7280]">Ready</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Input */}
            <div className="mb-6">
              <AnalyzerForm
                onResult={handleResult}
                onError={setError}
                loading={loading}
                setLoading={setLoading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 flex-1">{error}</p>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Results */}
            {analysis && !loading && (
              <AnalysisResult
                analysis={analysis}
                onClose={() => setAnalysis(null)}
              />
            )}

            {/* Empty state */}
            {!analysis && !loading && !error && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#111118] border border-[#1e1e2e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-[#6b7280]" />
                </div>
                <h2 className="text-base font-medium text-white mb-2">Paste a YouTube URL to begin</h2>
                <p className="text-sm text-[#6b7280] max-w-md mx-auto">
                  Gemini will watch the video, pull key insights with timestamps, detect visual moments,
                  and auto-categorize by topic — stocks, signals, geopolitics, AI, and more.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs text-[#6b7280]">
                  {[
                    ['Cliff Notes', 'Timestamped bullet points of every key moment'],
                    ['AI Vision', 'Charts, tickers, and screen shares captured'],
                    ['Smart Tags', 'Auto-categorized by topic'],
                    ['Export', 'Download as Markdown or JSON'],
                  ].map(([title, desc]) => (
                    <div key={title} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3 text-left">
                      <p className="text-white font-medium mb-1">{title}</p>
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
