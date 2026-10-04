import React, { useState } from 'react';
import { TodoProvider, useTodo } from './context/TodoContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { SearchModal } from './components/SearchModal';
import { NotificationToastContainer } from './components/NotificationToast';
import { InstallAppBanner } from './components/InstallAppBanner';

import { TodayView } from './views/TodayView';
import { TimelineView } from './views/TimelineView';
import { UpcomingView } from './views/UpcomingView';
import { TopicsView } from './views/TopicsView';
import { CompletedView } from './views/CompletedView';
import { SettingsView } from './views/SettingsView';

import './App.css';

const MainLayout: React.FC = () => {
  const { activeView } = useTodo();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'today':
        return <TodayView />;
      case 'timeline':
        return <TimelineView />;
      case 'upcoming':
        return <UpcomingView />;
      case 'topics':
        return <TopicsView />;
      case 'completed':
        return <CompletedView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`app-main-viewport ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <main className="app-content-container">
          <InstallAppBanner />
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <QuickAddModal />
      <SearchModal />
      <NotificationToastContainer />
    </div>
  );
};

export function App() {
  return (
    <TodoProvider>
      <MainLayout />
    </TodoProvider>
  );
}

export default App;
