import React, { useMemo } from 'react';
import { 
  Compass, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Flag,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Roadmap() {
  const { goals, tasks, milestones } = useApp();

  // Dynamic 10-month generator from October 2026 until June 2027
  const roadmapMonths = useMemo(() => {
    const list = [
      { id: '2026-10', name: 'October 2026', monthIndex: 9, year: 2026 },
      { id: '2026-11', name: 'November 2026', monthIndex: 10, year: 2026 },
      { id: '2026-12', name: 'December 2026', monthIndex: 11, year: 2026 },
      { id: '2027-01', name: 'January 2027', monthIndex: 0, year: 2027 },
      { id: '2027-02', name: 'February 2027', monthIndex: 1, year: 2027 },
      { id: '2027-03', name: 'March 2027', monthIndex: 2, year: 2027 },
      { id: '2027-04', name: 'April 2027', monthIndex: 3, year: 2027 },
      { id: '2027-05', name: 'May 2027', monthIndex: 4, year: 2027 },
      { id: '2027-06', name: 'June 2027 (FINAL DEADLINE)', monthIndex: 5, year: 2027 }
    ];

    return list.map(m => {
      // Find goals ending in or before this month
      const monthGoals = goals.filter(g => {
        const d = new Date(g.deadline);
        return d.getFullYear() === m.year && d.getMonth() === m.monthIndex;
      });

      // Find tasks assigned to this month
      const monthTasks = tasks.filter(t => t.date.startsWith(m.id));
      const completedTasks = monthTasks.filter(t => t.status === 'COMPLETED').length;

      // Find milestones in this month
      const monthMilestones = milestones.filter(ms => {
        const d = new Date(ms.targetDate);
        return d.getFullYear() === m.year && d.getMonth() === m.monthIndex;
      });

      // Calculate completion score
      let completionScore = 0;
      if (monthGoals.length > 0 || monthTasks.length > 0) {
        const goalScore = monthGoals.length > 0 
          ? (monthGoals.reduce((acc, g) => acc + (g.status === 'COMPLETED' ? 100 : g.progress || 0), 0) / monthGoals.length)
          : 0;
        const taskScore = monthTasks.length > 0 ? (completedTasks / monthTasks.length) * 100 : 0;
        completionScore = Math.round((goalScore * 0.7) + (taskScore * 0.3));
      } else {
        completionScore = 0;
      }

      return {
        ...m,
        goals: monthGoals,
        tasksCount: monthTasks.length,
        tasksCompleted: completedTasks,
        milestones: monthMilestones,
        completionPercentage: completionScore
      };
    });
  }, [goals, tasks, milestones]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-red-600" />
            10-MONTH STRATEGIC ROADMAP (OCTOBER 2026 — JUNE 2027)
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Systematic monthly progression and phased milestone delivery
          </p>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative border-l-2 border-zinc-800 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
        {roadmapMonths.map((month, idx) => {
          const isFinal = month.id === '2027-06';
          const isCurrent = month.id === '2026-10';

          return (
            <div key={month.id} className="relative group">
              {/* Timeline dot */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isFinal 
                  ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/50' 
                  : isCurrent
                  ? 'bg-white border-red-600 ring-2 ring-red-600'
                  : 'bg-zinc-950 border-zinc-700'
              }`}>
                {isFinal && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>

              {/* Month Card */}
              <div className={`bg-zinc-950 border rounded-xl p-5 transition-all ${
                isFinal 
                  ? 'border-red-600/80 bg-red-950/10' 
                  : isCurrent
                  ? 'border-zinc-500 ring-1 ring-zinc-700'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                      PHASE {idx + 1} OF 9
                    </span>
                    <h3 className={`text-lg font-black uppercase tracking-wider ${isFinal ? 'text-red-500' : 'text-white'}`}>
                      {month.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-zinc-500">
                      {month.tasksCompleted}/{month.tasksCount} TASKS
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-white font-bold">
                      {month.completionPercentage}% PROGRESS
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-900 h-1.5 rounded-full mb-4 overflow-hidden border border-zinc-800">
                  <div 
                    className={`h-full ${isFinal ? 'bg-red-600' : 'bg-white'}`}
                    style={{ width: `${month.completionPercentage}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Goals due */}
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-red-500" />
                      KEY GOALS ({month.goals.length})
                    </h4>
                    {month.goals.length === 0 ? (
                      <p className="text-xs text-zinc-600 font-mono italic">No specific goals anchored to this month.</p>
                    ) : (
                      <div className="space-y-2">
                        {month.goals.map(g => (
                          <div key={g.id} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80 text-xs">
                            <div className="font-semibold text-zinc-200">{g.title}</div>
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1">
                              <span>PRIORITY: {g.priority}</span>
                              <span className="text-red-400 font-bold">{g.progress}% DONE</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Milestones due */}
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2 flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-zinc-300" />
                      MAJOR MILESTONES ({month.milestones.length})
                    </h4>
                    {month.milestones.length === 0 ? (
                      <p className="text-xs text-zinc-600 font-mono italic">Focus on daily repetition and continuous mastery.</p>
                    ) : (
                      <div className="space-y-2">
                        {month.milestones.map(ms => (
                          <div key={ms.id} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80 text-xs">
                            <div className="font-semibold text-white">{ms.title}</div>
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1">
                              <span>TARGET DATE: {ms.targetDate}</span>
                              <span className="text-zinc-300 font-bold">{ms.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
