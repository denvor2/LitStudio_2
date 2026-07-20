import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth-store';
import { LoginPage } from '../features/auth/LoginPage';
import { MainLayout } from '../widgets/layout/MainLayout';
import { ScenePage } from '../features/editor/ScenePage';
import { MatrixPage } from '../features/planning/MatrixPage';
import { TimelinePage } from '../features/planning/TimelinePage';
import { StatisticsPage } from '../features/planning/StatisticsPage';
import { CharactersPage } from '../features/bible/CharactersPage';
import { LocationsPage } from '../features/bible/LocationsPage';
import { OrganizationsPage } from '../features/bible/OrganizationsPage';
import { RulesPage } from '../features/bible/RulesPage';
import { TermsPage } from '../features/bible/TermsPage';
import { AuthorStylePage } from '../features/style/AuthorStylePage';
import { IdeasPage } from '../features/ideas/IdeasPage';
import { ToastContainer } from '../shared/ui/Toast';

export function App() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
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
          <Route index element={<Navigate to="/series" replace />} />
          <Route path="series" element={<div className="p-8"><h1 className="text-2xl font-semibold">Мои серии</h1></div>} />
          <Route path="series/:seriesId" element={<div className="p-8"><h1 className="text-2xl font-semibold">Серия</h1></div>} />

          {/* Editor */}
          <Route path="books/:bookId" element={<ScenePage />} />
          <Route path="books/:bookId/editor" element={<ScenePage />} />

          {/* Planning */}
          <Route path="books/:bookId/planning/matrix" element={<MatrixPage />} />
          <Route path="books/:bookId/planning/timeline" element={<TimelinePage />} />
          <Route path="books/:bookId/planning/stats" element={<StatisticsPage />} />

          {/* World Bible */}
          <Route path="series/:seriesId/bible/characters" element={<CharactersPage />} />
          <Route path="series/:seriesId/bible/locations" element={<LocationsPage />} />
          <Route path="series/:seriesId/bible/organizations" element={<OrganizationsPage />} />
          <Route path="series/:seriesId/bible/rules" element={<RulesPage />} />
          <Route path="series/:seriesId/bible/terms" element={<TermsPage />} />

          {/* Series */}
          <Route path="series/:seriesId/style" element={<AuthorStylePage />} />
          <Route path="books/:bookId/ideas" element={<IdeasPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
