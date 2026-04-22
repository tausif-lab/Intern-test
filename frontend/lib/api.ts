/**
 * Centralised API helper for the frontend.
 * Automatically attaches the JWT from localStorage and handles 401 redirects.
 */

const API_BASE = 'https://intern-test-ez2k.onrender.com';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

interface RequestOptions extends RequestInit {
  // Optionally skip the auth header (e.g. login / register)
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const token = getToken();
  const authHeaders: Record<string, string> =
    !skipAuth && token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(headers as Record<string, string>),
    },
    ...rest,
  });

  if (response.status === 401) {
    // Token expired or invalid → clear storage and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}
