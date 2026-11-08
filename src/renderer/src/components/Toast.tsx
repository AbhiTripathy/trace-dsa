import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useTrace } from '../context/TraceContext'

export const Toast: React.FC = () => {
  const { toastMessage } = useTrace()

  if (!toastMessage) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
      <div className="px-3.5 py-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium shadow-xl flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>{toastMessage}</span>
      </div>
    </div>
  )
}
