import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth-store';
import { LoginPage } from '../features/auth/LoginPage';
import { MainLayout } from '../widgets/layout/MainLayout';
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
          <Route path="books/:bookId" element={<div className="p-8"><h1 className="text-2xl font-semibold">Книга</h1></div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
