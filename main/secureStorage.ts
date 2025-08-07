// src/main/safeStorageHandler.ts (New file for safeStorage logic)
import { safeStorage } from 'electron';
import { db } from './database'; // Assuming your Firestore `db` instance is exported from database.ts

interface StoredCredentials {
  encryptedPassword: string; // Stored as a string (base64 encoded Buffer)
  qthNickname: string | null;
}

/**
 * Saves eQSL credentials securely to Firestore.
 * The password is encrypted using Electron's safeStorage API.
 * @param userId The ID of the user.
 * @param username The eQSL username (callsign).
 * @param password The eQSL password (plaintext).
 * @param qthNickname The eQSL QTH Nickname.
 * @returns Promise<boolean> indicating success.
 */
export async function saveEQSLCredentials(
  callsign: string,
  username: string,
  password: string,
  qthNickname: string | null
): Promise<boolean> {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('Encryption is not available on this system. Not saving password.');
    // In a real app, you might inform the user or fall back to not saving.
    return false;
  }

  try {
    // Encrypt the password
    const encryptedPasswordBuffer = safeStorage.encryptString(password);
    // Convert Buffer to a base64 string for storage in Firestore
    const encryptedPasswordBase64 = encryptedPasswordBuffer.toString('base64');

    // Store the credentials in Firestore under the user's private data
    // Assuming a 'eqslCredentials' collection for each user
    const userDocRef = db.collection('artifacts').doc(__app_id).collection('users').doc(callsign);
    const eqslDocRef = userDocRef.collection('eqslCredentials').doc(username.toUpperCase()); // Use username as doc ID

    await eqslDocRef.set({
      encryptedPassword: encryptedPasswordBase64,
      qthNickname: qthNickname,
      lastUpdated: new Date().toISOString()
    });

    console.log('eQSL credentials saved securely for user:', username);
    return true;
  } catch (error) {
    console.error('Failed to save eQSL credentials:', error);
    return false;
  }
}

/**
 * Retrieves and decrypts eQSL credentials for a given user and username.
 * @param userId The ID of the user.
 * @param username The eQSL username (callsign).
 * @returns Promise<{ username: string, password: string, qthNickname: string | null } | null>
 */
export async function getEQSLCredentials(
  userId: number,
  username: string
): Promise<{ username: string, password: string, qthNickname: string | null } | null> {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('Encryption is not available on this system. Cannot retrieve password.');
    return null;
  }

  try {
    const userDocRef = db.collection('artifacts').doc(__app_id).collection('users').doc(userId.toString());
    const eqslDocRef = userDocRef.collection('eqslCredentials').doc(username.toUpperCase());
    const docSnap = await eqslDocRef.get();

    if (docSnap.exists) {
      const data = docSnap.data() as StoredCredentials;
      // Convert base64 string back to Buffer
      const encryptedPasswordBuffer = Buffer.from(data.encryptedPassword, 'base64');
      // Decrypt the password
      const decryptedPassword = safeStorage.decryptString(encryptedPasswordBuffer);

      return {
        username: username,
        password: decryptedPassword,
        qthNickname: data.qthNickname || null,
      };
    } else {
      console.log('No eQSL credentials found for user:', username);
      return null;
    }
  } catch (error) {
    console.error('Failed to retrieve or decrypt eQSL credentials:', error);
    return null;
  }
}

// You'll need to integrate these functions into your IPC handlers in background.ts
// For example, when the user clicks "Upload to eQSL", the main process
// would first call getEQSLCredentials, then use the decrypted password for the upload.