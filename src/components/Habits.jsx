import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Flame, 
  Check, 
  Calendar as CalendarIcon, 
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateHabitStats } from '../utils/progressCalculations';
import { formatDateKey } from '../utils/timeCalculations';

export default function Habits() {
  const { 
    habits, 
    habitLogs, 
    addHabit, 
    removeHabit, 
    toggleHabit, 
    searchQuery 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SAT');
  const [errorMsg, setErrorMsg] = useState('');

  // Last 7 days headers
  const today = new Date();
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past7Days.push({
      dateKey: formatDateKey(d),
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      isToday: i === 0
    });
  }

  const handleCreateHabit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Habit name cannot be blank.');
      return;
    }

    addHabit({
      name: name.trim(),
      description: description.trim(),
      category
    });

    setIsModalOpen(false);
    setName('');
    setDescription('');
    setErrorMsg('');
  };

  const filteredHabits = habits.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return h.name.toLowerCase().includes(q) || (h.description && h.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-600" />
            DISCIPLINE & HABIT MATRIX
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Real daily repetitions, rolling weekly tracking, and unbroken streaks
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setDescription('');
            setErrorMsg('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          NEW HABIT
        </button>
      </div>

      {/* Habit Grid / Matrix */}
      <div className="space-y-4">
        {filteredHabits.map((habit) => {
          const stats = calculateHabitStats(habit, habitLogs);

          return (
            <div 
              key={habit.id}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Habit details & Stats */}
                <div className="space-y-2 lg:max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-zinc-900 border border-zinc-800 text-white">
                      {habit.category}
                    </span>
                    <h3 className="font-bold text-base text-white">
                      {habit.name}
                    </h3>
                  </div>

                  {habit.description && (
                    <p className="text-xs text-zinc-400">
                      {habit.description}
                    </p>
                  )}

                  {/* Streak Pills */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Flame className={`w-4 h-4 ${stats.currentStreak > 0 ? 'text-red-500 fill-red-500' : 'text-zinc-600'}`} />
                      <span>CURRENT: <strong className="text-white">{stats.currentStreak}</strong> DAYS</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Award className="w-3.5 h-3.5 text-zinc-400" />
                      <span>BEST: <strong className="text-zinc-200">{stats.bestStreak}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                      <span>30-DAY RATE: <strong className="text-zinc-200">{stats.completionPercentage}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Matrix + Action */}
                <div className="flex items-center gap-4 self-end lg:self-center">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {past7Days.map((day) => {
                      const isCompleted = habitLogs.some(
                        l => l.habitId === habit.id && l.date === day.dateKey && l.completed
                      );

                      return (
                        <div key={day.dateKey} className="flex flex-col items-center">
                          <span className={`text-[10px] font-mono uppercase mb-1 ${day.isToday ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>
                            {day.dayLabel}
                          </span>
                          <button
                            onClick={() => toggleHabit(habit.id, day.dateKey)}
                            title={`${day.dateKey} - Click to toggle`}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded border flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-950'
                                : day.isToday
                                ? 'bg-zinc-900 border-zinc-700 hover:border-red-500 text-zinc-600'
                                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-700'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 stroke-[3]" />
                            ) : (
                              <span className="text-[11px] font-mono">{day.dayNumber}</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete habit "${habit.name}" and its log history?`)) {
                        removeHabit(habit.id);
                      }
                    }}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors ml-2"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                CREATE DAILY DISCIPLINE HABIT
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Study SAT Math 90 Minutes"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Routine Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Strict non-negotiable guidelines"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                >
                  <option value="SAT">SAT</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="University">University</option>
                  <option value="Programming">Programming</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
