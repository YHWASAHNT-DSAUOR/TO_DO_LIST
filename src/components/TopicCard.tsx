import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  GripVertical,
  CheckCircle2
} from 'lucide-react';
import type { Topic, Task } from '../types';
import { useTodo } from '../context/TodoContext';
import { TaskItem } from './TaskItem';
import { getIconComponent } from './IconPicker';

interface TopicCardProps {
  topic: Topic;
  tasks: Task[];
  index: number;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, tasks, index }) => {
  const { 
    toggleTopicCollapse, 
    deleteTopic, 
    openQuickAdd, 
    reorderTopics,
    moveTaskToTopic,
    getTopicStats
  } = useTodo();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDraggingTopic, setIsDraggingTopic] = useState(false);
  const [isDragOverTopic, setIsDragOverTopic] = useState(false);

  const stats = getTopicStats(topic.id);
  const isAllDone = stats.total > 0 && stats.completed === stats.total;
  const isCollapsed = topic.collapsed;
  const IconComponent = getIconComponent(topic.icon);

  // Drag and drop for topic reordering
  const handleTopicDragStart = (e: React.DragEvent) => {
    setIsDraggingTopic(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'TOPIC',
      topicId: topic.id,
      index
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTopicDragEnd = () => {
    setIsDraggingTopic(false);
  };

  const handleTopicDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTopic(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTopicDragLeave = () => {
    setIsDragOverTopic(false);
  };

  const handleTopicDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTopic(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'TOPIC' && data.index !== index) {
        reorderTopics(data.index, index);
      } else if (data.type === 'TASK') {
        // Move task into this topic!
        moveTaskToTopic(data.taskId, topic.id);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className={`topic-card-container ${isCollapsed ? 'collapsed' : ''} ${isAllDone ? 'all-completed' : ''} ${isDragOverTopic ? 'drag-over' : ''} ${isDraggingTopic ? 'dragging' : ''}`}
      onDragOver={handleTopicDragOver}
      onDragLeave={handleTopicDragLeave}
      onDrop={handleTopicDrop}
    >
      {/* Topic Card Header */}
      <div className="topic-card-header">
        <div 
          className="topic-drag-handle" 
          draggable
          onDragStart={handleTopicDragStart}
          onDragEnd={handleTopicDragEnd}
          title="Drag to reorder topic"
        >
          <GripVertical size={16} />
        </div>

        {/* Topic Icon Container */}
        <div 
          className="topic-icon-badge"
          style={{ 
            backgroundColor: `${topic.color}18`,
            color: topic.color,
            borderColor: `${topic.color}35`
          }}
          onClick={() => toggleTopicCollapse(topic.id)}
        >
          <IconComponent size={18} />
        </div>

        {/* Topic Title & Description */}
        <div className="topic-title-wrapper" onClick={() => toggleTopicCollapse(topic.id)}>
          <div className="topic-title-row">
            <h3 className="topic-name">{topic.name}</h3>
            {isAllDone && (
              <span className="topic-completed-tag" style={{ color: topic.color }}>
                <CheckCircle2 size={13} />
                <span>All Done</span>
              </span>
            )}
          </div>
          {topic.description && (
            <p className="topic-description">{topic.description}</p>
          )}
        </div>

        {/* Topic Progress Bar & Stats */}
        <div className="topic-stats-badge">
          <span className="topic-count-text">
            {stats.completed} / {stats.total} completed
          </span>
          <div className="topic-mini-progress-track">
            <div 
              className="topic-mini-progress-fill"
              style={{ 
                width: `${stats.percentage}%`,
                backgroundColor: topic.color
              }}
            />
          </div>
        </div>

        {/* Collapse / Expand Chevron */}
        <button
          type="button"
          className="topic-collapse-btn"
          onClick={() => toggleTopicCollapse(topic.id)}
          title={isCollapsed ? 'Expand topic' : 'Collapse topic'}
          aria-label={isCollapsed ? 'Expand topic' : 'Collapse topic'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Quick Add Task Button */}
        <button
          type="button"
          className="topic-add-task-btn"
          onClick={() => openQuickAdd({ topicId: topic.id, type: 'task' })}
          title={`Add task to ${topic.name}`}
        >
          <Plus size={15} />
          <span>Add Task</span>
        </button>

        {/* Topic Options Menu */}
        <div className="topic-menu-wrapper">
          <button
            type="button"
            className="topic-menu-trigger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Topic options"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div className="topic-dropdown-menu" onMouseLeave={() => setIsMenuOpen(false)}>
              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  openQuickAdd({ topicId: topic.id, type: 'topic' });
                }}
              >
                <Edit2 size={13} />
                <span>Edit Topic</span>
              </button>

              <button
                type="button"
                className="dropdown-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  openQuickAdd({ topicId: topic.id, type: 'task' });
                }}
              >
                <Plus size={13} />
                <span>Add Task</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-menu-item delete"
                onClick={() => {
                  setIsMenuOpen(false);
                  deleteTopic(topic.id);
                }}
              >
                <Trash2 size={13} />
                <span>Delete Topic</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topic Tasks Body (Collapsible) */}
      {!isCollapsed && (
        <div className="topic-card-body">
          {tasks.length === 0 ? (
            <div className="topic-empty-state">
              <p>No tasks yet in {topic.name}</p>
              <button
                type="button"
                className="topic-empty-add-btn"
                onClick={() => openQuickAdd({ topicId: topic.id, type: 'task' })}
              >
                <Plus size={14} />
                <span>Create Task</span>
              </button>
            </div>
          ) : (
            <div className="topic-tasks-list">
              {tasks.map((task, tIdx) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  topic={topic}
                  index={tIdx}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
