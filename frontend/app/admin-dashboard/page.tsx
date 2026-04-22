"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Task,
  User,
  TasksResponse,
  UsersResponse,
  TaskResponse,
} from "@/types/auth";
import { apiFetch } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        apiFetch<TasksResponse>("/api/v1/tasks"),
        apiFetch<UsersResponse>("/api/v1/tasks/users"),
      ]);
      setTasks(tasksRes.data?.tasks || []);
      setUsers(usersRes.data?.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored) as User;
    if (u.role !== "admin") {
      router.push("/user-dashboard");
      return;
    }
    setAdminUser(u);
    fetchData();
  }, [fetchData, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!form.title || !form.assignedTo) {
      setFormError("Title and assignee are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<TaskResponse>("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          assignedTo: form.assignedTo,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
        }),
      });
      setTasks((prev) => [res.data!.task, ...prev]);
      setForm({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
      });
      setFormSuccess("Task assigned successfully!");
      setTimeout(() => setFormSuccess(""), 3000);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await apiFetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const getAssigneeName = (t: Task) =>
    typeof t.assignedTo === "object" ? t.assignedTo.fullName : t.assignedTo;

  const priorityStyles: Record<string, string> = {
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    high: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const statusStyles: Record<string, string> = {
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  };

  const inputCls =
    "w-full bg-slate-800/80 border border-indigo-500/20 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: "📋" },
    {
      label: "Pending",
      value: tasks.filter((t) => t.status === "pending").length,
      icon: "⏳",
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "completed").length,
      icon: "✅",
    },
    { label: "Team Members", value: users.length, icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 relative overflow-x-hidden">
      {/* Orbs */}
      <div className="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] rounded-full bg-indigo-500 opacity-[0.12] blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-violet-500 opacity-[0.12] blur-[90px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-indigo-500/15 bg-[#070b14]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-100 tracking-tight">
            TaskFlow
          </span>
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">
            👋 {adminUser?.fullName}
          </span>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm hover:bg-red-500/20 transition-all"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-slate-900/70 border border-indigo-500/15 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm hover:border-indigo-500/35 transition-all"
            >
              <span className="text-3xl">{s.icon}</span>
              <div>
                <div className="text-2xl font-bold text-slate-100">
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Top grid: form + users */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
          {/* Assign Task Form */}
          <section className="bg-slate-900/70 border border-indigo-500/15 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100 mb-5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-indigo-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Assign New Task
            </h2>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-2.5 text-sm mb-4">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-2.5 text-sm mb-4">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Task Title *
                </label>
                <input
                  id="task-title"
                  className={inputCls}
                  placeholder="e.g. Design login page"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  id="task-desc"
                  className={`${inputCls} resize-none`}
                  placeholder="Task details…"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Assign To *
                  </label>
                  <select
                    id="task-assignee"
                    className={inputCls}
                    value={form.assignedTo}
                    onChange={(e) =>
                      setForm({ ...form, assignedTo: e.target.value })
                    }
                    required
                  >
                    <option value="">Select user…</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    className={inputCls}
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Due Date
                </label>
                <input
                  id="task-due"
                  className={inputCls}
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
              <button
                id="create-task-btn"
                type="submit"
                disabled={submitting}
                className="py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? "Assigning…" : "Assign Task"}
              </button>
            </form>
          </section>

          {/* Users List */}
          <section className="bg-slate-900/70 border border-indigo-500/15 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100 mb-5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-indigo-400"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              Team Members
            </h2>
            {users.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No users registered yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {users.map((u) => {
                  const taskCount = tasks.filter(
                    (t) =>
                      (typeof t.assignedTo === "object"
                        ? t.assignedTo._id
                        : t.assignedTo) === u._id,
                  ).length;
                  return (
                    <li
                      key={u._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-indigo-500/10 hover:border-indigo-500/25 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {u.fullName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {u.email}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-indigo-300 bg-indigo-500/15 rounded-md px-2 py-0.5 whitespace-nowrap">
                        {taskCount} tasks
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* All Tasks Table */}
        <section className="bg-slate-900/70 border border-indigo-500/15 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100 mb-5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-indigo-400"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            All Tasks
          </h2>

          {loading ? (
            <div className="flex items-center gap-3 text-slate-400 py-6">
              <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              Loading tasks…
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No tasks yet. Assign one above!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-500/12">
                    {[
                      "Title",
                      "Assigned To",
                      "Priority",
                      "Status",
                      "Due Date",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest pb-3 pr-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b border-indigo-500/07 hover:bg-indigo-500/04 transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="text-sm font-medium text-slate-200">
                          {t.title}
                        </div>
                        {t.description && (
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getAssigneeName(t).charAt(0)}
                          </div>
                          <span className="text-sm text-slate-300">
                            {getAssigneeName(t)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`text-xs font-semibold border rounded-md px-2.5 py-1 capitalize ${priorityStyles[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`text-xs font-semibold border rounded-md px-2.5 py-1 capitalize ${statusStyles[t.status]}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-slate-400">
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3.5">
                        <button
                          id={`delete-task-${t._id}`}
                          disabled={deletingId === t._id}
                          onClick={() => handleDelete(t._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {deletingId === t._id ? (
                            "…"
                          ) : (
                            <>
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
