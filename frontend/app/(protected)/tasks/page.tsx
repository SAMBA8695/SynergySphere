"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usersApi, projectsApi, tasksApi, ApiError, Task, Project } from "@/lib/api";

type Member = {
  userId: number;
  role: string;
  user: { userId: number; name: string; email: string };
};

const STATUS_LABELS: Record<Task["status"], string> = {
  TODO: "To-Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_COLORS: Record<Task["status"], string> = {
  TODO: "bg-gray-200 text-gray-800",
  IN_PROGRESS: "bg-yellow-200 text-yellow-800",
  DONE: "bg-green-200 text-green-800",
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState<Task["status"]>("TODO");
  const [dueDate, setDueDate] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { router.push("/login"); return; }
    const user = JSON.parse(userStr);

    Promise.all([
      usersApi.getTasks(user.user_id),
      usersApi.getProjects(user.user_id),
    ])
      .then(([t, p]) => { setTasks(t); setProjects(p); })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // When project is selected, fetch its members for the assignee dropdown
  async function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId);
    setAssigneeId("");
    setMembers([]);
    if (!projectId) return;

    setLoadingMembers(true);
    try {
      const m = await projectsApi.getMembers(Number(projectId));
      setMembers(m as Member[]);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");

    if (!selectedProjectId) {
      setCreateError("Please select a project.");
      return;
    }

    const userStr = localStorage.getItem('user');
const currentUser = userStr ? JSON.parse(userStr) : null;
console.log('currentUser:', currentUser); // check this
    const resolvedAssigneeId = assigneeId
      ? Number(assigneeId)
      : currentUser?.user_id ?? currentUser?.userId ?? null;

    if (!resolvedAssigneeId) {
      setCreateError("Could not determine assignee. Please select one.");
      return;
    }

    setCreating(true);
    try {
      const newTask = await tasksApi.create({
        projectId: Number(selectedProjectId),
        title,
        description: description || undefined,
        assigneeId: resolvedAssigneeId,
        status,
        dueDate: dueDate || undefined,
      });
      setTasks((prev) => [...prev, newTask]);
      // Reset form
      setSelectedProjectId("");
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setStatus("TODO");
      setDueDate("");
      setMembers([]);
      setIsModalOpen(false);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <p className="text-gray-500 animate-pulse">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track tasks across your projects.</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setCreateError(""); }}
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-blue-700 transition font-medium"
        >
          + New Task
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <h2 className="text-lg font-medium text-gray-700 mb-2">No tasks yet</h2>
          <p className="text-gray-500 mb-4">Create a task or go into a project to add one.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Task
          </button>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <li key={task.taskId} className="group border rounded-2xl p-6 bg-white hover:shadow-lg transition">
              <Link href={`/tasks/${task.taskId}`} className="block">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {task.title}
                </h2>
                {task.description && (
                  <p className="text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
                {task.dueDate && (
                  <div className="mt-2 text-sm text-gray-500">
                    Due: <span className="font-medium text-gray-700">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Task</h2>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">

              {/* Project selector */}
              <div>
                <label className="block text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300 focus:outline-none text-black"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300 focus:outline-none text-black"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300 focus:outline-none text-black"
                />
              </div>

              {/* Assignee — populated from project members */}
              <div>
                <label className="block text-gray-700 mb-1">Assignee</label>
                {loadingMembers ? (
                  <p className="text-sm text-gray-400 animate-pulse">Loading members...</p>
                ) : (
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300 focus:outline-none text-black"
                    disabled={!selectedProjectId}
                  >
                    <option value="">Assign to yourself</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name} ({m.role})
                      </option>
                    ))}
                  </select>
                )}
                {selectedProjectId && members.length === 0 && !loadingMembers && (
                  <p className="text-xs text-gray-400 mt-1">No other members — task will be assigned to you.</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task["status"])}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300 focus:outline-none text-black"
                >
                  <option value="TODO">To-Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300 focus:outline-none text-black"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border bg-red-300 hover:bg-red-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}