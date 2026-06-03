import { Link } from 'react-router-dom';
import { Terminal, BookOpen, Sliders, List, Play, Zap, Shield, Code2 } from 'lucide-react';

const features = [
  {
    to: '/runner',
    icon: Terminal,
    title: 'FFmpeg Runner',
    description: 'Type real FFmpeg commands. Watch them execute server-side with live log streaming. Inspect output files instantly.',
    color: 'text-green-400',
    bg: 'bg-green-950 border-green-900',
  },
  {
    to: '/builder',
    icon: Sliders,
    title: 'Command Builder',
    description: 'Pick codec, bitrate, resolution, format. Command string updates live. No memorizing flags.',
    color: 'text-blue-400',
    bg: 'bg-blue-950 border-blue-900',
  },
  {
    to: '/tutorials',
    icon: BookOpen,
    title: 'Tutorials',
    description: 'Step-by-step guided modules: HLS basics, ABR ladder, codec comparison, filters. Run each command as you learn.',
    color: 'text-purple-400',
    bg: 'bg-purple-950 border-purple-900',
  },
  {
    to: '/cheatsheet',
    icon: List,
    title: 'Cheat Sheet',
    description: 'Searchable reference for 20+ FFmpeg recipes: transcoding, HLS, DASH, filters, audio normalization.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-950 border-yellow-900',
  },
  {
    to: '/player',
    icon: Play,
    title: 'Player Lab',
    description: 'Paste any HLS or DASH URL. Player renders with live debug: quality level, bandwidth, buffer health.',
    color: 'text-pink-400',
    bg: 'bg-pink-950 border-pink-900',
  },
];

const concepts = [
  'HLS Segmentation', 'Adaptive Bitrate (ABR)', 'MPEG-DASH / MPD',
  'H.264 / H.265 / AV1', 'CRF Quality Tuning', 'EBU R128 Loudness',
  'FFmpeg Filtergraphs', 'CMAF / fMP4', 'Codec Presets',
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-purple-950 border border-purple-800 text-purple-300 text-xs px-3 py-1 rounded-full mb-4">
          <Zap size={12} /> OTT & Video Engineering Playground
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          Learn Streaming &amp; FFmpeg<br />
          <span className="text-purple-400">by doing, not reading</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          One-stop interactive environment for OTT and video engineers.
          Run real FFmpeg commands, explore HLS/DASH, compare codecs, and debug player behavior.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/runner" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Open FFmpeg Runner
          </Link>
          <Link to="/tutorials" className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Start Tutorials
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {features.map(({ to, icon: Icon, title, description, color, bg }) => (
          <Link key={to} to={to} className={`${bg} border rounded-xl p-5 hover:scale-[1.02] transition-transform group`}>
            <Icon size={22} className={`${color} mb-3`} />
            <h3 className="text-white font-semibold mb-1">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>

      {/* Concepts covered */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code2 size={16} className="text-gray-500" />
          <h2 className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Topics Covered</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {concepts.map((c) => (
            <span key={c} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">{c}</span>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-500">
        <Shield size={16} className="text-gray-600 mt-0.5 shrink-0" />
        <span>FFmpeg commands run in a sandboxed subprocess. Network URLs, path traversal, and dangerous filter sources are blocked. Max upload 50MB, 60s timeout, 10 jobs/hour per IP.</span>
      </div>
    </div>
  );
}
