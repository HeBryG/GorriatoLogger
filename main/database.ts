// electron/database.ts

import Database, { Database as DBDerived } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

// Define the path to your database file
const appDataPath = app.getPath('userData');
const dbDirectory = path.join(appDataPath, 'database');
const dbPath = path.join(dbDirectory, 'gorriatologger.db');

// Ensure the database directory exists
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

export let db: DBDerived;

export function initializeDatabase() {
  try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        callsign TEXT UNIQUE NOT NULL,
        eqslp TEXT NULL
      );
      CREATE TABLE IF NOT EXISTS Logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        callsign TEXT NOT NULL,
        destCallSign TEXT NOT NULL,
        band TEXT NOT NULL,
        frequencyMHz REAL NULL,
        mode TEXT NOT NULL,
        sentReport TEXT NULL,
        receivedReport TEXT NULL,
        notes TEXT NULL
      );
    `);
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    console.log('Database closed.');
  }
}

export function addUserEqslCred(eqslp: string, callsign: string) {
  const stmt = db.prepare("UPDATE Users SET eqslp = ? WHERE callsign = ?;");
  const info = stmt.run(eqslp, callsign);
  return info.lastInsertRowid;
}

export function addUser(callsign: string) {
  const stmt = db.prepare('INSERT INTO Users (callsign) VALUES (?)');
  const info = stmt.run(callsign);
  return info.lastInsertRowid;
}

export function getUsers() {
  const stmt = db.prepare('SELECT * FROM Users');
  return stmt.all();
}

export function addLog(callsign: string, destCallSign: string, band: string, frequencyMHz: number | null, mode: string, sentReport: string | null, receivedReport: string | null, notes: string | null) {
  const stmt = db.prepare('INSERT INTO Logs (callsign, destCallSign, band, frequencyMHz, mode, sentReport, receivedReport, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(callsign, destCallSign, band, frequencyMHz, mode, sentReport, receivedReport, notes);
  return info.lastInsertRowid;
}

export function getLogs(callsign: string) {
  const stmt = db.prepare('SELECT * FROM Logs WHERE callsign = ?');
  return stmt.all(callsign);
}

