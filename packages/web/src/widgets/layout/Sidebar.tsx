import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, PenTool, Globe, Lightbulb, Palette,
  Trash2, ChevronDown, ChevronRight, Settings
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'Главы', icon: <BookOpen size={18} />, path: '/chapters' },
  {
    label: 'Планирование',
    icon: <PenTool size={18} />,
    children: [
      { label: 'Матрица', icon: <ChevronRight size={14} />, path: '/planning/matrix' },
      { label: 'Таймлайн', icon: <ChevronRight size={14} />, path: '/planning/timeline' },
      { label: 'Карта связей', icon: <ChevronRight size={14} />, path: '/planning/connections' },
      { label: 'Статистика', icon: <ChevronRight size={14} />, path: '/planning/stats' },
    ],
  },
  {
    label: 'Библия мира',
    icon: <Globe size={18} />,
    children: [
      { label: 'Персонажи', icon: <ChevronRight size={14} />, path: '/bible/characters' },
      { label: 'Локации', icon: <ChevronRight size={14} />, path: '/bible/locations' },
      { label: 'Организации', icon: <ChevronRight size={14} />, path: '/bible/organizations' },
      { label: 'Правила', icon: <ChevronRight size={14} />, path: '/bible/rules' },
      { label: 'Термины', icon: <ChevronRight size={14} />, path: '/bible/terms' },
    ],
  },
  {
    label: 'Серия',
    icon: <Palette size={18} />,
    children: [
      { label: 'Авторский стиль', icon: <ChevronRight size={14} />, path: '/series/style' },
      { label: 'Идеи', icon: <ChevronRight size={14} />, path: '/series/ideas' },
      { label: 'Продакшн', icon: <ChevronRight size={14} />, path: '/series/production' },
    ],
  },
  { label: 'Корзина', icon: <Trash2 size={18} />, path: '/trash' },
];

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const isActive = item.path && location.pathname === item.path;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors
          ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
          ${depth > 0 ? 'ml-4' : ''}`}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
        }}
      >
        {hasChildren && (
          expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
        )}
        {!hasChildren && <span className="w-[14px]" />}
        <span className="text-gray-500">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
      </div>

      {hasChildren && expanded && (
        <div className="mt-0.5">
          {item.children!.map((child, i) => (
            <NavItemComponent key={i} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[250px] border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {navigation.map((item, i) => (
          <NavItemComponent key={i} item={item} />
        ))}
      </div>

      <div className="border-t border-gray-200 p-2">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md w-full">
          <Settings size={18} />
          <span>Настройки</span>
        </button>
      </div>
    </aside>
  );
}
