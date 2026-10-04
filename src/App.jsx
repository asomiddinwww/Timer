import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Tasks from './components/Tasks';
import Habits from './components/Habits';
import CalendarView from './components/CalendarView';
import Roadmap from './components/Roadmap';
import Milestones from './components/Milestones';
import FocusMode from './components/FocusMode';
import Pomodoro from './components/Pomodoro';
import Analytics from './components/Analytics';
import SettingsView from './components/SettingsView';
import EndOfDayReviewModal from './components/EndOfDayReviewModal';
import { Moon, Sparkles } from 'lucide-react';

function MainApp() {
  const { activeTab, setActiveTab } = useApp();
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Header bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'goals' && <Goals />}
        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'habits' && <Habits />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'roadmap' && <Roadmap />}
        {activeTab === 'milestones' && <Milestones />}
        {activeTab === 'focus' && <FocusMode />}
        {activeTab === 'pomodoro' && <Pomodoro />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating End-of-Day Review Trigger */}
      {activeTab !== 'focus' && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setIsReviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-red-600 text-white font-mono text-xs uppercase tracking-wider shadow-2xl transition-all hover:scale-105 group"
          >
            <Moon className="w-4 h-4 text-red-500 group-hover:rotate-12 transition-transform" />
            <span className="font-bold">END-OF-DAY DEBRIEF</span>
          </button>
        </div>
      )}

      {/* End of Day Modal */}
      <EndOfDayReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/90 py-6 text-center text-xs font-mono text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>“2 JUNE 2027 — MY GOAL” • PERSONAL MISSION CONTROL</span>
          <span className="text-zinc-500">TARGET TIMEZONE: ASIA/TASHKENT (UTC+5)</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
