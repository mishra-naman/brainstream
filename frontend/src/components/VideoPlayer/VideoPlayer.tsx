import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
// @ts-expect-error dashjs lacks complete type defs
import dashjs from 'dashjs';

interface DebugInfo {
  type: 'hls' | 'dash' | 'native' | null;
  currentLevel?: number;
  totalLevels?: number;
  bandwidth?: number;
  bufferLength?: number;
}

interface Props {
  url: string;
}

export default function VideoPlayer({ url }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<ReturnType<typeof dashjs.MediaPlayer>>(null);
  const [debug, setDebug] = useState<DebugInfo>({ type: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    setError(null);
    const video = videoRef.current;

    // Cleanup previous
    hlsRef.current?.destroy();
    dashRef.current?.reset();
    hlsRef.current = null;
    dashRef.current = null;

    const isDash = /\.mpd(\?|$)/i.test(url);
    const isHls = /\.m3u8(\?|$)/i.test(url);

    if (isDash) {
      const player = dashjs.MediaPlayer().create();
      player.initialize(video, url, false);
      dashRef.current = player;
      setDebug({ type: 'dash' });
      const interval = setInterval(() => {
        try {
          const info = player.getDashMetrics();
          setDebug({
            type: 'dash',
            bandwidth: player.getAverageThroughput('video') * 1000,
            bufferLength: player.getBufferLength('video'),
            currentLevel: player.getQualityFor('video'),
            totalLevels: player.getBitrateInfoListFor('video')?.length,
          });
          void info;
        } catch {}
      }, 1000);
      return () => {
        clearInterval(interval);
        player.reset();
      };
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDebug({
          type: 'hls',
          currentLevel: hls.currentLevel,
          totalLevels: hls.levels.length,
        });
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setDebug((d) => ({ ...d, currentLevel: data.level }));
      });
      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        setDebug((d) => ({
          ...d,
          bandwidth: hls.bandwidthEstimate,
          bufferLength: hls.mainForwardBufferInfo?.len,
        }));
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError(`HLS error: ${data.details}`);
      });
      return () => hls.destroy();
    }

    // Native playback fallback
    video.src = url;
    setDebug({ type: 'native' });
    video.onerror = () => setError('Playback failed. Check URL and format.');
  }, [url]);

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg bg-black max-h-96"
        style={{ aspectRatio: '16/9' }}
      />
      {debug.type && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Protocol', value: debug.type?.toUpperCase() },
            { label: 'Quality Level', value: debug.totalLevels ? `${(debug.currentLevel ?? 0) + 1} / ${debug.totalLevels}` : '—' },
            { label: 'Bandwidth', value: debug.bandwidth ? `${(debug.bandwidth / 1000).toFixed(0)} kbps` : '—' },
            { label: 'Buffer', value: debug.bufferLength != null ? `${debug.bufferLength.toFixed(1)}s` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 rounded p-2 text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm text-gray-200 font-mono mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
