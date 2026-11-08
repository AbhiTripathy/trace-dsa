import React from 'react'
import { X, Keyboard } from 'lucide-react'
import { useTrace } from '../context/TraceContext'

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useTrace()

  if (!isShortcutsOpen) return null

  const shortcuts = [
    {
      group: 'Discovery Navigation',
      items: [
        { keys: ['J', '↓', '→'], desc: 'Next discovery card' },
        { keys: ['K', '↑', '←'], desc: 'Previous discovery card' },
        { keys: ['Enter'], desc: 'Open focused detail & edit view' },
        { keys: ['Esc'], desc: 'Close open modal or inspector' }
      ]
    },
    {
      group: 'Quick Actions',
      items: [
        { keys: ['Ctrl', 'N'], desc: 'Open quick capture surface' },
        { keys: ['Ctrl', 'K'], desc: 'Focus global search input' },
        { keys: ['E'], desc: 'Edit active discovery' },
        { keys: ['F'], desc: 'Toggle favorite status' },
        { keys: ['R'], desc: 'Toggle revisit queue' },
        { keys: ['Space'], desc: 'Mark active discovery revisited today' },
        { keys: ['C'], desc: 'Copy discovery finding to clipboard' }
      ]
    },
    {
      group: 'Capturing & Forms',
      items: [
        { keys: ['Ctrl', 'Enter'], desc: 'Save and persist discovery' },
        { keys: ['Esc'], desc: 'Auto-save rough thought to Drafts' },
        { keys: ['?'], desc: 'Toggle this shortcuts reference' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Keyboard className="w-3 h-3" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Keyboard Navigation & Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.group} className="space-y-2">
              <h3 className="text-[11px] font-mono uppercase text-indigo-400 font-semibold tracking-wider">
                {group.group}
              </h3>
              <div className="space-y-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 px-2 text-xs text-[var(--text-secondary)]"
                  >
                    <span>{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
