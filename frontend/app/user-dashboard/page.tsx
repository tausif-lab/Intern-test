'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Task, User, TasksResponse, TaskResponse } from '@/types/auth';
import { apiFetch } from '@/lib/api';

export default function UserDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<TasksResponse>('/api/tasks');
      setTasks(res.tasks);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored) as User;
    if (u.role !== 'user') { router.push('/admin-dashboard'); return; }
    setCurrentUser(u);
    fetchTasks();
  }, [fetchTasks, router]);

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    setUpdatingId(task._id);
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    try {
      const res = await apiFetch<TaskResponse>(`/api/tasks/${task._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setTasks(prev => prev.map(t => t._id === task._id ? res.task : t));
    } catch (e) {
      // Revert on error
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: task.status } : t));
      alert(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const priorityConfig: Record<string, { badge: string; dot: string; label: string }> = {
    low:    { badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', label: '🟢 Low' },
    medium: { badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',       dot: 'bg-amber-400',   label: '🟡 Medium' },
    high:   { badge: 'text-red-400 bg-red-500/10 border-red-500/30',             dot: 'bg-red-400',     label: '🔴 High' },
  };

  const pending   = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const progressPct = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  function TaskCard({ task }: { task: Task }) {
    const pc = priorityConfig[task.priority] ?? priorityConfig.medium;
    const isDone = task.status === 'completed';
    const isUpdating = updatingId === task._id;
    const assignedBy = typeof task.assignedBy === 'object' ? task.assignedBy.fullName : task.assignedBy;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

    return (
      <div className={`flex flex-col gap-3 bg-slate-900/75 border rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${isDone ? 'border-indigo-500/10 opacity-60 hover:opacity-80' : 'border-indigo-500/18 hover:border-indigo-500/35'}`}>
        {/* Top row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-xs font-semibold border rounded-md px-2.5 py-1 ${pc.badge}`}>
            {pc.label}
          </span>
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
              📅 {new Date(task.dueDate).toLocaleDateString()}
              {isOverdue && <span className="text-red-400 font-semibold">· Overdue</span>}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-base font-semibold leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Assigned by <span className="text-slate-400 font-medium">{assignedBy}</span>
          </span>
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <span className={`text-xs font-semibold border rounded-md px-2.5 py-1 ${isDone ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
            {isDone ? '✅ Completed' : '⏳ Pending'}
          </span>

          <button
            id={`toggle-task-${task._id}`}
            disabled={isUpdating}
            onClick={() => toggleStatus(task)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDone
                ? 'bg-slate-800 border border-indigo-500/20 text-indigo-300 hover:bg-slate-700'
                : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:opacity-90 hover:-translate-y-0.5'
            }`}
          >
            {isUpdating ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isDone ? (
              'Mark Pending'
            ) : (
              'Mark Complete'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 relative overflow-x-hidden">
      {/* Orbs */}
      <div className="absolute top-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full bg-indigo-500 opacity-[0.12] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[400px] h-[400px] rounded-full bg-violet-500 opacity-[0.12] blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-indigo-500/15 bg-[#070b14]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-100 tracking-tight">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 bg-indigo-500/12 border border-indigo-500/20 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                {currentUser.fullName.charAt(0)}
              </div>
              <span className="text-sm text-indigo-200">{currentUser.fullName}</span>
            </div>
          )}
          <button onClick={logout} className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm hover:bg-red-500/20 transition-all">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Banner */}
        <div className="bg-slate-900/70 border border-indigo-500/18 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">My Tasks</h1>
          <p className="text-slate-400 text-sm mb-5">
            {completed.length} of {tasks.length} tasks completed
          </p>
          {tasks.length > 0 && (
            <div className="mb-4">
              <div className="w-full h-2 bg-indigo-500/12 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-slate-500">{progressPct}% done</span>
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              {pending.length} pending
            </span>
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              {completed.length} completed
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
            <div className="w-9 h-9 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p>Loading your tasks…</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-5 py-4 text-sm">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-5">🎉</div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No tasks assigned yet</h3>
            <p className="text-slate-500 text-sm">Your admin hasn&apos;t assigned any tasks to you yet. Check back later!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {pending.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2.5 text-base font-semibold text-slate-300 mb-4">
                  ⏳ Pending
                  <span className="text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full px-2.5 py-0.5">{pending.length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pending.map(t => <TaskCard key={t._id} task={t} />)}
                </div>
              </section>
            )}
            {completed.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2.5 text-base font-semibold text-slate-300 mb-4">
                  ✅ Completed
                  <span className="text-xs font-bold bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 rounded-full px-2.5 py-0.5">{completed.length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completed.map(t => <TaskCard key={t._id} task={t} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
