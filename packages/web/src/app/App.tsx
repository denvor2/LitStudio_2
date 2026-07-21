import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth-store';
import { useThemeStore } from '../lib/theme-store';
import { LoginPage } from '../features/auth/LoginPage';
import { MainLayout } from '../widgets/layout/MainLayout';
import { ScenePage } from '../features/editor/ScenePage';
import { PlotBoardPage } from '../features/plotboard/PlotBoardPage';
import { CodexPage } from '../features/codex/CodexPage';
import { OutlinePage } from '../features/outline/OutlinePage';
import { GoalsPage } from '../features/goals/GoalsPage';
import { TimelinePage } from '../features/planning/TimelinePage';
import { ToastContainer } from '../shared/ui/Toast';

export function App() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { loadFromStorage: loadTheme } = useThemeStore();

  useEffect(() => {
    loadFromStorage();
    loadTheme();
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<div className="p-8"><h1 className="text-2xl font-semibold">Мои проекты</h1></div>} />
          <Route path="projects/:projectId" element={<div className="p-8"><h1 className="text-2xl font-semibold">Проект</h1></div>} />

          {/* Editor */}
          <Route path="books/:bookId" element={<ScenePage />} />

          {/* Plot Board */}
          <Route path="books/:bookId/plot-board" element={<PlotBoardPage />} />

          {/* Outline */}
          <Route path="books/:bookId/outline" element={<OutlinePage />} />

          {/* Timeline */}
          <Route path="books/:bookId/timeline" element={<TimelinePage />} />

          {/* Codex */}
          <Route path="projects/:projectId/codex" element={<CodexPage />} />

          {/* Goals */}
          <Route path="projects/:projectId/goals" element={<GoalsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
