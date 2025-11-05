const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export type AuthResponse = { token: string; user: { id: number; email: string } };

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('bb_jwt', token);
  else localStorage.removeItem('bb_jwt');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('bb_jwt');
}

async function request(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getAuthToken();
  if (token) (headers as any).Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

export const api = {
  health: () => request('/health'),
  register: (email: string, password: string) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }) as Promise<AuthResponse>,
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }) as Promise<AuthResponse>,
  submitQuiz: (payload: { dueDate?: string; trimester?: number; wellnessPrefs?: string[] }) => request('/quiz/submit', { method: 'POST', body: JSON.stringify(payload) }),
  getTips: (userId: number) => request(`/tips/${userId}`),
  getMilestones: (userId: number) => request(`/milestones/${userId}`),
  createMilestone: (userId: number, payload: { title: string; targetWeek?: number; achievedAt?: string }) => request(`/milestones/${userId}`, { method: 'POST', body: JSON.stringify(payload) }),
};
