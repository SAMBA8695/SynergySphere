"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { usersApi, ApiError, Project, Task } from "@/lib/api";

const COLORS = ["#9CA3AF", "#FBBF24", "#34D399"];

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const userStr = localStorage.getItem('user');
  if (!userStr) { router.push('/login'); return; }
  const user = JSON.parse(userStr);

  // login response uses user_id (snake_case), handle both
  const userId = user.user_id ?? user.userId;
  console.log('userId resolved:', userId); // remove after confirming

  if (!userId) { router.push('/login'); return; }

  async function load() {
    try {
      const [p, t] = await Promise.all([
        usersApi.getProjects(userId),
        usersApi.getTasks(userId),
      ]);
      console.log('projects:', p);
      console.log('tasks:', t);
      setProjects(p);
      setTasks(t);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }

  load();
}, [router]);

  const stats = {
    totalProjects: projects.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  };

  const chartData = [
    { name: "To-Do", value: stats.todo },
    { name: "In-Progress", value: stats.inProgress },
    { name: "Done", value: stats.done },
  ];

  const statusLabel = (s: Task["status"]) =>
    s === "TODO" ? "To-Do" : s === "IN_PROGRESS" ? "In Progress" : "Done";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-32">
        <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your projects and tasks.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/projects" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            View Projects
          </Link>
          <Link href="/tasks" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            View Tasks
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Projects", value: stats.totalProjects },
          { label: "Tasks To-Do", value: stats.todo },
          { label: "In-Progress Tasks", value: stats.inProgress },
          { label: "Completed Tasks", value: stats.done },
        ].map((s) => (
          <div key={s.label} className="p-6 rounded-xl bg-white shadow text-center">
            <h2 className="text-2xl font-bold text-gray-900">{s.value}</h2>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects yet. <Link href="/projects" className="text-blue-600 hover:underline">Create one →</Link></p>
          ) : (
            <ul className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <li key={project.projectId} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
                  <Link href={`/projects/${project.projectId}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    {project.description && <p className="text-gray-600 mt-1">{project.description}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chart */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Task Status</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* My Tasks */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned to you yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.slice(0, 6).map((task) => (
              <li key={task.taskId} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
                <Link href={`/tasks/${task.taskId}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mt-1">{task.description}</p>
                  <span className="mt-2 inline-block text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {statusLabel(task.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}