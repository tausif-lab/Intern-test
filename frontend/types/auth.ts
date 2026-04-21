export interface User {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'admin';
}

export interface LoginFormData {
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  redirectUrl?: string;
}

export interface ErrorResponse {
  message: string;
}

// ─── Task types ────────────────────────────────────────────────────────────────

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: { _id: string; fullName: string; email: string } | string;
  assignedBy: { _id: string; fullName: string; email: string } | string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  message: string;
  task: Task;
}

export interface UsersResponse {
  users: User[];
}