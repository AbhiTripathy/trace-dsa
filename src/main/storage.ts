import { app, dialog, shell } from 'electron'
import { join } from 'path'
import * as fs from 'fs'

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

export class TraceStorage {
  private userDataDir: string
  private primaryFilePath: string
  private backupFilePath: string
  private settingsFilePath: string

  constructor() {
    this.userDataDir = app.getPath('userData')
    this.primaryFilePath = join(this.userDataDir, 'trace_discoveries.json')
    this.backupFilePath = join(this.userDataDir, 'trace_discoveries.backup.json')
    this.settingsFilePath = join(this.userDataDir, 'trace_settings.json')
  }

  public getDataDirectory(): string {
    return this.userDataDir
  }

  public getStorageInfo(): {
    userDataDir: string
    primaryPath: string
    backupPath: string
    primaryExists: boolean
    backupExists: boolean
    fileSizeBytes: number
    lastModified?: string
  } {
    const primaryExists = fs.existsSync(this.primaryFilePath)
    const backupExists = fs.existsSync(this.backupFilePath)
    let fileSizeBytes = 0
    let lastModified: string | undefined

    if (primaryExists) {
      try {
        const stats = fs.statSync(this.primaryFilePath)
        fileSizeBytes = stats.size
        lastModified = stats.mtime.toISOString()
      } catch {
        // ignore
      }
    }

    return {
      userDataDir: this.userDataDir,
      primaryPath: this.primaryFilePath,
      backupPath: this.backupFilePath,
      primaryExists,
      backupExists,
      fileSizeBytes,
      lastModified
    }
  }

  public loadDiscoveries(): Discovery[] | null {
    if (fs.existsSync(this.primaryFilePath)) {
      try {
        const raw = fs.readFileSync(this.primaryFilePath, 'utf-8')
        const data = JSON.parse(raw)
        if (Array.isArray(data)) {
          return data
        }
      } catch (err) {
        console.error('Failed to parse primary discoveries file, attempting backup recovery:', err)
        // Attempt recovery from backup
        const fromBackup = this.loadBackupDiscoveries()
        if (fromBackup) {
          console.warn('Successfully recovered discoveries from backup file.')
          return fromBackup
        }
      }
    } else {
      // Check if backup exists even if primary is missing
      const fromBackup = this.loadBackupDiscoveries()
      if (fromBackup) return fromBackup
    }

    return null
  }

  public loadBackupDiscoveries(): Discovery[] | null {
    if (fs.existsSync(this.backupFilePath)) {
      try {
        const raw = fs.readFileSync(this.backupFilePath, 'utf-8')
        const data = JSON.parse(raw)
        if (Array.isArray(data)) {
          return data
        }
      } catch (err) {
        console.error('Failed to parse backup discoveries file:', err)
      }
    }
    return null
  }

  public saveDiscoveries(discoveries: Discovery[]): { success: boolean; count: number; error?: string } {
    try {
      if (!Array.isArray(discoveries)) {
        throw new Error('Data to save must be an array of discoveries')
      }

      const jsonStr = JSON.stringify(discoveries, null, 2)

      // Ensure directory exists
      if (!fs.existsSync(this.userDataDir)) {
        fs.mkdirSync(this.userDataDir, { recursive: true })
      }

      // If primary file exists and is valid, create backup before overwriting
      if (fs.existsSync(this.primaryFilePath)) {
        try {
          fs.copyFileSync(this.primaryFilePath, this.backupFilePath)
        } catch (backupErr) {
          console.warn('Warning: Could not create backup copy before write:', backupErr)
        }
      }

      // Atomic write: write to temp file then rename
      const tempPath = `${this.primaryFilePath}.tmp.${Date.now()}`
      fs.writeFileSync(tempPath, jsonStr, 'utf-8')
      fs.renameSync(tempPath, this.primaryFilePath)

      return { success: true, count: discoveries.length }
    } catch (err) {
      console.error('Error saving discoveries:', err)
      return { success: false, count: 0, error: String(err) }
    }
  }

  public restoreFromBackup(): { success: boolean; data?: Discovery[]; error?: string } {
    try {
      const data = this.loadBackupDiscoveries()
      if (!data) {
        return { success: false, error: 'No valid backup file found to restore from.' }
      }
      this.saveDiscoveries(data)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  public async exportJSON(discoveries: Discovery[]): Promise<{ canceled: boolean; filePath?: string; error?: string }> {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Discoveries as JSON',
        defaultPath: join(app.getPath('documents'), `trace-discoveries-${new Date().toISOString().split('T')[0]}.json`),
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })

      if (canceled || !filePath) {
        return { canceled: true }
      }

      fs.writeFileSync(filePath, JSON.stringify(discoveries, null, 2), 'utf-8')
      return { canceled: false, filePath }
    } catch (err) {
      return { canceled: false, error: String(err) }
    }
  }

  public async importJSON(): Promise<{
    canceled: boolean
    data?: Discovery[]
    count?: number
    filePath?: string
    error?: string
  }> {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Import Discoveries JSON',
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })

      if (canceled || filePaths.length === 0) {
        return { canceled: true }
      }

      const filePath = filePaths[0]
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)

      if (!Array.isArray(parsed)) {
        return { canceled: false, error: 'Imported JSON must be an array of discovery objects.' }
      }

      // Validate and sanitize each item
      const validated: Discovery[] = parsed.map((item, index) => {
        const now = new Date().toISOString()
        return {
          id: typeof item.id === 'string' && item.id.trim() ? item.id : `trace-imp-${Date.now()}-${index}`,
          title: typeof item.title === 'string' ? item.title : 'Untitled Discovery',
          url: typeof item.url === 'string' ? item.url : undefined,
          rawCapture: typeof item.rawCapture === 'string' ? item.rawCapture : (typeof item.finding === 'string' ? item.finding : ''),
          pattern: typeof item.pattern === 'string' ? item.pattern : undefined,
          difficulty: ['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? item.difficulty : undefined,
          tags: Array.isArray(item.tags) ? item.tags.filter((t: unknown) => typeof t === 'string') : [],
          isFavorite: Boolean(item.isFavorite),
          needsRevisit: Boolean(item.needsRevisit),
          revisitCount: typeof item.revisitCount === 'number' ? item.revisitCount : 0,
          lastRevisitedAt: typeof item.lastRevisitedAt === 'string' ? item.lastRevisitedAt : undefined,
          isDraft: Boolean(item.isDraft),
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : now,
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : now
        }
      })

      return { canceled: false, data: validated, count: validated.length, filePath }
    } catch (err) {
      return { canceled: false, error: String(err) }
    }
  }

  public async exportCSV(discoveries: Discovery[]): Promise<{ canceled: boolean; filePath?: string; error?: string }> {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Discoveries as CSV',
        defaultPath: join(app.getPath('documents'), `trace-discoveries-${new Date().toISOString().split('T')[0]}.csv`),
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
      })

      if (canceled || !filePath) {
        return { canceled: true }
      }

      const headers = [
        'ID',
        'Title',
        'URL',
        'Pattern',
        'Difficulty',
        'RawCapture',
        'Tags',
        'IsFavorite',
        'NeedsRevisit',
        'RevisitCount',
        'LastRevisitedAt',
        'IsDraft',
        'CreatedAt',
        'UpdatedAt'
      ]

      const escapeCSV = (val: unknown): string => {
        if (val === null || val === undefined) return '""'
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      }

      const rows = discoveries.map((d) => [
        escapeCSV(d.id),
        escapeCSV(d.title),
        escapeCSV(d.url || ''),
        escapeCSV(d.pattern || ''),
        escapeCSV(d.difficulty || ''),
        escapeCSV(d.rawCapture || ''),
        escapeCSV(d.tags.join(';')),
        escapeCSV(d.isFavorite ? 'true' : 'false'),
        escapeCSV(d.needsRevisit ? 'true' : 'false'),
        escapeCSV(d.revisitCount),
        escapeCSV(d.lastRevisitedAt || ''),
        escapeCSV(d.isDraft ? 'true' : 'false'),
        escapeCSV(d.createdAt),
        escapeCSV(d.updatedAt)
      ])

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

      fs.writeFileSync(filePath, csvContent, 'utf-8')
      return { canceled: false, filePath }
    } catch (err) {
      return { canceled: false, error: String(err) }
    }
  }

  public async importCSV(): Promise<{
    canceled: boolean
    data?: Discovery[]
    count?: number
    filePath?: string
    error?: string
  }> {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Import Discoveries from CSV',
        properties: ['openFile'],
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
      })

      if (canceled || filePaths.length === 0) {
        return { canceled: true }
      }

      const filePath = filePaths[0]
      const raw = fs.readFileSync(filePath, 'utf-8')

      // Robust CSV parser handling multi-line quoted fields
      const records = this.parseCSV(raw)
      if (records.length < 2) {
        return { canceled: false, error: 'CSV file is empty or missing data rows.' }
      }

      const headers = records[0].map((h) => h.trim().toLowerCase())
      const titleIdx = headers.indexOf('title')
      const rawCapIdx = headers.indexOf('rawcapture')
      const patternIdx = headers.indexOf('pattern')
      const diffIdx = headers.indexOf('difficulty')
      const urlIdx = headers.indexOf('url')
      const tagsIdx = headers.indexOf('tags')
      const favIdx = headers.indexOf('isfavorite')
      const revIdx = headers.indexOf('needsrevisit')
      const idIdx = headers.indexOf('id')

      const now = new Date().toISOString()
      const data: Discovery[] = []

      for (let i = 1; i < records.length; i++) {
        const row = records[i]
        if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue

        const id = idIdx >= 0 && row[idIdx] ? row[idIdx].trim() : `trace-csv-${Date.now()}-${i}`
        const title = titleIdx >= 0 && row[titleIdx] ? row[titleIdx].trim() : 'Imported Discovery'
        const rawCapture = rawCapIdx >= 0 ? row[rawCapIdx] : (row[0] || '')
        const pattern = patternIdx >= 0 && row[patternIdx] ? row[patternIdx] : undefined
        const difficulty = diffIdx >= 0 && ['Easy', 'Medium', 'Hard'].includes(row[diffIdx]) ? (row[diffIdx] as any) : undefined
        const url = urlIdx >= 0 && row[urlIdx] ? row[urlIdx].trim() : undefined
        const tags = tagsIdx >= 0 && row[tagsIdx] ? row[tagsIdx].split(';').map((t) => t.trim()).filter(Boolean) : []
        const isFavorite = favIdx >= 0 ? row[favIdx].toLowerCase() === 'true' : false
        const needsRevisit = revIdx >= 0 ? row[revIdx].toLowerCase() === 'true' : false

        data.push({
          id,
          title,
          url,
          rawCapture,
          pattern,
          difficulty,
          tags,
          isFavorite,
          needsRevisit,
          revisitCount: 0,
          isDraft: false,
          createdAt: now,
          updatedAt: now
        })
      }

      return { canceled: false, data, count: data.length, filePath }
    } catch (err) {
      return { canceled: false, error: String(err) }
    }
  }

  private parseCSV(text: string): string[][] {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentField = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"'
          i++ // skip escaped quote
        } else if (char === '"') {
          inQuotes = false
        } else {
          currentField += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          currentRow.push(currentField)
          currentField = ''
        } else if (char === '\r') {
          if (nextChar === '\n') i++
          currentRow.push(currentField)
          rows.push(currentRow)
          currentRow = []
          currentField = ''
        } else if (char === '\n') {
          currentRow.push(currentField)
          rows.push(currentRow)
          currentRow = []
          currentField = ''
        } else {
          currentField += char
        }
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField)
      rows.push(currentRow)
    }

    return rows
  }

  public openDataFolder(): void {
    shell.openPath(this.userDataDir)
  }

  public getSettings(): AppSettings {
    try {
      if (fs.existsSync(this.settingsFilePath)) {
        const raw = fs.readFileSync(this.settingsFilePath, 'utf-8')
        return JSON.parse(raw)
      }
    } catch {
      // ignore
    }
    return { theme: 'dark', viewMode: 'feed' }
  }

  public saveSettings(settings: AppSettings): void {
    try {
      fs.writeFileSync(this.settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }
}
