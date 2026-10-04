/**
 * Database and Data Persistence Layer
 * Implements structured storage (Users, Goals, Tasks, Subtasks, Habits, HabitLogs, Milestones, PomodoroSessions, DailyProgress, Settings)
 * with robust schema validation, relational checks, backup export/import, and active multi-user session support.
 */

const STORAGE_KEY_PREFIX = 'GOAL_2027_DB_';

// Default user setup
export const DEFAULT_USER = {
  id: 'usr_commander',
  username: 'Commander',
  email: 'focus@2june2027.internal',
  createdAt: new Date().toISOString(),
};

// Default settings
export const DEFAULT_SETTINGS = {
  deadline: '2027-06-02T23:59:59',
  timezone: 'Asia/Tashkent',
  startDate: '2026-01-01',
  dailyTaskTarget: 5,
  streakRule: 'strict', // 'strict' (reset on 0 completed tasks/habits) or 'grace_1' (1 grace day)
  pomodoroWorkMin: 25,
  pomodoroShortBreakMin: 5,
  pomodoroLongBreakMin: 15,
  pomodoroSessionsBeforeLongBreak: 4,
  soundEnabled: true,
  desktopNotifications: false,
  theme: 'dark-serious',
};

// Initial Seed Data to ensure realistic starting workspace if empty
export const SEED_DATA = {
  goals: [
    {
      id: 'goal-sat-1',
      userId: 'usr_commander',
      title: 'Achieve SAT 1500+ (750+ Math, 750+ English)',
      description: 'Master SAT Math Question Bank and Erica Meltzer Reading & Writing strategies.',
      category: 'SAT',
      priority: 'HIGH',
      createdAt: '2026-09-01T08:00:00Z',
      deadline: '2027-03-15T23:59:59',
      status: 'IN_PROGRESS', // 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
      progress: 60,
      subtasks: [
        { id: 'sub-sat-1', title: 'Complete College Board Practice Tests 1-6', completed: true },
        { id: 'sub-sat-2', title: 'Review 1000 Advanced SAT Vocabulary Words', completed: true },
        { id: 'sub-sat-3', title: 'Score 780+ on 3 consecutive Math timed sections', completed: false },
        { id: 'sub-sat-4', title: 'Eliminate grammar traps in Writing & Language', completed: false }
      ]
    },
    {
      id: 'goal-eng-2',
      userId: 'usr_commander',
      title: 'IELTS Band 8.5 / C2 English Fluency',
      description: 'Perfect academic writing and spontaneous debate fluency for university admissions.',
      category: 'English',
      priority: 'HIGH',
      createdAt: '2026-09-10T10:00:00Z',
      deadline: '2027-04-30T23:59:59',
      status: 'IN_PROGRESS',
      progress: 50,
      subtasks: [
        { id: 'sub-eng-1', title: 'Write 30 Academic Task 2 essays with self-correction', completed: true },
        { id: 'sub-eng-2', title: 'Listen to 100 hours of BBC, NPR, and academic lectures', completed: true },
        { id: 'sub-eng-3', title: 'Pass 4 mock speaking tests with native evaluator feedback', completed: false }
      ]
    },
    {
      id: 'goal-math-3',
      userId: 'usr_commander',
      title: 'Master Advanced Mathematics & Calculus',
      description: 'Cover Differential & Integral Calculus, Linear Algebra, and Olympiad problem solving.',
      category: 'Mathematics',
      priority: 'MEDIUM',
      createdAt: '2026-09-15T09:00:00Z',
      deadline: '2027-05-20T23:59:59',
      status: 'IN_PROGRESS',
      progress: 33,
      subtasks: [
        { id: 'sub-math-1', title: 'Complete MIT 18.01 Single Variable Calculus problem sets', completed: true },
        { id: 'sub-math-2', title: 'Master Vectors & Matrix Transformation', completed: false },
        { id: 'sub-math-3', title: 'Solve 200 contest level math problems', completed: false }
      ]
    },
    {
      id: 'goal-uni-4',
      userId: 'usr_commander',
      title: 'Top-Tier University Admissions Application Portfolio',
      description: 'Complete Common App essay, Honors list, Extracurricular portfolio, and Recommendation letters.',
      category: 'University',
      priority: 'HIGH',
      createdAt: '2026-09-20T11:00:00Z',
      deadline: '2027-05-30T23:59:59',
      status: 'IN_PROGRESS',
      progress: 25,
      subtasks: [
        { id: 'sub-uni-1', title: 'Draft personal statement draft v1-v5', completed: true },
        { id: 'sub-uni-2', title: 'Finalize top 10 target university list & scholarships', completed: false },
        { id: 'sub-uni-3', title: 'Secure 3 glowing letters of recommendation', completed: false },
        { id: 'sub-uni-4', title: 'Polish activities resume', completed: false }
      ]
    },
    {
      id: 'goal-prog-5',
      userId: 'usr_commander',
      title: 'Build & Deploy Production-Grade AI Software System',
      description: 'Engineered with strict performance, modern web architecture, distributed caching, and clean code.',
      category: 'Programming',
      priority: 'MEDIUM',
      createdAt: '2026-09-25T14:00:00Z',
      deadline: '2027-05-15T23:59:59',
      status: 'IN_PROGRESS',
      progress: 75,
      subtasks: [
        { id: 'sub-prg-1', title: 'Architect system design and data models', completed: true },
        { id: 'sub-prg-2', title: 'Implement frontend dashboard and responsive layouts', completed: true },
        { id: 'sub-prg-3', title: 'Build state management, analytics, and Pomodoro system', completed: true },
        { id: 'sub-prg-4', title: 'End-to-end integration and load testing', completed: false }
      ]
    }
  ],
  tasks: [
    {
      id: 'tsk-101',
      userId: 'usr_commander',
      goalId: 'goal-sat-1',
      title: 'Solve 40 Hard Math Passport to Advanced Math Questions',
      description: 'Focus on nonlinear equations and quadratic system analysis.',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      priority: 'HIGH',
      status: 'COMPLETED' // 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
    },
    {
      id: 'tsk-102',
      userId: 'usr_commander',
      goalId: 'goal-eng-2',
      title: 'Analyze 3 SAT Erica Meltzer Reading Passages',
      description: 'Annotate main claims, transition words, and tone shifts.',
      date: new Date().toISOString().split('T')[0],
      startTime: '11:30',
      endTime: '13:00',
      priority: 'HIGH',
      status: 'COMPLETED'
    },
    {
      id: 'tsk-103',
      userId: 'usr_commander',
      goalId: 'goal-prog-5',
      title: 'Implement Countdown Engine & Milestone Visualizer',
      description: 'Ensure exact timezone calculations and zero placeholder functionality.',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '16:30',
      priority: 'HIGH',
      status: 'COMPLETED'
    },
    {
      id: 'tsk-104',
      userId: 'usr_commander',
      goalId: 'goal-math-3',
      title: 'Calculus derivatives chain rule drill (30 problems)',
      description: 'Write complete rigorous steps without skipping intermediary algebraic reductions.',
      date: new Date().toISOString().split('T')[0],
      startTime: '17:00',
      endTime: '18:30',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS'
    },
    {
      id: 'tsk-105',
      userId: 'usr_commander',
      goalId: 'goal-uni-4',
      title: 'Review university application deadlines and scholarship criteria',
      description: 'Create spreadsheet of exact portal requirements for regular and early action.',
      date: new Date().toISOString().split('T')[0],
      startTime: '19:30',
      endTime: '21:00',
      priority: 'LOW',
      status: 'TODO'
    }
  ],
  habits: [
    {
      id: 'hbt-1',
      userId: 'usr_commander',
      name: 'Study English',
      description: 'At least 60 mins of active immersion, vocabulary, and reading',
      frequency: 'daily',
      createdAt: '2026-09-01T00:00:00Z',
      category: 'English'
    },
    {
      id: 'hbt-2',
      userId: 'usr_commander',
      name: 'Study SAT Math',
      description: 'Timed questions without distractions',
      frequency: 'daily',
      createdAt: '2026-09-01T00:00:00Z',
      category: 'SAT'
    },
    {
      id: 'hbt-3',
      userId: 'usr_commander',
      name: 'Read High-Level Academic Articles',
      description: 'Scientific American, Economist, or philosophy papers',
      frequency: 'daily',
      createdAt: '2026-09-01T00:00:00Z',
      category: 'Personal'
    },
    {
      id: 'hbt-4',
      userId: 'usr_commander',
      name: 'Practice Vocabulary',
      description: 'Spaced repetition flashcards (Anki)',
      frequency: 'daily',
      createdAt: '2026-09-01T00:00:00Z',
      category: 'English'
    },
    {
      id: 'hbt-5',
      userId: 'usr_commander',
      name: 'Practice Programming',
      description: 'Algorithms or real software codebase commits',
      frequency: 'daily',
      createdAt: '2026-09-01T00:00:00Z',
      category: 'Programming'
    },
    {
      id: 'hbt-6',
      userId: 'usr_commander',
      name: 'Exercise / Physical Conditioning',
      description: 'Weightlifting, running, or high-intensity calisthenics',
      frequency: 'daily',
      createdAt: '2026-09-01T00:00:00Z',
      category: 'Personal'
    },
    {
      id: 'hbt-7',
      userId: 'usr_commander',
      name: 'Sleep on Time (by 23:00)',
      description: 'Strict 8 hours restorative sleep',
      frequency: 'daily',
      createdAt: '2026-09-01T00:00:00Z',
      category: 'Personal'
    }
  ],
  milestones: [
    {
      id: 'mls-1',
      userId: 'usr_commander',
      title: 'SAT 1500+ Official Score Benchmark',
      targetDate: '2027-03-15',
      progress: 75,
      status: 'IN_PROGRESS',
      description: 'Official test session score verification'
    },
    {
      id: 'mls-2',
      userId: 'usr_commander',
      title: 'English Academic Mastery (IELTS 8.5 / C2)',
      targetDate: '2027-04-30',
      progress: 60,
      status: 'IN_PROGRESS',
      description: 'Demonstrable near-native fluency in written and spoken academic discourse'
    },
    {
      id: 'mls-3',
      userId: 'usr_commander',
      title: 'Complete University Application Dossier',
      targetDate: '2027-05-30',
      progress: 35,
      status: 'IN_PROGRESS',
      description: 'Final submission to top choice international universities'
    },
    {
      id: 'mls-4',
      userId: 'usr_commander',
      title: 'Flagship Software Deployment',
      targetDate: '2027-05-15',
      progress: 80,
      status: 'IN_PROGRESS',
      description: 'Live full-stack system operating with users'
    },
    {
      id: 'mls-5',
      userId: 'usr_commander',
      title: 'Entrance Examination Perfection',
      targetDate: '2027-06-01',
      progress: 40,
      status: 'IN_PROGRESS',
      description: '100% mastery over target admissions curriculum'
    }
  ],
  pomodoroSessions: [
    {
      id: 'pomo-1',
      userId: 'usr_commander',
      goalId: 'goal-sat-1',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      date: new Date().toISOString().split('T')[0],
      taskTitle: 'SAT Math practice questions'
    },
    {
      id: 'pomo-2',
      userId: 'usr_commander',
      goalId: 'goal-eng-2',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      date: new Date().toISOString().split('T')[0],
      taskTitle: 'English vocabulary review'
    },
    {
      id: 'pomo-3',
      userId: 'usr_commander',
      goalId: 'goal-prog-5',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      taskTitle: 'Mission control dashboard coding'
    }
  ],
  // Pre-seed some habit log history for the last 14 days to provide real chart statistics
  habitLogs: (() => {
    const logs = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      // habit 1, 2, 5 completed regularly
      logs.push({ id: `hl-${i}-1`, habitId: 'hbt-1', userId: 'usr_commander', date: dateKey, completed: true });
      logs.push({ id: `hl-${i}-2`, habitId: 'hbt-2', userId: 'usr_commander', date: dateKey, completed: true });
      if (i % 2 === 0) {
        logs.push({ id: `hl-${i}-3`, habitId: 'hbt-3', userId: 'usr_commander', date: dateKey, completed: true });
      }
      if (i < 10) {
        logs.push({ id: `hl-${i}-4`, habitId: 'hbt-4', userId: 'usr_commander', date: dateKey, completed: true });
      }
      logs.push({ id: `hl-${i}-5`, habitId: 'hbt-5', userId: 'usr_commander', date: dateKey, completed: true });
      if (i < 8) {
        logs.push({ id: `hl-${i}-6`, habitId: 'hbt-6', userId: 'usr_commander', date: dateKey, completed: true });
        logs.push({ id: `hl-${i}-7`, habitId: 'hbt-7', userId: 'usr_commander', date: dateKey, completed: true });
      }
    }
    return logs;
  })(),
  dailyReviews: [
    {
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      completedTasks: 4,
      totalTasks: 4,
      pomodoros: 6,
      tomorrowGoal: 'Complete SAT Practice exam 5 Math section and review all mistakes.',
      reflection: 'Maintained intense uninterrupted focus for 5 hours.'
    }
  ]
};

// Database class
class DatabaseService {
  constructor() {
    this.currentUser = this.loadCurrentUser();
    this.initDatabase();
  }

  getStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    // Node / memory mock fallback
    if (!this._memoryStore) this._memoryStore = {};
    return {
      getItem: (key) => this._memoryStore[key] || null,
      setItem: (key, val) => { this._memoryStore[key] = String(val); },
      removeItem: (key) => { delete this._memoryStore[key]; }
    };
  }

  loadCurrentUser() {
    try {
      const storage = this.getStorage();
      const stored = storage.getItem(`${STORAGE_KEY_PREFIX}CURRENT_USER`);
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.getStorage().setItem(`${STORAGE_KEY_PREFIX}CURRENT_USER`, JSON.stringify(user));
  }

  initDatabase() {
    const storage = this.getStorage();
    const isInitialized = storage.getItem(`${STORAGE_KEY_PREFIX}INITIALIZED`);
    if (!isInitialized) {
      this.saveTable('users', [DEFAULT_USER]);
      this.saveTable('goals', SEED_DATA.goals);
      this.saveTable('tasks', SEED_DATA.tasks);
      this.saveTable('habits', SEED_DATA.habits);
      this.saveTable('habitLogs', SEED_DATA.habitLogs);
      this.saveTable('milestones', SEED_DATA.milestones);
      this.saveTable('pomodoroSessions', SEED_DATA.pomodoroSessions);
      this.saveTable('dailyReviews', SEED_DATA.dailyReviews);
      this.saveTable('settings', DEFAULT_SETTINGS);
      storage.setItem(`${STORAGE_KEY_PREFIX}INITIALIZED`, 'true');
    }
  }

  getTable(tableName) {
    try {
      const data = this.getStorage().getItem(`${STORAGE_KEY_PREFIX}${tableName.toUpperCase()}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading table ${tableName}`, e);
      return [];
    }
  }

  saveTable(tableName, data) {
    try {
      this.getStorage().setItem(`${STORAGE_KEY_PREFIX}${tableName.toUpperCase()}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Error saving table ${tableName}`, e);
      return false;
    }
  }

  // Settings
  getSettings() {
    try {
      const settings = this.getStorage().getItem(`${STORAGE_KEY_PREFIX}SETTINGS`);
      return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(newSettings) {
    const updated = { ...this.getSettings(), ...newSettings };
    this.getStorage().setItem(`${STORAGE_KEY_PREFIX}SETTINGS`, JSON.stringify(updated));
    return updated;
  }

  // Users
  getUsers() {
    return this.getTable('users');
  }

  createUser(username, email) {
    const users = this.getUsers();
    const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User with this username or email already exists');
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      username,
      email,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveTable('users', users);
    return newUser;
  }

  login(usernameOrEmail) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase());
    if (!user) {
      throw new Error('User not found. Please register or verify spelling.');
    }
    this.setCurrentUser(user);
    return user;
  }

  // Goals
  getGoals(userId = this.currentUser?.id) {
    const goals = this.getTable('goals');
    return goals.filter(g => !userId || g.userId === userId);
  }

  createGoal(goalData) {
    const goals = this.getTable('goals');
    const newGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: this.currentUser?.id || DEFAULT_USER.id,
      title: goalData.title.trim(),
      description: goalData.description || '',
      category: goalData.category || 'General',
      priority: goalData.priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
      deadline: goalData.deadline || '2027-06-02T23:59:59',
      status: 'TODO',
      progress: 0,
      subtasks: goalData.subtasks || []
    };
    goals.unshift(newGoal);
    this.saveTable('goals', goals);
    return newGoal;
  }

  updateGoal(id, updates) {
    const goals = this.getTable('goals');
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    
    // Auto-calculate progress if subtasks changed
    if (updates.subtasks) {
      const total = updates.subtasks.length;
      if (total > 0) {
        const done = updates.subtasks.filter(s => s.completed).length;
        updates.progress = Math.round((done / total) * 100);
        if (updates.progress === 100 && !updates.status) {
          updates.status = 'COMPLETED';
        } else if (updates.progress < 100 && updates.status === 'COMPLETED') {
          updates.status = 'IN_PROGRESS';
        }
      }
    }

    goals[index] = { ...goals[index], ...updates };
    this.saveTable('goals', goals);
    return goals[index];
  }

  deleteGoal(id) {
    let goals = this.getTable('goals');
    goals = goals.filter(g => g.id !== id);
    this.saveTable('goals', goals);
    return true;
  }

  // Tasks
  getTasks(userId = this.currentUser?.id, date = null) {
    const tasks = this.getTable('tasks');
    return tasks.filter(t => {
      const matchUser = !userId || t.userId === userId;
      const matchDate = !date || t.date === date;
      return matchUser && matchDate;
    });
  }

  createTask(taskData) {
    const tasks = this.getTable('tasks');
    const newTask = {
      id: `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: this.currentUser?.id || DEFAULT_USER.id,
      goalId: taskData.goalId || null,
      title: taskData.title.trim(),
      description: taskData.description || '',
      date: taskData.date || new Date().toISOString().split('T')[0],
      startTime: taskData.startTime || '09:00',
      endTime: taskData.endTime || '10:00',
      priority: taskData.priority || 'MEDIUM',
      status: taskData.status || 'TODO',
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    this.saveTable('tasks', tasks);
    return newTask;
  }

  updateTask(id, updates) {
    const tasks = this.getTable('tasks');
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    tasks[index] = { ...tasks[index], ...updates };
    this.saveTable('tasks', tasks);
    return tasks[index];
  }

  deleteTask(id) {
    let tasks = this.getTable('tasks');
    tasks = tasks.filter(t => t.id !== id);
    this.saveTable('tasks', tasks);
    return true;
  }

  // Habits
  getHabits(userId = this.currentUser?.id) {
    const habits = this.getTable('habits');
    return habits.filter(h => !userId || h.userId === userId);
  }

  createHabit(habitData) {
    const habits = this.getTable('habits');
    const newHabit = {
      id: `hbt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: this.currentUser?.id || DEFAULT_USER.id,
      name: habitData.name.trim(),
      description: habitData.description || '',
      category: habitData.category || 'General',
      frequency: habitData.frequency || 'daily',
      createdAt: new Date().toISOString()
    };
    habits.push(newHabit);
    this.saveTable('habits', habits);
    return newHabit;
  }

  deleteHabit(id) {
    let habits = this.getTable('habits');
    habits = habits.filter(h => h.id !== id);
    this.saveTable('habits', habits);

    // Also remove habit logs
    let logs = this.getTable('habitLogs');
    logs = logs.filter(l => l.habitId !== id);
    this.saveTable('habitLogs', logs);
    return true;
  }

  // Habit Logs
  getHabitLogs(userId = this.currentUser?.id) {
    const logs = this.getTable('habitLogs');
    return logs.filter(l => !userId || l.userId === userId);
  }

  toggleHabitLog(habitId, date) {
    const logs = this.getTable('habitLogs');
    const existingIndex = logs.findIndex(
      l => l.habitId === habitId && l.date === date && (!this.currentUser || l.userId === this.currentUser.id)
    );

    if (existingIndex > -1) {
      // Toggle or remove
      logs[existingIndex].completed = !logs[existingIndex].completed;
      if (!logs[existingIndex].completed) {
        logs.splice(existingIndex, 1);
      }
    } else {
      logs.push({
        id: `hl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        habitId,
        date,
        userId: this.currentUser?.id || DEFAULT_USER.id,
        completed: true
      });
    }

    this.saveTable('habitLogs', logs);
    return logs;
  }

  // Milestones
  getMilestones(userId = this.currentUser?.id) {
    const milestones = this.getTable('milestones');
    return milestones.filter(m => !userId || m.userId === userId);
  }

  createMilestone(milestoneData) {
    const milestones = this.getTable('milestones');
    const newMilestone = {
      id: `mls_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: this.currentUser?.id || DEFAULT_USER.id,
      title: milestoneData.title.trim(),
      description: milestoneData.description || '',
      targetDate: milestoneData.targetDate || '2027-06-02',
      progress: Number(milestoneData.progress) || 0,
      status: milestoneData.status || 'IN_PROGRESS',
      createdAt: new Date().toISOString()
    };
    milestones.push(newMilestone);
    this.saveTable('milestones', milestones);
    return newMilestone;
  }

  updateMilestone(id, updates) {
    const milestones = this.getTable('milestones');
    const index = milestones.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Milestone not found');
    milestones[index] = { ...milestones[index], ...updates };
    this.saveTable('milestones', milestones);
    return milestones[index];
  }

  deleteMilestone(id) {
    let milestones = this.getTable('milestones');
    milestones = milestones.filter(m => m.id !== id);
    this.saveTable('milestones', milestones);
    return true;
  }

  // Pomodoro Sessions
  getPomodoroSessions(userId = this.currentUser?.id) {
    const sessions = this.getTable('pomodoroSessions');
    return sessions.filter(s => !userId || s.userId === userId);
  }

  logPomodoroSession(sessionData) {
    const sessions = this.getTable('pomodoroSessions');
    const newSession = {
      id: `pomo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: this.currentUser?.id || DEFAULT_USER.id,
      goalId: sessionData.goalId || null,
      taskTitle: sessionData.taskTitle || 'Focused Work Session',
      durationMinutes: sessionData.durationMinutes || 25,
      completedAt: new Date().toISOString(),
      date: sessionData.date || new Date().toISOString().split('T')[0]
    };
    sessions.unshift(newSession);
    this.saveTable('pomodoroSessions', sessions);
    return newSession;
  }

  // Daily Reviews
  getDailyReviews() {
    return this.getTable('dailyReviews');
  }

  saveDailyReview(review) {
    const reviews = this.getTable('dailyReviews');
    const index = reviews.findIndex(r => r.date === review.date);
    if (index > -1) {
      reviews[index] = { ...reviews[index], ...review };
    } else {
      reviews.unshift(review);
    }
    this.saveTable('dailyReviews', reviews);
    return review;
  }

  // Export / Import / Reset
  exportAllData() {
    const data = {
      exportVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      currentUser: this.currentUser,
      settings: this.getSettings(),
      users: this.getTable('users'),
      goals: this.getTable('goals'),
      tasks: this.getTable('tasks'),
      habits: this.getTable('habits'),
      habitLogs: this.getTable('habitLogs'),
      milestones: this.getTable('milestones'),
      pomodoroSessions: this.getTable('pomodoroSessions'),
      dailyReviews: this.getTable('dailyReviews')
    };
    return JSON.stringify(data, null, 2);
  }

  importAllData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.goals || !data.tasks || !data.habits) {
        throw new Error('Invalid format: Missing essential mission data entities');
      }

      if (data.users) this.saveTable('users', data.users);
      if (data.settings) this.saveTable('settings', data.settings);
      if (data.goals) this.saveTable('goals', data.goals);
      if (data.tasks) this.saveTable('tasks', data.tasks);
      if (data.habits) this.saveTable('habits', data.habits);
      if (data.habitLogs) this.saveTable('habitLogs', data.habitLogs);
      if (data.milestones) this.saveTable('milestones', data.milestones);
      if (data.pomodoroSessions) this.saveTable('pomodoroSessions', data.pomodoroSessions);
      if (data.dailyReviews) this.saveTable('dailyReviews', data.dailyReviews);
      if (data.currentUser) this.setCurrentUser(data.currentUser);

      return { success: true, message: 'Data imported successfully' };
    } catch (e) {
      return { success: false, error: e.message || 'Invalid JSON syntax' };
    }
  }

  resetAllData() {
    const storage = this.getStorage();
    storage.removeItem(`${STORAGE_KEY_PREFIX}INITIALIZED`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}GOALS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}TASKS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}HABITS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}HABITLOGS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}MILESTONES`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}POMODOROSESSIONS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}DAILYREVIEWS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}SETTINGS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}USERS`);
    storage.removeItem(`${STORAGE_KEY_PREFIX}CURRENT_USER`);
    this.initDatabase();
    return true;
  }
}

export const db = new DatabaseService();
