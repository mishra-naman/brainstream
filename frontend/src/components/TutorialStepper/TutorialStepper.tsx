import { useState } from 'react';
import { ChevronLeft, ChevronRight, Terminal, CheckCircle } from 'lucide-react';
import type { Tutorial, TutorialStep } from '../../types';

interface Props {
  tutorial: Tutorial;
  onRunCommand?: (command: string) => void;
}

function StepView({ step, onRunCommand }: { step: TutorialStep; onRunCommand?: (cmd: string) => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(step.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-100">{step.title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{step.explanation}</p>

      {step.command && (
        <div className="space-y-2">
          {step.command_description && (
            <p className="text-xs text-purple-400">{step.command_description}</p>
          )}
          <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">command</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copy}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {onRunCommand && (
                  <button
                    onClick={() => onRunCommand(step.command)}
                    className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-2 py-0.5 rounded transition-colors"
                  >
                    Run in Runner →
                  </button>
                )}
              </div>
            </div>
            <pre className="p-3 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
              {step.command}
            </pre>
          </div>
          {step.expected_output_hint && (
            <p className="text-xs text-gray-600 italic">Expected: {step.expected_output_hint}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TutorialStepper({ tutorial, onRunCommand }: Props) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const step = tutorial.steps[current];
  const total = tutorial.steps.length;

  const goNext = () => {
    setCompleted((s) => new Set([...s, current]));
    if (current < total - 1) setCurrent((c) => c + 1);
  };

  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Progress bar */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {tutorial.steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap border-r border-gray-800 transition-colors shrink-0 ${
              i === current
                ? 'bg-purple-900 text-purple-200'
                : completed.has(i)
                ? 'text-green-400 hover:bg-gray-800'
                : 'text-gray-500 hover:bg-gray-800'
            }`}
          >
            {completed.has(i) && <CheckCircle size={10} />}
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <div className="p-6">
        {step && <StepView step={step} onRunCommand={onRunCommand} />}
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="text-xs text-gray-600">{current + 1} / {total}</span>
        <button
          onClick={goNext}
          disabled={current === total - 1}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {current < total - 1 ? 'Next' : 'Done'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
