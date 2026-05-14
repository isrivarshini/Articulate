const API_BASE = 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('articulate_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders(),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('articulate_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Something went wrong' }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function register({ email, username, password, displayName }) {
  const data = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      username,
      password,
      display_name: displayName || username,
    }),
  });
  localStorage.setItem('articulate_token', data.access_token);
  return data;
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('articulate_token', data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem('articulate_token');
  window.location.href = '/login';
}

export async function getMe() {
  return request('/auth/me');
}

export function isLoggedIn() {
  return !!getToken();
}

// ─── Practice ────────────────────────────────────────────────────────────────

export async function analyzeRecording({ audioBlob, mode, context, promptText }) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('mode', mode);
  if (context) formData.append('context', context);
  if (promptText) formData.append('prompt_text', promptText);

  return request('/practice/analyze', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — browser sets it with boundary for FormData
  });
}

export async function getSessions(limit = 30) {
  return request(`/practice/sessions?limit=${limit}`);
}

export async function getSessionDetail(sessionId) {
  return request(`/practice/sessions/${sessionId}`);
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

export async function getPrompts(mode, context = 'Technical') {
  return request(`/prompts/${mode}?context=${context}`);
}

export async function getRandomPrompt(mode, context = 'Technical') {
  return request(`/prompts/${mode}/random?context=${context}`);
}

// ─── Social ──────────────────────────────────────────────────────────────────

export async function getLeaderboard(limit = 20) {
  return request(`/leaderboard?limit=${limit}`);
}

export async function getStats() {
  return request('/stats');
}

export async function getBadges() {
  return request('/badges');
}