import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  User, 
  Clock, 
  Flame,
  Volume2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsView() {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    resetAllData,
    currentUser,
    createUser,
    setCurrentUser
  } = useApp();

  const [formSettings, setFormSettings] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // New user registration modal state
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [userMsg, setUserMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2_JUNE_2027_GOAL_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importData(content);
        if (res.success) {
          setImportStatus({ success: true, message: 'All mission data imported and synced successfully!' });
        } else {
          setImportStatus({ success: false, message: res.error || 'Failed to parse JSON file' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    try {
      createUser(newUsername.trim(), newEmail.trim() || `${newUsername.trim().toLowerCase()}@mission.local`);
      setUserMsg(`Profile "${newUsername}" created & switched.`);
      setNewUsername('');
      setNewEmail('');
    } catch (err) {
      setUserMsg(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-red-600" />
            MISSION CONTROL CONFIGURATION
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
            Fine-tune deadline rules, streak tolerances, Pomodoro timers, and data archives
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-green-400 bg-green-950/40 border border-green-800 px-3 py-1.5 rounded">
            <Check className="w-4 h-4" />
            SETTINGS PERSISTED
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* DEADLINE & TIMEZONE CARD */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600" />
            TARGET DEADLINE & CHRONOLOGY
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Target Deadline (Default: 2027-06-02T23:59:59)
              </label>
              <input
                type="text"
                value={formSettings.deadline}
                onChange={(e) => setFormSettings({ ...formSettings, deadline: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Timezone (Default: Asia/Tashkent)
              </label>
              <input
                type="text"
                value={formSettings.timezone}
                onChange={(e) => setFormSettings({ ...formSettings, timezone: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* STREAK & PERFORMANCE RULES CARD */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            STREAK CALCULATION DISCIPLINE RULES
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Streak Reset Rule
              </label>
              <select
                value={formSettings.streakRule}
                onChange={(e) => setFormSettings({ ...formSettings, streakRule: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600 uppercase"
              >
                <option value="strict">STRICT (ZERO TOLERANCE: RESETS ON MISSED DAY)</option>
                <option value="grace_1">GRACE DAY (ALLOWS 1 INACTIVE DAY BEFORE RESET)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Daily Task Target Benchmark
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formSettings.dailyTaskTarget}
                onChange={(e) => setFormSettings({ ...formSettings, dailyTaskTarget: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* POMODORO PREFERENCES */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-red-600" />
            POMODORO TIMER PREFERENCES
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Work Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={formSettings.pomodoroWorkMin}
                onChange={(e) => setFormSettings({ ...formSettings, pomodoroWorkMin: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Short Break (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formSettings.pomodoroShortBreakMin}
                onChange={(e) => setFormSettings({ ...formSettings, pomodoroShortBreakMin: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Long Break (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={formSettings.pomodoroLongBreakMin}
                onChange={(e) => setFormSettings({ ...formSettings, pomodoroLongBreakMin: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.soundEnabled}
                onChange={(e) => setFormSettings({ ...formSettings, soundEnabled: e.target.checked })}
                className="accent-red-600"
              />
              ENABLE SYNTHESIZED SOUND NOTIFICATIONS (WEB AUDIO API)
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950 transition-all"
        >
          SAVE MISSION CONFIGURATION
        </button>
      </form>

      {/* USER PROFILES & DATA BACKUP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* User Identity / Multi-profile */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <User className="w-4 h-4 text-red-600" />
            OPERATOR IDENTITY & PROFILES
          </h3>

          <div className="text-xs font-mono text-zinc-400">
            Active Operator: <strong className="text-white">{currentUser?.username}</strong> ({currentUser?.email})
          </div>

          <form onSubmit={handleCreateUser} className="space-y-3 pt-2 border-t border-zinc-900">
            <span className="text-[11px] font-mono uppercase text-zinc-500 block">Switch / Create Separate User</span>
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
            />
            <button
              type="submit"
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono uppercase text-white rounded transition-colors"
            >
              CREATE / SWITCH OPERATOR
            </button>
          </form>

          {userMsg && (
            <p className="text-[11px] font-mono text-zinc-400">{userMsg}</p>
          )}
        </div>

        {/* Data Persistence, Export & Import */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <Download className="w-4 h-4 text-red-600" />
            DATA PERSISTENCE & AIR-GAPPED EXPORT
          </h3>

          <p className="text-xs text-zinc-400 font-mono">
            Export a full JSON snapshot of your goals, tasks, habit logs, milestones, and settings.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 py-2 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-xs font-mono uppercase text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT JSON
            </button>

            <label className="flex-1 py-2 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-xs font-mono uppercase text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>IMPORT JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className={`p-2.5 rounded text-xs font-mono ${importStatus.success ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
              {importStatus.message}
            </div>
          )}

          {/* Reset All */}
          <div className="pt-3 border-t border-zinc-900">
            <button
              type="button"
              onClick={() => {
                if (confirm("WARNING: This will reset all local goals, tasks, and habits to standard default initial mission state. Continue?")) {
                  resetAllData();
                }
              }}
              className="text-xs font-mono text-red-500 hover:text-red-400 flex items-center gap-1.5 uppercase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET DATABASE TO FACTORY DEFAULT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
