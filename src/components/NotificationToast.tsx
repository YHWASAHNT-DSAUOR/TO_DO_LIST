import React from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import type { ToastMessage } from '../types';

export const NotificationToastContainer: React.FC = () => {
  const { toasts, removeToast, setActiveView, setHighlightedTaskId, tasks, updateTopic } = useTodo();

  if (toasts.length === 0) return null;

  const handleToastClick = (toast: ToastMessage) => {
    if (toast.taskId) {
      const task = tasks.find(t => t.id === toast.taskId);
      if (task?.topicId) {
        updateTopic(task.topicId, { collapsed: false });
      }
      setHighlightedTaskId(toast.taskId);
      setActiveView('today');
    }
    removeToast(toast.id);
  };

  return (
    <div className="toast-notifications-portal">
      {toasts.map(toast => {
        let IconComponent = Info;
        let toastClass = 'toast-info';

        if (toast.type === 'reminder') {
          IconComponent = Bell;
          toastClass = 'toast-reminder';
        } else if (toast.type === 'success') {
          IconComponent = CheckCircle;
          toastClass = 'toast-success';
        } else if (toast.type === 'warning') {
          IconComponent = AlertTriangle;
          toastClass = 'toast-warning';
        }

        return (
          <div
            key={toast.id}
            className={`toast-notification-card ${toastClass}`}
            onClick={() => handleToastClick(toast)}
          >
            <div className="toast-icon-wrapper">
              <IconComponent size={18} />
            </div>

            <div className="toast-text-body">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>

            {toast.taskId && (
              <button
                type="button"
                className="toast-view-action"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToastClick(toast);
                }}
                title="View task"
              >
                <ArrowRight size={14} />
              </button>
            )}

            <button
              type="button"
              className="toast-dismiss-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
