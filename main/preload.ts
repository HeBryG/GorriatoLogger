import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Expose specific database functions
  addUser: (callsign) => ipcRenderer.invoke('add-user', callsign),
  getUsers: () => ipcRenderer.invoke('get-users'),
  addLog: (callsign, destCallSign, band, frequencyMHz, mode, sentReport, receivedReport, notes) => ipcRenderer.invoke('add-log', callsign, destCallSign, band, frequencyMHz, mode, sentReport, receivedReport, notes),
  getLogs: (callsign) => ipcRenderer.invoke('get-logs', callsign),
  // New method to save credentials
  saveEQSLCredentials: (userId: number, username: string, password: string, qthNickname: string | null) =>
    ipcRenderer.invoke('save-eqsl-credentials', userId, username, password, qthNickname),

  // Modified upload method (no password passed from renderer)
  uploadLogsToEQSL: (userId: number, username: string, qthNickname: string | null) =>
    ipcRenderer.invoke('upload-logs-to-eqsl', userId, username, qthNickname),
});

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler
