import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Filter, 
  Calendar,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDailyTaskProgress } from '../utils/progressCalculations';
import { formatDateKey } from '../utils/timeCalculations';

export default function Tasks() {
  const { 
    tasks, 
    goals, 
    addTask, 
    editTask, 
    removeTask, 
    searchQuery, 
    filterPriority, 
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    setActiveTab
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState('HIGH');
  const [status, setStatus] = useState('TODO');
  const [errorMsg, setErrorMsg] = useState('');

  // Daily statistics for selected date
  const dayProgress = useMemo(() => {
    return calculateDailyTaskProgress(tasks, selectedDate);
  }, [tasks, selectedDate]);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setGoalId(goals[0]?.id || '');
    setStartTime('09:00');
    setEndTime('10:30');
    setPriority('HIGH');
    setStatus('TODO');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setGoalId(task.goalId || '');
    setStartTime(task.startTime || '09:00');
    setEndTime(task.endTime || '10:00');
    setPriority(task.priority || 'MEDIUM');
    setStatus(task.status || 'TODO');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      goalId: goalId || null,
      date: selectedDate,
      startTime,
      endTime,
      priority,
      status
    };

    if (editingTask) {
      editTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }
    setIsModalOpen(false);
  };

  // Smart "Plan My Day" ordering: HIGH PRIORITY -> IN PROGRESS -> TIME ORDER -> LOW PRIORITY
  const [isAutoPlanned, setIsAutoPlanned] = useState(false);

  const handlePlanMyDay = () => {
    setIsAutoPlanned(true);
  };

  // Filter & search
  const dayTasks = useMemo(() => {
    let list = tasks.filter(t => t.date === selectedDate);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }

    if (filterPriority !== 'ALL') {
      list = list.filter(t => t.priority === filterPriority);
    }

    if (filterStatus !== 'ALL') {
      list = list.filter(t => t.status === filterStatus);
    }

    if (isAutoPlanned) {
      const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      list.sort((a, b) => {
        // Incomplete first
        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
        // Priority
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        // Time
        return a.startTime.localeCompare(b.startTime);
      });
    } else {
      // Natural chronological sort
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return list;
  }, [tasks, selectedDate, searchQuery, filterPriority, filterStatus, isAutoPlanned]);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-red-600" />
            DAILY TASK EXECUTION SYSTEM
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Precision daily scheduling with automated completion metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePlanMyDay}
            className="px-3.5 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            PLAN MY DAY
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950 transition-all"
          >
            <Plus className="w-4 h-4" />
            ADD TASK
          </button>
        </div>
      </div>

      {/* Date selector & Daily Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Picker Card */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            TARGET DATE
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-600"
          />
          <button
            onClick={() => setSelectedDate(formatDateKey(new Date()))}
            className="text-[10px] font-mono text-red-400 hover:text-red-300 mt-2 text-left uppercase"
          >
            Return to Today ({formatDateKey(new Date())})
          </button>
        </div>

        {/* Total Tasks */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">TOTAL SCHEDULED</div>
          <div className="text-3xl font-black text-white mt-1">{dayProgress.total}</div>
          <div className="text-[11px] text-zinc-500 mt-1">TASKS ON THIS DATE</div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">COMPLETED</div>
          <div className="text-3xl font-black text-white mt-1">{dayProgress.completed}</div>
          <div className="text-[11px] text-zinc-500 mt-1">ACHIEVED OBJECTIVES</div>
        </div>

        {/* Progress Rate */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl font-mono">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">COMPLETION RATE</div>
          <div className="text-3xl font-black text-red-500 mt-1">{dayProgress.percentage}%</div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-2 overflow-hidden border border-zinc-800">
            <div className="bg-red-600 h-full" style={{ width: `${dayProgress.percentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono">
        <span className="text-zinc-500 uppercase flex items-center gap-1 font-bold">
          <Filter className="w-3.5 h-3.5" /> FILTERS:
        </span>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1 focus:outline-none focus:border-red-600 uppercase"
        >
          <option value="ALL">ALL STATUSES</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1 focus:outline-none focus:border-red-600 uppercase"
        >
          <option value="ALL">ALL PRIORITIES</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {isAutoPlanned && (
          <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded border border-red-800">
            ★ SMART ORDER APPLIED
          </span>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {dayTasks.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-xl">
            <CheckSquare className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 font-mono mb-4">No tasks found for {selectedDate}.</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider"
            >
              Add First Task
            </button>
          </div>
        ) : (
          dayTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const inProgress = task.status === 'IN_PROGRESS';
            const linkedGoal = goals.find(g => g.id === task.goalId);

            return (
              <div 
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'border-zinc-800/80 bg-zinc-950/50 opacity-75' 
                    : inProgress
                    ? 'border-red-600/70 bg-red-950/20'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => {
                      const newStatus = isCompleted ? 'TODO' : 'COMPLETED';
                      editTask(task.id, { status: newStatus });
                    }}
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-colors mt-0.5 shrink-0 ${
                      isCompleted 
                        ? 'bg-red-600 border-red-600 text-white' 
                        : 'border-zinc-700 hover:border-red-500 bg-zinc-900'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                        task.priority === 'HIGH' ? 'bg-red-950/80 border-red-700 text-red-400' :
                        task.priority === 'MEDIUM' ? 'bg-zinc-900 border-zinc-700 text-zinc-300' :
                        'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}>
                        {task.priority}
                      </span>

                      {linkedGoal && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 truncate max-w-[200px]">
                          GOAL: {linkedGoal.title}
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                        <Clock className="w-3 h-3 text-red-500" />
                        {task.startTime} - {task.endTime}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        const newStatus = inProgress ? 'TODO' : 'IN_PROGRESS';
                        editTask(task.id, { status: newStatus });
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-mono uppercase font-bold border transition-colors ${
                        inProgress
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
                      }`}
                    >
                      {inProgress ? 'IN PROGRESS' : 'SET ACTIVE'}
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete task "${task.title}"?`)) {
                        removeTask(task.id);
                      }
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-500 rounded hover:bg-zinc-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                {editingTask ? 'EDIT TASK' : 'CREATE DAILY TASK'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master SAT Math Passport To Advanced Math"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific problems, page numbers, or goals"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Connected Mission Goal
                </label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                >
                  <option value="">None (Independent Daily Task)</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>
                      [{g.category}] {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
