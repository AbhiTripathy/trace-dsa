import { ElectronAPI } from '@electron-toolkit/preload'

export interface Discovery {
  id: string
  title: string
  url?: string
  rawCapture: string
  pattern?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  isFavorite: boolean
  needsRevisit: boolean
  revisitCount: number
  lastRevisitedAt?: string
  isDraft: boolean
  createdAt: string
  updatedAt: string
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

export interface TraceAPI {
  getDiscoveries: () => Promise<Discovery[] | null>
  saveDiscoveries: (discoveries: Discovery[]) => Promise<{ success: boolean; count: number; error?: string }>
  restoreBackup: () => Promise<{ success: boolean; data?: Discovery[]; error?: string }>
  getStorageInfo: () => Promise<StorageInfo>
  openDataFolder: () => Promise<boolean>
  exportJSON: (discoveries: Discovery[]) => Promise<{ canceled: boolean; filePath?: string; error?: string }>
  importJSON: () => Promise<{ canceled: boolean; data?: Discovery[]; count?: number; filePath?: string; error?: string }>
  exportCSV: (discoveries: Discovery[]) => Promise<{ canceled: boolean; filePath?: string; error?: string }>
  importCSV: () => Promise<{ canceled: boolean; data?: Discovery[]; count?: number; filePath?: string; error?: string }>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<boolean>
  openExternal: (url: string) => Promise<boolean>
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    traceApi: TraceAPI
  }
}
