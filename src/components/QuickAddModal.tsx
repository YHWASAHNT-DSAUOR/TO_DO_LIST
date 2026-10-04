import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  Bell, 
  Repeat, 
  ListTree, 
  Layers, 
  AlertCircle
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import type { Priority, ReminderOption, RepeatFrequency } from '../types';
import { getTodayDateString, getFormattedDateString } from '../utils/dateUtils';
import { IconPicker } from './IconPicker';
import { ColorPicker, ACCENT_COLORS } from './ColorPicker';

export const QuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, 
    closeQuickAdd, 
    topics, 
    tasks, 
    addTopic, 
    updateTopic, 
    addTask, 
    updateTask, 
    addSubtask, 
    quickAddInitialTopicId, 
    quickAddInitialType, 
    quickAddInitialTaskId, 
    settings 
  } = useTodo();

  const [mode, setMode] = useState<'task' | 'topic' | 'subtask'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTopicId, setTaskTopicId] = useState(topics[0]?.id || '');
  const [taskDate, setTaskDate] = useState(getTodayDateString());
  const [taskTime, setTaskTime] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('none');
  const [taskReminder, setTaskReminder] = useState<ReminderOption>(settings.defaultReminder || '10m');
  const [taskCustomMinutes, setTaskCustomMinutes] = useState(15);
  const [taskRepeat, setTaskRepeat] = useState<RepeatFrequency>('none');
  const [taskRepeatDays, setTaskRepeatDays] = useState<number[]>([]);
  const [subtasksInputList, setSubtasksInputList] = useState<string[]>([]);
  const [currentSubtaskDraft, setCurrentSubtaskDraft] = useState('');

  // Topic form state
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicIcon, setTopicIcon] = useState('Sun');
  const [topicColor, setTopicColor] = useState(ACCENT_COLORS[0].hex);

  // Subtask standalone state
  const [targetTaskId, setTargetTaskId] = useState('');
  const [standaloneSubtaskTitle, setStandaloneSubtaskTitle] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const subtaskDraftInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isQuickAddOpen) {
      const initialMode = quickAddInitialType || 'task';
      setMode(initialMode);

      if (quickAddInitialTaskId) {
        const existingTask = tasks.find(t => t.id === quickAddInitialTaskId);
        if (existingTask) {
          setTaskTitle(existingTask.title);
          setTaskDescription(existingTask.description || '');
          setTaskTopicId(existingTask.topicId);
          setTaskDate(existingTask.date);
          setTaskTime(existingTask.time || '');
          setTaskPriority(existingTask.priority);
          setTaskReminder(existingTask.reminder);
          setTaskCustomMinutes(existingTask.customReminderMinutes || 15);
          setTaskRepeat(existingTask.repeat);
          setTaskRepeatDays(existingTask.repeatDays || []);
          setSubtasksInputList(existingTask.subtasks.map(s => s.title));
        }
      } else if (quickAddInitialTopicId && initialMode === 'topic') {
        const existingTopic = topics.find(t => t.id === quickAddInitialTopicId);
        if (existingTopic) {
          setTopicName(existingTopic.name);
          setTopicDescription(existingTopic.description || '');
          setTopicIcon(existingTopic.icon);
          setTopicColor(existingTopic.color);
        }
      } else {
        // Reset defaults
        setTaskTitle('');
        setTaskDescription('');
        setTaskTopicId(quickAddInitialTopicId || topics[0]?.id || '');
        setTaskDate(getTodayDateString());
        setTaskTime('');
        setTaskPriority('none');
        setTaskReminder(settings.defaultReminder || '10m');
        setTaskCustomMinutes(15);
        setTaskRepeat('none');
        setTaskRepeatDays([]);
        setSubtasksInputList([]);
        setCurrentSubtaskDraft('');

        setTopicName('');
        setTopicDescription('');
        setTopicIcon('Sun');
        setTopicColor(ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)].hex);

        setTargetTaskId(tasks[0]?.id || '');
        setStandaloneSubtaskTitle('');
      }

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isQuickAddOpen, quickAddInitialTopicId, quickAddInitialType, quickAddInitialTaskId, topics, tasks, settings.defaultReminder]);

  if (!isQuickAddOpen) return null;

  const handleAddSubtaskDraft = () => {
    if (currentSubtaskDraft.trim()) {
      setSubtasksInputList(prev => [...prev, currentSubtaskDraft.trim()]);
      setCurrentSubtaskDraft('');
      setTimeout(() => {
        subtaskDraftInputRef.current?.focus();
      }, 50);
    }
  };

  const handleRemoveSubtaskDraft = (index: number) => {
    setSubtasksInputList(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleDay = (dayIndex: number) => {
    setTaskRepeatDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'task') {
      if (!taskTitle.trim()) return;

      // Make sure we have a valid topic
      let targetTopicId = taskTopicId;
      if (!targetTopicId) {
        if (topics.length > 0) {
          targetTopicId = topics[0].id;
        } else {
          // Create default topic
          const newT = addTopic({
            name: 'General',
            icon: 'Folder',
            color: '#6366F1'
          });
          targetTopicId = newT.id;
        }
      }

      // Include current draft subtask if not empty
      const finalSubtasks = [...subtasksInputList];
      if (currentSubtaskDraft.trim()) {
        finalSubtasks.push(currentSubtaskDraft.trim());
      }

      if (quickAddInitialTaskId) {
        // Edit existing task
        updateTask(quickAddInitialTaskId, {
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          topicId: targetTopicId,
          date: taskDate,
          time: taskTime || undefined,
          priority: taskPriority,
          reminder: taskReminder,
          customReminderMinutes: taskReminder === 'custom' ? taskCustomMinutes : undefined,
          repeat: taskRepeat,
          repeatDays: taskRepeat === 'custom' ? taskRepeatDays : undefined
        });
      } else {
        // Create new task
        addTask({
          topicId: targetTopicId,
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          date: taskDate,
          time: taskTime || undefined,
          priority: taskPriority,
          status: 'not_started',
          reminder: taskReminder,
          customReminderMinutes: taskReminder === 'custom' ? taskCustomMinutes : undefined,
          repeat: taskRepeat,
          repeatDays: taskRepeat === 'custom' ? taskRepeatDays : undefined,
          subtasks: finalSubtasks
        });
      }

      closeQuickAdd();
    } else if (mode === 'topic') {
      if (!topicName.trim()) return;

      if (quickAddInitialTopicId) {
        updateTopic(quickAddInitialTopicId, {
          name: topicName.trim(),
          description: topicDescription.trim() || undefined,
          icon: topicIcon,
          color: topicColor
        });
      } else {
        addTopic({
          name: topicName.trim(),
          description: topicDescription.trim() || undefined,
          icon: topicIcon,
          color: topicColor
        });
      }
      closeQuickAdd();
    } else if (mode === 'subtask') {
      if (!standaloneSubtaskTitle.trim() || !targetTaskId) return;
      addSubtask(targetTaskId, standaloneSubtaskTitle.trim());
      closeQuickAdd();
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getFormattedDateString(tomorrow);
  const todayStr = getTodayDateString();

  return (
    <div className="modal-backdrop" onClick={closeQuickAdd}>
      <div className="quick-add-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="quick-add-modal-header">
          {/* Mode Selector Tabs */}
          <div className="modal-mode-tabs">
            <button
              type="button"
              className={`mode-tab-btn ${mode === 'task' ? 'active' : ''}`}
              onClick={() => setMode('task')}
            >
              <Plus size={15} />
              <span>{quickAddInitialTaskId ? 'Edit Task' : 'New Task'}</span>
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${mode === 'topic' ? 'active' : ''}`}
              onClick={() => setMode('topic')}
            >
              <Layers size={15} />
              <span>{quickAddInitialTopicId ? 'Edit Topic' : 'New Topic'}</span>
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${mode === 'subtask' ? 'active' : ''}`}
              onClick={() => setMode('subtask')}
            >
              <ListTree size={15} />
              <span>New Subtask</span>
            </button>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={closeQuickAdd}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="quick-add-form">
          {/* MODE: TASK */}
          {mode === 'task' && (
            <div className="form-section-stack">
              {/* Task Title */}
              <div className="form-group">
                <input
                  ref={titleInputRef}
                  type="text"
                  className="quick-add-main-input"
                  placeholder="What would you like to do? (e.g. Chest Workout)"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              {/* Task Description */}
              <div className="form-group">
                <input
                  type="text"
                  className="quick-add-sub-input"
                  placeholder="Add notes or description (optional)..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              {/* Topic & Date Row */}
              <div className="form-row-grid">
                {/* Topic Selector */}
                <div className="form-control-item">
                  <label className="form-control-label">
                    <Layers size={13} />
                    <span>Topic</span>
                  </label>
                  <select
                    className="form-select-input"
                    value={taskTopicId}
                    onChange={(e) => setTaskTopicId(e.target.value)}
                    required
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selector */}
                <div className="form-control-item">
                  <label className="form-control-label">
                    <Calendar size={13} />
                    <span>Date</span>
                  </label>
                  <div className="date-picker-row">
                    <button
                      type="button"
                      className={`date-preset-pill ${taskDate === todayStr ? 'active' : ''}`}
                      onClick={() => setTaskDate(todayStr)}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className={`date-preset-pill ${taskDate === tomorrowStr ? 'active' : ''}`}
                      onClick={() => setTaskDate(tomorrowStr)}
                    >
                      Tomorrow
                    </button>
                    <input
                      type="date"
                      className="form-date-input"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Time & Reminder Row */}
              <div className="form-row-grid">
                {/* Time Picker */}
                <div className="form-control-item">
                  <label className="form-control-label">
                    <Clock size={13} />
                    <span>Scheduled Time (optional)</span>
                  </label>
                  <div className="time-picker-wrapper">
                    <input
                      type="time"
                      className="form-time-input"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                    />
                    {taskTime && (
                      <button
                        type="button"
                        className="time-clear-btn"
                        onClick={() => setTaskTime('')}
                        title="Clear time"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Reminder Option */}
                <div className="form-control-item">
                  <label className="form-control-label">
                    <Bell size={13} />
                    <span>Reminder Notification</span>
                  </label>
                  <select
                    className="form-select-input"
                    value={taskReminder}
                    onChange={(e) => setTaskReminder(e.target.value as ReminderOption)}
                  >
                    <option value="none">No reminder</option>
                    <option value="at_time">At time of task</option>
                    <option value="5m">5 minutes before</option>
                    <option value="10m">10 minutes before</option>
                    <option value="15m">15 minutes before</option>
                    <option value="30m">30 minutes before</option>
                    <option value="1h">1 hour before</option>
                    <option value="custom">Custom minutes before</option>
                  </select>
                </div>
              </div>

              {/* Custom Reminder Minutes if selected */}
              {taskReminder === 'custom' && (
                <div className="form-control-item">
                  <label className="form-control-label">Minutes before task:</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    className="form-number-input"
                    value={taskCustomMinutes}
                    onChange={(e) => setTaskCustomMinutes(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              )}

              {/* Priority & Repeat Row */}
              <div className="form-row-grid">
                {/* Priority Selection */}
                <div className="form-control-item">
                  <label className="form-control-label">
                    <AlertCircle size={13} />
                    <span>Priority</span>
                  </label>
                  <div className="priority-chips-group">
                    {(['none', 'low', 'medium', 'high', 'urgent'] as Priority[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-chip-btn ${p} ${taskPriority === p ? 'selected' : ''}`}
                        onClick={() => setTaskPriority(p)}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Repeat Frequency */}
                <div className="form-control-item">
                  <label className="form-control-label">
                    <Repeat size={13} />
                    <span>Repeat</span>
                  </label>
                  <select
                    className="form-select-input"
                    value={taskRepeat}
                    onChange={(e) => setTaskRepeat(e.target.value as RepeatFrequency)}
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Every Weekday (Mon-Fri)</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom Days of Week</option>
                  </select>
                </div>
              </div>

              {/* Custom Repeat Days */}
              {taskRepeat === 'custom' && (
                <div className="form-control-item">
                  <label className="form-control-label">Repeat on:</label>
                  <div className="days-picker-row">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dName, dIdx) => (
                      <button
                        key={dName}
                        type="button"
                        className={`day-selector-btn ${taskRepeatDays.includes(dIdx) ? 'active' : ''}`}
                        onClick={() => handleToggleDay(dIdx)}
                      >
                        {dName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks Builder Section */}
              <div className="form-subtasks-builder">
                <label className="form-control-label">
                  <ListTree size={13} />
                  <span>Subtasks Hierarchy (Topic → Task → Subtasks)</span>
                </label>

                {/* Subtask draft list */}
                {subtasksInputList.length > 0 && (
                  <div className="draft-subtasks-list">
                    {subtasksInputList.map((sub, sIdx) => (
                      <div key={sIdx} className="draft-subtask-chip">
                        <span className="draft-subtask-tree">├──</span>
                        <span className="draft-subtask-title">{sub}</span>
                        <button
                          type="button"
                          className="draft-subtask-remove"
                          onClick={() => handleRemoveSubtaskDraft(sIdx)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new subtask input */}
                <div className="subtask-fast-entry-row">
                  <input
                    ref={subtaskDraftInputRef}
                    type="text"
                    className="subtask-fast-input"
                    placeholder="Add a subtask (e.g. Bench Press, Incline Dumbbell Press)..."
                    value={currentSubtaskDraft}
                    onChange={(e) => setCurrentSubtaskDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtaskDraft();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="subtask-fast-add-btn"
                    onClick={handleAddSubtaskDraft}
                    disabled={!currentSubtaskDraft.trim()}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE: TOPIC */}
          {mode === 'topic' && (
            <div className="form-section-stack">
              <div className="form-group">
                <label className="form-control-label">Topic Name</label>
                <input
                  ref={titleInputRef}
                  type="text"
                  className="quick-add-main-input"
                  placeholder="e.g. Gym, Morning, Work, Side Project..."
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-control-label">Description (optional)</label>
                <input
                  type="text"
                  className="quick-add-sub-input"
                  placeholder="e.g. Chest & Triceps Routine, Deep Focus..."
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-control-label">Accent Color</label>
                <ColorPicker
                  selectedColor={topicColor}
                  onSelectColor={(hex) => setTopicColor(hex)}
                />
              </div>

              <div className="form-group">
                <label className="form-control-label">Topic Icon</label>
                <IconPicker
                  selectedIcon={topicIcon}
                  onSelectIcon={(iconName) => setTopicIcon(iconName)}
                />
              </div>
            </div>
          )}

          {/* MODE: SUBTASK */}
          {mode === 'subtask' && (
            <div className="form-section-stack">
              <div className="form-group">
                <label className="form-control-label">Choose Parent Task</label>
                <select
                  className="form-select-input"
                  value={targetTaskId}
                  onChange={(e) => setTargetTaskId(e.target.value)}
                  required
                >
                  {tasks.map(t => {
                    const top = topics.find(item => item.id === t.topicId);
                    return (
                      <option key={t.id} value={t.id}>
                        {top ? `[${top.name}] ` : ''}{t.title} ({t.date})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-control-label">Subtask Title</label>
                <input
                  ref={titleInputRef}
                  type="text"
                  className="quick-add-main-input"
                  placeholder="e.g. Bench Press (4 Sets x 8 Reps)"
                  value={standaloneSubtaskTitle}
                  onChange={(e) => setStandaloneSubtaskTitle(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="modal-footer-actions">
            <button
              type="button"
              className="modal-cancel-button"
              onClick={closeQuickAdd}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-submit-button"
              disabled={
                (mode === 'task' && !taskTitle.trim()) ||
                (mode === 'topic' && !topicName.trim()) ||
                (mode === 'subtask' && (!standaloneSubtaskTitle.trim() || !targetTaskId))
              }
            >
              {quickAddInitialTaskId ? 'Save Changes' : mode === 'topic' ? (quickAddInitialTopicId ? 'Save Topic' : 'Create Topic') : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
