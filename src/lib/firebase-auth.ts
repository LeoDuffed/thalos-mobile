import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// si abrimos la app en el navegador, Firebase guarda la sesión con su configuración web
export function getReaderAuth(app: FirebaseApp) {
  return getAuth(app);
}
