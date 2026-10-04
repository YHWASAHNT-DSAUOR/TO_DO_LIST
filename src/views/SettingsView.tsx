import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  User 
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import type { ReminderOption } from '../types';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendPushNotification 
} from '../utils/notifications';
import { soundManager } from '../utils/sound';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    loadSampleRoutine, 
    resetData, 
    addToast 
  } = useTodo();

  const [userNameInput, setUserNameInput] = useState(settings.userName || 'Yash');
  const [notifState, setNotifState] = useState(getNotificationPermission());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveUserName = () => {
    if (userNameInput.trim()) {
      updateSettings({ userName: userNameInput.trim() });
    }
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotifState(perm);
    if (perm === 'granted') {
      updateSettings({ pushNotificationsEnabled: true });
      sendPushNotification('Notifications Activated 🎉', {
        body: 'You are all set to receive reminders for your workouts and tasks!'
      });
      addToast({ title: 'Notifications Enabled', message: 'Push notifications are now working!', type: 'success' });
    }
  };

  const handleTestNotification = () => {
    soundManager.playReminder();
    sendPushNotification('🏋️ Test Reminder: Chest Workout', {
      body: 'Your task starts in 5 minutes. Get ready for Bench Press!'
    });
    addToast({
      title: '🏋️ Test Reminder Sent',
      message: 'Chest Workout starting in 5 minutes',
      type: 'reminder'
    });
  };

  const handleTestSound = () => {
    soundManager.playCelebration();
    addToast({ title: 'Sound Played', message: 'Played task celebration fanfare', type: 'info' });
  };

  const handleExportJSON = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast({ title: 'Data Exported', message: 'Backup JSON downloaded', type: 'success' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importData(content);
        if (!res.success) {
          addToast({ title: 'Import Failed', message: res.error || 'Invalid file', type: 'warning' });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you sure you want to reset all data? This will remove all your topics, tasks, and subtasks.')) {
      resetData();
    }
  };

  return (
    <div className="settings-view-container">
      <div className="settings-header-banner">
        <div className="settings-title-row">
          <SettingsIcon size={22} className="settings-title-icon" />
          <h2>Application Settings</h2>
        </div>
        <p className="settings-subtitle">
          Customize notifications, reminders, themes, and manage data backups.
        </p>
      </div>

      <div className="settings-cards-grid">
        {/* User Profile / Greeting */}
        <div className="settings-card">
          <div className="settings-card-header">
            <User size={18} />
            <h3>Personalization</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-field">
              <label className="setting-label">Your Name (for greetings)</label>
              <div className="setting-input-inline">
                <input
                  type="text"
                  className="setting-text-input"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  placeholder="e.g. Yash"
                />
                <button
                  type="button"
                  className="setting-save-btn"
                  onClick={handleSaveUserName}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Bell size={18} />
            <h3>Reminders & Notifications</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-field">
              <label className="setting-label">Default Reminder Offset</label>
              <p className="setting-hint">Automatically set this reminder time when adding new tasks.</p>
              <select
                className="setting-select-input"
                value={settings.defaultReminder}
                onChange={(e) => updateSettings({ defaultReminder: e.target.value as ReminderOption })}
              >
                <option value="none">No reminder</option>
                <option value="at_time">At time of task</option>
                <option value="5m">5 minutes before</option>
                <option value="10m">10 minutes before</option>
                <option value="15m">15 minutes before</option>
                <option value="30m">30 minutes before</option>
                <option value="1h">1 hour before</option>
              </select>
            </div>

            <div className="setting-field">
              <div className="setting-toggle-row">
                <div>
                  <span className="setting-toggle-title">Browser Push Notifications</span>
                  <p className="setting-hint">Status: <strong>{notifState.toUpperCase()}</strong></p>
                </div>
                {notifState !== 'granted' ? (
                  <button
                    type="button"
                    className="setting-action-pill-btn"
                    onClick={handleRequestPermission}
                  >
                    <ShieldCheck size={14} />
                    <span>Grant Permission</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="setting-action-pill-btn secondary"
                    onClick={handleTestNotification}
                  >
                    Test Push Notification
                  </button>
                )}
              </div>
            </div>

            <div className="setting-field">
              <div className="setting-toggle-row">
                <div>
                  <span className="setting-toggle-title">Audio & Sound Chimes</span>
                  <p className="setting-hint">Crisp procedural audio effects on checkmarks and reminders.</p>
                </div>
                <div className="setting-button-group">
                  <button
                    type="button"
                    className={`setting-action-pill-btn ${settings.soundEnabled ? '' : 'inactive'}`}
                    onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  >
                    {settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{settings.soundEnabled ? 'Enabled' : 'Muted'}</span>
                  </button>
                  {settings.soundEnabled && (
                    <button
                      type="button"
                      className="setting-action-pill-btn secondary"
                      onClick={handleTestSound}
                      title="Preview celebration chime"
                    >
                      Preview Sound
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Display & Behavior */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Sun size={18} />
            <h3>Appearance & Behavior</h3>
          </div>
          <div className="settings-card-body">
            <div className="setting-field">
              <label className="setting-label">Theme Mode</label>
              <div className="theme-toggle-chips">
                <button
                  type="button"
                  className={`theme-chip ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => updateSettings({ theme: 'dark' })}
                >
                  <Moon size={14} />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  className={`theme-chip ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => updateSettings({ theme: 'light' })}
                >
                  <Sun size={14} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`theme-chip ${settings.theme === 'system' ? 'active' : ''}`}
                  onClick={() => updateSettings({ theme: 'system' })}
                >
                  <span>System</span>
                </button>
              </div>
            </div>

            <div className="setting-field">
              <label className="setting-label">Time Format</label>
              <div className="theme-toggle-chips">
                <button
                  type="button"
                  className={`theme-chip ${settings.timeFormat === '12h' ? 'active' : ''}`}
                  onClick={() => updateSettings({ timeFormat: '12h' })}
                >
                  <span>12-Hour (8:00 AM)</span>
                </button>
                <button
                  type="button"
                  className={`theme-chip ${settings.timeFormat === '24h' ? 'active' : ''}`}
                  onClick={() => updateSettings({ timeFormat: '24h' })}
                >
                  <span>24-Hour (08:00)</span>
                </button>
              </div>
            </div>

            <div className="setting-field">
              <div className="setting-toggle-row">
                <div>
                  <span className="setting-toggle-title">Auto-Complete Parent Task</span>
                  <p className="setting-hint">Automatically complete parent task when all of its subtasks are checked.</p>
                </div>
                <input
                  type="checkbox"
                  className="setting-checkbox-toggle"
                  checked={settings.autoMarkParentComplete}
                  onChange={(e) => updateSettings({ autoMarkParentComplete: e.target.checked })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Persistence & Backup */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Download size={18} />
            <h3>Data & Backup</h3>
          </div>
          <div className="settings-card-body">
            <p className="setting-hint">All topics, tasks, subtasks, and reminder configurations are stored locally in your browser.</p>

            <div className="data-actions-row">
              <button
                type="button"
                className="data-action-btn"
                onClick={handleExportJSON}
              >
                <Download size={15} />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="button"
                className="data-action-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>Import JSON Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
            </div>

            <div className="data-secondary-actions">
              <button
                type="button"
                className="data-routine-btn"
                onClick={loadSampleRoutine}
              >
                <Sparkles size={14} />
                <span>Reload Sample Morning & Gym Routines</span>
              </button>

              <button
                type="button"
                className="data-reset-btn"
                onClick={handleResetConfirm}
              >
                <Trash2 size={14} />
                <span>Reset All Application Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
