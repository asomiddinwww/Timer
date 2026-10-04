import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer as TimerIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  CheckCircle, 
  Flame,
  Volume2,
  VolumeX,
  Bell,
  Settings as SettingsIcon,
  BarChart2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/notifications';
import { formatDateKey } from '../utils/timeCalculations';

export default function Pomodoro() {
  const { 
    settings, 
    updateSettings, 
    logPomodoro, 
    pomodoroSessions, 
    goals,
    tasks
  } = useApp();

  // Mode: 'work' | 'short_break' | 'long_break'
  const [mode, setMode] = useState('work');
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [taskNote, setTaskNote] = useState('');

  // Durations (in seconds)
  const workDuration = (settings.pomodoroWorkMin || 25) * 60;
  const shortBreakDuration = (settings.pomodoroShortBreakMin || 5) * 60;
  const longBreakDuration = (settings.pomodoroLongBreakMin || 15) * 60;

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  // Today's total logged sessions
  const todayKey = formatDateKey(new Date());
  const todaySessions = pomodoroSessions.filter(s => s.date === todayKey);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);

  // Switch modes
  const switchMode = (newMode) => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setMode(newMode);
    if (newMode === 'work') setTimeLeft((settings.pomodoroWorkMin || 25) * 60);
    else if (newMode === 'short_break') setTimeLeft((settings.pomodoroShortBreakMin || 5) * 60);
    else if (newMode === 'long_break') setTimeLeft((settings.pomodoroLongBreakMin || 15) * 60);
  };

  // Timer Tick
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);

      if (mode === 'work') {
        // Log finished session
        const minutesLogged = settings.pomodoroWorkMin || 25;
        logPomodoro({
          goalId: selectedGoalId || null,
          taskTitle: taskNote || 'Standard Pomodoro Block',
          durationMinutes: minutesLogged,
          date: todayKey
        });

        const newCount = sessionsCompletedToday + 1;
        setSessionsCompletedToday(newCount);

        if (settings.soundEnabled) {
          notificationService.playChime('focus_complete');
        }
        notificationService.sendNotification(
          'Work Interval Finished',
          'Excellent discipline! Take a well-deserved break.'
        );

        // Auto transition to break
        if (newCount % (settings.pomodoroSessionsBeforeLongBreak || 4) === 0) {
          switchMode('long_break');
        } else {
          switchMode('short_break');
        }
      } else {
        // Break finished
        if (settings.soundEnabled) {
          notificationService.playChime('break_complete');
        }
        notificationService.sendNotification(
          'Break Over',
          'Resume your focus cycle. The 2 June 2027 deadline awaits.'
        );
        switchMode('work');
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode, sessionsCompletedToday, selectedGoalId, taskNote, settings, todayKey]);

  const handleStart = () => {
    setIsActive(true);
    if (settings.soundEnabled) {
      notificationService.playChime('focus_start');
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'work') setTimeLeft((settings.pomodoroWorkMin || 25) * 60);
    else if (mode === 'short_break') setTimeLeft((settings.pomodoroShortBreakMin || 5) * 60);
    else setTimeLeft((settings.pomodoroLongBreakMin || 15) * 60);
  };

  const handleSkip = () => {
    if (mode === 'work') {
      switchMode('short_break');
    } else {
      switchMode('work');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalModeDuration = mode === 'work' ? workDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;
  const progressPercent = Math.min(100, Math.round(((totalModeDuration - timeLeft) / totalModeDuration) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <TimerIcon className="w-6 h-6 text-red-600" />
            TACTICAL POMODORO ENGINE
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Deep focus intervals structured to prevent mental fatigue
          </p>
        </div>

        {/* Sound & Notification Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-2 rounded border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              settings.soundEnabled 
                ? 'bg-zinc-900 border-zinc-700 text-white' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
            title="Toggle Audio Cues"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-red-500" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] uppercase font-bold">{settings.soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={async () => {
              const res = await notificationService.requestPermission();
              updateSettings({ desktopNotifications: res.status === 'granted' });
            }}
            className="p-2 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
            title="Request Notification Permissions"
          >
            <Bell className="w-4 h-4 text-red-500" />
            <span className="text-[10px] uppercase font-bold">ALERTS</span>
          </button>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs uppercase">
          <button
            onClick={() => switchMode('work')}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
              mode === 'work' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-950' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            WORK ({settings.pomodoroWorkMin}M)
          </button>

          <button
            onClick={() => switchMode('short_break')}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
              mode === 'short_break' 
                ? 'bg-white text-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            SHORT BREAK ({settings.pomodoroShortBreakMin}M)
          </button>

          <button
            onClick={() => switchMode('long_break')}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
              mode === 'long_break' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            LONG BREAK ({settings.pomodoroLongBreakMin}M)
          </button>
        </div>
      </div>

      {/* Main Clock Face Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
        {/* Ambient indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 ${mode === 'work' ? 'bg-red-600' : 'bg-white'}`}></div>

        {/* Task anchor input */}
        <div className="max-w-md mx-auto mb-6 flex flex-col gap-2">
          <input
            type="text"
            value={taskNote}
            onChange={(e) => setTaskNote(e.target.value)}
            placeholder="What exact problem are you solving right now?"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white text-center focus:outline-none focus:border-red-600 font-mono"
          />

          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-red-600 font-mono text-center"
          >
            <option value="">Attribute time to mission goal (optional)</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>[{g.category}] {g.title}</option>
            ))}
          </select>
        </div>

        {/* Huge Digital Clock */}
        <div className="text-7xl sm:text-9xl font-black font-mono-num text-white tracking-tighter my-4">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Session Progress bar */}
        <div className="w-full max-w-md mx-auto bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800 mb-8">
          <div 
            className={`h-full transition-all duration-300 ${mode === 'work' ? 'bg-red-600' : 'bg-white'}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              START
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Pause className="w-4 h-4" />
              PAUSE
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Reset interval"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSkip}
            className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Skip to next phase"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">BLOCKS LOGGED TODAY</div>
          <div className="text-3xl font-black text-white mt-1">{todaySessions.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">COMPLETED WORK UNITS</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">TIME UNDER INTENSE FOCUS</div>
          <div className="text-3xl font-black text-red-500 mt-1">{todayMinutes}m</div>
          <div className="text-[11px] text-zinc-500 mt-1">TOTAL CONCENTRATION TIME</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">CYCLE CYCLE STAGE</div>
          <div className="text-3xl font-black text-white mt-1">
            {(todaySessions.length % (settings.pomodoroSessionsBeforeLongBreak || 4)) + 1} / {settings.pomodoroSessionsBeforeLongBreak || 4}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">UNTIL EXTENDED REST</div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4 text-red-500" />
          LOGGED SESSIONS HISTORY ({pomodoroSessions.length})
        </h4>

        <div className="space-y-2">
          {pomodoroSessions.slice(0, 5).map(session => (
            <div key={session.id} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-white">{session.taskTitle}</span>
              </div>
              <div className="text-zinc-500">
                {session.durationMinutes} mins • {session.date}
              </div>
            </div>
          ))}
          {pomodoroSessions.length === 0 && (
            <p className="text-xs text-zinc-600 font-mono">No Pomodoro sessions recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
