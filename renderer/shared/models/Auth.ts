export interface AuthInterface {
  id?: string;
  timestamp: string; // ISO format
  callSign: string;
}

// Optional: A class for working with entries in code
export class Auth implements AuthInterface {
  id?: string;
  timestamp: string;
  callSign: string;

  constructor(entry: {
        id?: string;
        timestamp?: string;
        callSign: string;
    })  {
        this.id = entry.id;
        this.timestamp = entry.timestamp || new Date().toISOString();
        this.callSign = entry.callSign.toUpperCase();
    }
  isValidCallsign(): boolean {
    const callsignRegex = /^[A-Z0-9]{1,2}[0-9][A-Z]{1,3}$/i;
    return callsignRegex.test(this.callSign.trim().toUpperCase());
  }
}