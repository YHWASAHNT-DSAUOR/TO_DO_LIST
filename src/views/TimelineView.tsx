import React from 'react';
import { 
  Clock, 
  Calendar, 
  Check, 
  ListTree, 
  Plus
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { formatTimeDisplay, getTimeStatus } from '../utils/dateUtils';
import { getIconComponent } from '../components/IconPicker';

export const TimelineView: React.FC = () => {
  const { 
    tasks, 
    topics, 
    selectedDate, 
    toggleTaskStatus, 
    toggleSubtask, 
    openQuickAdd,
    settings 
  } = useTodo();

  const dayTasks = tasks.filter(t => t.date === selectedDate);

  // Split into timed tasks and untimed tasks
  const timedTasks = dayTasks
    .filter(t => t.time)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const untimedTasks = dayTasks.filter(t => !t.time);

  return (
    <div className="timeline-view-container">
      <div className="timeline-header-card">
        <div className="timeline-title-row">
          <Clock size={20} className="timeline-title-icon" />
          <h2>Today's Schedule & Timeline</h2>
        </div>
        <p className="timeline-subtitle">
          Chronological daily breakdown of your topics, tasks, and subtasks.
        </p>
      </div>

      {dayTasks.length === 0 ? (
        <div className="timeline-empty-card">
          <Calendar size={32} />
          <h3>No tasks scheduled for today</h3>
          <button
            type="button"
            className="timeline-add-btn"
            onClick={() => openQuickAdd({ type: 'task' })}
          >
            <Plus size={16} />
            <span>Add Scheduled Task</span>
          </button>
        </div>
      ) : (
        <div className="timeline-schedule-layout">
          {/* Chronological Timed Section */}
          <div className="timeline-rail-wrapper">
            {timedTasks.length === 0 ? (
              <div className="timeline-no-timed-notice">
                <p>No tasks with specific times yet. Assign times to see them on the chronological timeline.</p>
              </div>
            ) : (
              <div className="timeline-events-list">
                {timedTasks.map((task) => {
                  const topic = topics.find(t => t.id === task.topicId);
                  const IconComp = topic ? getIconComponent(topic.icon) : Clock;
                  const isCompleted = task.status === 'completed';
                  const timeStatus = getTimeStatus(task.date, task.time);

                  return (
                    <div 
                      key={task.id} 
                      className={`timeline-event-card ${isCompleted ? 'completed' : ''}`}
                    >
                      {/* Left time badge */}
                      <div className="timeline-time-col">
                        <span className="timeline-time-text">
                          {formatTimeDisplay(task.time, settings.timeFormat === '24h')}
                        </span>
                        {timeStatus.label && !isCompleted && (
                          <span className={`timeline-relative-pill ${timeStatus.isUrgent ? 'urgent' : ''}`}>
                            {timeStatus.label}
                          </span>
                        )}
                      </div>

                      {/* Timeline node & connector line */}
                      <div className="timeline-node-col">
                        <div 
                          className="timeline-node-circle"
                          style={{ 
                            backgroundColor: topic?.color || '#6366F1',
                            boxShadow: `0 0 0 3px ${topic?.color || '#6366F1'}25`
                          }}
                        />
                        <div className="timeline-node-line" />
                      </div>

                      {/* Main Task Event Content */}
                      <div className="timeline-card-main">
                        <div className="timeline-card-top">
                          {/* Topic Pill */}
                          {topic && (
                            <span 
                              className="timeline-topic-badge"
                              style={{ 
                                backgroundColor: `${topic.color}15`,
                                color: topic.color,
                                borderColor: `${topic.color}30`
                              }}
                            >
                              <IconComp size={12} />
                              <span>{topic.name}</span>
                            </span>
                          )}

                          {task.priority !== 'none' && (
                            <span className={`priority-badge priority-${task.priority}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Task Title Row */}
                        <div className="timeline-task-row">
                          <button
                            type="button"
                            className={`timeline-task-checkbox ${isCompleted ? 'checked' : ''}`}
                            style={{
                              borderColor: isCompleted ? topic?.color : undefined,
                              backgroundColor: isCompleted ? topic?.color : undefined
                            }}
                            onClick={() => toggleTaskStatus(task.id)}
                          >
                            {isCompleted && <Check size={12} strokeWidth={3} color="#FFFFFF" />}
                          </button>

                          <span className={`timeline-task-title ${isCompleted ? 'completed' : ''}`}>
                            {task.title}
                          </span>
                        </div>

                        {task.description && (
                          <p className="timeline-task-desc">{task.description}</p>
                        )}

                        {/* Subtasks breakdown */}
                        {task.subtasks.length > 0 && (
                          <div className="timeline-subtasks-tree">
                            <div className="timeline-subtasks-header">
                              <ListTree size={12} />
                              <span>Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
                            </div>
                            <div className="timeline-subtasks-items">
                              {task.subtasks.map((sub, sIdx) => (
                                <div 
                                  key={sub.id} 
                                  className={`timeline-sub-row ${sub.completed ? 'completed' : ''}`}
                                >
                                  <span className="timeline-sub-guide">
                                    {sIdx === task.subtasks.length - 1 ? '└──' : '├──'}
                                  </span>
                                  <button
                                    type="button"
                                    className={`timeline-sub-checkbox ${sub.completed ? 'checked' : ''}`}
                                    style={{
                                      borderColor: sub.completed ? topic?.color : undefined,
                                      backgroundColor: sub.completed ? topic?.color : undefined
                                    }}
                                    onClick={() => toggleSubtask(task.id, sub.id)}
                                  >
                                    {sub.completed && <Check size={10} strokeWidth={3} color="#FFFFFF" />}
                                  </button>
                                  <span className="timeline-sub-text">{sub.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Untimed Tasks Section */}
          {untimedTasks.length > 0 && (
            <div className="timeline-untimed-section">
              <div className="untimed-header">
                <h3>Anytime Today (Untimed)</h3>
                <span className="untimed-count">{untimedTasks.length} tasks</span>
              </div>
              <div className="untimed-cards-grid">
                {untimedTasks.map(task => {
                  const topic = topics.find(t => t.id === task.topicId);
                  const isCompleted = task.status === 'completed';

                  return (
                    <div key={task.id} className={`untimed-task-card ${isCompleted ? 'completed' : ''}`}>
                      <div className="untimed-card-top">
                        {topic && (
                          <span 
                            className="untimed-topic-pill"
                            style={{ color: topic.color, backgroundColor: `${topic.color}15` }}
                          >
                            {topic.name}
                          </span>
                        )}
                        {task.priority !== 'none' && (
                          <span className={`priority-badge priority-${task.priority}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>

                      <div className="untimed-task-title-row">
                        <button
                          type="button"
                          className={`timeline-task-checkbox ${isCompleted ? 'checked' : ''}`}
                          style={{
                            borderColor: isCompleted ? topic?.color : undefined,
                            backgroundColor: isCompleted ? topic?.color : undefined
                          }}
                          onClick={() => toggleTaskStatus(task.id)}
                        >
                          {isCompleted && <Check size={12} strokeWidth={3} color="#FFFFFF" />}
                        </button>
                        <span className="untimed-title">{task.title}</span>
                      </div>

                      {task.subtasks.length > 0 && (
                        <div className="untimed-subtasks-summary">
                          {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} subtasks done
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
