import { getApps, initializeApp } from 'firebase/app';
import { signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

import { getReaderAuth } from './firebase-auth';
import { readDeviceId, readFirebaseConfig } from './firebase-config';

let authentication: Promise<void> | undefined;

export function getFirebaseClient() {
  // Expo necesita leer cada variable de esta forma para incluirla en la app
  const config = readFirebaseConfig({
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_DATABASE_URL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  });
  const deviceId = readDeviceId(process.env.EXPO_PUBLIC_TELEMETRY_DEVICE_ID);
  const app = getApps().find(candidate => candidate.name === 'thalos-mobile') ?? initializeApp(config, 'thalos-mobile');
  return { auth: getReaderAuth(app), database: getDatabase(app), deviceId };
}

export async function authenticateReader() {
  const client = getFirebaseClient();
  if (!authentication) {
    authentication = (async () => {
      await client.auth.authStateReady();
      // la app solo lee; la cuenta con permiso de escritura se queda en la ESP32
      if (!client.auth.currentUser) await signInAnonymously(client.auth);
    })().catch((error: unknown) => {
      authentication = undefined;
      throw error;
    });
  }
  await authentication;
  return client;
}
