export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Discovery {
  id: string
  title: string
  url?: string
  rawCapture: string
  pattern?: string
  difficulty?: Difficulty
  tags: string[]
  isFavorite: boolean
  needsRevisit: boolean
  revisitCount: number
  lastRevisitedAt?: string
  isDraft: boolean
  createdAt: string
  updatedAt: string
}

export type ViewFilter = 'all' | 'revisit' | 'favorites' | 'drafts' | 'pattern' | 'tag'

export interface FilterOptions {
  view: ViewFilter
  pattern?: string
  tag?: string
  searchQuery: string
  difficulty?: Difficulty
  sortBy: 'newest' | 'oldest' | 'revisit-priority' | 'title'
}

export interface AppSettings {
  theme: 'dark' | 'light'
  accentColor?: string
  viewMode?: 'feed' | 'grid'
}

export interface StorageInfo {
  userDataDir: string
  primaryPath: string
  backupPath: string
  primaryExists: boolean
  backupExists: boolean
  fileSizeBytes: number
  lastModified?: string
}
