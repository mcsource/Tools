'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Clock, Tag, Trash2, Search, Filter } from 'lucide-react';
import type { VideoAnalysis } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'stock_market', label: 'Stock Market' },
  { value: 'trading_signals', label: 'Trading Signals' },
  { value: 'investing_strategies', label: 'Investing' },
  { value: 'geopolitical', label: 'Geopolitical' },
  { value: 'ai_agents', label: 'AI Agents' },
  { value: 'macro_economics', label: 'Macro' },
  { value: 'crypto', label: 'Crypto' },
];

interface Props {
  onSelect: (analysis: VideoAnalysis) => void;
  currentId?: string;
}

type HistoryItem = Pick<
  VideoAnalysis,
  'id' | 'video_id' | 'url' | 'title' | 'thumbnail_url' | 'channel_name' | 'duration' | 'categories' | 'key_insights' | 'transcript_available' | 'created_at'
>;

export default function VideoHistory({ onSelect, currentId }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        category,
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();
      setItems(data.analyses || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this analysis?')) return;
    await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchHistory();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#1e1e2e]">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6b7280]" />
          History
          {total > 0 && (
            <span className="ml-auto text-xs text-[#6b7280] font-normal">{total} videos</span>
          )}
        </h2>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search videos..."
            className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#6b7280] focus:outline-none focus:border-blue-500/40 transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(1); }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                category === cat.value
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'text-[#6b7280] border-[#1e1e2e] hover:border-[#2e2e3e] hover:text-[#94a3b8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-xs text-[#6b7280]">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-xs text-[#6b7280]">No videos analyzed yet.</p>
            <p className="text-xs text-[#6b7280] mt-1">Paste a URL above to get started.</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item as VideoAnalysis)}
              className={`w-full flex gap-3 p-3 border-b border-[#1e1e2e] hover:bg-[#1a1a24] transition-all text-left group ${
                currentId === item.id ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-16 h-9 rounded bg-[#09090f] overflow-hidden">
                {item.thumbnail_url && (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.title || 'thumb'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white line-clamp-2 leading-snug">
                  {item.title || item.url}
                </p>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#6b7280] hover:text-red-400 transition-all p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-between p-3 border-t border-[#1e1e2e] text-xs text-[#6b7280]">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="disabled:opacity-30 hover:text-white transition-colors"
          >
            ← Prev
          </button>
          <span>{page} / {Math.ceil(total / 15)}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 15 >= total}
            className="disabled:opacity-30 hover:text-white transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
