import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth-store';
import { User, LogOut } from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuthStore();
  const { projectId, bookId } = useParams<{ projectId?: string; bookId?: string }>();

  return (
    <header className="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-sm">
      <nav className="flex items-center gap-4 text-gray-600">
        <span className="hover:text-gray-900 cursor-pointer">Файл</span>
        <span className="hover:text-gray-900 cursor-pointer">Редактировать</span>
        <span className="hover:text-gray-900 cursor-pointer">Вид</span>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <nav className="flex items-center gap-1 text-gray-500">
          <Link to="/projects" className="hover:text-gray-900">Проект</Link>
          {bookId && <><span className="text-gray-300">/</span><span className="text-gray-700">Книга</span></>}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <User size={16} />
            <span>{user?.displayName || user?.email}</span>
          </button>
          <button onClick={logout} className="text-gray-400 hover:text-gray-600">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
