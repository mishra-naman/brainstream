import { useEffect, useRef } from 'react';

interface Props {
  lines: string[];
  status?: string;
}

function colorize(line: string) {
  if (/error/i.test(line)) return 'text-red-400';
  if (/warn/i.test(line)) return 'text-yellow-400';
  if (/frame=/.test(line)) return 'text-indigo-400';
  if (/Output #/.test(line)) return 'text-green-400';
  return 'text-gray-300';
}

export default function LogPanel({ lines, status }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900">
        <span className="text-xs text-gray-500 font-mono">stderr / stdout</span>
        {status && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-mono ${
              status === 'done' ? 'bg-green-900 text-green-300' :
              status === 'error' ? 'bg-red-900 text-red-300' :
              status === 'running' ? 'bg-blue-900 text-blue-300 animate-pulse' :
              'bg-gray-800 text-gray-400'
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <div className="p-3 h-64 overflow-y-auto font-mono text-xs leading-5">
        {lines.length === 0 && (
          <span className="text-gray-600">Run a command to see output here...</span>
        )}
        {lines.map((line, i) => (
          <div key={i} className={colorize(line)}>
            {line || ' '}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
