import React, { useState, useEffect } from 'react'
import {
  X,
  Star,
  Clock,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Trash2,
  Check
} from 'lucide-react'
import { useTrace } from '../context/TraceContext'
import { COMMON_PATTERNS } from '../lib/constants'
import { Difficulty } from '../types/discovery'
import { formatDate } from '../lib/utils'

export const DiscoveryDetailModal: React.FC = () => {
  const {
    isDetailOpen,
    closeDetail,
    activeDiscovery,
    updateDiscovery,
    deleteDiscovery,
    toggleFavorite,
    toggleRevisit,
    markRevisitedToday
  } = useTrace()

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [rawCapture, setRawCapture] = useState('')
  const [pattern, setPattern] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isDraft, setIsDraft] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Populate state when activeDiscovery changes
  useEffect(() => {
    if (activeDiscovery) {
      setTitle(activeDiscovery.title || '')
      setUrl(activeDiscovery.url || '')
      setRawCapture(activeDiscovery.rawCapture || '')
      setPattern(activeDiscovery.pattern || '')
      setDifficulty(activeDiscovery.difficulty)
      setTags([...activeDiscovery.tags])
      setIsDraft(activeDiscovery.isDraft)
      setShowConfirmDelete(false)
    }
  }, [activeDiscovery])

  if (!isDetailOpen || !activeDiscovery) return null

  const handleSave = async () => {
    await updateDiscovery(activeDiscovery.id, {
      title: title.trim(),
      url: url.trim() || undefined,
      rawCapture,
      pattern: pattern.trim() || undefined,
      difficulty,
      tags,
      isDraft
    })
    closeDetail()
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '')
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleOpenUrl = () => {
    if (url && window.traceApi) {
      window.traceApi.openExternal(url)
    }
  }

  const handleDelete = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true)
      setTimeout(() => setShowConfirmDelete(false), 4000)
      return
    }
    await deleteDiscovery(activeDiscovery.id)
    closeDetail()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-indigo-400 font-semibold">
              Discovery Inspector & Refinement
            </span>
            {isDraft && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-semibold">
                Draft
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(activeDiscovery.id)}
              className={`p-1.5 rounded-md transition-colors ${
                activeDiscovery.isFavorite
                  ? 'text-yellow-400 bg-yellow-500/10'
                  : 'text-[var(--text-muted)] hover:text-yellow-400 hover:bg-[var(--bg-surface-elevated)]'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${activeDiscovery.isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>

            <button
              onClick={() => toggleRevisit(activeDiscovery.id)}
              className={`p-1.5 rounded-md transition-colors ${
                activeDiscovery.needsRevisit
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-[var(--bg-surface-elevated)]'
              }`}
              title="Toggle Revisit Queue"
            >
              <Clock className="w-4 h-4" />
            </button>

            <button
              onClick={closeDetail}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title & URL */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Problem Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Problem title (e.g., Course Schedule II)"
                className="w-full h-9 px-3 text-sm font-semibold rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/60"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative flex items-center">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full h-8 pl-3 pr-8 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              {url && (
                <button
                  type="button"
                  onClick={handleOpenUrl}
                  className="h-8 px-2.5 rounded-md bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs text-indigo-400 flex items-center gap-1 transition-colors"
                  title="Open link in default browser"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </button>
              )}
            </div>
          </div>

          {/* Thought Process */}
          <div className="rounded-xl p-4 bg-amber-500/5 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thought Process</span>
              </label>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                Core discovery intuition & notes
              </span>
            </div>
            <textarea
              value={rawCapture}
              onChange={(e) => setRawCapture(e.target.value)}
              placeholder="Detailed thought process, intuition, and notes at discovery time..."
              rows={6}
              className="w-full p-3 text-sm rounded-lg bg-[var(--bg-surface)] border border-amber-500/20 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 leading-relaxed resize-y"
            />
          </div>

          {/* Pattern & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1.5">
                Algorithmic Pattern
              </label>
              <div className="relative">
                <input
                  list="detail-patterns"
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="e.g., Two Pointers, Monotonic Stack..."
                  className="w-full h-8 px-2.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                />
                <datalist id="detail-patterns">
                  {COMMON_PATTERNS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1.5">
                Difficulty
              </label>
              <div className="flex items-center gap-2 h-8">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(difficulty === diff ? undefined : diff)}
                    className={`flex-1 h-full rounded text-xs font-medium border transition-colors ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : diff === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags Management */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Type tag and press Enter..."
                className="flex-1 h-8 px-2.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 font-mono"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="h-8 px-3 rounded-md bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Revisit Review Status & History */}
          <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-[var(--text-muted)] space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--text-secondary)]">Review Status:</span>
                <span>
                  Revisited {activeDiscovery.revisitCount || 0} times
                  {activeDiscovery.lastRevisitedAt
                    ? ` • Last: ${formatDate(activeDiscovery.lastRevisitedAt)}`
                    : ' • Never revisited'}
                </span>
              </div>
              <div className="text-[10px]">
                Created: {formatDate(activeDiscovery.createdAt)} • Updated:{' '}
                {formatDate(activeDiscovery.updatedAt)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => markRevisitedToday(activeDiscovery.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Mark Revisited Today</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <button
            type="button"
            onClick={handleDelete}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showConfirmDelete
                ? 'bg-rose-600 text-white'
                : 'text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{showConfirmDelete ? 'Confirm Permanent Delete' : 'Delete Discovery'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeDetail}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
