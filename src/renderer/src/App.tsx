import React, { useEffect } from 'react'
import { TraceProvider, useTrace } from './context/TraceContext'
import { AppHeader } from './components/AppHeader'
import { NavigationRail } from './components/NavigationRail'
import { DiscoveryFeed } from './components/DiscoveryFeed'
import { QuickCaptureModal } from './components/QuickCaptureModal'
import { DiscoveryDetailModal } from './components/DiscoveryDetailModal'
import { StorageModal } from './components/StorageModal'
import { ShortcutsModal } from './components/ShortcutsModal'
import { Toast } from './components/Toast'

const MainApp: React.FC = () => {
  const { setIsShortcutsOpen, isCaptureOpen, isDetailOpen, isStorageOpen } = useTrace()

  // Global listener for '?' to open shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        isCaptureOpen ||
        isDetailOpen ||
        isStorageOpen
      ) {
        return
      }

      if (e.key === '?') {
        e.preventDefault()
        setIsShortcutsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setIsShortcutsOpen, isCaptureOpen, isDetailOpen, isStorageOpen])

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Windows App Title Bar & Header */}
      <AppHeader />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Compact Navigation Rail */}
        <NavigationRail />

        {/* Discovery Feed Surface */}
        <DiscoveryFeed />
      </div>

      {/* Modals & Overlays */}
      <QuickCaptureModal />
      <DiscoveryDetailModal />
      <StorageModal />
      <ShortcutsModal />
      <Toast />
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <TraceProvider>
      <MainApp />
    </TraceProvider>
  )
}

export default App
