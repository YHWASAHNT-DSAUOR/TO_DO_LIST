import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'tempo_auth_current_user_v1',
  USERS_LIST: 'tempo_auth_users_directory_v1'
};

const DEFAULT_AVATAR_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'
];

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  signIn: (email: string, password?: string) => { success: boolean; error?: string };
  signUp: (name: string, email: string, password?: string, routineFocus?: string) => { success: boolean; error?: string };
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_LIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync users directory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users directory:', e);
    }
  }, [users]);

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to save current user:', e);
    }
  }, [currentUser]);

  const signUp = useCallback((name: string, email: string, password = '', routineFocus = 'Daily Balance'): { success: boolean; error?: string } => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const existing = users.find(u => u.email === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const randomColor = DEFAULT_AVATAR_COLORS[Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)];

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password,
      createdAt: new Date().toISOString(),
      avatarColor: randomColor,
      routineFocus
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    return { success: true };
  }, [users]);

  const signIn = useCallback((email: string, password = ''): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email.' };
    }

    const user = users.find(u => u.email === trimmedEmail);
    if (!user) {
      return { success: false, error: 'No account found with this email. Please sign up first.' };
    }

    // If account has password, check match
    if (user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(user);
    return { success: true };
  }, [users]);

  const signOut = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
