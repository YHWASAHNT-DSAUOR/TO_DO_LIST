import React from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Layers, 
  ListTree,
  Sparkles
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { formatTimeDisplay } from '../utils/dateUtils';
import { getIconComponent } from '../components/IconPicker';

export const CompletedView: React.FC = () => {
  const { tasks, topics, toggleTaskStatus, deleteTask, settings } = useTodo();

  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="completed-view-container">
      <div className="completed-header-banner">
        <div className="completed-title-row">
          <CheckCircle2 size={22} className="completed-title-icon" />
          <h2>Completed Archive</h2>
        </div>
        <p className="completed-subtitle">
          {completedTasks.length} task{completedTasks.length === 1 ? '' : 's'} accomplished. Great job staying focused!
        </p>
      </div>

      {completedTasks.length === 0 ? (
        <div className="completed-empty-card">
          <Sparkles size={36} />
          <h3>No completed tasks yet</h3>
          <p>Check off tasks in your dashboard to see them archived here.</p>
        </div>
      ) : (
        <div className="completed-tasks-list">
          {completedTasks.map(task => {
            const topic = topics.find(t => t.id === task.topicId);
            const IconComp = topic ? getIconComponent(topic.icon) : Layers;

            return (
              <div key={task.id} className="completed-task-card">
                <div className="completed-card-main">
                  <div className="completed-card-meta">
                    {topic && (
                      <span 
                        className="completed-topic-badge"
                        style={{ color: topic.color, backgroundColor: `${topic.color}15` }}
                      >
                        <IconComp size={12} />
                        <span>{topic.name}</span>
                      </span>
                    )}

                    <span className="completed-date-pill">
                      {task.date}
                    </span>

                    {task.time && (
                      <span className="completed-time-pill">
                        <Clock size={11} />
                        <span>{formatTimeDisplay(task.time, settings.timeFormat === '24h')}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="completed-task-name">{task.title}</h3>

                  {task.description && (
                    <p className="completed-task-desc">{task.description}</p>
                  )}

                  {task.subtasks.length > 0 && (
                    <div className="completed-subtasks-summary">
                      <ListTree size={12} />
                      <span>{task.subtasks.length} subtask{task.subtasks.length === 1 ? '' : 's'} completed</span>
                    </div>
                  )}
                </div>

                <div className="completed-card-actions">
                  <button
                    type="button"
                    className="completed-restore-btn"
                    onClick={() => toggleTaskStatus(task.id)}
                    title="Restore task to active"
                  >
                    <RotateCcw size={14} />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    className="completed-delete-btn"
                    onClick={() => deleteTask(task.id)}
                    title="Delete permanently"
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
