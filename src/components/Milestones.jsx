import React, { useState } from 'react';
import { 
  Flag, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate } from '../utils/timeCalculations';

export default function Milestones() {
  const { milestones, addMilestone, editMilestone, removeMilestone, searchQuery } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('2027-06-02');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('IN_PROGRESS');
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setEditingMilestone(null);
    setTitle('');
    setDescription('');
    setTargetDate('2027-06-02');
    setProgress(0);
    setStatus('IN_PROGRESS');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMilestone(m);
    setTitle(m.title);
    setDescription(m.description || '');
    setTargetDate(m.targetDate);
    setProgress(m.progress);
    setStatus(m.status);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Milestone title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      targetDate,
      progress: Number(progress),
      status: Number(progress) === 100 ? 'COMPLETED' : status
    };

    if (editingMilestone) {
      editMilestone(editingMilestone.id, payload);
    } else {
      addMilestone(payload);
    }
    setIsModalOpen(false);
  };

  const filteredMilestones = milestones.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.title.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Flag className="w-6 h-6 text-red-600" />
            CRITICAL MISSION MILESTONES
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Macro-level strategic achievements on the path to 2 June 2027
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          CREATE MILESTONE
        </button>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMilestones.map((m) => {
          const isDone = m.status === 'COMPLETED' || m.progress === 100;

          return (
            <div 
              key={m.id}
              className={`bg-zinc-950 border rounded-xl p-5 transition-all flex flex-col justify-between ${
                isDone 
                  ? 'border-zinc-800 bg-zinc-950/70' 
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                    isDone 
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
                      : 'bg-red-950/50 border-red-800 text-red-400'
                  }`}>
                    {m.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1 text-zinc-400 hover:text-white"
                      title="Edit Milestone"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete milestone "${m.title}"?`)) {
                          removeMilestone(m.id);
                        }
                      }}
                      className="p-1 text-zinc-500 hover:text-red-500"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className={`font-bold text-base ${isDone ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {m.title}
                </h3>

                {m.description && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {m.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">BENCHMARK PROGRESS</span>
                    <span className="font-bold text-white">{m.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-full transition-all duration-300 ${isDone ? 'bg-zinc-500' : 'bg-red-600'}`}
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  TARGET: {formatDisplayDate(m.targetDate)}
                </span>

                <button
                  onClick={() => {
                    const newProg = isDone ? 50 : 100;
                    const newStat = isDone ? 'IN_PROGRESS' : 'COMPLETED';
                    editMilestone(m.id, { progress: newProg, status: newStat });
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
                    isDone 
                      ? 'border-zinc-700 text-zinc-400 bg-zinc-900' 
                      : 'border-red-600 bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isDone ? 'REOPEN' : 'COMPLETE'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                {editingMilestone ? 'EDIT MILESTONE' : 'NEW STRATEGIC MILESTONE'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SAT 1500+ Official Score"
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
                  placeholder="Benchmark metrics and evidence"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Progress ({progress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="w-full accent-red-600"
                  />
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
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
