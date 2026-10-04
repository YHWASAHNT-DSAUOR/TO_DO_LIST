import React, { useState, useRef } from 'react';
import { 
  Check, 
  Clock, 
  Bell, 
  Repeat, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ArrowRightLeft, 
  GripVertical,
  AlertCircle
} from 'lucide-react';
import type { Task, Topic } from '../types';
import { useTodo } from '../context/TodoContext';
import { SubtaskItem } from './SubtaskItem';
import { formatTimeDisplay, getTimeStatus } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  topic: Topic;
  index: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, topic, index }) => {
  const { 
    topics, 
    toggleTaskStatus, 
    deleteTask, 
    addSubtask, 
    moveTaskToTopic, 
    reorderTasks, 
    settings,
    openQuickAdd,
    highlightedTaskId,
    setHighlightedTaskId
  } = useTodo();

  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  const isHighlighted = highlightedTaskId === task.id;

  const completedSubtasksCount = task.subtasks.filter(s => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;
  const timeStatus = getTimeStatus(task.date, task.time);

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsSubtasksExpanded(true);
      // Keep focus on input for fast multi-subtask entry
      setTimeout(() => {
        subtaskInputRef.current?.focus();
      }, 50);
    }
  };

  // Drag and drop handlers for tasks
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'TASK',
      taskId: task.id,
      sourceTopicId: task.topicId,
      sourceIndex: index
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'TASK') {
        if (data.sourceTopicId === task.topicId && data.sourceIndex !== index) {
          reorderTasks(task.topicId, data.sourceIndex, index);
        } else if (data.sourceTopicId !== task.topicId) {
          moveTaskToTopic(data.taskId, task.topicId, index);
        }
      }
    } catch {
      // Ignore drop parse error
    }
  };

  return (
    <div
      className={`task-item-wrapper ${isCompleted ? 'completed' : ''} ${isHighlighted ? 'highlight-pulse' : ''} ${isDragging ? 'dragging' : ''}`}
      onAnimationEnd={() => {
        if (isHighlighted) setHighlightedTaskId(null);
      }}
    >
      <div 
        className="task-main-card"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="task-drag-handle" title="Drag to reorder or move to another topic">
          <GripVertical size={15} />
        </div>

        {/* Checkbox */}
        <button
          type="button"
          className={`task-checkbox ${isCompleted ? 'checked' : ''} ${isInProgress ? 'in-progress' : ''}`}
          style={{
            borderColor: isCompleted || isInProgress ? topic.color : undefined,
            backgroundColor: isCompleted ? topic.color : undefined
          }}
          onClick={() => toggleTaskStatus(task.id)}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check size={14} strokeWidth={3} color="#FFFFFF" />}
          {isInProgress && <span className="in-progress-dot" style={{ backgroundColor: topic.color }} />}
        </button>

        {/* Task Details */}
        <div className="task-content">
          <div className="task-header-row">
            <span className={`task-title ${isCompleted ? 'completed' : ''}`}>
              {task.title}
            </span>

            {/* Time & Schedule badge */}
            {task.time && (
              <div className={`task-badge time-badge ${timeStatus.isUrgent ? 'urgent' : ''} ${timeStatus.isPast ? 'past' : ''}`}>
                <Clock size={12} />
                <span>{formatTimeDisplay(task.time, settings.timeFormat === '24h')}</span>
                {timeStatus.label && !isCompleted && (
                  <span className="time-status-pill">{timeStatus.label}</span>
                )}
              </div>
            )}
          </div>

          {/* Optional Task Description */}
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {/* Badges / Metadata row */}
          <div className="task-badges-row">
            {/* Priority Badge */}
            {task.priority !== 'none' && (
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority === 'urgent' && <AlertCircle size={11} />}
                {task.priority.toUpperCase()}
              </span>
            )}

            {/* Reminder Badge */}
            {task.reminder !== 'none' && (
              <span className="task-badge reminder-badge" title={`Reminder: ${task.reminder}`}>
                <Bell size={11} />
                <span>
                  {task.reminder === 'at_time' ? 'At time' : 
                   task.reminder === 'custom' ? `${task.customReminderMinutes}m before` : 
                   `${task.reminder} before`}
                </span>
              </span>
            )}

            {/* Repeat Badge */}
            {task.repeat !== 'none' && (
              <span className="task-badge repeat-badge" title={`Repeats: ${task.repeat}`}>
                <Repeat size={11} />
                <span>
                  {task.repeat === 'weekdays' ? 'Weekdays' :
                   task.repeat === 'daily' ? 'Daily' :
                   task.repeat === 'weekly' ? 'Weekly' :
                   task.repeat === 'custom' && task.repeatDays ? `Repeat on ${task.repeatDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}` :
                   task.repeat}
                </span>
              </span>
            )}

            {/* Subtask count badge */}
            {totalSubtasksCount > 0 && (
              <button
                type="button"
                className={`subtask-count-toggle ${completedSubtasksCount === totalSubtasksCount ? 'all-done' : ''}`}
                onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                title="Toggle subtasks view"
              >
                {isSubtasksExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>{completedSubtasksCount}/{totalSubtasksCount} subtasks</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Actions */}
        <div className="task-action-buttons">
          <button
            type="button"
            className="task-icon-btn"
            onClick={() => setIsAddingSubtask(!isAddingSubtask)}
            title="Add subtask"
          >
            <Plus size={15} />
          </button>

          <div className="task-menu-container">
            <button
              type="button"
              className="task-icon-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="More options"
            >
              <MoreVertical size={15} />
            </button>

            {isMenuOpen && (
              <div className="task-dropdown-menu" onMouseLeave={() => setIsMenuOpen(false)}>
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    openQuickAdd({ topicId: task.topicId, type: 'task', taskId: task.id });
                  }}
                >
                  <Edit3 size={13} />
                  <span>Edit Task</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowMoveModal(true);
                  }}
                >
                  <ArrowRightLeft size={13} />
                  <span>Move to Topic...</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAddingSubtask(true);
                    setTimeout(() => subtaskInputRef.current?.focus(), 50);
                  }}
                >
                  <Plus size={13} />
                  <span>Add Subtask</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-menu-item delete"
                  onClick={() => {
                    setIsMenuOpen(false);
                    deleteTask(task.id);
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Subtasks List */}
      {totalSubtasksCount > 0 && isSubtasksExpanded && (
        <div className="task-subtasks-tree">
          <div className="subtasks-vertical-rail" style={{ borderColor: `${topic.color}30` }} />
          <div className="subtasks-list">
            {task.subtasks.map((subtask, sIndex) => (
              <SubtaskItem
                key={subtask.id}
                taskId={task.id}
                subtask={subtask}
                index={sIndex}
                isLast={sIndex === task.subtasks.length - 1}
                topicColor={topic.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inline Add Subtask Input */}
      {isAddingSubtask && (
        <form onSubmit={handleAddSubtaskSubmit} className="subtask-inline-add-form">
          <div className="subtask-tree-guide">
            <span className="tree-line-vertical" />
            <span className="tree-line-horizontal" />
          </div>
          <div className="subtask-add-input-wrapper">
            <input
              ref={subtaskInputRef}
              type="text"
              className="subtask-add-input"
              placeholder="Enter subtask name and press Enter..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAddingSubtask(false);
                  setNewSubtaskTitle('');
                }
              }}
              autoFocus
            />
            <div className="subtask-add-btn-group">
              <button type="submit" className="subtask-add-confirm-btn" disabled={!newSubtaskTitle.trim()}>
                Add
              </button>
              <button 
                type="button" 
                className="subtask-add-cancel-btn" 
                onClick={() => {
                  setIsAddingSubtask(false);
                  setNewSubtaskTitle('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Move Task to Another Topic Modal / Popover */}
      {showMoveModal && (
        <div className="modal-backdrop" onClick={() => setShowMoveModal(false)}>
          <div className="move-topic-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>Move "{task.title}" to:</h4>
            <div className="move-topic-options">
              {topics.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`move-topic-btn ${t.id === task.topicId ? 'current' : ''}`}
                  onClick={() => {
                    moveTaskToTopic(task.id, t.id);
                    setShowMoveModal(false);
                  }}
                >
                  <span className="move-topic-dot" style={{ backgroundColor: t.color }} />
                  <span>{t.name}</span>
                  {t.id === task.topicId && <span className="current-pill">Current</span>}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="move-dialog-close-btn"
              onClick={() => setShowMoveModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
