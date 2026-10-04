export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export type ReminderOption = 
  | 'none' 
  | 'at_time' 
  | '5m' 
  | '10m' 
  | '15m' 
  | '30m' 
  | '1h' 
  | 'custom';

export type RepeatFrequency = 
  | 'none' 
  | 'daily' 
  | 'weekdays' 
  | 'weekly' 
  | 'monthly' 
  | 'custom';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
  completedAt?: string;
}

export interface Task {
  id: string;
  topicId: string;
  userId?: string;
  title: string;
  description?: string;
  date: string; // Format: YYYY-MM-DD
  time?: string; // Format: HH:mm (24-hour stored internally)
  priority: Priority;
  status: TaskStatus;
  reminder: ReminderOption;
  customReminderMinutes?: number;
  repeat: RepeatFrequency;
  repeatDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  subtasks: Subtask[];
  order: number;
  createdAt: string;
  completedAt?: string;
}

export interface Topic {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  icon: string; // Lucide icon name or emoji
  color: string; // Hex color code
  order: number;
  collapsed?: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  avatarColor: string;
  routineFocus?: string;
}

export interface AppSettings {
  userName: string;
  theme: 'system' | 'light' | 'dark';
  timeFormat: '12h' | '24h';
  startOfWeek: 'monday' | 'sunday';
  defaultReminder: ReminderOption;
  soundEnabled: boolean;
  pushNotificationsEnabled: boolean;
  vibrationEnabled: boolean;
  autoMarkParentComplete: boolean;
  showCompletedInToday: boolean;
}

export type ActiveView = 'today' | 'timeline' | 'upcoming' | 'topics' | 'completed' | 'settings';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'reminder';
  taskId?: string;
  topicId?: string;
  duration?: number;
}

export interface DragItem {
  type: 'TOPIC' | 'TASK' | 'SUBTASK';
  id: string;
  topicId?: string;
  taskId?: string;
  sourceIndex: number;
}

export interface SearchResultItem {
  type: 'topic' | 'task' | 'subtask';
  id: string;
  topicId: string;
  taskId?: string;
  subtaskId?: string;
  title: string;
  breadcrumbs: string[];
  matchedText: string;
  date?: string;
  time?: string;
  completed?: boolean;
}
