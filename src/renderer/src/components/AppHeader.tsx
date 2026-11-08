import React, { useRef, useEffect } from 'react'
import {
  Search,
  Plus,
  LayoutGrid,
  SquareCode,
  Sun,
  Moon,
  FolderArchive,
  HelpCircle,
  X,
  Minus,
  Square,
  Sparkles
} from 'lucide-react'
import { useTrace } from '../context/TraceContext'

export const AppHeader: React.FC = () => {
  const {
    filter,
    setFilter,
    settings,
    toggleTheme,
    setViewMode,
    setIsCaptureOpen,
    setIsStorageOpen,
    setIsShortcutsOpen
  } = useTrace()

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Listen for Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setIsCaptureOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsCaptureOpen])

  const handleMinimize = () => window.traceApi?.window?.minimize?.()
  const handleMaximize = () => window.traceApi?.window?.maximize?.()
  const handleClose = () => window.traceApi?.window?.close?.()

  return (
    <header className="app-drag-region h-11 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between px-3 select-none z-30 transition-colors">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-sm tracking-tight text-[var(--text-primary)]">
          <div className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-mono text-xs tracking-wider uppercase font-bold text-indigo-400">trace</span>
        </div>
      </div>

      {/* Global Quick Search (Centered) */}
      <div className="app-no-drag flex-1 max-w-md mx-4">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search findings, patterns, tags... (Ctrl+K)"
            className="w-full h-7 pl-8 pr-7 text-xs rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {filter.searchQuery ? (
            <button
              onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="absolute right-2 px-1 text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded pointer-events-none">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Actions and Controls */}
      <div className="app-no-drag flex items-center gap-1.5">
        {/* Quick Capture Button */}
        <button
          onClick={() => setIsCaptureOpen(true)}
          className="h-7 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="Quick Capture (Ctrl+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Capture</span>
          <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono bg-indigo-700/60 rounded text-indigo-100">
            Ctrl+N
          </kbd>
        </button>


        {/* View Mode Toggle: Feed vs Grid */}
        <div className="flex items-center bg-[var(--bg-surface)] p-0.5 rounded-md border border-[var(--border-subtle)]">
          <button
            onClick={() => setViewMode('feed')}
            className={`p-1 rounded text-xs transition-colors ${
              settings.viewMode === 'feed'
                ? 'bg-indigo-500/15 text-indigo-400 font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Focus Feed Mode (J/K to navigate)"
          >
            <SquareCode className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded text-xs transition-colors ${
              settings.viewMode === 'grid'
                ? 'bg-indigo-500/15 text-indigo-400 font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Card Stream Mode"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Storage & Data button */}
        <button
          onClick={() => setIsStorageOpen(true)}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          title="Local Storage & Data (Import, Export, Backup)"
        >
          <FolderArchive className="w-3.5 h-3.5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {settings.theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Shortcuts help button */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Window Controls (for fallback or extra window control) */}
        <div className="flex items-center ml-18 border-l border-[var(--border-subtle)] pl-2">
          <button
            onClick={handleMinimize}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] rounded transition-colors"
            title="Maximize"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  )
}
