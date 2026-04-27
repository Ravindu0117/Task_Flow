const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      credentials: 'include', // send HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (res.status === 401) {
      // Try silent token refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request
        const retryRes = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...options.headers },
        });
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({ error: 'Request failed' }));
          throw err;
        }
        if (retryRes.status === 204) return undefined as T;
        return retryRes.json();
      }

      // Avoid redirect loops when already on an auth page.
      const publicPaths = ['/login', '/register'];
      if (typeof window !== 'undefined' && !publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
      throw { error: 'Session expired' };
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw err;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Auth
  register(data: { email: string; password: string; name: string }) {
    return this.request<{ user: import('@/types').User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ user: import('@/types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    return this.request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  }

  me() {
    return this.request<{ user: import('@/types').User }>('/auth/me');
  }

  // Tasks
  getTasks() {
    return this.request<{ tasks: import('@/types').Task[] }>('/tasks');
  }

  createTask(data: Partial<import('@/types').Task>) {
    return this.request<{ task: import('@/types').Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTask(id: string, data: Partial<import('@/types').Task>) {
    return this.request<{ task: import('@/types').Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteTask(id: string) {
    return this.request<void>(`/tasks/${id}`, { method: 'DELETE' });
  }

  reorderTasks(orderedIds: string[]) {
    return this.request<{ ok: boolean }>('/tasks/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orderedIds }),
    });
  }
}

export const api = new ApiClient(BASE_URL);
