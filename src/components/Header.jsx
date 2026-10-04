import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Activity, 
  Calendar, 
  Compass, 
  Flag, 
  Eye, 
  Timer, 
  BarChart3, 
  Settings, 
  Flame,
  Search,
  User,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { 
    countdown, 
    streakData, 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery,
    currentUser,
    settings
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Activity },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'milestones', label: 'Milestones', icon: Flag },
    { id: 'focus', label: 'Focus Mode', icon: Eye, highlight: true },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const urgencyColors = {
    LOW: 'border-zinc-700 text-zinc-300',
    MEDIUM: 'border-zinc-500 text-white',
    HIGH: 'border-red-600/70 text-red-400',
    CRITICAL: 'border-red-600 bg-red-950/40 text-red-500 animate-pulse'
  };

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-zinc-800">
      {/* Top Banner: Urgency & Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span className="font-bold tracking-widest text-zinc-300 uppercase">MISSION OBJECTIVE:</span>
            <span className="font-black text-white tracking-wider">2 JUNE 2027</span>
          </div>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400 font-mono">
            {settings.timezone}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-2.5 py-0.5 rounded border text-[11px] font-mono font-bold tracking-wider uppercase ${urgencyColors[countdown.urgency] || urgencyColors.LOW}`}>
            URGENCY: {countdown.urgency}
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
            <Flame className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="font-bold text-white">{streakData.currentStreak}</span>
            <span className="text-zinc-500 text-[10px] uppercase">DAY STREAK</span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800 text-zinc-400">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-200">{currentUser?.username || 'Commander'}</span>
          </div>
        </div>
      </div>

      {/* Main Bar: Title & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer group flex items-center gap-3 select-none"
          >
            <div className="w-9 h-9 rounded bg-red-600 flex items-center justify-center font-black text-black text-xl tracking-tighter group-hover:bg-red-500 transition-colors shadow-lg shadow-red-900/30">
              27
            </div>
            <div>
              <h1 className="font-black text-lg md:text-xl tracking-wider text-white uppercase flex items-center gap-2">
                2 JUNE 2027 <span className="text-red-600">—</span> <span className="text-zinc-300 font-medium text-sm md:text-base">MY GOAL</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                Personal Mission Control & Countdown Engine
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals, tasks, habits..."
              className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs rounded border border-zinc-800 pl-9 pr-3 py-2 focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setActiveTab('focus')}
            className="px-3.5 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-red-950"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 border-t border-zinc-900/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 uppercase tracking-wider ${
                isActive
                  ? 'border-red-600 text-white bg-zinc-900/60'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/40'
              } ${item.highlight && !isActive ? 'text-red-400' : ''}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
