import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateKey } from '../utils/timeCalculations';

export default function Analytics() {
  const { 
    goals, 
    tasks, 
    habits, 
    habitLogs, 
    pomodoroSessions, 
    streakData,
    overallGoalProgress
  } = useApp();

  // Metrics derived purely from actual database data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const missedTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.date < formatDateKey(new Date())).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Goals
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'COMPLETED' || g.progress === 100).length;

  // Study / Pomodoro totals
  const totalPomoMinutes = pomodoroSessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);
  const totalPomoHours = (totalPomoMinutes / 60).toFixed(1);

  // Daily task volume past 7 days
  const last7DaysMetrics = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = formatDateKey(d);
      const dayTasks = tasks.filter(t => t.date === dateKey);
      const done = dayTasks.filter(t => t.status === 'COMPLETED').length;
      const dayHabits = habitLogs.filter(l => l.date === dateKey && l.completed).length;
      const pomos = pomodoroSessions.filter(s => s.date === dateKey).length;

      list.push({
        dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        tasksTotal: dayTasks.length,
        tasksDone: done,
        habitsDone: dayHabits,
        pomos
      });
    }
    return list;
  }, [tasks, habitLogs, pomodoroSessions]);

  // Max value for bar scaling
  const maxDayTasks = Math.max(...last7DaysMetrics.map(m => Math.max(m.tasksTotal, m.habitsDone, 4)), 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-600" />
            MISSION ANALYTICS & VELOCITY RADAR
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Real performance telemetry derived strictly from recorded execution logs
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Completion */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider flex items-center justify-between">
            <span>GOAL PROGRESSION</span>
            <TrendingUp className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{overallGoalProgress}%</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {completedGoals}/{totalGoals} GOALS FULFILLED
          </div>
        </div>

        {/* Task Velocity */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider flex items-center justify-between">
            <span>TASK COMPLETION RATE</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-3xl font-black text-red-500 mt-2">{taskCompletionRate}%</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {completedTasks} DONE • {missedTasks} PAST OVERDUE
          </div>
        </div>

        {/* Streaks */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider flex items-center justify-between">
            <span>DISCIPLINE STREAK</span>
            <Flame className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{streakData.currentStreak} DAYS</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            RECORD: {streakData.bestStreak} CONSECUTIVE DAYS
          </div>
        </div>

        {/* Study Hours */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider flex items-center justify-between">
            <span>FOCUSED WORK</span>
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalPomoHours} HRS</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {pomodoroSessions.length} POMODORO BLOCKS
          </div>
        </div>
      </div>

      {/* 7-Day Performance Chart */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-red-600"></span>
            ROLLING 7-DAY TASK & DISCIPLINE VOLUME
          </h3>
          <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-sm"></span> COMPLETED TASKS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-zinc-700 rounded-sm"></span> HABITS LOGGED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 border-b border-zinc-900 pb-2">
          {last7DaysMetrics.map(d => {
            const taskHeightPercent = Math.min(100, (d.tasksDone / maxDayTasks) * 100);
            const habitHeightPercent = Math.min(100, (d.habitsDone / maxDayTasks) * 100);

            return (
              <div key={d.dateKey} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1 w-full justify-center h-full">
                  {/* Task bar */}
                  <div 
                    className="w-3 sm:w-5 bg-red-600 rounded-t transition-all hover:bg-red-500"
                    style={{ height: `${Math.max(6, taskHeightPercent)}%` }}
                    title={`${d.tasksDone} tasks completed`}
                  ></div>
                  {/* Habit bar */}
                  <div 
                    className="w-3 sm:w-5 bg-zinc-800 hover:bg-zinc-700 rounded-t transition-all"
                    style={{ height: `${Math.max(6, habitHeightPercent)}%` }}
                    title={`${d.habitsDone} habits done`}
                  ></div>
                </div>

                <div className="text-center font-mono">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">{d.dayName}</span>
                  <span className="text-[9px] text-zinc-600 hidden sm:block">{d.dateKey.slice(5)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            CATEGORY DISTRIBUTION & PROGRESS
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {['SAT', 'English', 'Mathematics', 'University', 'Programming', 'Personal'].map(cat => {
              const catGoals = goals.filter(g => g.category === cat);
              if (catGoals.length === 0) return null;
              const catAvg = Math.round(catGoals.reduce((a, b) => a + (b.progress || 0), 0) / catGoals.length);

              return (
                <div key={cat} className="p-2.5 rounded bg-zinc-900/40 border border-zinc-800/80">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-white">{cat}</span>
                    <span className="text-red-400 font-bold">{catAvg}% COMPLETE</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full" style={{ width: `${catAvg}%` }}></div>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {catGoals.length} active goals tracked
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consistency Score & Rules */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-300" />
            MISSION CONSISTENCY AUDIT
          </h3>

          <div className="space-y-4 text-xs font-mono text-zinc-400 leading-relaxed">
            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800">
              <span className="text-white font-bold block mb-1">STRICT CALCULATION RULE</span>
              All metrics on this screen are computed live directly from your verified task entries, milestone check-offs, and Pomodoro timer logs.
            </div>

            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800">
              <span className="text-white font-bold block mb-1">TARGET BENCHMARK FOR 2027</span>
              Maintaining at least a 75% weekly task completion velocity ensures all major milestones (SAT, IELTS, University portfolio) are finalized well before 2 June 2027.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
