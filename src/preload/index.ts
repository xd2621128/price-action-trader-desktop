import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

export interface PythonOutput {
  type: 'stdout' | 'stderr'
  data: string
}

export interface ElectronAPI {
  python: {
    runAnalysis: () => Promise<boolean>
    runBacktest: (mode: 'breakout' | 'retrace') => Promise<boolean>
    stop: () => Promise<boolean>
    onOutput: (callback: (output: PythonOutput) => void) => () => void
    onExit: (callback: (data: { code: number; error?: string }) => void) => () => void
    onLog: (callback: (log: string) => void) => () => void
  }
  file: {
    read: (filepath: string) => Promise<string>
    write: (filepath: string, content: string) => Promise<boolean>
    readLog: (logPath: string) => Promise<string>
    watchLog: (logPath: string) => Promise<void>
    unwatchLog: () => Promise<void>
  }
  notification: {
    show: (title: string, body: string) => Promise<void>
  }
  window: {
    flash: () => Promise<void>
  }
  settings: {
    get: <T = unknown>(key: string) => Promise<T>
    set: (key: string, value: unknown) => Promise<boolean>
    getAll: () => Promise<Record<string, unknown>>
  }
  config: {
    read: () => Promise<Record<string, unknown> | null>
    write: (config: Record<string, unknown>) => Promise<boolean>
  }
}

const electronAPI: ElectronAPI = {
  python: {
    runAnalysis: () => ipcRenderer.invoke('python:run-analysis'),
    runBacktest: (mode) => ipcRenderer.invoke('python:run-backtest', mode),
    stop: () => ipcRenderer.invoke('python:stop'),
    onOutput: (callback) => {
      const handler = (_: IpcRendererEvent, output: PythonOutput) => callback(output)
      ipcRenderer.on('python:output', handler)
      return () => ipcRenderer.removeListener('python:output', handler)
    },
    onExit: (callback) => {
      const handler = (_: IpcRendererEvent, data: { code: number; error?: string }) => callback(data)
      ipcRenderer.on('python:exit', handler)
      return () => ipcRenderer.removeListener('python:exit', handler)
    },
    onLog: (callback) => {
      const handler = (_: IpcRendererEvent, log: string) => callback(log)
      ipcRenderer.on('python:log', handler)
      return () => ipcRenderer.removeListener('python:log', handler)
    }
  },
  file: {
    read: (filepath) => ipcRenderer.invoke('file:read', filepath),
    write: (filepath, content) => ipcRenderer.invoke('file:write', filepath, content),
    readLog: (logPath) => ipcRenderer.invoke('file:read-log', logPath),
    watchLog: (logPath) => ipcRenderer.invoke('file:watch-log', logPath),
    unwatchLog: () => ipcRenderer.invoke('file:unwatch-log')
  },
  notification: {
    show: (title, body) => ipcRenderer.invoke('notification:show', title, body)
  },
  window: {
    flash: () => ipcRenderer.invoke('window:flash')
  },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll')
  },
  config: {
    read: () => ipcRenderer.invoke('config:read'),
    write: (config) => ipcRenderer.invoke('config:write', config)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
