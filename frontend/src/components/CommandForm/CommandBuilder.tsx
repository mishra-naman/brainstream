import { useState, useEffect } from 'react';

interface BuilderState {
  inputFormat: string;
  codec: string;
  crf: number;
  preset: string;
  resolution: string;
  outputFormat: string;
  audioBitrate: string;
  extraFilter: string;
}

const CODECS: Record<string, { lib: string; crfDefault: number; label: string }> = {
  h264: { lib: 'libx264', crfDefault: 23, label: 'H.264 (AVC)' },
  h265: { lib: 'libx265', crfDefault: 28, label: 'H.265 (HEVC)' },
  av1: { lib: 'libaom-av1', crfDefault: 30, label: 'AV1 (libaom)' },
  vp9: { lib: 'libvpx-vp9', crfDefault: 30, label: 'VP9' },
  copy: { lib: 'copy', crfDefault: 0, label: 'Copy (no transcode)' },
};

const RESOLUTIONS = ['original', '1080', '720', '480', '360'];
const PRESETS = ['ultrafast', 'fast', 'medium', 'slow', 'veryslow'];
const OUTPUT_FORMATS = [
  { value: 'mp4', label: 'MP4' },
  { value: 'm3u8', label: 'HLS (.m3u8)' },
  { value: 'mpd', label: 'DASH (.mpd)' },
  { value: 'webm', label: 'WebM' },
];

function buildCommand(s: BuilderState): string {
  const codec = CODECS[s.codec];
  if (!codec) return '';

  const parts: string[] = ['ffmpeg', '-i', 'input.' + (s.inputFormat || 'mp4')];

  // Video
  if (s.codec === 'copy') {
    parts.push('-c:v', 'copy');
  } else {
    parts.push('-c:v', codec.lib);
    if (s.codec !== 'copy' && s.crf > 0) {
      if (s.codec === 'vp9') {
        parts.push('-crf', String(s.crf), '-b:v', '0');
      } else {
        parts.push('-crf', String(s.crf));
      }
    }
    if (['h264', 'h265'].includes(s.codec)) {
      parts.push('-preset', s.preset);
    }
  }

  // Scale filter
  const filters: string[] = [];
  if (s.resolution !== 'original') {
    filters.push(`scale=-2:${s.resolution}`);
  }
  if (s.extraFilter) filters.push(s.extraFilter);
  if (filters.length) parts.push('-vf', `"${filters.join(',')}"`);

  // Audio
  const audioLib = s.outputFormat === 'webm' ? 'libopus' : 'aac';
  parts.push('-c:a', audioLib, '-b:a', s.audioBitrate);

  // HLS-specific
  if (s.outputFormat === 'm3u8') {
    parts.push('-hls_time', '6', '-hls_list_size', '0', '-hls_segment_filename', 'seg_%03d.ts');
  }

  // DASH-specific
  if (s.outputFormat === 'mpd') {
    parts.push('-f', 'dash', '-seg_duration', '6');
  }

  // Output
  parts.push(`output.${s.outputFormat}`);
  return parts.join(' ');
}

const PARAM_HINTS: Record<string, string> = {
  codec: 'Video codec determines compression efficiency and compatibility.',
  crf: 'CRF = Constant Rate Factor. Quality-based encoding. Lower = better quality, larger file.',
  preset: 'Encoding speed vs compression tradeoff. Slower preset = better compression.',
  resolution: 'Output video height in pixels. Width auto-calculated to keep aspect ratio.',
  outputFormat: 'Container or protocol format for output.',
  audioBitrate: 'Compressed audio bitrate. 128k is fine for stereo.',
};

interface Props {
  onCommandReady?: (cmd: string) => void;
}

export default function CommandBuilderForm({ onCommandReady }: Props) {
  const [state, setState] = useState<BuilderState>({
    inputFormat: 'mp4',
    codec: 'h264',
    crf: 23,
    preset: 'medium',
    resolution: 'original',
    outputFormat: 'mp4',
    audioBitrate: '128k',
    extraFilter: '',
  });
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const command = buildCommand(state);

  useEffect(() => {
    const codec = CODECS[state.codec];
    if (codec) setState((s) => ({ ...s, crf: codec.crfDefault }));
  }, [state.codec]);

  const set = (key: keyof BuilderState) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setState((s) => ({ ...s, [key]: e.target.type === 'range' ? Number(e.target.value) : e.target.value }));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Codec */}
        <div onMouseEnter={() => setActiveHint('codec')} onMouseLeave={() => setActiveHint(null)}>
          <label className="block text-xs text-gray-400 mb-1">Video Codec</label>
          <select value={state.codec} onChange={set('codec')} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500">
            {Object.entries(CODECS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Resolution */}
        <div onMouseEnter={() => setActiveHint('resolution')} onMouseLeave={() => setActiveHint(null)}>
          <label className="block text-xs text-gray-400 mb-1">Resolution</label>
          <select value={state.resolution} onChange={set('resolution')} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500">
            {RESOLUTIONS.map((r) => (
              <option key={r} value={r}>{r === 'original' ? 'Original' : `${r}p`}</option>
            ))}
          </select>
        </div>

        {/* Output Format */}
        <div onMouseEnter={() => setActiveHint('outputFormat')} onMouseLeave={() => setActiveHint(null)}>
          <label className="block text-xs text-gray-400 mb-1">Output Format</label>
          <select value={state.outputFormat} onChange={set('outputFormat')} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500">
            {OUTPUT_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Audio Bitrate */}
        <div onMouseEnter={() => setActiveHint('audioBitrate')} onMouseLeave={() => setActiveHint(null)}>
          <label className="block text-xs text-gray-400 mb-1">Audio Bitrate</label>
          <select value={state.audioBitrate} onChange={set('audioBitrate')} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500">
            {['64k', '96k', '128k', '192k', '256k', '320k'].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* CRF */}
        {state.codec !== 'copy' && (
          <div className="sm:col-span-2" onMouseEnter={() => setActiveHint('crf')} onMouseLeave={() => setActiveHint(null)}>
            <label className="block text-xs text-gray-400 mb-1">
              CRF: <span className="text-purple-400 font-mono">{state.crf}</span>
              <span className="text-gray-600 ml-2 text-xs">(lower = better quality)</span>
            </label>
            <input type="range" min={0} max={51} step={1} value={state.crf} onChange={set('crf')} className="w-full accent-purple-500" />
          </div>
        )}

        {/* Preset */}
        {['h264', 'h265'].includes(state.codec) && (
          <div onMouseEnter={() => setActiveHint('preset')} onMouseLeave={() => setActiveHint(null)}>
            <label className="block text-xs text-gray-400 mb-1">Preset</label>
            <select value={state.preset} onChange={set('preset')} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500">
              {PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Hint */}
      {activeHint && PARAM_HINTS[activeHint] && (
        <div className="bg-indigo-950 border border-indigo-800 rounded px-3 py-2 text-xs text-indigo-300">
          {PARAM_HINTS[activeHint]}
        </div>
      )}

      {/* Generated command */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Generated command</p>
        <pre className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
          {command}
        </pre>
        {onCommandReady && (
          <button
            onClick={() => onCommandReady(command)}
            className="mt-2 w-full bg-purple-700 hover:bg-purple-600 text-white py-2 rounded text-sm transition-colors"
          >
            Send to FFmpeg Runner →
          </button>
        )}
      </div>
    </div>
  );
}
