'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectsApi, tasksApi, usersApi, ApiError, Project, Task } from '@/lib/api';

const STATUS_LABELS: Record<Task['status'], string> = {
  TODO: 'To-Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const STATUS_COLORS: Record<Task['status'], string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
};

type Member = {
  userId: number;
  role: string;
  user: { userId: number; name: string; email: string };
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // member search state
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ userId: number; name: string; email: string } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [memberRole, setMemberRole] = useState<'member' | 'admin'>('member');
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [taskStatus, setTaskStatus] = useState<Task['status']>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [taskError, setTaskError] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) { router.push('/login'); return; }

  //   Promise.all([
  //     projectsApi.getById(projectId),
  //     projectsApi.getTasks(projectId),
  //     projectsApi.getMembers(projectId),
  //   ])

    
  //     .then(([p, t, m]) => {
  //       setProject(p);
  //       setTasks(t);
  //       setMembers(m as Member[]);
  //     })
  //     .catch((err) => {
  //       if (err instanceof ApiError && err.status === 401) router.push('/login');
  //       else if (err instanceof ApiError && err.status === 403) setError('You are not a member of this project.');
  //       else if (err instanceof ApiError && err.status === 404) setError('Project not found.');
  //       else setError(err instanceof ApiError ? err.message : 'Failed to load project');
  //     })
  //     .finally(() => setLoading(false));
  // }, [projectId, router]);

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) { router.push('/login'); return; }

  async function load() {
    try {
      const p = await projectsApi.getById(projectId);
      setProject(p);

      const t = await projectsApi.getTasks(projectId);
      setTasks(t);

      try {
        const m = await projectsApi.getMembers(projectId);
        setMembers(m as Member[]);
      } catch (err) {
        console.error('Members fetch failed:', err);
      }

    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.push('/login');
      else if (err instanceof ApiError && err.status === 403) setError('You are not a member of this project.');
      else if (err instanceof ApiError && err.status === 404) setError('Project not found.');
      else setError(err instanceof ApiError ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }

  load();
}, [projectId, router]);

  async function handleSearch() {
    setSearchError('');
    setSearchResult(null);
    setSearching(true);
    try {
      const user = await usersApi.searchByEmail(searchEmail);
      // check if already a member
      if (members.some((m) => m.userId === user.userId)) {
        setSearchError('This user is already a member of this project.');
      } else {
        setSearchResult(user);
      }
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : 'User not found');
    } finally {
      setSearching(false);
    }
  }

  async function handleAddMember() {
    if (!searchResult) return;
    setMemberError('');
    setMemberSuccess('');
    setAddingMember(true);
    try {
      const newMember = await projectsApi.addMember(projectId, searchResult.userId, memberRole);
      setMembers((prev) => [...prev, { 
  userId: searchResult.userId, 
  role: memberRole, 
  user: searchResult 
}]);
      setMemberSuccess(`${searchResult.name} added as ${memberRole}.`);
      setSearchResult(null);
      setSearchEmail('');
    } catch (err) {
      setMemberError(err instanceof ApiError ? err.message : 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(userId: number, name: string) {
    if (!confirm(`Remove ${name} from this project?`)) return;
    try {
      await projectsApi.removeMember(projectId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to remove member');
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
  e.preventDefault();
  setTaskError('');
  const userStr = localStorage.getItem('user');
const currentUser = userStr ? JSON.parse(userStr) : null;
console.log('currentUser:', currentUser); // check this
  
  // figure out assignee — either selected member or current user
  const resolvedAssigneeId = assigneeId 
    ? Number(assigneeId) 
    : currentUser?.user_id ?? currentUser?.userId ?? null;

  if (!resolvedAssigneeId) {
    setTaskError('Could not determine assignee. Please select one.');
    return;
  }

  setCreatingTask(true);
  try {
    const newTask = await tasksApi.create({
      projectId,
      title: taskTitle,
      description: taskDescription || undefined,
      assigneeId: resolvedAssigneeId,
      status: taskStatus,
      dueDate: dueDate || undefined,
    });
    setTasks((prev) => [...prev, newTask]);
    setTaskTitle('');
    setTaskDescription('');
    setAssigneeId('');
    setTaskStatus('TODO');
    setDueDate('');
  } catch (err) {
    setTaskError(err instanceof ApiError ? err.message : 'Failed to create task');
  } finally {
    setCreatingTask(false);
  }
}

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <p className="text-gray-500 animate-pulse">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        <Link href="/projects" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Projects</Link>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">

      {/* Header */}
      <section>
        <Link href="/projects" className="text-sm text-blue-600 hover:underline">← Back to Projects</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{project.name}</h1>
        {project.description && <p className="text-gray-600 mt-1">{project.description}</p>}
      </section>

      {/* Members */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Members <span className="text-gray-400 text-base font-normal">({members.length})</span>
        </h2>

        {/* Current members list */}
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">No members yet.</p>
        ) : (
          <ul className="divide-y mb-6 border rounded-xl overflow-hidden">
            {members.map((m) => (
              <li key={m.userId} className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{m.user.name}</p>
                  <p className="text-sm text-gray-500">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
                    {m.role}
                  </span>
                  {m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(m.userId, m.user.name)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add member by email */}
        <h3 className="font-medium text-gray-700 mb-3">Add Member by Email</h3>

        {memberError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{memberError}</div>
        )}
        {memberSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{memberSuccess}</div>
        )}

        {/* Search bar */}
        <div className="flex gap-2 mb-3">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value);
              setSearchResult(null);
              setSearchError('');
              setMemberSuccess('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="Search user by email..."
            className="flex-1 border rounded-lg px-3 py-2 text-black focus:ring focus:ring-blue-300 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchEmail}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchError && <p className="text-red-600 text-sm mb-3">{searchError}</p>}

        {/* Search result */}
        {searchResult && (
          <div className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 mb-2">
            <div>
              <p className="font-medium text-gray-900">{searchResult.name}</p>
              <p className="text-sm text-gray-500">{searchResult.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as 'member' | 'admin')}
                className="border rounded-lg px-2 py-1 text-black text-sm focus:ring focus:ring-blue-300 focus:outline-none"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleAddMember}
                disabled={addingMember}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {addingMember ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Tasks list */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Tasks <span className="text-gray-400 text-base font-normal">({tasks.length})</span>
        </h2>
        {tasks.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-2xl text-gray-500">
            No tasks yet. Create one below.
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.taskId} className="border rounded-xl p-4 bg-white hover:shadow transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create task */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Task</h2>
        {taskError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{taskError}</div>
        )}
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-black focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-black focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          {/* Assignee dropdown from members list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-black focus:ring focus:ring-blue-300 focus:outline-none"
              >
                <option value="">Assign to yourself</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as Task['status'])}
                className="w-full border rounded-lg px-3 py-2 text-black focus:ring focus:ring-blue-300 focus:outline-none"
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
                className="w-full border rounded-lg px-3 py-2 text-black focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creatingTask}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {creatingTask ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </section>
    </div>
  );
}