'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ExternalLink, Download, Clock, Tag, Eye, ChevronDown, ChevronUp,
  Lightbulb, Film, FileText, Camera
} from 'lucide-react';
import type { VideoAnalysis, SummaryPoint, VisualMoment } from '@/lib/supabase';

const CATEGORY_LABELS: Record<string, string> = {
  stock_market: 'Stock Market',
  trading_signals: 'Trading Signals',
  investing_strategies: 'Investing Strategies',
  geopolitical: 'Geopolitical',
  ai_agents: 'AI Agents',
  macro_economics: 'Macro Economics',
  crypto: 'Crypto',
  real_estate: 'Real Estate',
  other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  stock_market:          'bg-green-500/10 text-green-400 border-green-500/20',
  trading_signals:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  investing_strategies:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  geopolitical:          'bg-red-500/10 text-red-400 border-red-500/20',
  ai_agents:             'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  macro_economics:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  crypto:                'bg-orange-500/10 text-orange-400 border-orange-500/20',
  real_estate:           'bg-teal-500/10 text-teal-400 border-teal-500/20',
  other:                 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

interface Props {
  analysis: VideoAnalysis;
  onClose?: () => void;
}

export default function AnalysisResult({ analysis, onClose }: Props) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVisuals, setShowVisuals] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const summary = (analysis.summary || []) as SummaryPoint[];
  const visualMoments = (analysis.visual_moments || []) as VisualMoment[];

  async function handleExport(format: 'markdown' | 'json') {
    setExportLoading(true);
    try {
      const res = await fetch(`/api/export/${analysis.id}?format=${format}`);
      const blob = await res.blob();
      const ext = format === 'markdown' ? 'md' : 'json';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${analysis.id.slice(0, 8)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* Video Header */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl overflow-hidden mb-4">
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-36 h-20 rounded-lg overflow-hidden bg-[#09090f]">
            {analysis.thumbnail_url && (
              <Image
                src={analysis.thumbnail_url}
                alt={analysis.title || 'Video thumbnail'}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-white leading-snug line-clamp-2 mb-1">
              {analysis.title || 'Untitled Video'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#6b7280] mb-2">
              {analysis.channel_name && <span>{analysis.channel_name}</span>}
              {analysis.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {analysis.duration}
                </span>
              )}
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${
                analysis.transcript_available
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              }`}>
                {analysis.transcript_available ? (
                  <><FileText className="w-3 h-3" /> Transcript</>
                ) : (
                  <><Eye className="w-3 h-3" /> AI Vision</>
                )}
              </span>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1.5">
              {(analysis.categories || []).map((cat) => (
                <span
                  key={cat}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${
                    CATEGORY_COLORS[cat] || CATEGORY_COLORS.other
                  }`}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {CATEGORY_LABELS[cat] || cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#1e1e2e]">
          <a
            href={analysis.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in YouTube
          </a>
          <span className="text-[#1e1e2e]">|</span>
          <button
            onClick={() => handleExport('markdown')}
            disabled={exportLoading || analysis.id === 'unsaved'}
            className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export Markdown
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exportLoading || analysis.id === 'unsaved'}
            className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Key Insights */}
      {analysis.key_insights && analysis.key_insights.length > 0 && (
        <div className="bg-[#111118] border border-blue-500/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-300">Key Insights</h3>
          </div>
          <ul className="space-y-2">
            {analysis.key_insights.map((insight, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-[#e2e8f0]">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-mono font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cliff Notes */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Film className="w-4 h-4 text-[#94a3b8]" />
          <h3 className="text-sm font-semibold text-white">Cliff Notes</h3>
          <span className="ml-auto text-xs text-[#6b7280]">{summary.length} points</span>
        </div>

        <div className="space-y-0">
          {summary.map((point, i) => {
            const tsSeconds = Math.floor(point.timestamp_ms / 1000);
            const ytLink = `${analysis.url}&t=${tsSeconds}s`;

            return (
              <div
                key={i}
                className="flex gap-3 py-3 border-b border-[#1e1e2e] last:border-0 group"
              >
                {/* Timestamp */}
                <a
                  href={ytLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 font-mono text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2 py-1 rounded-md transition-all whitespace-nowrap"
                >
                  {point.timestamp}
                </a>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e2e8f0] leading-relaxed">{point.point}</p>
                  {point.visual_context && (
                    <div className="mt-1.5 flex gap-1.5 text-xs text-[#94a3b8] bg-[#09090f] rounded-lg px-2.5 py-1.5 border border-[#1e1e2e]">
                      <Camera className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />
                      <span>{point.visual_context}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Moments (collapsible) */}
      {visualMoments.length > 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-4 mb-4">
          <button
            onClick={() => setShowVisuals(!showVisuals)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Visual Moments</h3>
              <span className="text-xs text-[#6b7280]">{visualMoments.length} captured</span>
            </div>
            {showVisuals ? (
              <ChevronUp className="w-4 h-4 text-[#6b7280]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6b7280]" />
            )}
          </button>

          {showVisuals && (
            <div className="mt-3 space-y-2">
              {visualMoments.map((vm, i) => {
                const tsSeconds = Math.floor(vm.timestamp_ms / 1000);
                const ytLink = `${analysis.url}&t=${tsSeconds}s`;
                return (
                  <div key={i} className="flex gap-3 text-sm">
                    <a
                      href={ytLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 font-mono text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md transition-all"
                    >
                      {vm.timestamp}
                    </a>
                    <p className="text-[#94a3b8] leading-relaxed">{vm.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Raw Transcript (collapsible) */}
      {analysis.raw_transcript && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-4">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#6b7280]" />
              <h3 className="text-sm font-semibold text-[#94a3b8]">Raw Transcript</h3>
            </div>
            {showTranscript ? (
              <ChevronUp className="w-4 h-4 text-[#6b7280]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6b7280]" />
            )}
          </button>

          {showTranscript && (
            <pre className="mt-3 text-xs text-[#6b7280] whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
              {analysis.raw_transcript}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
