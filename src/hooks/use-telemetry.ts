import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { goOffline, goOnline, onValue, ref, type Database } from 'firebase/database';

import { authenticateReader } from '@/lib/firebase';
import { parseDeviceStatus, parseRadarReading, type DeviceStatus, type RadarReading } from '@/lib/telemetry';

type TelemetryState = {
  deviceId: string;
  status: DeviceStatus;
  reading: RadarReading | null;
  loaded: boolean;
  connected: boolean;
  error: string | null;
  serverOffset: number;
};

function errorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code.startsWith('app/') && error instanceof Error) return error.message;
  if (['operation-not-allowed', 'admin-restricted-operation', 'configuration-not-found'].some(part => code.includes(part))) return 'Activa el acceso Anónimo en Firebase → Authentication → Método de acceso.';
  if (/permission[_-]denied/i.test(code)) return 'Firebase rechazó la lectura. Revisa las reglas de telemetry en Realtime Database.';
  if (code.includes('network-request-failed')) return 'No se pudo contactar a Firebase. Revisa la conexión a internet.';
  if (code.includes('invalid-api-key')) return 'Revisa la configuración de Firebase en .env.local y recarga Expo.';
  return 'No se pudo leer Firebase. Revisa la conexión y vuelve a intentar.';
}

export function useTelemetry() {
  const [attempt, setAttempt] = useState(0);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const [now, setNow] = useState(() => Date.now());
  const [focused, setFocused] = useState(false);
  const [state, setState] = useState<TelemetryState>({ deviceId: 'robot-01', status: parseDeviceStatus(null), reading: null, loaded: false, connected: false, error: null, serverOffset: 0 });

  const reset = useCallback(() => {
    setNow(Date.now());
    setState(previous => ({ ...previous, loaded: false, connected: false, error: null }));
  }, []);

  useEffect(() => {
    const listener = AppState.addEventListener('change', next => {
      setForeground(next === 'active');
      if (next === 'active') reset();
      else setState(previous => ({ ...previous, connected: false }));
    });
    return () => listener.remove();
  }, [reset]);

  useFocusEffect(useCallback(() => {
    setFocused(true);
    reset();
    return () => setFocused(false);
  }, [reset]));

  // solo escuchamos Firebase mientras el panel está abierto y la app está en primer plano
  useEffect(() => {
    if (!foreground || !focused) return;
    let active = true;
    let failed = false;
    let online = false;
    let database: Database | undefined;
    const unsubscribers: (() => void)[] = [];
    const ready = new Set<string>();

    function stopListening() {
      unsubscribers.splice(0).forEach(unsubscribe => unsubscribe());
    }

    function fail(error: unknown) {
      if (!active || failed) return;
      failed = true;
      stopListening();
      if (database) goOffline(database);
      setState(previous => ({ ...previous, connected: false, error: errorMessage(error) }));
    }

    // este reloj permite marcar una lectura como antigua aunque dejen de llegar datos
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const timeout = setTimeout(() => {
      if (!online || ready.size < 2) fail(Object.assign(new Error('La conexión tardó demasiado. Revisa internet y vuelve a intentar.'), { code: 'app/timeout' }));
    }, 20_000);

    async function subscribe() {
      try {
        const client = await authenticateReader();
        if (!active || failed) return;
        database = client.database;
        goOnline(database);
        setState(previous => ({ ...previous, deviceId: client.deviceId }));
        unsubscribers.push(onValue(ref(database, '.info/connected'), snapshot => {
          if (!active || failed) return;
          online = snapshot.val() === true;
          setState(previous => ({ ...previous, connected: online }));
        }, fail));
        // usamos la hora del servidor para que el reloj del teléfono no cambie la antigüedad
        unsubscribers.push(onValue(ref(database, '.info/serverTimeOffset'), snapshot => {
          const offset: unknown = snapshot.val();
          if (active && !failed && typeof offset === 'number' && Number.isFinite(offset)) {
            setState(previous => ({ ...previous, serverOffset: offset }));
          }
        }, fail));
        const base = `telemetry/devices/${client.deviceId}`;
        unsubscribers.push(onValue(ref(database, `${base}/status`), snapshot => {
          if (!active || failed) return;
          ready.add('status');
          setState(previous => ({ ...previous, status: parseDeviceStatus(snapshot.val()), loaded: ready.size === 2 }));
        }, fail));
        unsubscribers.push(onValue(ref(database, `${base}/sensors/ld2450`), snapshot => {
          if (!active || failed) return;
          ready.add('reading');
          setState(previous => ({ ...previous, reading: parseRadarReading(snapshot.val()), loaded: ready.size === 2 }));
        }, fail));
      } catch (error) {
        fail(error);
      }
    }

    void subscribe();
    return () => {
      // al salir del panel cerramos las escuchas y dejamos de mantener la conexión abierta
      active = false;
      clearInterval(clock);
      clearTimeout(timeout);
      stopListening();
      if (database) goOffline(database);
    };
  }, [attempt, foreground, focused]);

  return { ...state, now: now + state.serverOffset, retry: () => { reset(); setAttempt(previous => previous + 1); } };
}
