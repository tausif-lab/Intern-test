export interface User {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user" | "admin";
}

export interface LoginFormData {
  email: string;
  password: string;
  role: "user" | "admin";
}

/**
 * Structured API Response Format
 * All authentication responses follow this structure
 */
export interface AuthResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: {
    token: string;
    user: User;
    redirectUrl?: string;
  } | null;
  errors: Array<{ field?: string; message: string; value?: any }> | null;
  timestamp: string;
}

export interface ErrorResponse {
  status: "error";
  statusCode: number;
  message: string;
  data: null;
  errors: Array<{ field?: string; message: string; value?: any }>;
  timestamp: string;
}

// ─── Task types ────────────────────────────────────────────────────────────────

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: { _id: string; fullName: string; email: string } | string;
  assignedBy: { _id: string; fullName: string; email: string } | string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data: T | null;
  errors: Array<{ field?: string; message: string; value?: any }> | null;
  timestamp: string;
}

export interface TasksResponse extends ApiResponse<{ tasks: Task[] }> {}

export interface TaskResponse extends ApiResponse<{ task: Task }> {}

export interface UsersResponse extends ApiResponse<{ users: User[] }> {}
