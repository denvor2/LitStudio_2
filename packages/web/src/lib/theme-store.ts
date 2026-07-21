import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
  loadFromStorage: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  toggle: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: next });
    localStorage.setItem('theme', next);
    applyTheme(next);
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  },

  loadFromStorage: () => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    set({ theme });
    applyTheme(theme);
  },
}));

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
