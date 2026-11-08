import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface TraceAPI {
  getDiscoveries: () => Promise<any>
  saveDiscoveries: (discoveries: any[]) => Promise<{ success: boolean; count: number; error?: string }>
  restoreBackup: () => Promise<{ success: boolean; data?: any[]; error?: string }>
  getStorageInfo: () => Promise<any>
  openDataFolder: () => Promise<boolean>
  exportJSON: (discoveries: any[]) => Promise<{ canceled: boolean; filePath?: string; error?: string }>
  importJSON: () => Promise<{ canceled: boolean; data?: any[]; count?: number; filePath?: string; error?: string }>
  exportCSV: (discoveries: any[]) => Promise<{ canceled: boolean; filePath?: string; error?: string }>
  importCSV: () => Promise<{ canceled: boolean; data?: any[]; count?: number; filePath?: string; error?: string }>
  getSettings: () => Promise<any>
  saveSettings: (settings: any) => Promise<boolean>
  openExternal: (url: string) => Promise<boolean>
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
}

const api: TraceAPI = {
  getDiscoveries: () => ipcRenderer.invoke('trace:getDiscoveries'),
  saveDiscoveries: (discoveries) => ipcRenderer.invoke('trace:saveDiscoveries', discoveries),
  restoreBackup: () => ipcRenderer.invoke('trace:restoreBackup'),
  getStorageInfo: () => ipcRenderer.invoke('trace:getStorageInfo'),
  openDataFolder: () => ipcRenderer.invoke('trace:openDataFolder'),
  exportJSON: (discoveries) => ipcRenderer.invoke('trace:exportJSON', discoveries),
  importJSON: () => ipcRenderer.invoke('trace:importJSON'),
  exportCSV: (discoveries) => ipcRenderer.invoke('trace:exportCSV', discoveries),
  importCSV: () => ipcRenderer.invoke('trace:importCSV'),
  getSettings: () => ipcRenderer.invoke('trace:getSettings'),
  saveSettings: (settings) => ipcRenderer.invoke('trace:saveSettings', settings),
  openExternal: (url) => ipcRenderer.invoke('trace:openExternal', url),
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('traceApi', api)
  } catch (error) {
    console.error('Failed to expose APIs in preload:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.traceApi = api
}
