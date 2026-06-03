import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import type { FFmpegJob } from '../types';

interface SubmitOptions {
  command: string;
  file?: File | null;
  sampleName?: string;
}

export function useFFmpegJob() {
  const [job, setJob] = useState<FFmpegJob | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const reset = useCallback(() => {
    wsRef.current?.close();
    setJob(null);
    setLogs([]);
    setError(null);
    setSubmitting(false);
  }, []);

  const submit = useCallback(async ({ command, file, sampleName }: SubmitOptions) => {
    reset();
    setSubmitting(true);

    const form = new FormData();
    form.append('command', command);
    if (file) form.append('input_file', file);
    if (sampleName) form.append('sample_name', sampleName);

    try {
      const res = await axios.post<FFmpegJob>('/api/ffmpeg/jobs/', form);
      const created = res.data;
      setJob(created);
      setSubmitting(false);

      // Open WebSocket to stream logs
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${window.location.host}/ws/jobs/${created.id}/`);
      wsRef.current = ws;

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'log') {
          setLogs((prev) => [...prev, msg.line]);
        } else if (msg.type === 'done') {
          setJob((prev) => prev ? { ...prev, status: msg.status, exit_code: msg.exit_code } : prev);
          // Fetch final job state for output files
          axios.get<FFmpegJob>(`/api/ffmpeg/jobs/${created.id}/`).then((r) => {
            setJob(r.data);
          });
          ws.close();
        }
      };

      ws.onerror = () => {
        // Fall back to polling if WS unavailable
        const poll = setInterval(async () => {
          const r = await axios.get<FFmpegJob>(`/api/ffmpeg/jobs/${created.id}/`);
          setJob(r.data);
          setLogs(r.data.output_log.split('\n').filter(Boolean));
          if (r.data.status === 'done' || r.data.status === 'error') {
            clearInterval(poll);
          }
        }, 1500);
      };
    } catch (err: unknown) {
      setSubmitting(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError('Unknown error');
      }
    }
  }, [reset]);

  return { job, logs, submitting, error, submit, reset };
}
