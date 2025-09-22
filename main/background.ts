import path from 'path';
import { app, ipcMain } from 'electron';
import serve from 'electron-serve';

// 👇 Add .js (TypeScript will turn .ts → .js)
import { createWindow } from './helpers/create-window.js';

import {
  closeDatabase,
  initializeDatabase,
  addUser,
  addLog,
  getLogs,
  getUsers,
} from './database.js';

import {
  saveEQSLCredentials,
  getEQSLCredentials,
} from './secureStorage.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
// Helper function to convert a single log entry to ADIF format
// This is a simplified example; a full ADIF converter would be more complex
function convertLogToADIF(log: any): string {
  let adif = '';
  adif += `<CALL:${log.destCallSign.length}>${log.destCallSign}\n`;
  adif += `<QSO_DATE:${log.qsoDate.length}>${log.qsoDate}\n`; // Assuming YYYYMMDD format
  adif += `<TIME_ON:${log.timeOn.length}>${log.timeOn}\n`; // Assuming HHMM format
  adif += `<BAND:${log.band.length}>${log.band}\n`;
  adif += `<FREQ:${log.frequencyMHz.toFixed(3).length}>${log.frequencyMHz.toFixed(3)}\n`;
  adif += `<MODE:${log.mode.length}>${log.mode}\n`;
  if (log.sentReport) adif += `<RST_SENT:${log.sentReport.length}>${log.sentReport}\n`;
  if (log.receivedReport) adif += `<RST_RCVD:${log.receivedReport.length}>${log.receivedReport}\n`;
  if (log.notes) adif += `<NOTES:${log.notes.length}>${log.notes}\n`;
  adif += `<EOR>\n`; // End of Record
  return adif;
}



if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

  initializeDatabase(); // Initialize the database when the app is ready
  // Set up IPC handlers
  ipcMain.handle('add-user', async (event, callsign) => {
    try {
      return await addUser(callsign);
    } catch (error) {
      console.error('Error adding user via IPC:', error);
      throw error;
    }
  });

  ipcMain.handle('get-users', async () => {
    try {
      return await getUsers();
    } catch (error) {
      console.error('Error getting users via IPC:', error);
      throw error;
    }
  });

  ipcMain.handle('add-log', async (event, callsign, destCallSign, band, frequencyMHz, mode, sentReport, receivedReport, notes) => {
    try {
      return await addLog(callsign, destCallSign, band, frequencyMHz, mode, sentReport, receivedReport, notes);
    } catch (error) {
      console.error('Error adding product via IPC:', error);
      throw error;
    }
  });

  ipcMain.handle('get-logs', async (event, callsign) => {
    try {
      return await getLogs(callsign);
    } catch (error) {
      console.error('Error getting products via IPC:', error);
      throw error;
    }
  });
// ... other imports
// IPC handler for eQSL upload
ipcMain.handle('upload-logs-to-eqsl', async (event, userId, username, password, qthNickname) => {
  try {
    // 1. Fetch logs for the specified user from your database
    const logsToUpload = await getLogs(userId);

    if (logsToUpload.length === 0) {
      return { success: false, message: 'No logs found for this user to upload.' };
    }

    // 2. Convert logs to ADIF format
    // You'll need to ensure your log entries have the necessary fields (QSO_DATE, TIME_ON etc.)
    // For simplicity, let's assume logsToUpload has these fields or you derive them.
    // NOTE: Your current `Log` interface in React doesn't have `qsoDate` or `timeOn`.
    // You'll need to add these to your database and log entry creation.
    const adifContent = logsToUpload.map(log => {
        // Example: You'll need to convert your log's timestamp to ADIF format
        // For demonstration, let's assume a dummy date/time
        const now = new Date();
        const qsoDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const timeOn = now.toTimeString().slice(0, 5).replace(/:/g, ''); // HHMM

        return `<CALL:${log.destCallSign.length}>${log.destCallSign}\n` +
               `<QSO_DATE:${qsoDate.length}>${qsoDate}\n` +
               `<TIME_ON:${timeOn.length}>${timeOn}\n` +
               `<BAND:${log.band.length}>${log.band}\n` +
               `<FREQ:${log.frequencyMHz ? log.frequencyMHz.toFixed(3).length : 0}>${log.frequencyMHz ? log.frequencyMHz.toFixed(3) : ''}\n` +
               `<MODE:${log.mode.length}>${log.mode}\n` +
               (log.sentReport ? `<RST_SENT:${log.sentReport.length}>${log.sentReport}\n` : '') +
               (log.receivedReport ? `<RST_RCVD:${log.receivedReport.length}>${log.receivedReport}\n` : '') +
               (log.notes ? `<NOTES:${log.notes.length}>${log.notes}\n` : '') +
               `<EOR>\n`;
    }).join('');

    // Prepend ADIF header
    const fullAdifFileContent = `ADIF 2.2\n<PROGRAMID:14>Gorriato Logger\n<EOH>\n` + adifContent;

    // 3. Prepare FormData for the POST request
    const formData = new URLSearchParams();
    formData.append('EQSL_USER', username);
    formData.append('EQSL_PSWD', password);
    formData.append('Filename', fullAdifFileContent); // eQSL expects the ADIF content directly in 'Filename' field
    if (qthNickname) {
      formData.append('APP_EQSL_QTH_NICKNAME', qthNickname);
    }

    // 4. Send the POST request to eQSL.cc
    const response = await fetch('https://www.eqsl.cc/qslcard/ImportADIF.cfm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Important for URLSearchParams
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('eQSL Response:', responseText);

    // 5. Parse the response and determine success/failure
    // eQSL's response is typically HTML/text. You'll need to parse it to check for success.
    // Look for specific keywords or patterns in the responseText.
    if (responseText.includes('Log File Uploaded Successfully') || responseText.includes('records imported')) {
      return { success: true, message: 'Logs uploaded successfully!' };
    } else {
      // You might need more sophisticated parsing to extract specific error messages from eQSL's HTML.
      return { success: false, message: `eQSL responded with an error. Response: ${responseText.substring(0, 200)}...` };
    }

  } catch (error: any) {
    console.error('Error during eQSL upload:', error);
    return { success: false, message: `Error during upload: ${error.message}` };
  }
});
// IPC handler to save credentials
ipcMain.handle('save-eqsl-credentials', async (event, userId, username, password, qthNickname) => {
  return await saveEQSLCredentials(userId, username, password, qthNickname);
});

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./login')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/login`)
    mainWindow.webContents.openDevTools()
  }


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  closeDatabase(); // Close the database when all windows are closed
});


ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
});
})()

