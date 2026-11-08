import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { Discovery, FilterOptions, AppSettings, StorageInfo } from '../types/discovery'
import { DEFAULT_DISCOVERIES } from '../lib/constants'

interface TraceContextType {
  discoveries: Discovery[]
  filteredDiscoveries: Discovery[]
  activeDiscoveryId: string | null
  activeDiscovery: Discovery | null
  filter: FilterOptions
  settings: AppSettings
  storageInfo: StorageInfo | null
  isCaptureOpen: boolean
  isDetailOpen: boolean
  isStorageOpen: boolean
  isShortcutsOpen: boolean
  toastMessage: string | null
  isLoading: boolean
  // Actions
  setActiveDiscoveryId: (id: string | null) => void
  setFilter: React.Dispatch<React.SetStateAction<FilterOptions>>
  setIsCaptureOpen: (open: boolean) => void
  setIsDetailOpen: (open: boolean) => void
  setIsStorageOpen: (open: boolean) => void
  setIsShortcutsOpen: (open: boolean) => void
  createDiscovery: (discovery: Partial<Discovery>) => Promise<Discovery>
  updateDiscovery: (id: string, updates: Partial<Discovery>) => Promise<void>
  deleteDiscovery: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  toggleRevisit: (id: string) => Promise<void>
  markRevisitedToday: (id: string) => Promise<void>
  toggleTheme: () => Promise<void>
  setViewMode: (mode: 'feed' | 'grid') => Promise<void>
  openDetail: (id: string) => void
  closeDetail: () => void
  nextDiscovery: () => void
  prevDiscovery: () => void
  showToast: (message: string) => void
  exportJSON: () => Promise<void>
  importJSON: (mode: 'merge' | 'replace') => Promise<{ count: number } | null>
  exportCSV: () => Promise<void>
  importCSV: (mode: 'merge' | 'replace') => Promise<{ count: number } | null>
  restoreBackup: () => Promise<boolean>
  openDataFolder: () => Promise<void>
  refreshStorageInfo: () => Promise<void>
}

const TraceContext = createContext<TraceContextType | undefined>(undefined)

const DEFAULT_FILTER: FilterOptions = {
  view: 'all',
  searchQuery: '',
  sortBy: 'newest'
}

export const TraceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([])
  const [activeDiscoveryId, setActiveDiscoveryId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterOptions>(DEFAULT_FILTER)
  const [settings, setSettings] = useState<AppSettings>({ theme: 'dark', viewMode: 'feed' })
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [isCaptureOpen, setIsCaptureOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isStorageOpen, setIsStorageOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 2800)
  }, [])

  // Sync theme class to document.documentElement
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
  }, [settings.theme])

  // Initial load from local file via IPC
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true)
        if (window.traceApi) {
          // Load settings
          const savedSettings = await window.traceApi.getSettings()
          if (savedSettings && savedSettings.theme) {
            setSettings(savedSettings)
          }

          // Load discoveries
          const loaded = await window.traceApi.getDiscoveries()
          if (Array.isArray(loaded) && loaded.length > 0) {
            setDiscoveries(loaded)
            setActiveDiscoveryId(loaded[0].id)
          } else {
            // First run: Seed default realistic discoveries and persist
            setDiscoveries(DEFAULT_DISCOVERIES)
            setActiveDiscoveryId(DEFAULT_DISCOVERIES[0].id)
            await window.traceApi.saveDiscoveries(DEFAULT_DISCOVERIES)
          }

          // Load storage info
          const info = await window.traceApi.getStorageInfo()
          setStorageInfo(info)
        } else {
          // Browser preview fallback
          setDiscoveries(DEFAULT_DISCOVERIES)
          setActiveDiscoveryId(DEFAULT_DISCOVERIES[0].id)
        }
      } catch (err) {
        console.error('Failed to initialize discoveries from storage:', err)
        setDiscoveries(DEFAULT_DISCOVERIES)
        setActiveDiscoveryId(DEFAULT_DISCOVERIES[0].id)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Save discoveries to disk helper
  const persistDiscoveries = useCallback(async (newDiscoveries: Discovery[]) => {
    setDiscoveries(newDiscoveries)
    if (window.traceApi) {
      try {
        const res = await window.traceApi.saveDiscoveries(newDiscoveries)
        if (!res.success) {
          console.error('Failed to persist discoveries:', res.error)
        }
        const info = await window.traceApi.getStorageInfo()
        setStorageInfo(info)
      } catch (err) {
        console.error('IPC saveDiscoveries error:', err)
      }
    }
  }, [])

  // Refresh storage info
  const refreshStorageInfo = useCallback(async () => {
    if (window.traceApi) {
      try {
        const info = await window.traceApi.getStorageInfo()
        setStorageInfo(info)
      } catch (err) {
        console.error(err)
      }
    }
  }, [])

  // Filtered discoveries
  const filteredDiscoveries = useMemo(() => {
    let list = [...discoveries]

    // View filter
    switch (filter.view) {
      case 'revisit':
        list = list.filter((d) => d.needsRevisit)
        break
      case 'favorites':
        list = list.filter((d) => d.isFavorite)
        break
      case 'drafts':
        list = list.filter((d) => d.isDraft)
        break
      case 'pattern':
        if (filter.pattern) {
          list = list.filter((d) => d.pattern === filter.pattern)
        }
        break
      case 'tag':
        if (filter.tag) {
          list = list.filter((d) => d.tags.includes(filter.tag!))
        }
        break
      case 'all':
      default:
        // By default, hide unfinished drafts from main feed unless explicitly searching or viewing drafts
        if (!filter.searchQuery.trim()) {
          list = list.filter((d) => !d.isDraft)
        }
        break
    }

    // Difficulty filter
    if (filter.difficulty) {
      list = list.filter((d) => d.difficulty === filter.difficulty)
    }

    // Search query across title, thought process (rawCapture), pattern, and tags
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim()
      list = list.filter((d) => {
        return (
          d.title.toLowerCase().includes(q) ||
          d.rawCapture.toLowerCase().includes(q) ||
          (d.pattern && d.pattern.toLowerCase().includes(q)) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
    }

    // Sorting
    list.sort((a, b) => {
      if (filter.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (filter.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (filter.sortBy === 'revisit-priority') {
        // Needs revisit first, then lowest revisit count
        if (a.needsRevisit !== b.needsRevisit) return a.needsRevisit ? -1 : 1
        return a.revisitCount - b.revisitCount
      }
      if (filter.sortBy === 'title') {
        return (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
      }
      return 0
    })

    return list
  }, [discoveries, filter])

  // Keep active discovery in bounds
  const activeDiscovery = useMemo(() => {
    if (!activeDiscoveryId) {
      return filteredDiscoveries.length > 0 ? filteredDiscoveries[0] : null
    }
    const found = discoveries.find((d) => d.id === activeDiscoveryId)
    return found || (filteredDiscoveries.length > 0 ? filteredDiscoveries[0] : null)
  }, [discoveries, activeDiscoveryId, filteredDiscoveries])

  // Navigation: Next / Prev
  const nextDiscovery = useCallback(() => {
    if (filteredDiscoveries.length === 0) return
    const currentIndex = filteredDiscoveries.findIndex((d) => d.id === (activeDiscovery?.id || ''))
    if (currentIndex >= 0 && currentIndex < filteredDiscoveries.length - 1) {
      setActiveDiscoveryId(filteredDiscoveries[currentIndex + 1].id)
    } else if (currentIndex === -1 && filteredDiscoveries.length > 0) {
      setActiveDiscoveryId(filteredDiscoveries[0].id)
    }
  }, [filteredDiscoveries, activeDiscovery])

  const prevDiscovery = useCallback(() => {
    if (filteredDiscoveries.length === 0) return
    const currentIndex = filteredDiscoveries.findIndex((d) => d.id === (activeDiscovery?.id || ''))
    if (currentIndex > 0) {
      setActiveDiscoveryId(filteredDiscoveries[currentIndex - 1].id)
    }
  }, [filteredDiscoveries, activeDiscovery])

  // Create discovery
  const createDiscovery = useCallback(
    async (partial: Partial<Discovery>): Promise<Discovery> => {
      const now = new Date().toISOString()
      const newDiscovery: Discovery = {
        id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: partial.title?.trim() || '',
        url: partial.url?.trim() || undefined,
        rawCapture: partial.rawCapture || '',
        pattern: partial.pattern || undefined,
        difficulty: partial.difficulty || undefined,
        tags: partial.tags || [],
        isFavorite: Boolean(partial.isFavorite),
        needsRevisit: partial.needsRevisit !== undefined ? partial.needsRevisit : true,
        revisitCount: 0,
        isDraft: Boolean(partial.isDraft),
        createdAt: now,
        updatedAt: now
      }

      const updated = [newDiscovery, ...discoveries]
      await persistDiscoveries(updated)
      setActiveDiscoveryId(newDiscovery.id)
      showToast(newDiscovery.isDraft ? 'Draft saved' : 'Discovery captured')
      return newDiscovery
    },
    [discoveries, persistDiscoveries, showToast]
  )

  // Update discovery
  const updateDiscovery = useCallback(
    async (id: string, updates: Partial<Discovery>): Promise<void> => {
      const now = new Date().toISOString()
      const updated = discoveries.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            ...updates,
            rawCapture: updates.rawCapture !== undefined ? updates.rawCapture : d.rawCapture,
            updatedAt: now
          }
        }
        return d
      })
      await persistDiscoveries(updated)
      showToast('Changes saved')
    },
    [discoveries, persistDiscoveries, showToast]
  )

  // Delete discovery
  const deleteDiscovery = useCallback(
    async (id: string): Promise<void> => {
      const remaining = discoveries.filter((d) => d.id !== id)
      await persistDiscoveries(remaining)
      if (activeDiscoveryId === id) {
        const next = remaining[0] ? remaining[0].id : null
        setActiveDiscoveryId(next)
      }
      showToast('Discovery removed')
    },
    [discoveries, activeDiscoveryId, persistDiscoveries, showToast]
  )

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (id: string): Promise<void> => {
      const target = discoveries.find((d) => d.id === id)
      if (!target) return
      const nextState = !target.isFavorite
      await updateDiscovery(id, { isFavorite: nextState })
      showToast(nextState ? 'Added to favorites' : 'Removed from favorites')
    },
    [discoveries, updateDiscovery, showToast]
  )

  // Toggle revisit queue
  const toggleRevisit = useCallback(
    async (id: string): Promise<void> => {
      const target = discoveries.find((d) => d.id === id)
      if (!target) return
      const nextState = !target.needsRevisit
      await updateDiscovery(id, { needsRevisit: nextState })
      showToast(nextState ? 'Added to revisit queue' : 'Removed from revisit queue')
    },
    [discoveries, updateDiscovery, showToast]
  )

  // Mark revisited today
  const markRevisitedToday = useCallback(
    async (id: string): Promise<void> => {
      const target = discoveries.find((d) => d.id === id)
      if (!target) return
      const now = new Date().toISOString()
      await updateDiscovery(id, {
        revisitCount: (target.revisitCount || 0) + 1,
        lastRevisitedAt: now,
        needsRevisit: false
      })
      showToast('Marked as revisited')
    },
    [discoveries, updateDiscovery, showToast]
  )

  // Toggle theme
  const toggleTheme = useCallback(async () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark'
    const newSettings: AppSettings = { ...settings, theme: nextTheme }
    setSettings(newSettings)
    if (window.traceApi) {
      await window.traceApi.saveSettings(newSettings)
    }
  }, [settings])

  // View mode
  const setViewMode = useCallback(
    async (mode: 'feed' | 'grid') => {
      const newSettings: AppSettings = { ...settings, viewMode: mode }
      setSettings(newSettings)
      if (window.traceApi) {
        await window.traceApi.saveSettings(newSettings)
      }
    },
    [settings]
  )

  const openDetail = useCallback((id: string) => {
    setActiveDiscoveryId(id)
    setIsDetailOpen(true)
  }, [])

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false)
  }, [])

  // JSON Export
  const exportJSON = useCallback(async () => {
    if (window.traceApi) {
      const res = await window.traceApi.exportJSON(discoveries)
      if (!res.canceled) {
        if (res.error) {
          showToast(`Export failed: ${res.error}`)
        } else {
          showToast('JSON export complete')
        }
      }
    }
  }, [discoveries, showToast])

  // JSON Import
  const importJSON = useCallback(
    async (mode: 'merge' | 'replace'): Promise<{ count: number } | null> => {
      if (!window.traceApi) return null
      const res = await window.traceApi.importJSON()
      if (res.canceled) return null
      if (res.error || !res.data) {
        showToast(res.error || 'Import failed')
        return null
      }

      let combined: Discovery[]
      if (mode === 'replace') {
        combined = res.data
      } else {
        // Merge: keep existing, add new if unique ID, or update if duplicate
        const existingMap = new Map(discoveries.map((d) => [d.id, d]))
        res.data.forEach((d) => existingMap.set(d.id, d))
        combined = Array.from(existingMap.values())
      }

      await persistDiscoveries(combined)
      if (combined.length > 0) setActiveDiscoveryId(combined[0].id)
      showToast(`Imported ${res.count} discoveries`)
      return { count: res.count || 0 }
    },
    [discoveries, persistDiscoveries, showToast]
  )

  // CSV Export
  const exportCSV = useCallback(async () => {
    if (window.traceApi) {
      const res = await window.traceApi.exportCSV(discoveries)
      if (!res.canceled) {
        if (res.error) {
          showToast(`CSV export failed: ${res.error}`)
        } else {
          showToast('CSV export complete')
        }
      }
    }
  }, [discoveries, showToast])

  // CSV Import
  const importCSV = useCallback(
    async (mode: 'merge' | 'replace'): Promise<{ count: number } | null> => {
      if (!window.traceApi) return null
      const res = await window.traceApi.importCSV()
      if (res.canceled) return null
      if (res.error || !res.data) {
        showToast(res.error || 'CSV import failed')
        return null
      }

      let combined: Discovery[]
      if (mode === 'replace') {
        combined = res.data
      } else {
        const existingMap = new Map(discoveries.map((d) => [d.id, d]))
        res.data.forEach((d) => existingMap.set(d.id, d))
        combined = Array.from(existingMap.values())
      }

      await persistDiscoveries(combined)
      if (combined.length > 0) setActiveDiscoveryId(combined[0].id)
      showToast(`Imported ${res.count} discoveries from CSV`)
      return { count: res.count || 0 }
    },
    [discoveries, persistDiscoveries, showToast]
  )

  // Restore Backup
  const restoreBackup = useCallback(async (): Promise<boolean> => {
    if (!window.traceApi) return false
    const res = await window.traceApi.restoreBackup()
    if (res.success && res.data) {
      setDiscoveries(res.data)
      if (res.data.length > 0) setActiveDiscoveryId(res.data[0].id)
      showToast('Recovered data from backup')
      await refreshStorageInfo()
      return true
    } else {
      showToast(res.error || 'Could not restore backup')
      return false
    }
  }, [showToast, refreshStorageInfo])

  // Open data folder
  const openDataFolder = useCallback(async () => {
    if (window.traceApi) {
      await window.traceApi.openDataFolder()
    }
  }, [])

  return (
    <TraceContext.Provider
      value={{
        discoveries,
        filteredDiscoveries,
        activeDiscoveryId,
        activeDiscovery,
        filter,
        settings,
        storageInfo,
        isCaptureOpen,
        isDetailOpen,
        isStorageOpen,
        isShortcutsOpen,
        toastMessage,
        isLoading,
        setActiveDiscoveryId,
        setFilter,
        setIsCaptureOpen,
        setIsDetailOpen,
        setIsStorageOpen,
        setIsShortcutsOpen,
        createDiscovery,
        updateDiscovery,
        deleteDiscovery,
        toggleFavorite,
        toggleRevisit,
        markRevisitedToday,
        toggleTheme,
        setViewMode,
        openDetail,
        closeDetail,
        nextDiscovery,
        prevDiscovery,
        showToast,
        exportJSON,
        importJSON,
        exportCSV,
        importCSV,
        restoreBackup,
        openDataFolder,
        refreshStorageInfo
      }}
    >
      {children}
    </TraceContext.Provider>
  )
}

export function useTrace(): TraceContextType {
  const context = useContext(TraceContext)
  if (!context) {
    throw new Error('useTrace must be used within a TraceProvider')
  }
  return context
}
