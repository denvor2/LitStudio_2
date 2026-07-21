import { Link, useLocation, useParams } from 'react-router-dom';
import {
  BookOpen, LayoutGrid, FileText, Globe, Target,
  Clock, Settings
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
}

export function Sidebar() {
  const { projectId, bookId } = useParams<{ projectId?: string; bookId?: string }>();

  const navigation: NavItem[] = [
    { label: 'Проекты', icon: <BookOpen size={18} />, path: '/projects' },
    ...(bookId ? [
      { label: 'Рукопись', icon: <FileText size={18} />, path: `/books/${bookId}` },
      { label: 'Доска сюжета', icon: <LayoutGrid size={18} />, path: `/books/${bookId}/plot-board` },
      { label: 'Конспект', icon: <FileText size={18} />, path: `/books/${bookId}/outline` },
      { label: 'Таймлайн', icon: <Clock size={18} />, path: `/books/${bookId}/timeline` },
    ] : []),
    ...(projectId ? [
      { label: 'Кодекс', icon: <Globe size={18} />, path: `/projects/${projectId}/codex` },
      { label: 'Цели', icon: <Target size={18} />, path: `/projects/${projectId}/goals` },
    ] : []),
  ];

  return (
    <aside className="w-[250px] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 flex flex-col overflow-hidden dark:bg-[#1a1b1e]">
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {navigation.map((item, i) => (
          <NavItemComponent key={i} item={item} />
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md w-full">
          <Settings size={18} />
          <span>Настройки</span>
        </button>
      </div>
    </aside>
  );
}

function NavItemComponent({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive = item.path && location.pathname === item.path;

  return (
    <Link
      to={item.path || '#'}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors
        ${isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}
