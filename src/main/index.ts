import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { TraceStorage, Discovery, AppSettings } from './storage'

const storage = new TraceStorage()
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const initialSettings = storage.getSettings()
  const isDark = initialSettings.theme !== 'light'

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: isDark ? '#090a0f' : '#f8fafc',
    ...(process.platform === 'win32'
      ? {
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: isDark ? '#090a0f' : '#f8fafc',
            symbolColor: isDark ? '#94a3b8' : '#334155',
            height: 38
          }
        }
      : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Register IPC Handlers
function registerIpcHandlers(): void {
  // Discovery persistence
  ipcMain.handle('trace:getDiscoveries', async () => {
    return storage.loadDiscoveries()
  })

  ipcMain.handle('trace:saveDiscoveries', async (_, discoveries: Discovery[]) => {
    return storage.saveDiscoveries(discoveries)
  })

  ipcMain.handle('trace:restoreBackup', async () => {
    return storage.restoreFromBackup()
  })

  ipcMain.handle('trace:getStorageInfo', async () => {
    return storage.getStorageInfo()
  })

  ipcMain.handle('trace:openDataFolder', async () => {
    storage.openDataFolder()
    return true
  })

  // Import / Export
  ipcMain.handle('trace:exportJSON', async (_, discoveries: Discovery[]) => {
    return storage.exportJSON(discoveries)
  })

  ipcMain.handle('trace:importJSON', async () => {
    return storage.importJSON()
  })

  ipcMain.handle('trace:exportCSV', async (_, discoveries: Discovery[]) => {
    return storage.exportCSV(discoveries)
  })

  ipcMain.handle('trace:importCSV', async () => {
    return storage.importCSV()
  })

  // Settings
  ipcMain.handle('trace:getSettings', async () => {
    return storage.getSettings()
  })

  ipcMain.handle('trace:saveSettings', async (_, settings: AppSettings) => {
    storage.saveSettings(settings)
    // Update titleBarOverlay colors if on Windows
    if (mainWindow && process.platform === 'win32' && mainWindow.setTitleBarOverlay) {
      const isDark = settings.theme !== 'light'
      try {
        mainWindow.setTitleBarOverlay({
          color: isDark ? '#090a0f' : '#f8fafc',
          symbolColor: isDark ? '#94a3b8' : '#334155',
          height: 38
        })
      } catch {
        // ignore if not supported
      }
    }
    return true
  })

  ipcMain.handle('trace:openExternal', async (_, url: string) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url)
      return true
    }
    return false
  })

  // Window control IPC (for custom controls fallback if needed)
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron.trace')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
