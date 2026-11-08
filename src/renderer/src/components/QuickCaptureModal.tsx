import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Sparkles,
  Link,
  Tag,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Check
} from 'lucide-react'
import { useTrace } from '../context/TraceContext'
import { COMMON_PATTERNS } from '../lib/constants'
import { Difficulty } from '../types/discovery'

export const QuickCaptureModal: React.FC = () => {
  const { isCaptureOpen, setIsCaptureOpen, createDiscovery, showToast } = useTrace()

  const [rawCapture, setRawCapture] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [pattern, setPattern] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined)
  const [tagsInput, setTagsInput] = useState('')
  const [showMeta, setShowMeta] = useState(false)
  const [isDraftMode, setIsDraftMode] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus textarea on modal open
  useEffect(() => {
    if (isCaptureOpen) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
    } else {
      // Reset form state when closed
      setRawCapture('')
      setTitle('')
      setUrl('')
      setPattern('')
      setDifficulty(undefined)
      setTagsInput('')
      setShowMeta(false)
      setIsDraftMode(false)
    }
  }, [isCaptureOpen])

  // Ctrl+Enter shortcut to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave(false)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    }
  }

  const handleClose = () => {
    // If user entered rough text, save as a rough draft so they never lose it
    if (rawCapture.trim().length > 5 && !title.trim()) {
      createDiscovery({
        title: 'Quick Capture (Untitled)',
        rawCapture: rawCapture.trim(),
        isDraft: true,
        tags: ['quick-draft']
      })
      showToast('Unfinished thought auto-saved to Drafts')
    }
    setIsCaptureOpen(false)
  }

  const handleSave = async (forceDraft: boolean = false) => {
    if (!rawCapture.trim()) {
      showToast('Please type your raw intuition or insight first')
      textareaRef.current?.focus()
      return
    }

    const tags = tagsInput
      .split(/[,;\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)

    await createDiscovery({
      title: title.trim() || (forceDraft ? 'Rough Draft' : 'Personal Discovery'),
      url: url.trim() || undefined,
      rawCapture: rawCapture.trim(),
      pattern: pattern.trim() || undefined,
      difficulty,
      tags,
      isDraft: forceDraft || isDraftMode,
      needsRevisit: true
    })

    setIsCaptureOpen(false)
  }

  if (!isCaptureOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-3 h-3" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Quick Discovery Capture
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Input Surface */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Thought Process
            </label>
            <textarea
              ref={textareaRef}
              value={rawCapture}
              onChange={(e) => setRawCapture(e.target.value)}
              placeholder="What clicked? Jot down your thought process, bottleneck, why standard approaches failed, or algorithmic intuition..."
              rows={5}
              className="w-full p-3 text-sm rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Progressive Disclosure for Problem Context */}
          <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-base)]">
            <button
              type="button"
              onClick={() => setShowMeta(!showMeta)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            >
              <span className="font-medium flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5 text-indigo-400" />
                <span>Problem Context & Metadata (Optional)</span>
              </span>
              {showMeta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMeta && (
              <div className="p-3 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--bg-surface)]">
                {/* Title & URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                      Problem Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Trapping Rain Water"
                      className="w-full h-8 px-2.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                      Problem URL
                    </label>
                    <div className="relative flex items-center">
                      <Link className="w-3 h-3 absolute left-2 text-[var(--text-muted)]" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://leetcode.com/problems/..."
                        className="w-full h-8 pl-7 pr-2.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Pattern & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                      Algorithmic Pattern
                    </label>
                    <div className="relative">
                      <input
                        list="capture-patterns"
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        placeholder="Select or type pattern..."
                        className="w-full h-8 px-2.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                      />
                      <datalist id="capture-patterns">
                        {COMMON_PATTERNS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                      Difficulty
                    </label>
                    <div className="flex items-center gap-1.5 h-8">
                      {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setDifficulty(difficulty === diff ? undefined : diff)}
                          className={`flex-1 h-full rounded text-[11px] font-medium border transition-colors ${
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

                {/* Tags */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                    Tags (comma separated)
                  </label>
                  <div className="relative flex items-center">
                    <Tag className="w-3 h-3 absolute left-2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="invariants, space-optimization, monotonic..."
                      className="w-full h-8 pl-7 pr-2.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Save as Rough Draft</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Capture Discovery</span>
              <kbd className="text-[9px] font-mono bg-indigo-700/60 px-1 py-0.2 rounded text-indigo-100">
                Ctrl+Enter
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
