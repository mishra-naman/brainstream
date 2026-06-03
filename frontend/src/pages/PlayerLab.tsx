import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, ExternalLink } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';

const DEMO_STREAMS = [
  { label: 'Apple WWDC (HLS)', url: 'https://devstreaming-cdn.apple.com/videos/wwdc/2019/244gmopitz5ezs2kkq/244/hls_vod_mvp.m3u8' },
  { label: 'Akamai test (HLS)', url: 'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8' },
];

export default function PlayerLab() {
  const location = useLocation();
  const initialUrl = (location.state as { url?: string })?.url ?? '';
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [activeUrl, setActiveUrl] = useState(initialUrl);

  const load = () => setActiveUrl(inputUrl.trim());

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Player Lab</h1>
        <p className="text-gray-500 text-sm">Paste any HLS (.m3u8) or DASH (.mpd) URL. Inspect quality level, bandwidth, and buffer in real time.</p>
      </div>

      {/* URL Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="https://example.com/stream/playlist.m3u8"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500 placeholder-gray-600 font-mono"
        />
        <button
          onClick={load}
          disabled={!inputUrl.trim()}
          className="bg-purple-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <Play size={14} /> Load
        </button>
      </div>

      {/* Demo streams */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-gray-600 self-center">Demo streams:</span>
        {DEMO_STREAMS.map((s) => (
          <button
            key={s.url}
            onClick={() => { setInputUrl(s.url); setActiveUrl(s.url); }}
            className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 px-2.5 py-1 rounded transition-colors"
          >
            <ExternalLink size={10} /> {s.label}
          </button>
        ))}
      </div>

      {/* Player */}
      {activeUrl ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <VideoPlayer url={activeUrl} />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-600 font-mono truncate">{activeUrl}</span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Play size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Enter a stream URL above or run a command in FFmpeg Runner to generate one.</p>
        </div>
      )}
    </div>
  );
}
