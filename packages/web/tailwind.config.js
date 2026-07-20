/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        status: {
          draft: '#94a3b8',
          editing: '#f59e0b',
          proofread: '#3b82f6',
          final: '#22c55e',
        },
        entity: {
          character: '#a855f7',
          location: '#06b6d4',
          organization: '#f97316',
        },
        sync: {
          saved: '#22c55e',
          stale: '#f59e0b',
          offline: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
