const fields = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  databaseURL: 'EXPO_PUBLIC_FIREBASE_DATABASE_URL',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
} as const;

// revisamos que la configuración esté completa antes de intentar conectarnos
export function readFirebaseConfig(env: Record<string, unknown>) {
  const missing = Object.values(fields).filter(key => typeof env[key] !== 'string' || !String(env[key]).trim());
  if (missing.length) {
    throw Object.assign(new Error(`Completa ${missing.join(', ')} en .env.local y recarga Expo.`), { code: 'app/missing-config' });
  }
  const required = Object.fromEntries(Object.entries(fields).map(([key, variable]) => [key, String(env[variable]).trim()])) as Record<keyof typeof fields, string>;
  if (!/^https:\/\//.test(required.databaseURL)) {
    throw Object.assign(new Error('La dirección de Realtime Database debe comenzar con https://.'), { code: 'app/invalid-config' });
  }
  return {
    ...required,
    storageBucket: optionalText(env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: optionalText(env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  };
}

function optionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

// usamos el mismo robot de la web, sin permitir rutas fuera de su carpeta
export function readDeviceId(value: unknown) {
  const deviceId = optionalText(value) ?? 'robot-01';
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(deviceId)) {
    throw Object.assign(new Error('El identificador del robot solo admite letras, números, guiones y guiones bajos.'), { code: 'app/invalid-device' });
  }
  return deviceId;
}
