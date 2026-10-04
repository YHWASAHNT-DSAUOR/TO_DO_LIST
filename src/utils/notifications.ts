import type { Task, Topic } from '../types';
import { soundManager } from './sound';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionState;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

export function sendPushNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    if (options?.onClick) {
      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    // Trigger vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    return true;
  } catch (error) {
    console.error('Error sending native notification:', error);
    return false;
  }
}

export function triggerTaskReminderNotification(
  task: Task,
  topic?: Topic,
  onTaskClick?: (taskId: string) => void
) {
  const iconEmoji = topic?.icon ? `${topic.icon} ` : '⏱️ ';
  const title = `${iconEmoji}${task.title}`;
  
  let body = '';
  if (task.subtasks && task.subtasks.length > 0) {
    const remaining = task.subtasks.filter(s => !s.completed).length;
    body = `Upcoming in ${topic ? topic.name : 'Today'}. ${remaining} subtask${remaining === 1 ? '' : 's'} remaining.`;
  } else if (task.description) {
    body = task.description;
  } else {
    body = `It's time for your task in ${topic?.name || 'Today'}.`;
  }

  // Play auditory chime
  soundManager.playReminder();

  // Send system push notification if enabled
  sendPushNotification(title, {
    body,
    tag: `task-reminder-${task.id}`,
    onClick: () => {
      if (onTaskClick) onTaskClick(task.id);
    }
  });
}
