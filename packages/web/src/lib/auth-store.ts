import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    api.setToken(res.token);
    localStorage.setItem('token', res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  register: async (email, password, displayName) => {
    const res = await api.post<{ user: User; token: string }>('/auth/register', {
      email, password, displayName,
    });
    api.setToken(res.token);
    localStorage.setItem('token', res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  logout: () => {
    api.setToken(null);
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      api.get<User>('/auth/me').then((user) => {
        set({ user, token, isAuthenticated: true });
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  },
}));
