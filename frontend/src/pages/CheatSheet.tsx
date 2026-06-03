import { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { CHEAT_ENTRIES, CATEGORIES } from '../data/cheatsheet';

export default function CheatSheet() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = CHEAT_ENTRIES.filter((e) => {
    const matchCat = category === 'all' || e.category === category;
    const q = query.toLowerCase();
    const matchQuery = !q || e.title.toLowerCase().includes(q) ||
      e.command.toLowerCase().includes(q) ||
      e.tags.some((t) => t.includes(q));
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Cheat Sheet</h1>
        <p className="text-gray-500 text-sm">Searchable FFmpeg recipes for transcoding, HLS, DASH, filters, and audio.</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, flags, tags..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 placeholder-gray-600"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === id
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600">No commands match your search.</div>
        )}
        {filtered.map((entry) => (
          <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">{entry.title}</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                  {entry.category}
                </span>
              </div>
              <button
                onClick={() => copy(entry.id, entry.command)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="Copy command"
              >
                {copied === entry.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            <pre className="px-4 py-3 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {entry.command}
            </pre>
            <div className="px-4 py-2 border-t border-gray-800 bg-gray-950">
              <p className="text-xs text-gray-500">{entry.description}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {entry.tags.map((t) => (
                  <span key={t} className="text-xs text-gray-700">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
