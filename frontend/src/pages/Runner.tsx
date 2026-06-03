import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { useFFmpegJob } from '../hooks/useFFmpegJob';
import LogPanel from '../components/FFmpegEditor/LogPanel';
import OutputFiles from '../components/FFmpegEditor/OutputFiles';
import axios from 'axios';
import type { Sample } from '../types';

interface Props {
  initialCommand?: string;
}

export default function Runner({ initialCommand }: Props) {
  const { job, logs, submitting, error, submit, reset } = useFFmpegJob();
  const [command, setCommand] = useState(initialCommand ?? 'ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac output.mp4');
  const [file, setFile] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState('');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadSamples = async () => {
    if (samplesLoaded) return;
    const res = await axios.get<Sample[]>('/api/ffmpeg/samples/');
    setSamples(res.data);
    setSamplesLoaded(true);
  };

  const handleRun = () => {
    submit({ command, file, sampleName: sampleName || undefined });
  };

  const handlePlayInLab = (url: string) => {
    navigate('/player', { state: { url: window.location.origin + url } });
  };

  const inputActive = file || sampleName;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">FFmpeg Runner</h1>
        <p className="text-gray-500 text-sm">Type a command, upload a file, run it server-side. Live logs stream via WebSocket.</p>
      </div>

      <div className="space-y-4">
        {/* Input source */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Input File</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded text-sm transition-colors"
            >
              <Upload size={14} />
              {file ? file.name : 'Upload file'}
            </button>
            <input ref={fileRef} type="file" className="hidden" accept="video/*,audio/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setSampleName(''); }} />

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">or sample:</span>
              <select
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                value={sampleName}
                onChange={(e) => { setSampleName(e.target.value); setFile(null); }}
                onClick={loadSamples}
              >
                <option value="">Select sample...</option>
                {samples.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          {!inputActive && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertTriangle size={12} /> Upload a file or pick a sample to run commands.
            </p>
          )}
        </div>

        {/* Command editor */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950">
            <span className="text-xs text-gray-500">command</span>
            <div className="flex gap-2">
              <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          </div>
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full bg-gray-950 text-green-400 font-mono text-sm p-4 focus:outline-none resize-none"
            rows={4}
            spellCheck={false}
            placeholder="ffmpeg -i input.mp4 ..."
          />
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={submitting || !inputActive || !command.trim()}
          className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Play size={16} />
          {submitting ? 'Submitting...' : 'Run Command'}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Log output */}
        <LogPanel lines={logs} status={job?.status} />

        {/* Output files */}
        {job?.output_files && job.output_files.length > 0 && (
          <OutputFiles files={job.output_files} onPlayInLab={handlePlayInLab} />
        )}
      </div>
    </div>
  );
}
