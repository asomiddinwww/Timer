import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Calendar, 
  Filter, 
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate } from '../utils/timeCalculations';

export default function Goals() {
  const { 
    goals, 
    addGoal, 
    editGoal, 
    removeGoal, 
    searchQuery, 
    filterCategory, 
    setFilterCategory,
    filterPriority,
    setFilterPriority
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SAT');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [deadline, setDeadline] = useState('2027-06-02');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const standardCategories = ['SAT', 'English', 'Mathematics', 'University', 'Programming', 'Personal', 'Other'];

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setCategory('SAT');
    setCustomCategory('');
    setPriority('HIGH');
    setDeadline('2027-06-02');
    setSubtasks([]);
    setNewSubtaskTitle('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    if (standardCategories.includes(goal.category)) {
      setCategory(goal.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(goal.category);
    }
    setPriority(goal.priority);
    setDeadline(goal.deadline.split('T')[0]);
    setSubtasks(goal.subtasks ? [...goal.subtasks] : []);
    setNewSubtaskTitle('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtaskInModal = (subId) => {
    setSubtasks(subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s));
  };

  const handleRemoveSubtaskInModal = (subId) => {
    setSubtasks(subtasks.filter(s => s.id !== subId));
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Goal title is strictly required.');
      return;
    }
    if (!deadline) {
      setErrorMsg('Target deadline date is required.');
      return;
    }

    const finalCategory = (category === 'Other' && customCategory.trim()) ? customCategory.trim() : category;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      priority,
      deadline: `${deadline}T23:59:59`,
      subtasks
    };

    if (editingGoal) {
      editGoal(editingGoal.id, payload);
    } else {
      addGoal(payload);
    }
    setIsModalOpen(false);
  };

  const handleToggleSubtaskInList = (goal, subId) => {
    const updatedSubtasks = goal.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    editGoal(goal.id, { subtasks: updatedSubtasks });
  };

  // Filter and search
  const filteredGoals = goals.filter(g => {
    const matchesSearch = !searchQuery || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = filterCategory === 'ALL' || g.category === filterCategory;
    const matchesPriority = filterPriority === 'ALL' || g.priority === filterPriority;

    return matchesSearch && matchesCat && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-red-600" />
            MISSION GOALS SYSTEM
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Define, structure, and execute milestones before 2 June 2027
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          CREATE NEW GOAL
        </button>
      </div>

      {/* Category & Priority Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
        <span className="text-zinc-500 font-mono uppercase flex items-center gap-1.5 font-bold">
          <Filter className="w-3.5 h-3.5" /> FILTERS:
        </span>

        {/* Category selector */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-red-600 font-mono uppercase"
        >
          <option value="ALL">ALL CATEGORIES</option>
          {standardCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Priority selector */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-red-600 font-mono uppercase"
        >
          <option value="ALL">ALL PRIORITIES</option>
          <option value="HIGH">HIGH PRIORITY</option>
          <option value="MEDIUM">MEDIUM PRIORITY</option>
          <option value="LOW">LOW PRIORITY</option>
        </select>

        <span className="ml-auto font-mono text-zinc-500">
          SHOWING {filteredGoals.length} OF {goals.length}
        </span>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => {
          const isCompleted = goal.status === 'COMPLETED';
          const isExpanded = expandedGoalId === goal.id;
          const totalSub = goal.subtasks?.length || 0;
          const completedSub = goal.subtasks?.filter(s => s.completed).length || 0;

          return (
            <div 
              key={goal.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                isCompleted 
                  ? 'border-zinc-800 bg-zinc-950/60 opacity-80' 
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-zinc-900 border border-zinc-800 text-white">
                      {goal.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                      goal.priority === 'HIGH' ? 'bg-red-950/60 border-red-700 text-red-400' :
                      goal.priority === 'MEDIUM' ? 'bg-zinc-900 border-zinc-700 text-zinc-300' :
                      'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Confirm deletion of goal "${goal.title}"?`)) {
                          removeGoal(goal.id);
                        }
                      }}
                      className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-base mt-2 ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {goal.title}
                </h3>

                {/* Description */}
                {goal.description && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">EXECUTION RATE</span>
                    <span className="font-bold text-white">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-zinc-500' : 'bg-red-600'}`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Subtasks Accordion */}
                {totalSub > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-900">
                    <button
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        SUBTASKS: {completedSub} OF {totalSub} COMPLETED
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-1.5 pl-2">
                        {goal.subtasks.map((st) => (
                          <div 
                            key={st.id}
                            onClick={() => handleToggleSubtaskInList(goal, st.id)}
                            className="cursor-pointer flex items-center gap-2 p-1.5 rounded hover:bg-zinc-900/60 text-xs"
                          >
                            <input 
                              type="checkbox" 
                              checked={st.completed} 
                              onChange={() => {}} // handled by parent onClick
                              className="accent-red-600 rounded bg-zinc-900 border-zinc-700" 
                            />
                            <span className={st.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer info & toggle completion */}
              <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                <div className="text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>TARGET: {formatDisplayDate(goal.deadline)}</span>
                </div>

                <button
                  onClick={() => {
                    const newStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED';
                    const newProgress = isCompleted ? 50 : 100;
                    editGoal(goal.id, { status: newStatus, progress: newProgress });
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
                    isCompleted 
                      ? 'border-zinc-700 text-zinc-400 hover:text-white bg-zinc-900' 
                      : 'border-red-600 bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isCompleted ? 'REOPEN GOAL' : 'COMPLETE GOAL'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                {editingGoal ? 'EDIT MISSION GOAL' : 'CREATE NEW MISSION GOAL'}
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

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master SAT Math to 780+ Benchmark"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Description / Strategy
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline precise requirements and execution methodology"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  >
                    {standardCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {category === 'Other' && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Custom Category
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Category name"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="pt-3 border-t border-zinc-800">
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                  Subtasks & Measurable Deliverables ({subtasks.length})
                </label>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    placeholder="Add breakdown step..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono uppercase"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center justify-between gap-2 p-2 rounded bg-zinc-900/60 border border-zinc-800 text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => handleToggleSubtaskInModal(st.id)}
                          className="accent-red-600"
                        />
                        <span className={st.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                          {st.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtaskInModal(st.id)}
                        className="text-zinc-500 hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
