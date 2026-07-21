// Scene statuses
export const SCENE_STATUSES = ['draft', 'editing', 'proofread', 'final'] as const;
export const SCENE_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  editing: 'На редактуре',
  proofread: 'Вычитано',
  final: 'Финал',
};
export const SCENE_STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  editing: '#f59e0b',
  proofread: '#3b82f6',
  final: '#22c55e',
};

// Book statuses
export const BOOK_STATUSES = ['draft', 'in_progress', 'completed'] as const;

// Codex entry types
export const CODEX_ENTRY_TYPES = [
  'character', 'location', 'object', 'faction', 'language', 'rule', 'term', 'custom',
] as const;
export const CODEX_ENTRY_TYPE_LABELS: Record<string, string> = {
  character: 'Персонаж',
  location: 'Локация',
  object: 'Объект',
  faction: 'Фракция',
  language: 'Язык',
  rule: 'Правило',
  term: 'Термин',
  custom: 'Другое',
};

// Codex entry colors
export const CODEX_ENTRY_COLORS: Record<string, string> = {
  character: '#a855f7',
  location: '#06b6d4',
  object: '#f97316',
  faction: '#ec4899',
  language: '#8b5cf6',
  rule: '#14b8a6',
  term: '#6366f1',
  custom: '#64748b',
};

// Collaborator roles
export const COLLABORATOR_ROLES = ['owner', 'editor', 'commenter', 'reader'] as const;
export const COLLABORATOR_ROLE_LABELS: Record<string, string> = {
  owner: 'Владелец',
  editor: 'Редактор',
  commenter: 'Комментатор',
  reader: 'Читатель',
};

// Goal types
export const GOAL_TYPES = ['daily', 'weekly', 'deadline'] as const;
export const GOAL_TYPE_LABELS: Record<string, string> = {
  daily: 'Дневная',
  weekly: 'Недельная',
  deadline: 'Дедлайн',
};

// Scene link types
export const SCENE_LINK_TYPES = ['mention', 'pov', 'location', 'appears'] as const;

// Beat types (legacy, kept for reference)
export const BEAT_TYPES = ['setup', 'trial', 'turning_point', 'resolution'] as const;

// Sync status
export const SYNC_STATUS_COLORS = {
  saved: '#22c55e',
  stale: '#f59e0b',
  offline: '#ef4444',
} as const;

// Author's sheet = 40,000 chars with spaces
export const AUTHOR_SHEET_CHARS = 40000;
// Standard page = 1,800 chars
export const PAGE_CHARS = 1800;
// NaNoWriMo daily goal
export const NANO_DAILY_GOAL = 1667;
