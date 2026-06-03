import { useNavigate } from 'react-router-dom';
import CommandBuilderForm from '../components/CommandForm/CommandBuilder';

export default function Builder() {
  const navigate = useNavigate();

  const handleSendToRunner = (command: string) => {
    navigate('/runner', { state: { command } });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Command Builder</h1>
        <p className="text-gray-500 text-sm">Pick your options. The FFmpeg command updates live. No flag memorization.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <CommandBuilderForm onCommandReady={handleSendToRunner} />
      </div>
    </div>
  );
}
