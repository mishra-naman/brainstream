import { NavLink } from 'react-router-dom';
import { Terminal, BookOpen, Sliders, List, Play, Tv2 } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: Tv2, end: true },
  { to: '/runner', label: 'FFmpeg Runner', icon: Terminal },
  { to: '/builder', label: 'Command Builder', icon: Sliders },
  { to: '/tutorials', label: 'Tutorials', icon: BookOpen },
  { to: '/cheatsheet', label: 'Cheat Sheet', icon: List },
  { to: '/player', label: 'Player Lab', icon: Play },
];

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14 overflow-x-auto">
        <span className="text-purple-400 font-bold text-lg mr-4 whitespace-nowrap flex items-center gap-2">
          <Tv2 size={20} /> OTT Playground
        </span>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
