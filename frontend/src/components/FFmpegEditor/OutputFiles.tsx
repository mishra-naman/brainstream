import { Download, Film, FileText } from 'lucide-react';
import type { OutputFile } from '../../types';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ name }: { name: string }) {
  if (/\.(mp4|mkv|webm|ts|m4s|mov)$/i.test(name)) return <Film size={14} className="text-purple-400" />;
  return <FileText size={14} className="text-blue-400" />;
}

interface Props {
  files: OutputFile[];
  onPlayInLab?: (url: string) => void;
}

export default function OutputFiles({ files, onPlayInLab }: Props) {
  if (!files.length) return null;

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-2">Output files</p>
      <div className="space-y-1">
        {files.map((f) => (
          <div key={f.url} className="flex items-center justify-between bg-gray-900 rounded px-3 py-2 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <FileIcon name={f.name} />
              <span className="text-gray-200 truncate">{f.name}</span>
              <span className="text-gray-600 text-xs shrink-0">{formatSize(f.size)}</span>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              {/\.m3u8$|\.mpd$/i.test(f.name) && onPlayInLab && (
                <button
                  onClick={() => onPlayInLab(f.url)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Play in Lab
                </button>
              )}
              <a
                href={f.url}
                download
                className="text-gray-400 hover:text-gray-200 transition-colors"
                title="Download"
              >
                <Download size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
