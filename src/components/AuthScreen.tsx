import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Dumbbell, 
  BookOpen, 
  Flame,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTodo } from '../context/TodoContext';
import { soundManager } from '../utils/sound';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const { updateSettings, loadSampleRoutine, triggerConfetti } = useTodo();

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [routineFocus, setRoutineFocus] = useState('Fitness & Workouts');
  const [preloadTemplate, setPreloadTemplate] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const focusOptions = [
    { label: 'Fitness & Workouts', icon: Dumbbell },
    { label: 'Work & Deep Focus', icon: Zap },
    { label: 'Study & Academics', icon: BookOpen },
    { label: 'Personal Habits', icon: Flame }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'signup') {
      const res = signUp(name, email, password, routineFocus);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed');
        return;
      }

      // Update app settings with the user's name
      updateSettings({ userName: name.trim() });

      // If user wanted sample routines loaded
      if (preloadTemplate) {
        loadSampleRoutine();
      }

      soundManager.playCelebration();
      triggerConfetti();
    } else {
      const res = signIn(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Sign in failed');
        return;
      }

      soundManager.playCheck();
    }
  };

  const handleGuestDemo = () => {
    const guestRes = signUp('Yash', `guest-${Date.now()}@tempo.app`, '', 'Fitness & Workouts');
    if (guestRes.success) {
      updateSettings({ userName: 'Yash' });
      loadSampleRoutine();
      soundManager.playCelebration();
      triggerConfetti();
    }
  };

  return (
    <div className="auth-fullscreen-container">
      {/* Background ambient lighting */}
      <div className="auth-ambient-orb orb-1" />
      <div className="auth-ambient-orb orb-2" />

      <div className="auth-card-wrapper">
        {/* Brand Banner */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} />
          </div>
          <h1 className="auth-app-name">Tempo</h1>
          <p className="auth-tagline">Hierarchical Daily Planner & Routine Command Center</p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Mode Tabs */}
          <div className="auth-mode-selector">
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
            >
              <span>Create Account</span>
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage('');
              }}
            >
              <span>Sign In</span>
            </button>
          </div>

          {errorMessage && (
            <div className="auth-error-banner">
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* SIGN UP FIELDS */}
            {authMode === 'signup' && (
              <>
                <div className="auth-form-group">
                  <label className="auth-field-label">Your Name</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-text-input"
                      placeholder="e.g. Yashwant Dasour"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-field-label">Primary Daily Focus</label>
                  <div className="auth-focus-grid">
                    {focusOptions.map(opt => {
                      const IconC = opt.icon;
                      const isSel = routineFocus === opt.label;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          className={`auth-focus-pill ${isSel ? 'selected' : ''}`}
                          onClick={() => setRoutineFocus(opt.label)}
                        >
                          <IconC size={13} />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* COMMON FIELDS: EMAIL & PASSWORD */}
            <div className="auth-form-group">
              <label className="auth-field-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-text-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-field-label">
                Password {authMode === 'signup' && <span className="auth-optional-tag">(optional for local use)</span>}
              </label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-text-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={preloadTemplate}
                  onChange={(e) => setPreloadTemplate(e.target.checked)}
                />
                <span>Preload Morning & Gym Routine template (Topics → Tasks → Subtasks)</span>
              </label>
            )}

            <button type="submit" className="auth-submit-btn">
              <span>{authMode === 'signup' ? 'Get Started & Personalize' : 'Sign In to My Dashboard'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Bypass */}
          <div className="auth-footer-bypass">
            <div className="auth-divider">
              <span>or</span>
            </div>
            <button
              type="button"
              className="auth-guest-btn"
              onClick={handleGuestDemo}
            >
              <Shield size={14} />
              <span>Continue with Instant Demo Mode</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="auth-features-row">
          <div className="auth-feature-pill">
            <Layers size={14} />
            <span>Topic → Task → Subtask</span>
          </div>
          <div className="auth-feature-pill">
            <CheckCircle2 size={14} />
            <span>Instant Local & Offline Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
