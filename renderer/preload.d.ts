import { IpcHandler } from '../main/preload'

declare global {
  interface Window {
    ipc: IpcHandler,
    api: {
      addUser: (callsign: string) => Promise<number>,
      getUsers: () => Promise<{id: number; callsign: string}[]>,
      addLog: (callsign, destCallSign, band, frequencyMHz, mode, sentReport, receivedReport, notes) => Promise<number>,
      getLogs: (callsign) => Promise<{id: number, callsign: string, destCallSign: string, band: string, frequencyMHz: number, mode: string, sentReport: number, receivedReport: number, notes: string}[]>,
      saveEQSLCredentials: (callsign: string, password: string, qthNickname: string | null) => Promise<{userId: number, username: string, password: string, qthNickname: string | null}>,
      // Modified upload method (no password passed from renderer)
      getEQSLCredentials: ( callsign: string) => Promise<{ username: string, password: string, qthNickname: string | null } | null>,
      saveEQSLCredentials: (callsign: string, password: string, qthNickname: string | null) =>  Promise<boolean>,
    }
  }
}
