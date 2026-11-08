import React, { useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  FilterX,
  Plus
} from 'lucide-react'
import { useTrace } from '../context/TraceContext'
import { DiscoveryCard } from './DiscoveryCard'

export const DiscoveryFeed: React.FC = () => {
  const {
    filteredDiscoveries,
    activeDiscovery,
    activeDiscoveryId,
    setActiveDiscoveryId,
    nextDiscovery,
    prevDiscovery,
    settings,
    openDetail,
    toggleFavorite,
    toggleRevisit,
    markRevisitedToday,
    showToast,
    filter,
    setFilter,
    setIsCaptureOpen,
    isCaptureOpen,
    isDetailOpen,
    isStorageOpen,
    isShortcutsOpen
  } = useTrace()

  const currentIndex = activeDiscovery
    ? filteredDiscoveries.findIndex((d) => d.id === activeDiscovery.id)
    : 0

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or any modal is open
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        isCaptureOpen ||
        isDetailOpen ||
        isStorageOpen ||
        isShortcutsOpen
      ) {
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          nextDiscovery()
          break
        case 'k':
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          prevDiscovery()
          break
        case 'e':
          if (activeDiscovery) {
            e.preventDefault()
            openDetail(activeDiscovery.id)
          }
          break
        case 'f':
          if (activeDiscovery) {
            e.preventDefault()
            toggleFavorite(activeDiscovery.id)
          }
          break
        case 'r':
          if (activeDiscovery) {
            e.preventDefault()
            toggleRevisit(activeDiscovery.id)
          }
          break
        case ' ':
          if (activeDiscovery) {
            e.preventDefault()
            markRevisitedToday(activeDiscovery.id)
          }
          break
        case 'c':
          if (activeDiscovery) {
            e.preventDefault()
            const text = activeDiscovery.rawCapture
            navigator.clipboard.writeText(text)
            showToast('Thought process copied to clipboard')
          }
          break
        case 'Enter':
          if (activeDiscovery) {
            e.preventDefault()
            openDetail(activeDiscovery.id)
          }
          break
      }
    },
    [
      activeDiscovery,
      nextDiscovery,
      prevDiscovery,
      openDetail,
      toggleFavorite,
      toggleRevisit,
      markRevisitedToday,
      showToast,
      isCaptureOpen,
      isDetailOpen,
      isStorageOpen,
      isShortcutsOpen
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (filteredDiscoveries.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          {filter.searchQuery ? 'No matching discoveries' : 'No discoveries in this view'}
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5">
          {filter.searchQuery
            ? `No records found matching "${filter.searchQuery}". Try searching for another algorithmic concept or clear filters.`
            : 'Capture your first DSA breakthrough or adjust your filters.'}
        </p>

        <div className="flex items-center gap-2">
          {filter.searchQuery || filter.pattern || filter.tag || filter.view !== 'all' ? (
            <button
              onClick={() =>
                setFilter({
                  view: 'all',
                  searchQuery: '',
                  sortBy: 'newest'
                })
              }
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          ) : null}

          <button
            onClick={() => setIsCaptureOpen(true)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Capture</span>
          </button>
        </div>
      </div>
    )
  }

  // Focus Feed View (Default Hero Mode)
  if (settings.viewMode === 'feed') {
    return (
      <main className="flex-1 flex flex-col justify-between p-6 md:p-8 overflow-y-auto">
        {/* Top subtle shortcut navigation bar */}
        <div className="flex items-center justify-between max-w-3xl w-full mx-auto mb-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px]">
              {String((currentIndex >= 0 ? currentIndex : 0) + 1).padStart(2, '0')} /{' '}
              {String(filteredDiscoveries.length).padStart(2, '0')}
            </span>
            <span className="text-[var(--border-subtle)]">•</span>
            <span className="hidden sm:inline-block">Use [J / K] to navigate discoveries</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevDiscovery}
              disabled={currentIndex <= 0}
              className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] disabled:opacity-30 disabled:pointer-events-none border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
              title="Previous discovery (K or Up)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextDiscovery}
              disabled={currentIndex >= filteredDiscoveries.length - 1}
              className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] disabled:opacity-30 disabled:pointer-events-none border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
              title="Next discovery (J or Down)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Hero Discovery Card */}
        <div className="my-auto py-4 flex items-center justify-center">
          {activeDiscovery && (
            <DiscoveryCard
              key={activeDiscovery.id}
              discovery={activeDiscovery}
              isHero={true}
              index={currentIndex}
              total={filteredDiscoveries.length}
              onOpenDetail={() => openDetail(activeDiscovery.id)}
            />
          )}
        </div>

        {/* Bottom Shortcut hints */}
        <div className="max-w-3xl w-full mx-auto mt-6 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2 text-[11px] text-[var(--text-muted)] select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[10px]">
                J / K
              </kbd>
              <span>Next/Prev</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[10px]">
                E
              </kbd>
              <span>Edit/Refine</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[10px]">
                R
              </kbd>
              <span>Revisit</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[10px]">
                F
              </kbd>
              <span>Favorite</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[10px]">
                Space
              </kbd>
              <span>Mark Revisited</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span>TRACE Discovery Feed</span>
          </div>
        </div>
      </main>
    )
  }

  // Grid Stream Mode (Multi-card overview)
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {filteredDiscoveries.map((discovery, idx) => {
          const isSelected = activeDiscoveryId === discovery.id
          return (
            <div
              key={discovery.id}
              onClick={() => setActiveDiscoveryId(discovery.id)}
              className={isSelected ? 'ring-2 ring-indigo-500 rounded-xl' : ''}
            >
              <DiscoveryCard
                discovery={discovery}
                isHero={false}
                index={idx}
                total={filteredDiscoveries.length}
                onOpenDetail={() => openDetail(discovery.id)}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
}
