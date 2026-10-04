import React, { useMemo } from 'react';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  ArrowRight,
  Target,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDailyTaskProgress, calculateWeeklyProgress } from '../utils/progressCalculations';
import { formatDateKey } from '../utils/timeCalculations';

export default function Dashboard() {
  const { 
    countdown, 
    streakData, 
    overallGoalProgress, 
    daysPassed, 
    tasks, 
    goals, 
    milestones, 
    habits, 
    habitLogs, 
    setActiveTab, 
    editTask 
  } = useApp();

  const todayKey = formatDateKey(new Date());
  const todayTasks = useMemo(() => tasks.filter(t => t.date === todayKey), [tasks, todayKey]);
  const dailyProgress = useMemo(() => calculateDailyTaskProgress(tasks, todayKey), [tasks, todayKey]);
  const weeklyProgress = useMemo(() => calculateWeeklyProgress(tasks, habitLogs), [tasks, habitLogs]);

  // Urgent upcoming goals/milestones
  const upcomingGoals = useMemo(() => {
    return [...goals]
      .filter(g => g.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3);
  }, [goals]);

  // Next task to focus on
  const highPriorityTasks = todayTasks.filter(t => t.status !== 'COMPLETED');
  const activeFocusTask = highPriorityTasks.find(t => t.status === 'IN_PROGRESS') || highPriorityTasks[0];

  // Motivation phrases
  const motivationPhrases = [
    "Your deadline is moving closer every second.",
    "Do today's work before tomorrow becomes today's deadline.",
    "Consistency beats intensity.",
    "Every unfinished hour is a concession you cannot afford.",
    "Sacrifice today's comfort for 2027 dominance."
  ];
  // Select quote based on day
  const dailyQuote = motivationPhrases[new Date().getDate() % motivationPhrases.length];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. MAIN DEADLINE HERO SECTION */}
      <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-black p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-sm"></span>
              <span className="text-xs uppercase font-mono tracking-widest text-zinc-400">
                OFFICIAL TARGET DEADLINE
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase font-sans">
              2 JUNE 2027
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">STATUS</div>
              <div className="text-xs font-bold text-white uppercase">
                {countdown.isReached ? 'DEADLINE REACHED' : 'COUNTDOWN ACTIVE'}
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">SECTOR</div>
              <div className="text-xs font-bold text-red-500 uppercase font-mono">
                {countdown.urgency} URGENCY
              </div>
            </div>
          </div>
        </div>

        {/* TIMER DISPLAY */}
        {countdown.isReached ? (
          <div className="p-8 text-center bg-red-950/40 border border-red-600 rounded-lg">
            <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-2">
              DEADLINE REACHED — 2 JUNE 2027
            </h3>
            <p className="text-zinc-300 text-sm max-w-xl mx-auto">
              The mission window has closed. Review your accumulated achievements, mastered milestones, and complete goal archives.
            </p>
          </div>
        ) : (
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4 flex items-center justify-between">
              <span>TIME REMAINING UNTIL DEADLINE</span>
              <span className="text-red-500 font-bold">1-SECOND REAL-TIME PRECISION</span>
            </div>

            {/* Countdown 4 blocks */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {/* DAYS */}
              <div className="bg-black/80 border border-zinc-800 hover:border-red-600/50 transition-colors p-4 md:p-6 rounded-lg flex flex-col items-center justify-center text-center group">
                <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono-num text-white tracking-tighter group-hover:text-red-500 transition-colors">
                  {countdown.days.toLocaleString()}
                </span>
                <span className="mt-2 text-xs font-mono uppercase font-bold tracking-widest text-zinc-400">
                  DAYS
                </span>
              </div>

              {/* HOURS */}
              <div className="bg-black/80 border border-zinc-800 hover:border-red-600/50 transition-colors p-4 md:p-6 rounded-lg flex flex-col items-center justify-center text-center group">
                <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono-num text-white tracking-tighter group-hover:text-red-500 transition-colors">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="mt-2 text-xs font-mono uppercase font-bold tracking-widest text-zinc-400">
                  HOURS
                </span>
              </div>

              {/* MINUTES */}
              <div className="bg-black/80 border border-zinc-800 hover:border-red-600/50 transition-colors p-4 md:p-6 rounded-lg flex flex-col items-center justify-center text-center group">
                <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono-num text-white tracking-tighter group-hover:text-red-500 transition-colors">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="mt-2 text-xs font-mono uppercase font-bold tracking-widest text-zinc-400">
                  MINUTES
                </span>
              </div>

              {/* SECONDS */}
              <div className="bg-black/80 border border-zinc-800 hover:border-red-600/50 transition-colors p-4 md:p-6 rounded-lg flex flex-col items-center justify-center text-center group">
                <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono-num text-red-500 tracking-tighter text-glow-red">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="mt-2 text-xs font-mono uppercase font-bold tracking-widest text-zinc-400">
                  SECONDS
                </span>
              </div>
            </div>

            {/* Sub-metrics exact required rows */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-center">
              <div className="bg-zinc-950 p-3 rounded border border-zinc-900">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">TOTAL DAYS REMAINING</div>
                <div className="text-base font-black text-white mt-1">{countdown.totalDays}</div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-900">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">DAYS PASSED</div>
                <div className="text-base font-black text-zinc-300 mt-1">{daysPassed}</div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-900">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">DAYS COMPLETED</div>
                <div className="text-base font-black text-zinc-300 mt-1">{streakData.totalSuccessfulDays}</div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-900">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">CURRENT STREAK</div>
                <div className="text-base font-black text-red-500 mt-1 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-red-500" />
                  {streakData.currentStreak}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-900">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">OVERALL GOAL PROGRESS</div>
                <div className="text-base font-black text-white mt-1">{overallGoalProgress}%</div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-900">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">TODAY'S PROGRESS</div>
                <div className="text-base font-black text-white mt-1">{dailyProgress.percentage}%</div>
              </div>
            </div>

            {/* Expanded precision breakdown */}
            <div className="mt-3 text-center text-xs font-mono text-zinc-500 flex flex-wrap items-center justify-center gap-4">
              <span>TOTAL HOURS LEFT: <strong className="text-zinc-300">{countdown.totalHours.toLocaleString()}</strong></span>
              <span>•</span>
              <span>TOTAL MINUTES LEFT: <strong className="text-zinc-300">{countdown.totalMinutes.toLocaleString()}</strong></span>
              <span>•</span>
              <span>TOTAL SECONDS LEFT: <strong className="text-zinc-300">{countdown.totalSeconds.toLocaleString()}</strong></span>
            </div>
          </div>
        )}
      </section>

      {/* MOTIVATIONAL DIRECTIVE */}
      <div className="border border-red-900/60 bg-gradient-to-r from-red-950/40 via-black to-zinc-950 p-4 rounded-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-200 uppercase font-mono">
            “{dailyQuote}”
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('focus')}
          className="shrink-0 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white uppercase tracking-wider transition-colors"
        >
          ENGAGE FOCUS
        </button>
      </div>

      {/* 2. TODAY'S MAIN MISSION & ACTIVE TASK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks & Execution Priority */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  TODAY'S EXECUTION BATCH ({dailyProgress.completed}/{dailyProgress.total} COMPLETED)
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 uppercase"
              >
                Manage Tasks <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <span>TODAY'S COMPLETION RATE</span>
                <span className="font-bold text-white">{dailyProgress.percentage}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="bg-red-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${dailyProgress.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Today Task List */}
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-400 font-mono mb-3">No tasks scheduled for today yet.</p>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider"
                >
                  Create Today's Tasks
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  const inProg = task.status === 'IN_PROGRESS';
                  return (
                    <div 
                      key={task.id}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                        isDone 
                          ? 'border-zinc-800/80 bg-zinc-900/30 opacity-70' 
                          : inProg 
                          ? 'border-red-600/70 bg-red-950/20' 
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => {
                            const newStatus = isDone ? 'TODO' : 'COMPLETED';
                            editTask(task.id, { status: newStatus });
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            isDone 
                              ? 'bg-red-600 border-red-600 text-white' 
                              : 'border-zinc-600 hover:border-red-500'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                            <span>{task.startTime} - {task.endTime}</span>
                            <span>•</span>
                            <span className={task.priority === 'HIGH' ? 'text-red-400 font-bold' : 'text-zinc-400'}>
                              {task.priority} PRIORITY
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {inProg ? (
                          <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-600 text-[10px] font-mono uppercase font-bold">
                            RUNNING
                          </span>
                        ) : !isDone && (
                          <button
                            onClick={() => editTask(task.id, { status: 'IN_PROGRESS' })}
                            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono uppercase tracking-wider"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Habits check today */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  DAILY HABIT REPETITIONS
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('habits')}
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 uppercase"
              >
                Habits Matrix <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {habits.slice(0, 6).map((habit) => {
                const isLogged = habitLogs.some(l => l.habitId === habit.id && l.date === todayKey && l.completed);
                return (
                  <div 
                    key={habit.id}
                    className={`p-3 rounded border flex items-center justify-between gap-2 ${
                      isLogged 
                        ? 'border-red-900/60 bg-red-950/20' 
                        : 'border-zinc-800/80 bg-zinc-900/40'
                    }`}
                  >
                    <span className="text-xs text-zinc-300 font-medium truncate">
                      {habit.name}
                    </span>
                    <button
                      onClick={() => useApp().toggleHabit(habit.id, todayKey)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-colors ${
                        isLogged 
                          ? 'bg-red-600 text-white' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isLogged ? 'DONE' : 'LOG'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Mission Milestones & Focus Launch */}
        <div className="space-y-6">
          {/* Active Focus Card */}
          <div className="rounded-xl border border-red-900/80 bg-gradient-to-b from-red-950/30 to-black p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
                RECOMMENDED FOCUS TARGET
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>

            {activeFocusTask ? (
              <div>
                <h4 className="text-base font-bold text-white mb-2 leading-snug">
                  {activeFocusTask.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                  {activeFocusTask.description || "Concentrate without distraction until this unit of work is completed."}
                </p>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-4 pt-3 border-t border-zinc-800">
                  <span>TIME BLOCK</span>
                  <span className="text-white font-bold">{activeFocusTask.startTime} - {activeFocusTask.endTime}</span>
                </div>
                <button
                  onClick={() => setActiveTab('focus')}
                  className="w-full py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950"
                >
                  <Sparkles className="w-4 h-4" />
                  START 25-MIN FOCUS BLOCK
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-zinc-400 mb-4">All high priority tasks for today are completed.</p>
                <button
                  onClick={() => setActiveTab('pomodoro')}
                  className="w-full py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Open Pomodoro Timer
                </button>
              </div>
            )}
          </div>

          {/* Strategic Milestones snapshot */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-300" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  STRATEGIC MILESTONES
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('milestones')}
                className="text-xs font-mono text-zinc-400 hover:text-white uppercase"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {milestones.slice(0, 4).map((m) => (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-300 truncate">{m.title}</span>
                    <span className="font-mono text-zinc-400">{m.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800/80">
                    <div 
                      className="bg-white h-full"
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>TARGET: {m.targetDate}</span>
                    <span className={m.progress >= 100 ? 'text-red-500 font-bold' : ''}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Deadlines upcoming */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                UPCOMING GOAL DEADLINES
              </h3>
              <button 
                onClick={() => setActiveTab('roadmap')}
                className="text-xs font-mono text-zinc-400 hover:text-white uppercase"
              >
                Roadmap
              </button>
            </div>

            <div className="space-y-3">
              {upcomingGoals.map((g) => (
                <div key={g.id} className="p-3 rounded bg-zinc-900/60 border border-zinc-800">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-xs font-semibold text-white leading-tight">{g.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase shrink-0">
                      {g.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-2">
                    <span>DEADLINE: {g.deadline.split('T')[0]}</span>
                    <span className="text-red-400 font-bold">{g.progress}% COMPLETE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
