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

// ===== Project (was Series) =====

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  font?: string;
  fontSize?: number;
  columnWidth?: number;
  theme?: 'light' | 'dark';
  dailyGoal?: number;
  weeklyGoal?: number;
}

// ===== Collaborator =====

export type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'reader';

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  user?: User;
  createdAt: Date;
}

// ===== Book =====

export type BookStatus = 'draft' | 'in_progress' | 'completed';

export interface Book {
  id: string;
  projectId: string;
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
  content: unknown; // Yjs JSON
  status: SceneStatus;
  sortOrder: number;
  povCharacterId: string | null;
  locationId: string | null;
  wordCount: number;
  charCount: number;
  colorTag: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Beat =====

export interface Beat {
  id: string;
  sceneId: string;
  title: string | null;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
}

// ===== CodexEntry (unified entity) =====

export type CodexEntryType =
  | 'character'
  | 'location'
  | 'object'
  | 'faction'
  | 'language'
  | 'rule'
  | 'term'
  | 'custom';

export type CodexEntryScope = 'series' | 'local';
export type CodexEntryStatus = 'draft' | 'approved';

export interface CodexEntry {
  id: string;
  projectId: string;
  type: CodexEntryType;
  name: string;
  attributes: Record<string, unknown>;
  scope: CodexEntryScope;
  status: CodexEntryStatus;
  firstMentionSceneId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Predefined attribute schemas for common types
export interface CharacterAttributes {
  role?: string;
  description?: string;
  appearance?: string;
  personality?: string;
  goal?: string;
  conflict?: string;
  nameVariants?: { name: string; context: string }[];
}

export interface LocationAttributes {
  description?: string;
  category?: string;
  parentId?: string; // for nesting: country → city → building
}

export interface ObjectAttributes {
  description?: string;
  category?: string;
}

export interface FactionAttributes {
  description?: string;
  category?: string;
}

export interface RuleAttributes {
  formulation?: string;
  exceptions?: string;
  category?: string;
}

export interface TermAttributes {
  definition?: string;
  synonyms?: string[];
  category?: string;
}

// ===== Relationship =====

export interface Relationship {
  id: string;
  projectId: string;
  sourceEntryId: string;
  targetEntryId: string;
  label: string | null;
  description: string | null;
  createdAt: Date;
}

// ===== SceneEntityLink =====

export type SceneLinkType = 'mention' | 'pov' | 'location' | 'appears';

export interface SceneEntityLink {
  id: string;
  sceneId: string;
  entryId: string;
  linkType: SceneLinkType;
  createdAt: Date;
}

// ===== PlotArc (Plot Board column) =====

export interface PlotArc {
  id: string;
  bookId: string;
  title: string;
  color: string | null;
  sortOrder: number;
  createdAt: Date;
}

// ===== PlotCard (Plot Board card) =====

export interface PlotCard {
  id: string;
  arcId: string;
  sceneId: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
  color: string | null;
  createdAt: Date;
  scene?: Scene | null;
}

// ===== OutlineEntry =====

export interface OutlineEntry {
  id: string;
  bookId: string;
  chapterNumber: number | null;
  sceneNumber: number | null;
  summary: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== TimelineEvent =====

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

// ===== Goal =====

export type GoalType = 'daily' | 'weekly' | 'deadline';

export interface Goal {
  id: string;
  projectId: string;
  type: GoalType;
  targetWords: number;
  deadline: Date | null;
  currentWords: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Comment =====

export interface Comment {
  id: string;
  sceneId: string | null;
  entryId: string | null;
  authorId: string;
  content: string;
  position: unknown; // JSON position in document
  resolved: boolean;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
}

// ===== AIExpertRole =====

export interface AIExpertRole {
  id: string;
  projectId: string;
  name: string;
  prompt: string;
  isBuiltin: boolean;
  quickActions: QuickAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

// ===== Version =====

export type VersionSource = 'autosave' | 'status_change' | 'app_close' | 'manual';

export interface Version {
  id: string;
  entityType: string;
  entityId: string;
  snapshot: unknown;
  source: VersionSource;
  authorId: string | null;
  createdAt: Date;
}

// ===== API Types =====

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
