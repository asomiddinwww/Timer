import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, DEFAULT_SETTINGS, DEFAULT_USER } from '../services/db';
import { calculateRemainingTime, calculateDaysPassed } from '../utils/timeCalculations';
import { calculateMasterStreak, calculateGoalProgress } from '../utils/progressCalculations';
import { notificationService } from '../services/notifications';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // State
  const [currentUser, setCurrentUser] = useState(() => db.loadCurrentUser());
  const [settings, setSettings] = useState(() => db.getSettings());
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState([]);
  const [dailyReviews, setDailyReviews] = useState([]);
  
  // Navigation & Search state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'goals', 'tasks', 'habits', 'calendar', 'roadmap', 'milestones', 'focus', 'pomodoro', 'analytics', 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Exact Countdown Realtime State
  const [countdown, setCountdown] = useState(() => calculateRemainingTime(settings.deadline, settings.timezone));

  // Load all user data
  const refreshData = useCallback(() => {
    const currentUserId = currentUser?.id || DEFAULT_USER.id;
    setGoals(db.getGoals(currentUserId));
    setTasks(db.getTasks(currentUserId));
    setHabits(db.getHabits(currentUserId));
    setHabitLogs(db.getHabitLogs(currentUserId));
    setMilestones(db.getMilestones(currentUserId));
    setPomodoroSessions(db.getPomodoroSessions(currentUserId));
    setDailyReviews(db.getDailyReviews());
  }, [currentUser]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Tick timer every second with zero unnecessary re-render overhead on child components
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateRemainingTime(settings.deadline, settings.timezone));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.deadline, settings.timezone]);

  // Streak calculations
  const streakData = calculateMasterStreak(tasks, habitLogs, habits, settings.streakRule);
  const overallGoalProgress = calculateGoalProgress(goals);
  const daysPassed = calculateDaysPassed(settings.startDate);

  // Settings update
  const updateSettings = (newSettings) => {
    const saved = db.saveSettings(newSettings);
    setSettings(saved);
  };

  // User Actions
  const handleSwitchUser = (user) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    refreshData();
  };

  const handleCreateUser = (username, email) => {
    const user = db.createUser(username, email);
    handleSwitchUser(user);
    return user;
  };

  // Goals CRUD
  const addGoal = (goalData) => {
    const created = db.createGoal(goalData);
    refreshData();
    return created;
  };

  const editGoal = (id, updates) => {
    const updated = db.updateGoal(id, updates);
    refreshData();
    return updated;
  };

  const removeGoal = (id) => {
    db.deleteGoal(id);
    refreshData();
  };

  // Tasks CRUD
  const addTask = (taskData) => {
    const created = db.createTask(taskData);
    refreshData();
    return created;
  };

  const editTask = (id, updates) => {
    const updated = db.updateTask(id, updates);
    refreshData();
    return updated;
  };

  const removeTask = (id) => {
    db.deleteTask(id);
    refreshData();
  };

  // Habits CRUD
  const addHabit = (habitData) => {
    const created = db.createHabit(habitData);
    refreshData();
    return created;
  };

  const removeHabit = (id) => {
    db.deleteHabit(id);
    refreshData();
  };

  const toggleHabit = (habitId, date) => {
    db.toggleHabitLog(habitId, date);
    if (settings.soundEnabled) {
      notificationService.playChime('click');
    }
    refreshData();
  };

  // Milestones CRUD
  const addMilestone = (milestoneData) => {
    const created = db.createMilestone(milestoneData);
    refreshData();
    return created;
  };

  const editMilestone = (id, updates) => {
    const updated = db.updateMilestone(id, updates);
    refreshData();
    return updated;
  };

  const removeMilestone = (id) => {
    db.deleteMilestone(id);
    refreshData();
  };

  // Pomodoro
  const logPomodoro = (sessionData) => {
    const created = db.logPomodoroSession(sessionData);
    if (settings.soundEnabled) {
      notificationService.playChime('focus_complete');
    }
    refreshData();
    return created;
  };

  // Daily Review
  const saveDailyReview = (reviewData) => {
    const saved = db.saveDailyReview(reviewData);
    refreshData();
    return saved;
  };

  // Export / Import
  const exportData = () => {
    return db.exportAllData();
  };

  const importData = (jsonStr) => {
    const res = db.importAllData(jsonStr);
    if (res.success) {
      setSettings(db.getSettings());
      setCurrentUser(db.loadCurrentUser());
      refreshData();
    }
    return res;
  };

  const resetAllData = () => {
    db.resetAllData();
    setSettings(db.getSettings());
    setCurrentUser(db.loadCurrentUser());
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSwitchUser,
        createUser: handleCreateUser,
        settings,
        updateSettings,
        countdown,
        streakData,
        overallGoalProgress,
        daysPassed,
        goals,
        tasks,
        habits,
        habitLogs,
        milestones,
        pomodoroSessions,
        dailyReviews,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filterCategory,
        setFilterCategory,
        filterPriority,
        setFilterPriority,
        filterStatus,
        setFilterStatus,
        addGoal,
        editGoal,
        removeGoal,
        addTask,
        editTask,
        removeTask,
        addHabit,
        removeHabit,
        toggleHabit,
        addMilestone,
        editMilestone,
        removeMilestone,
        logPomodoro,
        saveDailyReview,
        exportData,
        importData,
        resetAllData,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
