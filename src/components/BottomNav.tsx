import React from 'react';
import { 
  Calendar, 
  Clock, 
  Layers, 
  Settings, 
  Plus 
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import type { ActiveView } from '../types';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, openQuickAdd } = useTodo();

  const navItems: { id: ActiveView; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'topics', label: 'Topics', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-nav-container">
        {navItems.slice(0, 2).map(({ id, label, icon: IconComponent }) => (
          <button
            key={id}
            type="button"
            className={`mobile-nav-btn ${activeView === id ? 'active' : ''}`}
            onClick={() => setActiveView(id)}
          >
            <IconComponent size={20} />
            <span>{label}</span>
          </button>
        ))}

        {/* Center Floating Quick Add Button */}
        <button
          type="button"
          className="mobile-fab-btn"
          onClick={() => openQuickAdd()}
          title="Quick add"
          aria-label="Quick add"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {navItems.slice(2).map(({ id, label, icon: IconComponent }) => (
          <button
            key={id}
            type="button"
            className={`mobile-nav-btn ${activeView === id ? 'active' : ''}`}
            onClick={() => setActiveView(id)}
          >
            <IconComponent size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
