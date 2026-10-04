import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  Sparkles, 
  Bell, 
  ShieldCheck
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { TopicCard } from '../components/TopicCard';
import { getNotificationPermission, requestNotificationPermission, sendPushNotification } from '../utils/notifications';

export const TodayView: React.FC = () => {
  const { 
    topics, 
    tasks, 
    selectedDate, 
    filterPriority, 
    filterStatus, 
    sortBy, 
    openQuickAdd, 
    loadSampleRoutine,
    updateSettings,
    addToast
  } = useTodo();

  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());
  const [isDismissedNotifBanner, setIsDismissedNotifBanner] = useState(false);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === 'granted') {
      updateSettings({ pushNotificationsEnabled: true });
      sendPushNotification('Tempo Notifications Enabled 🔔', {
        body: 'You will receive reminders before your scheduled tasks!'
      });
      addToast({
        title: 'Notifications Enabled',
        message: 'Browser push notifications are now active',
        type: 'success'
      });
    } else {
      addToast({
        title: 'Permission Denied',
        message: 'Notifications were blocked by your browser settings',
        type: 'warning'
      });
    }
  };

  // Filter and sort tasks for this view
  const filteredTasks = tasks.filter(task => {
    // Date match
    const dateMatch = task.date === selectedDate;
    if (!dateMatch) return false;

    // Status filter
    if (filterStatus === 'active' && task.status === 'completed') return false;
    if (filterStatus === 'completed' && task.status !== 'completed') return false;

    // Priority filter
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'time') {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    }
    if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    return a.order - b.order;
  });

  // Topics in display order
  const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

  return (
    <div className="today-view-container">
      {/* Push Notification Permission Onboarding Banner */}
      {notifPermission === 'default' && !isDismissedNotifBanner && (
        <div className="notification-permission-banner">
          <div className="banner-icon-side">
            <Bell size={20} className="banner-bell-icon" />
          </div>
          <div className="banner-text-side">
            <h4>Never miss a task or workout</h4>
            <p>Enable browser notifications to receive timely reminders for your scheduled tasks and subtasks.</p>
          </div>
          <div className="banner-action-side">
            <button
              type="button"
              className="banner-enable-btn"
              onClick={handleEnableNotifications}
            >
              <ShieldCheck size={15} />
              <span>Enable Notifications</span>
            </button>
            <button
              type="button"
              className="banner-dismiss-btn"
              onClick={() => setIsDismissedNotifBanner(true)}
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Main Topics Container */}
      {topics.length === 0 ? (
        <div className="empty-dashboard-state">
          <div className="empty-icon-orb">
            <Layers size={36} />
          </div>
          <h2>Welcome to Tempo</h2>
          <p>Organize your day hierarchically into <strong>Topics → Tasks → Subtasks</strong>.</p>
          <div className="empty-actions-row">
            <button
              type="button"
              className="empty-primary-btn"
              onClick={loadSampleRoutine}
            >
              <Sparkles size={16} />
              <span>Load Morning & Gym Routines</span>
            </button>
            <button
              type="button"
              className="empty-secondary-btn"
              onClick={() => openQuickAdd({ type: 'topic' })}
            >
              <Plus size={16} />
              <span>Create First Topic</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="topics-cards-stack">
          {sortedTopics.map((topic, index) => {
            const topicTasks = sortedTasks.filter(t => t.topicId === topic.id);
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                tasks={topicTasks}
                index={index}
              />
            );
          })}

          {/* Bottom Action Row */}
          <div className="today-bottom-actions">
            <button
              type="button"
              className="bottom-add-topic-btn"
              onClick={() => openQuickAdd({ type: 'topic' })}
            >
              <Plus size={16} />
              <span>Add Topic</span>
            </button>
            <button
              type="button"
              className="bottom-add-task-btn"
              onClick={() => openQuickAdd({ type: 'task' })}
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
