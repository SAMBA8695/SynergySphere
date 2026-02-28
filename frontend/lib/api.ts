export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function parseErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "Something went wrong";
  const b = body as Record<string, unknown>;
  if (Array.isArray(b.message)) return b.message.join(", ");
  if (typeof b.message === "string") return b.message;
  if (typeof b.error === "string") return b.error;
  if (typeof b.detail === "string") return b.detail;
  return "Something went wrong";
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError("Not authenticated", 401);
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let body: unknown = {};
    try { body = await res.json(); } catch {}
    throw new ApiError(parseErrorMessage(body), res.status);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    request("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }, false),

  login: (email: string, password: string) =>
    request<{
      access_token: string;
      token_type: string;
      user: { user_id: number; name: string; email: string };
    }>("/login", {
      method: "POST",
      body: JSON.stringify({ username: email, password }),
    }, false),
};

export const usersApi = {
  me: () =>
    request<{ userId: number; name: string; email: string }>("/users/me"),

  getProjects: (userId: number) =>
    request<Project[]>(`/users/${userId}/projects`),

  getTasks: (userId: number) =>
    request<Task[]>(`/users/${userId}/tasks`),

  searchByEmail: (email: string) =>
    request<{ userId: number; name: string; email: string }>(
      `/users/search?email=${encodeURIComponent(email)}`
    ),
};

export const projectsApi = {
  create: (name: string, description?: string) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),

  getById: (projectId: number) =>
    request<Project>(`/projects/${projectId}`),

  getTasks: (projectId: number) =>
    request<Task[]>(`/projects/${projectId}/tasks`),

  getMembers: (projectId: number) =>
    request<Member[]>(`/projects/${projectId}/members`),

  addMember: (projectId: number, userId: number, role: "member" | "admin" = "member") =>
    request(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    }),

  removeMember: (projectId: number, userId: number) =>
    request(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    }),
};

export const tasksApi = {
  create: (data: {
    projectId: number;
    title: string;
    description?: string;
    assigneeId?: number;
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate?: string;
  }) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (taskId: number, data: Partial<{
    title: string;
    description: string;
    assigneeId: number;
    status: string;
    dueDate: string;
  }>) =>
    request<Task>(`/tasks/${taskId}/update`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (taskId: number) =>
    request(`/tasks/${taskId}/delete`, { method: "DELETE" }),
};

export interface Project {
  projectId: number;
  name: string;
  description?: string;
}

export interface Task {
  taskId: number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeId?: number;
  dueDate?: string;
  projectId: number;
}

export interface Member {
  userId: number;
  role: string;
  user: {
    userId: number;
    name: string;
    email: string;
  };
}