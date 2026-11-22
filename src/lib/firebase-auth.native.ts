import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import type { Persistence } from 'firebase/auth';

// Firebase incluye esta función en Android e iOS, pero no en sus tipos de navegador
const nativeAuth = FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
};

export function getReaderAuth(app: FirebaseApp) {
  try {
    // guardamos la sesión anónima para no crear un usuario cada vez que abrimos la app
    return nativeAuth.initializeAuth(app, {
      persistence: nativeAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // al recargar el código, la sesión de Firebase puede estar inicializada
    if (error instanceof Error && 'code' in error && error.code === 'auth/already-initialized') {
      return nativeAuth.getAuth(app);
    }
    throw error;
  }
}
