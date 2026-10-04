import React, { useEffect, useRef } from 'react';
import { Search, X, Layers, CheckSquare, ListTree, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import type { SearchResultItem } from '../types';

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    setActiveView, 
    setSelectedDate,
    setHighlightedTaskId,
    setHighlightedTopicId,
    updateTopic
  } = useTodo();

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Global keyboard shortcuts (Cmd+K, /, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === '/' && !isSearchOpen && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const handleSelectResult = (result: SearchResultItem) => {
    // Uncollapse the topic so it is visible
    if (result.topicId) {
      updateTopic(result.topicId, { collapsed: false });
    }

    if (result.date) {
      setSelectedDate(result.date);
    }

    if (result.taskId) {
      setHighlightedTaskId(result.taskId);
    } else if (result.topicId) {
      setHighlightedTopicId(result.topicId);
    }

    setActiveView('today');
    setIsSearchOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsSearchOpen(false)}>
      <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="search-input-header">
          <Search size={18} className="search-modal-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search topics, tasks, or subtasks... (e.g. Bench, Gym, Running)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            className="search-close-esc-btn"
            onClick={() => setIsSearchOpen(false)}
          >
            ESC
          </button>
        </div>

        {/* Search Results List */}
        <div className="search-results-body">
          {!searchQuery.trim() ? (
            <div className="search-empty-prompt">
              <p>Type keywords to search across all levels of hierarchy</p>
              <div className="search-hints">
                <span>Try searching:</span>
                <button type="button" onClick={() => setSearchQuery('Gym')}>Gym</button>
                <button type="button" onClick={() => setSearchQuery('Bench')}>Bench</button>
                <button type="button" onClick={() => setSearchQuery('Running')}>Running</button>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-no-results">
              <p>No matches found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="search-results-list">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="search-result-row"
                  onClick={() => handleSelectResult(result)}
                >
                  <div className="search-result-icon-col">
                    {result.type === 'topic' && <Layers size={16} className="type-topic-icon" />}
                    {result.type === 'task' && <CheckSquare size={16} className="type-task-icon" />}
                    {result.type === 'subtask' && <ListTree size={16} className="type-subtask-icon" />}
                  </div>

                  <div className="search-result-content">
                    {/* Breadcrumbs: Topic → Task → Subtask */}
                    <div className="search-breadcrumbs-trail">
                      {result.breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <ArrowRight size={11} className="crumb-arrow" />}
                          <span className={`crumb-segment ${idx === result.breadcrumbs.length - 1 ? 'crumb-highlight' : ''}`}>
                            {crumb}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="search-result-meta-line">
                      <span className="search-type-tag">{result.type.toUpperCase()}</span>
                      {result.time && <span className="search-time-tag">⏱ {result.time}</span>}
                      {result.completed && <span className="search-status-tag">Completed</span>}
                    </div>
                  </div>

                  <div className="search-result-action">
                    <CornerDownLeft size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
