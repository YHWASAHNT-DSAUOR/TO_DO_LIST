import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  GripVertical 
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { getIconComponent } from '../components/IconPicker';

export const TopicsView: React.FC = () => {
  const { 
    topics, 
    tasks, 
    deleteTopic, 
    openQuickAdd, 
    reorderTopics, 
    setActiveView 
  } = useTodo();

  const [draggedTopicIdx, setDraggedTopicIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTopicIdx(index);
    e.dataTransfer.setData('text/plain', JSON.stringify({ index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedTopicIdx !== null && draggedTopicIdx !== targetIndex) {
      reorderTopics(draggedTopicIdx, targetIndex);
    }
    setDraggedTopicIdx(null);
  };

  return (
    <div className="topics-view-container">
      <div className="topics-header-banner">
        <div className="topics-banner-left">
          <div className="topics-banner-title-row">
            <Layers size={22} className="topics-title-icon" />
            <h2>Topics Hub & Organization</h2>
          </div>
          <p className="topics-subtitle">
            Manage your high-level life domains, routines, workouts, and project buckets.
          </p>
        </div>

        <button
          type="button"
          className="topics-create-primary-btn"
          onClick={() => openQuickAdd({ type: 'topic' })}
        >
          <Plus size={16} />
          <span>New Topic</span>
        </button>
      </div>

      {topics.length === 0 ? (
        <div className="topics-empty-box">
          <Layers size={36} />
          <h3>No topics created yet</h3>
          <p>Topics help organize your tasks and routines into clean hierarchical groups.</p>
          <button
            type="button"
            className="topics-empty-create-btn"
            onClick={() => openQuickAdd({ type: 'topic' })}
          >
            <Plus size={16} />
            <span>Create First Topic</span>
          </button>
        </div>
      ) : (
        <div className="topics-grid-container">
          {topics.map((topic, index) => {
            const topicTasks = tasks.filter(t => t.topicId === topic.id);
            const completedCount = topicTasks.filter(t => t.status === 'completed').length;
            const totalCount = topicTasks.length;
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            let totalSubtasks = 0;
            topicTasks.forEach(t => {
              totalSubtasks += t.subtasks.length;
            });

            const IconComp = getIconComponent(topic.icon);

            return (
              <div
                key={topic.id}
                className="topic-hub-card"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  borderTopColor: topic.color
                }}
              >
                <div className="topic-hub-card-header">
                  <div className="hub-header-left">
                    <div 
                      className="topic-hub-icon-badge"
                      style={{ 
                        backgroundColor: `${topic.color}20`,
                        color: topic.color
                      }}
                    >
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h3 className="topic-hub-name">{topic.name}</h3>
                      {topic.description && (
                        <p className="topic-hub-desc">{topic.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="hub-drag-handle" title="Drag to reorder topic">
                    <GripVertical size={16} />
                  </div>
                </div>

                {/* Progress stats */}
                <div className="topic-hub-stats-section">
                  <div className="hub-stats-row">
                    <span className="hub-stats-label">Completion</span>
                    <span className="hub-stats-val">{percentage}%</span>
                  </div>
                  <div className="hub-progress-track">
                    <div 
                      className="hub-progress-bar"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: topic.color
                      }}
                    />
                  </div>

                  <div className="hub-metrics-grid">
                    <div className="hub-metric-box">
                      <span className="hub-metric-number">{totalCount}</span>
                      <span className="hub-metric-name">Tasks</span>
                    </div>
                    <div className="hub-metric-box">
                      <span className="hub-metric-number">{completedCount}</span>
                      <span className="hub-metric-name">Done</span>
                    </div>
                    <div className="hub-metric-box">
                      <span className="hub-metric-number">{totalSubtasks}</span>
                      <span className="hub-metric-name">Subtasks</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="topic-hub-card-footer">
                  <button
                    type="button"
                    className="hub-card-btn view"
                    onClick={() => {
                      setActiveView('today');
                    }}
                  >
                    View in Today
                  </button>
                  <button
                    type="button"
                    className="hub-card-btn edit"
                    onClick={() => openQuickAdd({ topicId: topic.id, type: 'topic' })}
                    title="Edit topic"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    className="hub-card-btn delete"
                    onClick={() => deleteTopic(topic.id)}
                    title="Delete topic"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
