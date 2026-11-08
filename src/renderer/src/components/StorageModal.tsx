import React, { useState, useEffect } from 'react'
import {
  X,
  HardDrive,
  FolderOpen,
  Upload,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { useTrace } from '../context/TraceContext'
import { formatDate } from '../lib/utils'

export const StorageModal: React.FC = () => {
  const {
    isStorageOpen,
    setIsStorageOpen,
    storageInfo,
    refreshStorageInfo,
    openDataFolder,
    exportJSON,
    importJSON,
    exportCSV,
    importCSV,
    restoreBackup,
    discoveries
  } = useTrace()

  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [showConfirmRestore, setShowConfirmRestore] = useState(false)
  const [showConfirmReplace, setShowConfirmReplace] = useState(false)

  useEffect(() => {
    if (isStorageOpen) {
      refreshStorageInfo()
      setShowConfirmRestore(false)
      setShowConfirmReplace(false)
    }
  }, [isStorageOpen, refreshStorageInfo])

  if (!isStorageOpen) return null

  const handleImportJSONClick = async () => {
    if (importMode === 'replace' && !showConfirmReplace) {
      setShowConfirmReplace(true)
      return
    }
    await importJSON(importMode)
    setShowConfirmReplace(false)
  }

  const handleImportCSVClick = async () => {
    if (importMode === 'replace' && !showConfirmReplace) {
      setShowConfirmReplace(true)
      return
    }
    await importCSV(importMode)
    setShowConfirmReplace(false)
  }

  const handleRestoreBackupClick = async () => {
    if (!showConfirmRestore) {
      setShowConfirmRestore(true)
      return
    }
    await restoreBackup()
    setShowConfirmRestore(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-3 h-3" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Local Storage, Backup & Portability
            </h2>
          </div>
          <button
            onClick={() => setIsStorageOpen(false)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Storage Telemetry Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Local JSON File Persistence
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Offline & Private
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                  Total Discoveries
                </span>
                <p className="font-semibold text-[var(--text-primary)]">{discoveries.length} records</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                  File Size
                </span>
                <p className="font-semibold text-[var(--text-primary)]">
                  {storageInfo?.fileSizeBytes
                    ? `${(storageInfo.fileSizeBytes / 1024).toFixed(1)} KB`
                    : '< 1 KB'}
                </p>
              </div>

              <div className="col-span-2 space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                  Primary Data File
                </span>
                <p className="font-mono text-[10px] text-[var(--text-secondary)] break-all select-all bg-[var(--bg-surface)] p-1.5 rounded border border-[var(--border-subtle)]">
                  {storageInfo?.primaryPath || 'Loading...'}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                  Auto-Rotating Backup
                </span>
                <p className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  {storageInfo?.backupExists ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] text-[11px]">Will create on save</span>
                  )}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                  Last Saved
                </span>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {storageInfo?.lastModified ? formatDate(storageInfo.lastModified) : 'Recent'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <button
                onClick={openDataFolder}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open Data Folder in Windows Explorer</span>
              </button>

              <button
                onClick={refreshStorageInfo}
                className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                title="Refresh stats"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Import / Export Controls */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Import & Export
            </h3>

            {/* Mode selection for import */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]">
              <span className="text-xs text-[var(--text-secondary)]">When importing records:</span>
              <div className="flex items-center bg-[var(--bg-surface)] p-0.5 rounded border border-[var(--border-subtle)] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setImportMode('merge')
                    setShowConfirmReplace(false)
                  }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    importMode === 'merge'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Merge
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    importMode === 'replace'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Replace All
                </button>
              </div>
            </div>

            {showConfirmReplace && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Warning:</strong> "Replace All" will overwrite all existing discoveries with the imported file. Proceed with caution.
                </span>
              </div>
            )}

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* JSON Export */}
              <button
                onClick={exportJSON}
                className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface-elevated)] transition-colors flex items-center gap-2.5 text-left"
              >
                <div className="p-2 rounded bg-indigo-500/15 text-indigo-400">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Export JSON</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Full fidelity backup</div>
                </div>
              </button>

              {/* JSON Import */}
              <button
                onClick={handleImportJSONClick}
                className={`p-3 rounded-lg border transition-colors flex items-center gap-2.5 text-left ${
                  showConfirmReplace
                    ? 'border-rose-500/50 bg-rose-500/10'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface-elevated)]'
                }`}
              >
                <div className="p-2 rounded bg-indigo-500/15 text-indigo-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    {showConfirmReplace ? 'Confirm Replace JSON' : 'Import JSON'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">{importMode} mode</div>
                </div>
              </button>

              {/* CSV Export */}
              <button
                onClick={exportCSV}
                className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface-elevated)] transition-colors flex items-center gap-2.5 text-left"
              >
                <div className="p-2 rounded bg-emerald-500/15 text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Export CSV</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Excel & Sheets</div>
                </div>
              </button>

              {/* CSV Import */}
              <button
                onClick={handleImportCSVClick}
                className={`p-3 rounded-lg border transition-colors flex items-center gap-2.5 text-left ${
                  showConfirmReplace
                    ? 'border-rose-500/50 bg-rose-500/10'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface-elevated)]'
                }`}
              >
                <div className="p-2 rounded bg-emerald-500/15 text-emerald-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    {showConfirmReplace ? 'Confirm Replace CSV' : 'Import CSV'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">{importMode} mode</div>
                </div>
              </button>
            </div>
          </div>

          {/* Emergency Backup Restore */}
          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Safety & Backup Recovery
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              TRACE automatically maintains an isolated rotating backup (<code className="text-indigo-400">trace_discoveries.backup.json</code>) before each save cycle. If you ever need to roll back:
            </p>

            <button
              onClick={handleRestoreBackupClick}
              disabled={!storageInfo?.backupExists}
              className={`w-full p-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                showConfirmRestore
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-amber-400 hover:bg-amber-500/10 disabled:opacity-40'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {showConfirmRestore
                  ? 'Click Again to Confirm Rollback to Auto-Backup'
                  : 'Rollback to Previous Session Backup'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <button
            onClick={() => setIsStorageOpen(false)}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
