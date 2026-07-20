import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth-store';
import { ChevronRight, User, LogOut } from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-10 border-b border-gray-200 bg-white flex items-center px-4 text-sm">
      {/* Menu bar */}
      <nav className="flex items-center gap-4 text-gray-600">
        <span className="hover:text-gray-900 cursor-pointer">Файл</span>
        <span className="hover:text-gray-900 cursor-pointer">Редактировать</span>
        <span className="hover:text-gray-900 cursor-pointer">Вид</span>
        <span className="hover:text-gray-900 cursor-pointer">Справка</span>
      </nav>

      {/* Breadcrumb */}
      <div className="flex-1 flex items-center justify-center">
        <nav className="flex items-center gap-1 text-gray-500">
          <Link to="/series" className="hover:text-gray-900">Серия</Link>
          <ChevronRight size={14} />
          <span className="text-gray-300">Книга</span>
          <ChevronRight size={14} />
          <span className="text-gray-300">Глава</span>
          <ChevronRight size={14} />
          <span className="text-gray-300">Сцена</span>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Mode switcher */}
        <div className="flex items-center bg-gray-100 rounded-md p-0.5">
          <button className="px-2 py-0.5 text-xs font-medium bg-white rounded shadow-sm">
            Планирование
          </button>
          <button className="px-2 py-0.5 text-xs font-medium text-gray-600 rounded">
            Написание
          </button>
        </div>

        {/* User menu */}
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
