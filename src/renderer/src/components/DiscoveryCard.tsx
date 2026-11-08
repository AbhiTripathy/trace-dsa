import React, { useState } from 'react'
import {
  Star,
  Clock,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  Tag
} from 'lucide-react'
import { Discovery } from '../types/discovery'
import { useTrace } from '../context/TraceContext'
import { formatDate } from '../lib/utils'

interface DiscoveryCardProps {
  discovery: Discovery
  isHero?: boolean
  index?: number
  total?: number
  onOpenDetail: () => void
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  discovery,
  isHero = false,
  index,
  total,
  onOpenDetail
}) => {
  const {
    toggleFavorite,
    toggleRevisit,
    markRevisitedToday,
    deleteDiscovery,
    showToast
  } = useTrace()

  const [copied, setCopied] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const textToCopy = discovery.rawCapture || ''
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    showToast('Thought process copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (discovery.url && window.traceApi) {
      window.traceApi.openExternal(discovery.url)
    }
  }

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(discovery.id)
  }

  const handleToggleRevisit = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleRevisit(discovery.id)
  }

  const handleMarkRevisited = (e: React.MouseEvent) => {
    e.stopPropagation()
    markRevisitedToday(discovery.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!showConfirmDelete) {
      setShowConfirmDelete(true)
      setTimeout(() => setShowConfirmDelete(false), 4000)
      return
    }
    deleteDiscovery(discovery.id)
  }

  return (
    <article
      onClick={onOpenDetail}
      className={`group relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isHero
          ? 'bg-[var(--bg-surface)] border-[var(--border-medium)] shadow-xl p-6 md:p-8 max-w-3xl w-full mx-auto ring-1 ring-white/5 hover:border-indigo-500/40'
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-indigo-500/40 p-5 flex flex-col justify-between hover:shadow-md'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {discovery.pattern && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                {discovery.pattern}
              </span>
            )}

            {discovery.difficulty && (
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${
                  discovery.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : discovery.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {discovery.difficulty}
              </span>
            )}

            {discovery.isDraft && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 font-medium">
                Draft
              </span>
            )}

            {isHero && index !== undefined && total !== undefined && (
              <span className="text-[11px] font-mono text-[var(--text-muted)] ml-auto">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            )}
          </div>

          {discovery.title && (
            <h3
              className={`font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors flex items-center gap-2 ${
                isHero ? 'text-lg md:text-xl' : 'text-sm'
              }`}
            >
              <span className="truncate">{discovery.title}</span>
              {discovery.url && (
                <button
                  onClick={handleOpenUrl}
                  title="Open problem link in browser"
                  className="p-1 rounded text-[var(--text-muted)] hover:text-indigo-400 transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </h3>
          )}
        </div>

        {/* Right side quick indicators */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggleFav}
            className={`p-1.5 rounded-md transition-colors ${
              discovery.isFavorite
                ? 'text-yellow-400 bg-yellow-500/10'
                : 'text-[var(--text-muted)] hover:text-yellow-400 hover:bg-[var(--bg-surface-elevated)]'
            }`}
            title={discovery.isFavorite ? 'Remove favorite' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${discovery.isFavorite ? 'fill-yellow-400' : ''}`} />
          </button>

          <button
            onClick={handleToggleRevisit}
            className={`p-1.5 rounded-md transition-colors ${
              discovery.needsRevisit
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-[var(--bg-surface-elevated)]'
            }`}
            title={discovery.needsRevisit ? 'In revisit queue' : 'Mark to revisit'}
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Discovery Content - Thought Process */}
      <div className="my-3">
        <div className="rounded-lg p-4 bg-amber-500/5 border border-amber-500/20 text-[var(--text-secondary)]">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2">
            <span>Thought Process</span>
          </div>
          <p
            className={`font-sans leading-relaxed whitespace-pre-wrap ${
              isHero
                ? 'text-sm md:text-base font-normal text-[var(--text-primary)]'
                : 'text-xs text-[var(--text-secondary)] line-clamp-4'
            }`}
          >
            {discovery.rawCapture || '(Empty thought process)'}
          </p>
        </div>
      </div>

      {/* Tags & Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2 text-xs">
        {/* Tags */}
        <div className="flex items-center gap-1 flex-wrap">
          {discovery.tags.length > 0 ? (
            discovery.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
              >
                <Tag className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-[var(--text-muted)] italic">No tags</span>
          )}
        </div>

        {/* Revisit Counter & Action Toolbar */}
        <div className="flex items-center gap-2">
          {discovery.revisitCount > 0 && (
            <span
              className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1"
              title={`Revisited ${discovery.revisitCount} times. Last: ${discovery.lastRevisitedAt ? formatDate(discovery.lastRevisitedAt) : 'N/A'}`}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{discovery.revisitCount} rev</span>
            </span>
          )}

          {isHero && (
            <button
              onClick={handleMarkRevisited}
              className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors flex items-center gap-1"
              title="Mark revisited today"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revisited Today</span>
            </button>
          )}

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={handleCopy}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
              title="Copy finding"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenDetail()
              }}
              className="p-1 rounded text-[var(--text-muted)] hover:text-indigo-400 hover:bg-[var(--bg-surface-elevated)] transition-colors"
              title="Edit / Refine"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDelete}
              className={`p-1 rounded transition-colors ${
                showConfirmDelete
                  ? 'bg-rose-500 text-white'
                  : 'text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10'
              }`}
              title={showConfirmDelete ? 'Click again to permanently delete' : 'Delete discovery'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
