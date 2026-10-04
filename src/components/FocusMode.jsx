import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Clock, 
  Target, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateKey } from '../utils/timeCalculations';
import { notificationService } from '../services/notifications';

export default function FocusMode() {
  const { 
    tasks, 
    editTask, 
    countdown, 
    setActiveTab, 
    settings,
    logPomodoro
  } = useApp();

  const todayKey = formatDateKey(new Date());
  const todayTasks = tasks.filter(t => t.date === todayKey);
  const unfinishedTasks = todayTasks.filter(t => t.status !== 'COMPLETED');

  // Currently focused task
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const currentTask = unfinishedTasks[currentTaskIndex] || null;
  const nextTask = unfinishedTasks[currentTaskIndex + 1] || null;

  // Focus timer (seconds)
  const defaultSeconds = (settings.pomodoroWorkMin || 25) * 60;
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  // Sync settings duration
  useEffect(() => {
    if (!isActive) {
      setTimeLeft((settings.pomodoroWorkMin || 25) * 60);
    }
  }, [settings.pomodoroWorkMin]);

  // Tick timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      clearInterval(timerRef.current);
      if (settings.soundEnabled) {
        notificationService.playChime('focus_complete');
      }
      notificationService.sendNotification(
        'Focus Session Completed',
        currentTask ? `Finished block for: ${currentTask.title}` : '25-minute focus session finished!'
      );
      if (currentTask) {
        logPomodoro({
          goalId: currentTask.goalId,
          taskTitle: currentTask.title,
          durationMinutes: settings.pomodoroWorkMin || 25
        });
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, currentTask, settings]);

  const handleStart = () => {
    setIsActive(true);
    if (settings.soundEnabled) {
      notificationService.playChime('focus_start');
    }
    if (currentTask && currentTask.status !== 'IN_PROGRESS') {
      editTask(currentTask.id, { status: 'IN_PROGRESS' });
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft((settings.pomodoroWorkMin || 25) * 60);
  };

  const handleCompleteTask = () => {
    if (!currentTask) return;
    editTask(currentTask.id, { status: 'COMPLETED' });
    logPomodoro({
      goalId: currentTask.goalId,
      taskTitle: currentTask.title,
      durationMinutes: Math.max(1, Math.round(((settings.pomodoroWorkMin * 60) - timeLeft) / 60))
    });
    if (settings.soundEnabled) {
      notificationService.playChime('focus_complete');
    }
    // Advance to next task if exists
    setTimeLeft((settings.pomodoroWorkMin || 25) * 60);
    setIsActive(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-[80vh] flex flex-col justify-between py-6 max-w-4xl mx-auto px-4">
      {/* Top Bar: Distraction-free Exit & Deadline Reminder */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
            DISTRACTION-FREE MISSION FOCUS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-zinc-500">
            2 JUNE 2027: <span className="text-white font-bold">{countdown.days}d {countdown.hours}h</span>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            EXIT FOCUS
          </button>
        </div>
      </div>

      {/* Main Focus Centerpiece */}
      <div className="py-12 text-center space-y-8">
        {currentTask ? (
          <div className="space-y-4">
            <span className="px-3 py-1 rounded bg-red-950/60 border border-red-800 text-red-400 text-xs font-mono uppercase font-bold tracking-widest inline-block">
              CURRENT MISSION OBJECTIVE
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase max-w-3xl mx-auto leading-tight">
              {currentTask.title}
            </h1>
            {currentTask.description && (
              <p className="text-sm text-zinc-400 max-w-xl mx-auto font-mono">
                {currentTask.description}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white uppercase">
              ALL SCHEDULED TASKS COMPLETED
            </h1>
            <p className="text-zinc-500 font-mono text-xs">
              Excellent execution. Pick another goal or initiate free study session.
            </p>
          </div>
        )}

        {/* Large Countdown Clock */}
        <div className="my-8">
          <div className="text-7xl sm:text-9xl font-black font-mono-num text-white tracking-tighter">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-600 mt-2">
            BLOCK TIME REMAINING
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-widest flex items-center gap-2.5 shadow-2xl shadow-red-950 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              START FOCUS
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm uppercase tracking-widest flex items-center gap-2.5 transition-all"
            >
              <Pause className="w-5 h-5" />
              PAUSE
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {currentTask && (
            <button
              onClick={handleCompleteTask}
              className="px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 hover:border-red-600 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-red-500" />
              COMPLETE TASK
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer: Next Task Up */}
      <div className="border-t border-zinc-900 pt-6">
        {nextTask ? (
          <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                NEXT MISSION IN QUEUE
              </span>
              <p className="text-sm font-bold text-zinc-300">
                {nextTask.title}
              </p>
              <span className="text-[11px] font-mono text-zinc-500">
                {nextTask.startTime} - {nextTask.endTime} • {nextTask.priority} PRIORITY
              </span>
            </div>

            <button
              onClick={() => setCurrentTaskIndex(prev => prev + 1)}
              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono uppercase text-white flex items-center gap-1"
            >
              Skip Ahead <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-center text-xs font-mono text-zinc-600">
            END OF QUEUE FOR TODAY
          </div>
        )}
      </div>
    </div>
  );
}
