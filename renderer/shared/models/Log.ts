import { Bands } from "../enum/Bands";
import { Modes } from "../enum/Modes";

export interface LogEntryInterface {
  id?: string;
  timestamp: string; // ISO format
  callSign: string;
  destCallSign: string;
  band: Bands;
  frequencyMHz?: number;
  mode: Modes;
  sentReport?: string;
  receivedReport?: string;
  notes?: string;
}

// Optional: A class for working with entries in code
export class Log implements LogEntryInterface {
  id?: string;
  timestamp: string;
  callSign: string;
  destCallSign: string;
  band: Bands;
  frequencyMHz?: number;
  mode: Modes;
  sentReport?: string;
  receivedReport?: string;
  notes?: string;

  constructor(entry: {
        id?: string;
        timestamp?: string;
        callSign: string;
        destCallSign: string;
        band: Bands,
        frequencyMHz?: number;
        mode: Modes;
        sentReport?: string;
        receivedReport?: string;
        notes?: string;
    })  {
        this.id = entry.id;
        this.timestamp = entry.timestamp || new Date().toISOString();
        this.callSign = entry.callSign.toUpperCase();
        this.destCallSign = entry.destCallSign.toUpperCase();
        this.band = entry.band;
        this.frequencyMHz = entry.frequencyMHz;
        this.mode = entry.mode;
        this.sentReport = entry.sentReport;
        this.receivedReport = entry.receivedReport;
        this.notes = entry.notes;
    }
  callsignRegex = /^[A-Z0-9]{1,2}[0-9][A-Z]{1,3}$/i;
  toString(): string {
    return `[${this.timestamp}] ${this.callSign} on ${this.frequencyMHz} MHz (${this.mode}) - Sent: ${this.sentReport}, Received: ${this.receivedReport}${this.notes ? ` | Notes: ${this.notes}` : ''}`;
  }
  isValidCallsign(): boolean {
    return this.callsignRegex.test(this.callSign.trim().toUpperCase());
  }
  isValidDestCallsign(): boolean {
    return this.callsignRegex.test(this.destCallSign.trim().toUpperCase());
  }
}