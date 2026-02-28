"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usersApi, projectsApi, ApiError, Project } from "@/lib/api";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { router.push("/login"); return; }
    const user = JSON.parse(userStr);

    usersApi.getProjects(user.user_id)
      .then(setProjects)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load projects");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const project = await projectsApi.create(newName, newDesc);
      setProjects((prev) => [...prev, project]);
      setNewName("");
      setNewDesc("");
      setIsModalOpen(false);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage and explore all your ongoing projects.</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setCreateError(""); }}
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-blue-700 transition font-medium"
        >
          + New Project
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 animate-pulse">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <h2 className="text-lg font-medium text-gray-700 mb-2">No projects found</h2>
          <p className="text-gray-500 mb-4">Start by creating your very first project.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Project
          </button>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.projectId} className="group border rounded-2xl p-6 bg-white hover:shadow-lg transition cursor-pointer">
              <Link href={`/projects/${project.projectId}`} className="block">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {project.name}
                </h2>
                {project.description && (
                  <p className="text-gray-600 mt-2 line-clamp-3">{project.description}</p>
                )}
                <div className="mt-4 text-sm text-blue-600 font-medium">View Details →</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Project</h2>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300 focus:outline-none text-black"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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