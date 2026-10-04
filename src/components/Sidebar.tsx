import React from 'react';
import { 
  Calendar, 
  Clock, 
  CalendarDays, 
  Layers, 
  CheckCircle2, 
  Settings as SettingsIcon, 
  Plus, 
  Sun, 
  Moon, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { useAuth } from '../context/AuthContext';
import type { ActiveView } from '../types';
import { getIconComponent } from './IconPicker';
import { getTodayDateString } from '../utils/dateUtils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { 
    activeView, 
    setActiveView, 
    topics, 
    tasks, 
    todayStats, 
    settings, 
    updateSettings, 
    openQuickAdd,
    setSelectedDate
  } = useTodo();

  const { currentUser, signOut } = useAuth();
  const todayStr = getTodayDateString();

  const navItems: { id: ActiveView; label: string; icon: React.ComponentType<{ size?: number }>; badge?: number | string }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: Calendar,
      badge: todayStats.totalTasks > 0 ? `${todayStats.completedTasks}/${todayStats.totalTasks}` : undefined
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Clock,
      badge: tasks.filter(t => t.date === todayStr && t.time).length || undefined
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: CalendarDays,
      badge: tasks.filter(t => t.date > todayStr).length || undefined
    },
    {
      id: 'topics',
      label: 'Topics Hub',
      icon: Layers,
      badge: topics.length || undefined
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      badge: tasks.filter(t => t.status === 'completed').length || undefined
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon
    }
  ];

  const handleNavClick = (viewId: ActiveView) => {
    setActiveView(viewId);
    if (viewId === 'today') {
      setSelectedDate(todayStr);
    }
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-container">
        <div className="sidebar-brand-logo" onClick={() => handleNavClick('today')}>
          <div className="brand-logo-icon">
            <Sparkles size={18} />
          </div>
          {!isCollapsed && (
            <div className="brand-text-wrapper">
              <span className="brand-title">Tempo</span>
              <span className="brand-subtitle">Hierarchical Daily</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="sidebar-nav-section">
        <ul className="sidebar-nav-list">
          {navItems.map(({ id, label, icon: IconComponent, badge }) => {
            const isActive = activeView === id;
            return (
              <li key={id} className="sidebar-nav-item">
                <button
                  type="button"
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(id)}
                  title={label}
                >
                  <span className="nav-link-icon">
                    <IconComponent size={18} />
                  </span>
                  {!isCollapsed && <span className="nav-link-label">{label}</span>}
                  {!isCollapsed && badge !== undefined && (
                    <span className={`nav-link-badge ${id === 'today' ? 'today-badge' : ''}`}>
                      {badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Topics Section in Sidebar */}
      {!isCollapsed && (
        <div className="sidebar-topics-section">
          <div className="sidebar-section-header">
            <span className="section-header-title">MY TOPICS</span>
            <button
              type="button"
              className="sidebar-add-topic-btn"
              onClick={() => openQuickAdd({ type: 'topic' })}
              title="Create new topic"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="sidebar-topics-list">
            {topics.length === 0 ? (
              <div className="sidebar-empty-topics">No topics yet</div>
            ) : (
              topics.map(topic => {
                const topicTasks = tasks.filter(t => t.topicId === topic.id && t.date === todayStr);
                const done = topicTasks.filter(t => t.status === 'completed').length;
                const total = topicTasks.length;
                const IconComp = getIconComponent(topic.icon);

                return (
                  <button
                    key={topic.id}
                    type="button"
                    className="sidebar-topic-item"
                    onClick={() => {
                      setActiveView('today');
                    }}
                  >
                    <span 
                      className="sidebar-topic-dot"
                      style={{ backgroundColor: topic.color }}
                    />
                    <IconComp size={14} style={{ color: topic.color, marginRight: 6 }} />
                    <span className="sidebar-topic-name">{topic.name}</span>
                    {total > 0 && (
                      <span className="sidebar-topic-count">
                        {done}/{total}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Sidebar User Profile & Footer */}
      <div className="sidebar-footer">
        {currentUser && !isCollapsed && (
          <div className="sidebar-user-card">
            <div 
              className="sidebar-user-avatar"
              style={{ backgroundColor: currentUser.avatarColor || '#6366F1' }}
            >
              <span>{userInitials}</span>
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{currentUser.name}</span>
              <span className="sidebar-user-email">{currentUser.email}</span>
            </div>
            <button
              type="button"
              className="sidebar-signout-btn"
              onClick={signOut}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        <button
          type="button"
          className="sidebar-footer-theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {!isCollapsed && (
            <span>{settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>
      </div>
    </aside>
  );
};
