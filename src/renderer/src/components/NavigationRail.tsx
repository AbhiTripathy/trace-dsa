import React, { useMemo } from 'react'
import {
  Compass,
  Clock,
  Star,
  FileEdit,
  Hash,
  Layers
} from 'lucide-react'
import { useTrace } from '../context/TraceContext'
import { ViewFilter } from '../types/discovery'

export const NavigationRail: React.FC = () => {
  const { discoveries, filter, setFilter, setIsStorageOpen } = useTrace()

  // Calculate counts
  const counts = useMemo(() => {
    let all = 0
    let revisit = 0
    let favorites = 0
    let drafts = 0
    const patternsMap = new Map<string, number>()
    const tagsMap = new Map<string, number>()

    discoveries.forEach((d) => {
      if (d.isDraft) {
        drafts++
      } else {
        all++
        if (d.needsRevisit) revisit++
        if (d.isFavorite) favorites++
      }

      if (d.pattern) {
        patternsMap.set(d.pattern, (patternsMap.get(d.pattern) || 0) + 1)
      }

      d.tags.forEach((tag) => {
        tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1)
      })
    })

    const patterns = Array.from(patternsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const tags = Array.from(tagsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return { all, revisit, favorites, drafts, patterns, tags }
  }, [discoveries])

  const setView = (view: ViewFilter, pattern?: string, tag?: string) => {
    setFilter((prev) => ({
      ...prev,
      view,
      pattern: pattern ?? (view === 'pattern' ? prev.pattern : undefined),
      tag: tag ?? (view === 'tag' ? prev.tag : undefined)
    }))
  }

  return (
    <aside className="w-56 h-[calc(100vh-2.75rem)] border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between select-none">
      {/* Scrollable Nav Items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Core Views */}
        <div className="space-y-0.5">
          <button
            onClick={() => setView('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter.view === 'all' && !filter.pattern && !filter.tag
                ? 'bg-indigo-500/15 text-indigo-400 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>All Discoveries</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{counts.all}</span>
          </button>

          <button
            onClick={() => setView('revisit')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter.view === 'revisit'
                ? 'bg-amber-500/15 text-amber-400 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Revisit Queue</span>
            </div>
            {counts.revisit > 0 ? (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                {counts.revisit}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">0</span>
            )}
          </button>

          <button
            onClick={() => setView('favorites')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter.view === 'favorites'
                ? 'bg-yellow-500/15 text-yellow-400 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5" />
              <span>Favorites</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{counts.favorites}</span>
          </button>

          <button
            onClick={() => setView('drafts')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter.view === 'drafts'
                ? 'bg-sky-500/15 text-sky-400 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileEdit className="w-3.5 h-3.5" />
              <span>Rough Drafts</span>
            </div>
            {counts.drafts > 0 ? (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300">
                {counts.drafts}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">0</span>
            )}
          </button>
        </div>

        {/* Algorithmic Patterns Section */}
        {counts.patterns.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <Layers className="w-3 h-3" />
                <span>Patterns</span>
              </div>
              {filter.view === 'pattern' && (
                <button
                  onClick={() => setView('all')}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {counts.patterns.slice(0, 7).map((p) => {
                const isActive = filter.view === 'pattern' && filter.pattern === p.name
                return (
                  <button
                    key={p.name}
                    onClick={() => setView('pattern', p.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-xs transition-colors ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-400 font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                    }`}
                  >
                    <span className="truncate pr-1 text-left">{p.name}</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{p.count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {counts.tags.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <Hash className="w-3 h-3" />
                <span>Tags</span>
              </div>
              {filter.view === 'tag' && (
                <button
                  onClick={() => setView('all')}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 px-2">
              {counts.tags.slice(0, 10).map((t) => {
                const isActive = filter.view === 'tag' && filter.tag === t.name
                return (
                  <button
                    key={t.name}
                    onClick={() => setView('tag', undefined, t.name)}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                      isActive
                        ? 'bg-indigo-500 text-white font-medium'
                        : 'bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/40'
                    }`}
                  >
                    #{t.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Persistence & Data Status Footer */}
      <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
        <div className="flex items-center justify-between px-1 py-1 text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px]">Local JSON active</span>
          </div>
          <button
            onClick={() => setIsStorageOpen(true)}
            className="text-[10px] text-indigo-400 hover:underline"
          >
            Manage
          </button>
        </div>
      </div>
    </aside>
  )
}
