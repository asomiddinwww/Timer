import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Flag,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateKey } from '../utils/timeCalculations';

export default function CalendarView() {
  const { tasks, goals, habits, habitLogs, editTask } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar dates matrix
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push(dStr);
  }

  // Selected date breakdown
  const selectedTasks = tasks.filter(t => t.date === selectedDate);
  const selectedGoalsDeadline = goals.filter(g => g.deadline.startsWith(selectedDate));
  const selectedHabitLogs = habitLogs.filter(l => l.date === selectedDate && l.completed);

  const todayKey = formatDateKey(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-red-600" />
            MISSION CALENDAR & DEADLINE RADAR
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Map out daily commitments, evaluate past consistency, and inspect upcoming deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(formatDateKey(new Date()));
            }}
            className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono uppercase text-zinc-300 hover:text-white"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs font-bold text-white px-2">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Matrix */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] uppercase tracking-wider text-zinc-500 mb-2 font-bold">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((dateKey, index) => {
              if (!dateKey) {
                return <div key={`empty-${index}`} className="h-20 sm:h-24 bg-transparent"></div>;
              }

              const dayNum = parseInt(dateKey.split('-')[2], 10);
              const isSelected = selectedDate === dateKey;
              const isToday = todayKey === dateKey;

              const dayTasks = tasks.filter(t => t.date === dateKey);
              const completedTasks = dayTasks.filter(t => t.status === 'COMPLETED').length;
              const hasGoalDeadline = goals.some(g => g.deadline.startsWith(dateKey));
              const dayHabitsDone = habitLogs.filter(l => l.date === dateKey && l.completed).length;

              // Check if completed day or missed day
              const isCompletedDay = dayTasks.length > 0 && completedTasks === dayTasks.length;
              const isMissedDay = dayTasks.length > 0 && completedTasks === 0 && dateKey < todayKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`h-20 sm:h-24 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected 
                      ? 'border-red-600 bg-red-950/20 ring-1 ring-red-600' 
                      : isToday 
                      ? 'border-white bg-zinc-900/60' 
                      : 'border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${
                      isToday ? 'text-red-500 font-black' : isSelected ? 'text-white' : 'text-zinc-400'
                    }`}>
                      {dayNum}
                    </span>

                    {hasGoalDeadline && (
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" title="Goal Deadline"></span>
                    )}
                  </div>

                  {/* Badges / indicators */}
                  <div className="space-y-1">
                    {dayTasks.length > 0 && (
                      <div className={`text-[9px] font-mono px-1 py-0.5 rounded truncate ${
                        isCompletedDay 
                          ? 'bg-zinc-800 text-zinc-300' 
                          : isMissedDay
                          ? 'bg-red-950 text-red-400 border border-red-900'
                          : 'bg-zinc-900 text-zinc-400'
                      }`}>
                        {completedTasks}/{dayTasks.length} TASKS
                      </div>
                    )}

                    {dayHabitsDone > 0 && (
                      <div className="text-[9px] font-mono text-zinc-500 hidden sm:block">
                        ★ {dayHabitsDone} HABITS
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-zinc-900 flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span> DEADLINE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm border border-white"></span> TODAY
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-zinc-800"></span> COMPLETED DAY
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-red-950 border border-red-900"></span> MISSED TASKS
            </span>
          </div>
        </div>

        {/* Selected Date Inspector */}
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500">INSPECTING DATE</span>
                <h3 className="text-base font-bold text-white font-mono">{selectedDate}</h3>
              </div>
              {selectedDate === todayKey && (
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono uppercase font-bold">
                  TODAY
                </span>
              )}
            </div>

            {/* Target deadlines on this day */}
            {selectedGoalsDeadline.length > 0 && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-1 mb-1">
                  <Flag className="w-3.5 h-3.5" /> CRITICAL DEADLINES
                </span>
                {selectedGoalsDeadline.map(g => (
                  <div key={g.id} className="text-xs font-semibold text-white">
                    • {g.title}
                  </div>
                ))}
              </div>
            )}

            {/* Tasks scheduled */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                SCHEDULED TASKS ({selectedTasks.length})
              </h4>

              {selectedTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono py-2">No tasks recorded for this date.</p>
              ) : (
                selectedTasks.map(task => {
                  const isDone = task.status === 'COMPLETED';
                  return (
                    <div 
                      key={task.id}
                      className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {task.title}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {task.startTime} - {task.endTime} • {task.priority}
                        </span>
                      </div>
                      <button
                        onClick={() => editTask(task.id, { status: isDone ? 'TODO' : 'COMPLETED' })}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                          isDone ? 'bg-zinc-800 text-zinc-400' : 'bg-red-600 text-white'
                        }`}
                      >
                        {isDone ? 'DONE' : 'MARK'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Habits logged */}
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2">
                HABITS COMPLETED ({selectedHabitLogs.length})
              </h4>
              <div className="space-y-1.5">
                {selectedHabitLogs.map(log => {
                  const habit = habits.find(h => h.id === log.habitId);
                  return (
                    <div key={log.id} className="text-xs text-zinc-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                      <span>{habit?.name || 'Completed Routine'}</span>
                    </div>
                  );
                })}
                {selectedHabitLogs.length === 0 && (
                  <p className="text-xs text-zinc-500 font-mono">No habit check-ins recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
