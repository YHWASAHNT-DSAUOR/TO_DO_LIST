import React from 'react';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  Check, 
  ArrowRight, 
  ListTree 
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { getUpcomingDates, formatTimeDisplay } from '../utils/dateUtils';
import { getIconComponent } from '../components/IconPicker';

export const UpcomingView: React.FC = () => {
  const { 
    tasks, 
    topics, 
    setSelectedDate, 
    setActiveView, 
    toggleTaskStatus, 
    openQuickAdd,
    settings 
  } = useTodo();

  const upcomingDateSlots = getUpcomingDates(7).slice(1); // Next 6 days

  return (
    <div className="upcoming-view-container">
      <div className="upcoming-header-card">
        <div className="upcoming-title-row">
          <CalendarDays size={20} className="upcoming-title-icon" />
          <h2>Upcoming Days & Future Schedule</h2>
        </div>
        <p className="upcoming-subtitle">
          Plan ahead and organize upcoming routines, workouts, and projects.
        </p>
      </div>

      <div className="upcoming-dates-stack">
        {upcomingDateSlots.map(({ dateString, label, dayOfWeek }) => {
          const dayTasks = tasks.filter(t => t.date === dateString);

          return (
            <div key={dateString} className="upcoming-day-group">
              <div className="upcoming-day-header">
                <div className="day-header-left">
                  <span className="upcoming-day-label">{label}</span>
                  <span className="upcoming-day-sub">{dayOfWeek} ({dateString})</span>
                </div>

                <div className="day-header-right">
                  <span className="upcoming-task-count">
                    {dayTasks.length} task{dayTasks.length === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    className="upcoming-add-day-btn"
                    onClick={() => openQuickAdd({ type: 'task' })}
                    title={`Add task for ${label}`}
                  >
                    <Plus size={14} />
                    <span>Add Task</span>
                  </button>
                  <button
                    type="button"
                    className="upcoming-jump-btn"
                    onClick={() => {
                      setSelectedDate(dateString);
                      setActiveView('today');
                    }}
                    title="View this day in Dashboard"
                  >
                    <span>View Day</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {dayTasks.length === 0 ? (
                <div className="upcoming-empty-day">
                  <span>No tasks scheduled for {label}</span>
                </div>
              ) : (
                <div className="upcoming-tasks-grid">
                  {dayTasks.map(task => {
                    const topic = topics.find(t => t.id === task.topicId);
                    const IconComp = topic ? getIconComponent(topic.icon) : Clock;
                    const isCompleted = task.status === 'completed';

                    return (
                      <div key={task.id} className={`upcoming-task-card ${isCompleted ? 'completed' : ''}`}>
                        <div className="upcoming-task-top">
                          {topic && (
                            <span 
                              className="upcoming-topic-pill"
                              style={{ color: topic.color, backgroundColor: `${topic.color}15` }}
                            >
                              <IconComp size={12} />
                              <span>{topic.name}</span>
                            </span>
                          )}

                          {task.time && (
                            <span className="upcoming-time-badge">
                              <Clock size={11} />
                              <span>{formatTimeDisplay(task.time, settings.timeFormat === '24h')}</span>
                            </span>
                          )}

                          {task.priority !== 'none' && (
                            <span className={`priority-badge priority-${task.priority}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="upcoming-task-body">
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

                          <span className="upcoming-task-title">{task.title}</span>
                        </div>

                        {task.subtasks.length > 0 && (
                          <div className="upcoming-subtasks-preview">
                            <ListTree size={11} />
                            <span>{task.subtasks.length} subtask{task.subtasks.length === 1 ? '' : 's'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
