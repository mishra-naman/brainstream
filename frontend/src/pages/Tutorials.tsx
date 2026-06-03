import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { Tutorial, TutorialSummary } from '../types';
import TutorialStepper from '../components/TutorialStepper/TutorialStepper';

const CATEGORY_COLORS: Record<string, string> = {
  hls: 'bg-blue-900 text-blue-300',
  dash: 'bg-cyan-900 text-cyan-300',
  codec: 'bg-orange-900 text-orange-300',
  ffmpeg: 'bg-green-900 text-green-300',
  live: 'bg-red-900 text-red-300',
};

export default function Tutorials() {
  const [list, setList] = useState<TutorialSummary[]>([]);
  const [selected, setSelected] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<TutorialSummary[]>('/api/tutorials/').then((r) => {
      setList(r.data);
      setLoading(false);
    });
  }, []);

  const open = async (slug: string) => {
    const r = await axios.get<Tutorial>(`/api/tutorials/${slug}/`);
    setSelected(r.data);
  };

  const handleRunCommand = (command: string) => {
    navigate('/runner', { state: { command } });
  };

  if (loading) return <div className="text-center py-20 text-gray-600">Loading tutorials...</div>;

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-6 transition-colors"
        >
          ← Back to tutorials
        </button>
        <div className="mb-4">
          <span className={`text-xs px-2 py-0.5 rounded font-mono mr-2 ${CATEGORY_COLORS[selected.category] ?? 'bg-gray-800 text-gray-400'}`}>
            {selected.category.toUpperCase()}
          </span>
          <h1 className="text-2xl font-bold text-white mt-2">{selected.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{selected.description}</p>
        </div>
        <TutorialStepper tutorial={selected} onRunCommand={handleRunCommand} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Tutorials</h1>
        <p className="text-gray-500 text-sm">Guided step-by-step modules. Each command is runnable in the FFmpeg Runner.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map((t) => (
          <button
            key={t.slug}
            onClick={() => open(t.slug)}
            className="text-left bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <BookOpen size={18} className="text-purple-400 mt-0.5" />
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${CATEGORY_COLORS[t.category] ?? 'bg-gray-800 text-gray-400'}`}>
                {t.category.toUpperCase()}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors">{t.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-3">{t.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{t.step_count} steps</span>
              <ChevronRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
