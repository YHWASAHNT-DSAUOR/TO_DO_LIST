import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import type { 
  Topic, 
  Task, 
  Subtask, 
  AppSettings, 
  ActiveView, 
  ToastMessage, 
  SearchResultItem, 
  Priority
} from '../types';
import { 
  loadStoredTopics, 
  saveStoredTopics, 
  loadStoredTasks, 
  saveStoredTasks, 
  loadStoredSettings, 
  saveStoredSettings,
  getInitialSeedData,
  exportBackupData,
  importBackupData,
  resetAllData
} from '../utils/storage';
import { getTodayDateString, calculateReminderTime } from '../utils/dateUtils';
import { soundManager } from '../utils/sound';
import { triggerTaskReminderNotification } from '../utils/notifications';

interface TodoContextType {
  topics: Topic[];
  tasks: Task[];
  settings: AppSettings;
  activeView: ActiveView;
  selectedDate: string;
  searchQuery: string;
  filterPriority: Priority | 'all';
  filterStatus: 'all' | 'active' | 'completed';
  sortBy: 'order' | 'time' | 'priority';
  toasts: ToastMessage[];
  isSearchOpen: boolean;
  isQuickAddOpen: boolean;
  quickAddInitialTopicId?: string;
  quickAddInitialType?: 'topic' | 'task' | 'subtask';
  quickAddInitialTaskId?: string;
  highlightedTaskId: string | null;
  highlightedTopicId: string | null;

  // Navigation & UI controls
  setActiveView: (view: ActiveView) => void;
  setSelectedDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: Priority | 'all') => void;
  setFilterStatus: (status: 'all' | 'active' | 'completed') => void;
  setSortBy: (sort: 'order' | 'time' | 'priority') => void;
  setIsSearchOpen: (open: boolean) => void;
  openQuickAdd: (options?: { topicId?: string; type?: 'topic' | 'task' | 'subtask'; taskId?: string }) => void;
  closeQuickAdd: () => void;
  setHighlightedTaskId: (id: string | null) => void;
  setHighlightedTopicId: (id: string | null) => void;

  // Topic CRUD
  addTopic: (topic: Omit<Topic, 'id' | 'order' | 'createdAt'>) => Topic;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  toggleTopicCollapse: (id: string) => void;
  reorderTopics: (startIndex: number, endIndex: number) => void;
  collapseAllTopics: (collapsed: boolean) => void;

  // Task CRUD
  addTask: (task: Omit<Task, 'id' | 'order' | 'createdAt' | 'subtasks'> & { subtasks?: string[] }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  moveTaskToTopic: (taskId: string, targetTopicId: string, newIndex?: number) => void;
  reorderTasks: (topicId: string, startIndex: number, endIndex: number) => void;

  // Subtask CRUD
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  reorderSubtasks: (taskId: string, startIndex: number, endIndex: number) => void;

  // Settings & System
  updateSettings: (updates: Partial<AppSettings>) => void;
  triggerConfetti: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  loadSampleRoutine: () => void;
  exportData: () => string;
  importData: (json: string) => { success: boolean; error?: string };
  resetData: () => void;

  // Computed / Search
  searchResults: SearchResultItem[];
  todayStats: {
    totalTasks: number;
    completedTasks: number;
    totalSubtasks: number;
    completedSubtasks: number;
    percentage: number;
  };
  getTopicStats: (topicId: string, date?: string) => {
    total: number;
    completed: number;
    percentage: number;
  };
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>(() => loadStoredTopics());
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  
  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'time' | 'priority'>('order');
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialTopicId, setQuickAddInitialTopicId] = useState<string | undefined>();
  const [quickAddInitialType, setQuickAddInitialType] = useState<'topic' | 'task' | 'subtask' | undefined>('task');
  const [quickAddInitialTaskId, setQuickAddInitialTaskId] = useState<string | undefined>();
  
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);

  // Sync sound settings with soundManager
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Apply Dark/Light theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Persist data
  useEffect(() => {
    saveStoredTopics(topics);
  }, [topics]);

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Confetti helper
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6']
      });
    } catch {
      // Ignore if confetti fails
    }
  }, []);

  // Toast Helpers
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id, duration: toast.duration || 4000 };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Reminders scheduler check (every 15 seconds)
  const alertedReminders = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      tasks.forEach(task => {
        if (task.status === 'completed' || task.reminder === 'none' || !task.time) return;

        const reminderTime = calculateReminderTime(task.date, task.time, task.reminder, task.customReminderMinutes);
        if (!reminderTime) return;

        const reminderKey = `${task.id}-${task.date}-${task.time}-${task.reminder}`;
        const diffSecs = (reminderTime.getTime() - now.getTime()) / 1000;

        // If reminder is within window [-30s, +30s] and not alerted yet
        if (diffSecs >= -30 && diffSecs <= 30 && !alertedReminders.has(reminderKey)) {
          alertedReminders.add(reminderKey);

          const topic = topics.find(t => t.id === task.topicId);
          if (settings.pushNotificationsEnabled) {
            triggerTaskReminderNotification(task, topic, (taskId) => {
              setActiveView('today');
              setHighlightedTaskId(taskId);
            });
          }

          addToast({
            title: task.title,
            message: `Starting in ${task.reminder === 'at_time' ? 'now' : task.reminder}. Topic: ${topic?.name || 'General'}`,
            type: 'reminder',
            taskId: task.id,
            duration: 7000
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 15000);
    checkReminders(); // Initial check
    return () => clearInterval(interval);
  }, [tasks, topics, settings.pushNotificationsEnabled, alertedReminders, addToast]);

  // Topic Actions
  const addTopic = useCallback((topicData: Omit<Topic, 'id' | 'order' | 'createdAt'>): Topic => {
    const newTopic: Topic = {
      ...topicData,
      id: `topic-${Date.now()}`,
      order: topics.length,
      collapsed: false,
      createdAt: new Date().toISOString()
    };
    setTopics(prev => [...prev, newTopic]);
    addToast({ title: 'Topic Created', message: `Created "${newTopic.name}"`, type: 'success' });
    return newTopic;
  }, [topics.length, addToast]);

  const updateTopic = useCallback((id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTopic = useCallback((id: string) => {
    const topicToDelete = topics.find(t => t.id === id);
    if (!topicToDelete) return;

    setTopics(prev => prev.filter(t => t.id !== id));
    // Also remove associated tasks
    setTasks(prev => prev.filter(t => t.topicId !== id));

    addToast({
      title: 'Topic Deleted',
      message: `Deleted "${topicToDelete.name}" and its tasks.`,
      type: 'info'
    });
  }, [topics, addToast]);

  const toggleTopicCollapse = useCallback((id: string) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, collapsed: !t.collapsed } : t));
  }, []);

  const collapseAllTopics = useCallback((collapsed: boolean) => {
    setTopics(prev => prev.map(t => ({ ...t, collapsed })));
  }, []);

  const reorderTopics = useCallback((startIndex: number, endIndex: number) => {
    setTopics(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((t, idx) => ({ ...t, order: idx }));
    });
  }, []);

  // Task Actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'order' | 'createdAt' | 'subtasks'> & { subtasks?: string[] }): Task => {
    const taskId = `task-${Date.now()}`;
    const subtasksList: Subtask[] = (taskData.subtasks || []).map((subTitle, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      title: subTitle.trim(),
      completed: false,
      order: idx,
      createdAt: new Date().toISOString()
    })).filter(s => s.title.length > 0);

    const targetTopicTasks = tasks.filter(t => t.topicId === taskData.topicId && t.date === taskData.date);

    const newTask: Task = {
      ...taskData,
      id: taskId,
      order: targetTopicTasks.length,
      subtasks: subtasksList,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
    addToast({ title: 'Task Added', message: `Added "${newTask.title}"`, type: 'success' });
    return newTask;
  }, [tasks, addToast]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== id));
    addToast({ title: 'Task Removed', message: `Deleted "${taskToDelete.title}"`, type: 'info' });
  }, [tasks, addToast]);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;

      const willBeCompleted = task.status !== 'completed';
      const newStatus = willBeCompleted ? 'completed' : 'not_started';

      if (willBeCompleted) {
        soundManager.playCheck();
      } else {
        soundManager.playUncheck();
      }

      // Also toggle all subtasks to match parent
      const updatedSubtasks = task.subtasks.map(s => ({
        ...s,
        completed: willBeCompleted,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined
      }));

      return {
        ...task,
        status: newStatus,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined,
        subtasks: updatedSubtasks
      };
    }));
  }, []);

  const moveTaskToTopic = useCallback((taskId: string, targetTopicId: string, newIndex?: number) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;

      const otherTasks = prev.filter(t => t.id !== taskId);
      const targetTopicTasks = otherTasks.filter(t => t.topicId === targetTopicId);

      const targetOrder = newIndex !== undefined ? newIndex : targetTopicTasks.length;
      const updatedTask: Task = { ...task, topicId: targetTopicId, order: targetOrder };

      const result = [...otherTasks, updatedTask];
      // Re-index target topic tasks
      return result.map(t => {
        if (t.topicId === targetTopicId) {
          const topicTasks = result.filter(item => item.topicId === targetTopicId);
          const idx = topicTasks.findIndex(item => item.id === t.id);
          return { ...t, order: idx >= 0 ? idx : t.order };
        }
        return t;
      });
    });
  }, []);

  const reorderTasks = useCallback((topicId: string, startIndex: number, endIndex: number) => {
    setTasks(prev => {
      const topicTasks = prev.filter(t => t.topicId === topicId).sort((a, b) => a.order - b.order);
      const otherTasks = prev.filter(t => t.topicId !== topicId);

      const [removed] = topicTasks.splice(startIndex, 1);
      topicTasks.splice(endIndex, 0, removed);

      const reindexed = topicTasks.map((t, idx) => ({ ...t, order: idx }));
      return [...otherTasks, ...reindexed];
    });
  }, []);

  // Subtask Actions
  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;

    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const newSub: Subtask = {
        id: `sub-${Date.now()}`,
        title: title.trim(),
        completed: false,
        order: task.subtasks.length,
        createdAt: new Date().toISOString()
      };

      const updatedSubtasks = [...task.subtasks, newSub];
      // If task was completed, revert to in_progress or not_started
      const updatedStatus = task.status === 'completed' ? 'in_progress' : task.status;

      return {
        ...task,
        subtasks: updatedSubtasks,
        status: updatedStatus
      };
    }));
  }, []);

  const updateSubtask = useCallback((taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const updatedSubtasks = task.subtasks.map(s => 
        s.id === subtaskId ? { ...s, ...updates } : s
      );

      return { ...task, subtasks: updatedSubtasks };
    }));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
      return { ...task, subtasks: updatedSubtasks };
    }));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      let willAllBeCompleted = false;
      const updatedSubtasks = task.subtasks.map(s => {
        if (s.id === subtaskId) {
          const nextState = !s.completed;
          if (nextState) soundManager.playCheck();
          else soundManager.playUncheck();
          return { ...s, completed: nextState, completedAt: nextState ? new Date().toISOString() : undefined };
        }
        return s;
      });

      // Check if all subtasks are now completed
      const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
      const anyCompleted = updatedSubtasks.some(s => s.completed);

      let newStatus = task.status;
      if (settings.autoMarkParentComplete && allCompleted) {
        newStatus = 'completed';
        willAllBeCompleted = true;
      } else if (anyCompleted && task.status === 'not_started') {
        newStatus = 'in_progress';
      } else if (!allCompleted && task.status === 'completed') {
        newStatus = 'in_progress';
      }

      if (willAllBeCompleted) {
        soundManager.playCelebration();
        triggerConfetti();
      }

      return {
        ...task,
        subtasks: updatedSubtasks,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      };
    }));
  }, [settings.autoMarkParentComplete, triggerConfetti]);

  const reorderSubtasks = useCallback((taskId: string, startIndex: number, endIndex: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const list = Array.from(task.subtasks);
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);

      return {
        ...task,
        subtasks: list.map((s, idx) => ({ ...s, order: idx }))
      };
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    addToast({ title: 'Settings Updated', message: 'Preferences saved', type: 'info' });
  }, [addToast]);

  const openQuickAdd = useCallback((options?: { topicId?: string; type?: 'topic' | 'task' | 'subtask'; taskId?: string }) => {
    setQuickAddInitialTopicId(options?.topicId || (topics[0]?.id));
    setQuickAddInitialType(options?.type || 'task');
    setQuickAddInitialTaskId(options?.taskId);
    setIsQuickAddOpen(true);
  }, [topics]);

  const closeQuickAdd = useCallback(() => {
    setIsQuickAddOpen(false);
  }, []);

  const loadSampleRoutine = useCallback(() => {
    const seed = getInitialSeedData();
    setTopics(seed.topics);
    setTasks(seed.tasks);
    addToast({ title: 'Sample Loaded', message: 'Loaded Morning & Gym Routines', type: 'success' });
  }, [addToast]);

  const exportData = useCallback(() => {
    return exportBackupData();
  }, []);

  const importData = useCallback((json: string) => {
    const result = importBackupData(json);
    if (result.success) {
      setTopics(loadStoredTopics());
      setTasks(loadStoredTasks());
      setSettings(loadStoredSettings());
      addToast({ title: 'Import Successful', message: 'Data restored successfully', type: 'success' });
    }
    return result;
  }, [addToast]);

  const resetData = useCallback(() => {
    resetAllData();
    setTopics([]);
    setTasks([]);
    setSettings(loadStoredSettings());
    addToast({ title: 'Data Cleared', message: 'All topics and tasks have been reset', type: 'warning' });
  }, [addToast]);

  // Computed Search Results
  const searchResults = useMemo((): SearchResultItem[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // Search Topics
    topics.forEach(topic => {
      if (topic.name.toLowerCase().includes(query) || (topic.description && topic.description.toLowerCase().includes(query))) {
        results.push({
          type: 'topic',
          id: topic.id,
          topicId: topic.id,
          title: topic.name,
          breadcrumbs: [topic.name],
          matchedText: topic.description || 'Topic'
        });
      }
    });

    // Search Tasks & Subtasks
    tasks.forEach(task => {
      const topic = topics.find(t => t.id === task.topicId);
      const topicName = topic ? topic.name : 'Unknown Topic';

      if (task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query))) {
        results.push({
          type: 'task',
          id: task.id,
          topicId: task.topicId,
          taskId: task.id,
          title: task.title,
          breadcrumbs: [topicName, task.title],
          matchedText: task.description || `${task.time ? `At ${task.time}` : 'Task'}`,
          date: task.date,
          time: task.time,
          completed: task.status === 'completed'
        });
      }

      // Search Subtasks
      task.subtasks.forEach(sub => {
        if (sub.title.toLowerCase().includes(query)) {
          results.push({
            type: 'subtask',
            id: sub.id,
            topicId: task.topicId,
            taskId: task.id,
            subtaskId: sub.id,
            title: sub.title,
            breadcrumbs: [topicName, task.title, sub.title],
            matchedText: 'Subtask',
            date: task.date,
            time: task.time,
            completed: sub.completed
          });
        }
      });
    });

    return results;
  }, [searchQuery, topics, tasks]);

  // Computed Today Stats
  const todayStats = useMemo(() => {
    const todayStr = getTodayDateString();
    const todayTasks = tasks.filter(t => t.date === todayStr);

    let totalSub = 0;
    let completedSub = 0;

    todayTasks.forEach(t => {
      totalSub += t.subtasks.length;
      completedSub += t.subtasks.filter(s => s.completed).length;
    });

    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(t => t.status === 'completed').length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      totalSubtasks: totalSub,
      completedSubtasks: completedSub,
      percentage
    };
  }, [tasks]);

  // Get Topic Stats helper
  const getTopicStats = useCallback((topicId: string, date = getTodayDateString()) => {
    const topicTasks = tasks.filter(t => t.topicId === topicId && (date ? t.date === date : true));
    const total = topicTasks.length;
    const completed = topicTasks.filter(t => t.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [tasks]);

  return (
    <TodoContext.Provider value={{
      topics,
      tasks,
      settings,
      activeView,
      selectedDate,
      searchQuery,
      filterPriority,
      filterStatus,
      sortBy,
      toasts,
      isSearchOpen,
      isQuickAddOpen,
      quickAddInitialTopicId,
      quickAddInitialType,
      quickAddInitialTaskId,
      highlightedTaskId,
      highlightedTopicId,
      setActiveView,
      setSelectedDate,
      setSearchQuery,
      setFilterPriority,
      setFilterStatus,
      setSortBy,
      setIsSearchOpen,
      openQuickAdd,
      closeQuickAdd,
      setHighlightedTaskId,
      setHighlightedTopicId,
      addTopic,
      updateTopic,
      deleteTopic,
      toggleTopicCollapse,
      reorderTopics,
      collapseAllTopics,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      moveTaskToTopic,
      reorderTasks,
      addSubtask,
      updateSubtask,
      deleteSubtask,
      toggleSubtask,
      reorderSubtasks,
      updateSettings,
      triggerConfetti,
      addToast,
      removeToast,
      loadSampleRoutine,
      exportData,
      importData,
      resetData,
      searchResults,
      todayStats,
      getTopicStats
    }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};
