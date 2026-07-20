export const SCENE_STATUSES = ['draft', 'editing', 'proofread', 'final'] as const;
export const BOOK_STATUSES = ['draft', 'in_progress', 'completed'] as const;
export const ENTITY_SCOPES = ['series', 'local'] as const;
export const ENTITY_STATUSES = ['draft', 'approved'] as const;
export const ENTITY_TYPES = ['character', 'location', 'organization'] as const;
export const BEAT_TYPES = ['setup', 'trial', 'turning_point', 'resolution'] as const;
export const CELL_STATUSES = ['pending', 'written', 'linked', 'not_participating'] as const;
export const ASSET_TYPES = ['cover', 'trailer_prompt', 'tts', 'merch'] as const;
export const PUBLICATION_STATUSES = ['draft', 'submitted', 'published', 'unpublished'] as const;
export const VERSION_SOURCES = ['autosave', 'status_change', 'app_close', 'manual'] as const;
export const SYNC_ACTIONS = ['create', 'update', 'delete'] as const;

export const SCENE_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  editing: 'На редактуре',
  proofread: 'Вычитано',
  final: 'Финал',
};

export const SCENE_STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',      // slate-400
  editing: '#f59e0b',    // amber-500
  proofread: '#3b82f6',  // blue-500
  final: '#22c55e',      // green-500
};

export const ENTITY_TYPE_COLORS: Record<string, string> = {
  character: '#a855f7',  // purple
  location: '#06b6d4',   // cyan
  organization: '#f97316', // orange
};

export const SYNC_STATUS_COLORS = {
  saved: '#22c55e',      // green
  stale: '#f59e0b',      // amber
  offline: '#ef4444',    // red
} as const;
