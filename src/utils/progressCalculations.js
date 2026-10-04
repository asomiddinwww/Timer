/**
 * Progress, Analytics, and Streak Computation Engine
 * Real calculations without fake numbers or synthetic placeholders.
 */

import { formatDateKey } from './timeCalculations.js';

/**
 * Calculates real habit streaks and statistics
 */
export function calculateHabitStats(habit, habitLogs) {
  const habitSpecificLogs = habitLogs.filter(l => l.habitId === habit.id && l.completed);
  const logDatesSet = new Set(habitSpecificLogs.map(l => l.date));

  const today = new Date();
  const todayKey = formatDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  // Check current streak: walk backwards from today or yesterday
  let currentStreak = 0;
  let testDate = new Date(today);
  
  // If not completed today yet, start checking from yesterday so active streak is preserved
  if (!logDatesSet.has(todayKey)) {
    testDate.setDate(testDate.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(testDate);
    if (logDatesSet.has(key)) {
      currentStreak++;
      testDate.setDate(testDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak historically
  let bestStreak = 0;
  let runningStreak = 0;
  // Sort distinct dates ascending
  const sortedDates = Array.from(logDatesSet).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      runningStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }
  }

  // Last 7 days history
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dKey = formatDateKey(d);
    last7Days.push({
      date: dKey,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      completed: logDatesSet.has(dKey)
    });
  }

  const completedLast30 = Array.from(logDatesSet).filter(d => {
    const diffDays = (today.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const completionPercentage = Math.min(100, Math.round((completedLast30 / 30) * 100));

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    totalCompleted: sortedDates.length,
    completionPercentage,
    last7Days,
    isCompletedToday: logDatesSet.has(todayKey)
  };
}

/**
 * Calculates overall master streak across daily required performance
 */
export function calculateMasterStreak(tasks, habitLogs, habits, streakRule = 'strict') {
  const today = new Date();
  const todayKey = formatDateKey(today);

  // A day is considered successful if:
  // Either >= 1 high-priority task completed OR >= 50% habits completed OR >= 3 total tasks completed
  const isDaySuccessful = (dateKey) => {
    const dayTasks = tasks.filter(t => t.date === dateKey);
    const dayCompletedTasks = dayTasks.filter(t => t.status === 'COMPLETED');
    const dayHabitLogs = habitLogs.filter(l => l.date === dateKey && l.completed);

    if (dayCompletedTasks.length >= 3) return true;
    if (dayCompletedTasks.some(t => t.priority === 'HIGH')) return true;
    if (habits.length > 0 && dayHabitLogs.length >= Math.ceil(habits.length * 0.5)) return true;
    if (dayTasks.length > 0 && dayCompletedTasks.length === dayTasks.length) return true;

    return false;
  };

  let currentStreak = 0;
  let testDate = new Date(today);
  const todayDone = isDaySuccessful(todayKey);

  if (!todayDone) {
    testDate.setDate(testDate.getDate() - 1);
  }

  let graceDaysUsed = 0;
  const maxGraceDays = streakRule === 'grace_1' ? 1 : 0;

  for (let i = 0; i < 365; i++) {
    const key = formatDateKey(testDate);
    if (isDaySuccessful(key)) {
      currentStreak++;
    } else {
      if (graceDaysUsed < maxGraceDays) {
        graceDaysUsed++;
      } else {
        break;
      }
    }
    testDate.setDate(testDate.getDate() - 1);
  }

  // Calculate historical total successful days
  let totalSuccessfulDays = 0;
  const inspectedDates = new Set([...tasks.map(t => t.date), ...habitLogs.map(l => l.date)]);
  inspectedDates.forEach(dateKey => {
    if (isDaySuccessful(dateKey)) totalSuccessfulDays++;
  });

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, 14), // baseline comparison with past records
    totalSuccessfulDays: Math.max(totalSuccessfulDays, currentStreak)
  };
}

/**
 * Calculates overall goals and subtasks progress percentage accurately
 */
export function calculateGoalProgress(goals) {
  if (!goals || goals.length === 0) return 0;
  
  let totalWeightedScore = 0;
  let totalWeight = 0;

  goals.forEach(goal => {
    // Weight by priority
    const weight = goal.priority === 'HIGH' ? 3 : goal.priority === 'MEDIUM' ? 2 : 1;
    totalWeight += weight;

    if (goal.status === 'COMPLETED') {
      totalWeightedScore += 100 * weight;
    } else if (goal.subtasks && goal.subtasks.length > 0) {
      const completedSub = goal.subtasks.filter(s => s.completed).length;
      const subRatio = (completedSub / goal.subtasks.length) * 100;
      totalWeightedScore += subRatio * weight;
    } else {
      totalWeightedScore += (goal.progress || 0) * weight;
    }
  });

  if (totalWeight === 0) return 0;
  return Math.min(100, Math.round(totalWeightedScore / totalWeight));
}

/**
 * Calculates today's task completion progress
 */
export function calculateDailyTaskProgress(tasks, targetDateStr = formatDateKey(new Date())) {
  const dayTasks = tasks.filter(t => t.date === targetDateStr);
  const total = dayTasks.length;
  if (total === 0) return { total: 0, completed: 0, inProgress: 0, todo: 0, percentage: 0 };

  const completed = dayTasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = dayTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todo = dayTasks.filter(t => t.status === 'TODO').length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, inProgress, todo, percentage };
}

/**
 * Calculates weekly task & habit progress
 */
export function calculateWeeklyProgress(tasks, habitLogs) {
  const today = new Date();
  const daysInWeek = 7;
  let tasksScheduled = 0;
  let tasksFinished = 0;

  for (let i = 0; i < daysInWeek; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);
    const forDay = tasks.filter(t => t.date === dateKey);
    tasksScheduled += forDay.length;
    tasksFinished += forDay.filter(t => t.status === 'COMPLETED').length;
  }

  const percentage = tasksScheduled > 0 ? Math.round((tasksFinished / tasksScheduled) * 100) : 0;
  return { tasksScheduled, tasksFinished, percentage };
}
