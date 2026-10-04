import React from 'react';
import { 
  Search, 
  Plus, 
  Sparkles, 
  SlidersHorizontal,
  ChevronsUpDown,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { getGreeting, formatDateHeading, getTodayDateString } from '../utils/dateUtils';
import type { Priority } from '../types';

export const Header: React.FC = () => {
  const { 
    settings, 
    todayStats, 
    setIsSearchOpen, 
    openQuickAdd, 
    activeView,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    collapseAllTopics,
    topics
  } = useTodo();

  const todayStr = getTodayDateString();
  const { dayName, formattedDate } = formatDateHeading(todayStr);
  const greeting = getGreeting(settings.userName);

  const areAllCollapsed = topics.every(t => t.collapsed);

  return (
    <header className="app-header">
      {/* Top Banner / Greeting Row */}
      <div className="header-greeting-section">
        <div className="header-greeting-left">
          <div className="header-date-badge">
            <span className="header-day-name">{dayName}</span>
            <span className="header-date-separator">•</span>
            <span className="header-full-date">{formattedDate}</span>
          </div>
          <h1 className="header-greeting-title">
            {greeting}
          </h1>
        </div>

        {/* Header Action Controls */}
        <div className="header-greeting-right">
          {/* Global Search trigger */}
          <button
            type="button"
            className="header-search-trigger-btn"
            onClick={() => setIsSearchOpen(true)}
            title="Search tasks and subtasks (Cmd+K or /)"
          >
            <Search size={15} />
            <span className="search-placeholder-text">Search topics, tasks...</span>
            <kbd className="search-kbd-shortcut">⌘K</kbd>
          </button>

          {/* Prominent Quick Add Button */}
          <button
            type="button"
            className="header-primary-add-btn"
            onClick={() => openQuickAdd()}
            title="Quick add topic, task, or subtask"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Banner */}
      <div className="header-progress-banner">
        <div className="progress-info-left">
          <div className="progress-stat-pill">
            <CheckCircle2 size={16} className="progress-check-icon" />
            <span className="progress-stat-number">
              <strong>{todayStats.completedTasks}</strong> / {todayStats.totalTasks} tasks completed
            </span>
          </div>

          {todayStats.totalSubtasks > 0 && (
            <span className="progress-subtask-detail">
              ({todayStats.completedSubtasks} / {todayStats.totalSubtasks} subtasks done)
            </span>
          )}

          {todayStats.totalTasks > 0 && todayStats.percentage === 100 && (
            <span className="progress-celebrate-badge">
              <Sparkles size={13} />
              <span>All daily goals achieved!</span>
            </span>
          )}
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill"
              style={{ width: `${todayStats.percentage}%` }}
            />
          </div>
          <span className="progress-percentage-label">{todayStats.percentage}%</span>
        </div>
      </div>

      {/* Filter & View Controls Bar (Only on Today & Topics views) */}
      {(activeView === 'today' || activeView === 'topics') && (
        <div className="header-filter-bar">
          <div className="filter-group-left">
            {/* Status Filter */}
            <div className="filter-chip-group">
              <button
                type="button"
                className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-chip ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                Active
              </button>
              <button
                type="button"
                className={`filter-chip ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </button>
            </div>

            {/* Priority Filter */}
            <div className="filter-select-wrapper">
              <Filter size={13} />
              <select
                className="filter-dropdown"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="filter-group-right">
            {/* Sort Dropdown */}
            <div className="filter-select-wrapper">
              <SlidersHorizontal size={13} />
              <select
                className="filter-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'order' | 'time' | 'priority')}
              >
                <option value="order">Custom Order</option>
                <option value="time">Sort by Time</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>

            {/* Collapse / Expand All Topics */}
            {activeView === 'today' && (
              <button
                type="button"
                className="header-tool-btn"
                onClick={() => collapseAllTopics(!areAllCollapsed)}
                title={areAllCollapsed ? 'Expand all topics' : 'Collapse all topics'}
              >
                <ChevronsUpDown size={14} />
                <span>{areAllCollapsed ? 'Expand All' : 'Collapse All'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
