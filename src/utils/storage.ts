import type { Topic, Task, AppSettings } from '../types';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEYS = {
  TOPICS: 'hierarchical_todo_topics_v1',
  TASKS: 'hierarchical_todo_tasks_v1',
  SETTINGS: 'hierarchical_todo_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Yash',
  theme: 'dark',
  timeFormat: '12h',
  startOfWeek: 'monday',
  defaultReminder: '10m',
  soundEnabled: true,
  pushNotificationsEnabled: true,
  vibrationEnabled: true,
  autoMarkParentComplete: true,
  showCompletedInToday: true,
};

export function getInitialSeedData(): { topics: Topic[]; tasks: Task[] } {
  const today = getTodayDateString();
  
  const topicMorningId = 'topic-morning';
  const topicGymId = 'topic-gym';
  const topicWorkId = 'topic-work';

  const topics: Topic[] = [
    {
      id: topicMorningId,
      name: 'Morning',
      description: 'Morning rituals & outdoor cardio routine',
      icon: 'Sun',
      color: '#F59E0B', // Amber
      order: 0,
      collapsed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: topicGymId,
      name: 'Gym',
      description: 'Strength & Hypertrophy Split: Push Day',
      icon: 'Dumbbell',
      color: '#6366F1', // Indigo
      order: 1,
      collapsed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: topicWorkId,
      name: 'Productivity & Projects',
      description: 'Engineering & Deep focus blocks',
      icon: 'Briefcase',
      color: '#10B981', // Emerald
      order: 2,
      collapsed: false,
      createdAt: new Date().toISOString()
    }
  ];

  const tasks: Task[] = [
    {
      id: 'task-running-1',
      topicId: topicMorningId,
      title: 'Morning Running',
      description: 'Warmup stretching & steady-state zone 2 run',
      date: today,
      time: '07:00',
      priority: 'high',
      status: 'not_started',
      reminder: '10m',
      repeat: 'weekdays',
      order: 0,
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: 'sub-run-1',
          title: 'Run from Home → Gym',
          completed: false,
          order: 0,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'task-chest-1',
      topicId: topicGymId,
      title: 'Chest Workout',
      description: 'Heavy compound pressing followed by isolation',
      date: today,
      time: '08:00',
      priority: 'high',
      status: 'not_started',
      reminder: '5m',
      repeat: 'custom',
      repeatDays: [1, 4], // Monday & Thursday
      order: 0,
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: 'sub-chest-1',
          title: 'Bench Press (4 Sets x 8 Reps)',
          completed: false,
          order: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-chest-2',
          title: 'Incline Dumbbell Press (3 Sets x 10 Reps)',
          completed: false,
          order: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-chest-3',
          title: 'Cable Fly (3 Sets x 12 Reps)',
          completed: false,
          order: 2,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'task-triceps-1',
      topicId: topicGymId,
      title: 'Triceps Workout',
      description: 'Tricep accessory burnouts',
      date: today,
      time: '08:45',
      priority: 'medium',
      status: 'not_started',
      reminder: '5m',
      repeat: 'weekly',
      order: 1,
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: 'sub-tri-1',
          title: 'Rope Pushdown (4 Sets x 12 Reps)',
          completed: false,
          order: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-tri-2',
          title: 'Overhead Extension (3 Sets x 10 Reps)',
          completed: false,
          order: 1,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'task-deepwork-1',
      topicId: topicWorkId,
      title: 'System Architecture Review',
      description: 'Design review for scalable distributed message queue',
      date: today,
      time: '10:30',
      priority: 'urgent',
      status: 'not_started',
      reminder: '15m',
      repeat: 'none',
      order: 0,
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: 'sub-arch-1',
          title: 'Draft RFC specifications',
          completed: false,
          order: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-arch-2',
          title: 'Benchmark throughput metrics',
          completed: false,
          order: 1,
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];

  return { topics, tasks };
}

export function loadStoredTopics(): Topic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOPICS);
    if (!raw) {
      const seed = getInitialSeedData();
      saveStoredTopics(seed.topics);
      return seed.topics;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load topics from localStorage:', e);
    return getInitialSeedData().topics;
  }
}

export function saveStoredTopics(topics: Topic[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  } catch (e) {
    console.error('Failed to save topics to localStorage:', e);
  }
}

export function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const seed = getInitialSeedData();
      saveStoredTasks(seed.tasks);
      return seed.tasks;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks from localStorage:', e);
    return getInitialSeedData().tasks;
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveStoredSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function exportBackupData(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    topics: loadStoredTopics(),
    tasks: loadStoredTasks(),
    settings: loadStoredSettings()
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed.topics) || !Array.isArray(parsed.tasks)) {
      return { success: false, error: 'Invalid backup file format: missing topics or tasks.' };
    }
    saveStoredTopics(parsed.topics);
    saveStoredTasks(parsed.tasks);
    if (parsed.settings) {
      saveStoredSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message || 'Failed to parse JSON backup file.' };
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.TOPICS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
