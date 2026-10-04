import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  Award, 
  Calendar, 
  ArrowRight,
  Flame,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateKey } from '../utils/timeCalculations';

export default function EndOfDayReviewModal({ isOpen, onClose }) {
  const { tasks, addTask, streakData, pomodoroSessions } = useApp();
  const [tomorrowGoal, setTomorrowGoal] = useState('');
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const todayKey = formatDateKey(new Date());
  const todayTasks = tasks.filter(t => t.date === todayKey);
  const completedCount = todayTasks.filter(t => t.status === 'COMPLETED').length;
  const missedCount = todayTasks.length - completedCount;
  const percentage = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0;

  const handleSave = (e) => {
    e.preventDefault();
    if (tomorrowGoal.trim()) {
      // Create tomorrow's first priority task automatically
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowKey = formatDateKey(tomorrow);

      addTask({
        title: tomorrowGoal.trim(),
        description: reflection.trim() || 'Prime objective scheduled during end-of-day review',
        date: tomorrowKey,
        priority: 'HIGH',
        status: 'TODO',
        startTime: '09:00',
        endTime: '11:00'
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block mb-1">
            NIGHTLY DEBRIEF & AUDIT
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            TODAY'S RESULT & REVIEW
          </h2>
        </div>

        {/* Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-center font-mono mb-6">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">COMPLETED</div>
            <div className="text-2xl font-black text-white mt-1">{completedCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">MISSED</div>
            <div className="text-2xl font-black text-zinc-400 mt-1">{missedCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">PROGRESS</div>
            <div className="text-2xl font-black text-red-500 mt-1">{percentage}%</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">STREAK</div>
            <div className="text-2xl font-black text-white mt-1 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" />
              {streakData.currentStreak}
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 bg-red-950/40 border border-red-700 rounded-xl text-center text-red-300 font-mono text-xs">
            ✓ Tomorrow's prime objective has been programmed into your queue. Rest well.
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1 font-bold">
                SET TOMORROW'S MAIN GOAL *
              </label>
              <input
                type="text"
                required
                value={tomorrowGoal}
                onChange={(e) => setTomorrowGoal(e.target.value)}
                placeholder="What is the single highest leverage task for tomorrow?"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Day Reflection / Lessons Learned
              </label>
              <textarea
                rows={2}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What slowed you down? What will you execute better?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-sans"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-all mt-4"
            >
              LOCK IN TOMORROW'S PLAN <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
