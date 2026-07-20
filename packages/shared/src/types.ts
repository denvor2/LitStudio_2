// ===== User & Auth =====

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  authProvider: 'local' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

// ===== Series =====

export interface Series {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Book =====

export type BookStatus = 'draft' | 'in_progress' | 'completed';

export interface Book {
  id: string;
  seriesId: string;
  title: string;
  subtitle: string | null;
  genre: string | null;
  tags: string[];
  annotationShort: string | null;
  annotationFull: string | null;
  targetChars: number | null;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Chapter =====

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Scene =====

export type SceneStatus = 'draft' | 'editing' | 'proofread' | 'final';

export interface Scene {
  id: string;
  chapterId: string;
  title: string | null;
  content: unknown; // ProseMirror/TipTap JSON
  contentPlaintext: string | null;
  charCount: number;
  wordCount: number;
  status: SceneStatus;
  sortOrder: number;
  tensionScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== World Bible =====

export type EntityScope = 'series' | 'local';
export type EntityStatus = 'draft' | 'approved';

export interface NameVariant {
  name: string;
  context: string;
}

export interface Character {
  id: string;
  seriesId: string;
  scope: EntityScope;
  bookId: string | null;
  name: string;
  role: string | null;
  description: string | null;
  nameVariants: NameVariant[];
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  seriesId: string;
  scope: EntityScope;
  bookId: string | null;
  name: string;
  category: string | null;
  description: string | null;
  firstMentionSceneId: string | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  seriesId: string;
  scope: EntityScope;
  bookId: string | null;
  name: string;
  category: string | null;
  description: string | null;
  firstMentionSceneId: string | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rule {
  id: string;
  seriesId: string;
  scope: EntityScope;
  bookId: string | null;
  name: string;
  category: string | null;
  formulation: string;
  exceptions: string | null;
  firstMentionSceneId: string | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Term {
  id: string;
  seriesId: string;
  scope: EntityScope;
  bookId: string | null;
  term: string;
  definition: string;
  synonyms: string[];
  category: string | null;
  firstMentionSceneId: string | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Connections (Mindmap) =====

export type EntityType = 'character' | 'location' | 'organization';

export interface Connection {
  id: string;
  seriesId: string;
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  targetId: string;
  label: string | null;
  createdAt: Date;
}

// ===== Character Arc =====

export type BeatType = 'setup' | 'trial' | 'turning_point' | 'resolution';

export interface CharacterArc {
  id: string;
  characterId: string;
  bookId: string;
  sceneId: string | null;
  beatType: BeatType;
  goal: string | null;
  internalConflict: string | null;
  learned: string | null;
  relationToCharacterId: string | null;
  sortOrder: number;
  createdAt: Date;
}

// ===== Planning: Matrix =====

export interface PlotLine {
  id: string;
  bookId: string;
  title: string;
  sortOrder: number;
  createdAt: Date;
}

export type CellStatus = 'pending' | 'written' | 'linked' | 'not_participating';

export interface MatrixCell {
  id: string;
  bookId: string;
  plotLineId: string;
  bitNumber: number;
  bitDescription: string | null;
  sceneId: string | null;
  status: CellStatus;
  sortOrder: number;
  createdAt: Date;
}

// ===== Planning: Timeline =====

export interface TimelineEvent {
  id: string;
  bookId: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  relativeTime: string | null;
  sceneId: string | null;
  sortOrder: number;
  createdAt: Date;
}

// ===== Planning: Mindmap Nodes =====

export interface MindmapNode {
  id: string;
  bookId: string;
  entityType: EntityType;
  entityId: string;
  x: number;
  y: number;
  createdAt: Date;
}

// ===== Ideas =====

export interface Idea {
  id: string;
  bookId: string;
  title: string | null;
  content: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== Author Style =====

export interface PunctuationRule {
  name: string;
  description: string;
  example: string;
}

export interface AuthorStyle {
  id: string;
  seriesId: string;
  pov: string | null;
  tonality: string | null;
  punctuationRules: PunctuationRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StopListEntry {
  id: string;
  styleId: string;
  phrase: string;
  suggestion: string | null;
  example: string | null;
  createdAt: Date;
}

// ===== Production =====

export type AssetType = 'cover' | 'trailer_prompt' | 'tts' | 'merch';

export interface ProductionAsset {
  id: string;
  bookId: string;
  assetType: AssetType;
  title: string | null;
  fileUrl: string | null;
  filePath: string | null;
  version: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Publication =====

export type PublicationStatus = 'draft' | 'submitted' | 'published' | 'unpublished';

export interface Publication {
  id: string;
  bookId: string;
  platform: string;
  status: PublicationStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  notes: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Versions =====

export type VersionSource = 'autosave' | 'status_change' | 'app_close' | 'manual';

export interface Version {
  id: string;
  entityType: string;
  entityId: string;
  snapshot: unknown;
  source: VersionSource;
  createdAt: Date;
}

// ===== Trash =====

export interface TrashEntry {
  id: string;
  entityType: string;
  entityId: string;
  entityData: unknown;
  deletedBy: string | null;
  createdAt: Date;
  expiresAt: Date | null;
}

// ===== Sync =====

export type SyncAction = 'create' | 'update' | 'delete';

export interface SyncQueueEntry {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: SyncAction;
  payload: unknown;
  clientTimestamp: Date;
  synced: boolean;
  syncedAt: Date | null;
  createdAt: Date;
}

// ===== API Response Types =====

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
