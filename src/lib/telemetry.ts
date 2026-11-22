export type RadarTarget = {
  slot: number;
  xMm: number;
  yMm: number;
  speedCms: number;
  resolutionMm: number;
  distanceM: number;
  angleDeg: number;
};

export type RadarReading = {
  updatedAt: number | null;
  sequence: number | null;
  targets: RadarTarget[];
  valid: boolean;
  issue: string | null;
};

export type DeviceStatus = {
  lastSeenAt: number | null;
  firmware: string | null;
  wifiRssiDbm: number | null;
};

// si la ESP sigue conectada pero el radar no manda tramas, sus estados deben ser distintos
export const ESP_TIMEOUT_MS = 15_000;
export const SENSOR_TIMEOUT_MS = 5_000;
const MAX_TIMESTAMP_MS = 8_640_000_000_000_000;

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function numeric(value: unknown, min: number, max: number, integer = false): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)) ? value : null;
}

function timestamp(value: unknown) {
  return numeric(value, 1, MAX_TIMESTAMP_MS, true);
}

// este reporte indica cuándo respondió la ESP32, aunque el radar no tenga datos nuevos
export function parseDeviceStatus(value: unknown): DeviceStatus {
  const data = object(value);
  return {
    lastSeenAt: timestamp(data.lastSeenAt),
    firmware: typeof data.firmware === 'string' && data.firmware.trim() ? data.firmware.slice(0, 64) : null,
    wifiRssiDbm: numeric(data.wifiRssiDbm, -127, 0, true),
  };
}

export function parseRadarReading(value: unknown): RadarReading | null {
  if (value == null) return null;
  const data = object(value);
  const targets: RadarTarget[] = [];
  let malformed = false;
  const entries = data.targets !== null && typeof data.targets === 'object' ? Object.entries(data.targets) : [];
  if (data.targets != null && typeof data.targets !== 'object') malformed = true;

  for (const [key, raw] of entries) {
    // Firebase puede devolver las ranuras como un arreglo con espacios vacíos
    if (raw == null) continue;
    const target = object(raw);
    if (target.active === false && ['1', '2', '3'].includes(key)) continue;
    const xMm = numeric(target.xMm, -32767, 32767, true);
    const yMm = numeric(target.yMm, -32767, 32767, true);
    const speedCms = numeric(target.speedCms, -32767, 32767, true);
    const resolutionMm = numeric(target.resolutionMm, 0, 65535, true);
    if (!['1', '2', '3'].includes(key) || target.active !== true || xMm === null || yMm === null || speedCms === null || resolutionMm === null || (xMm === 0 && yMm === 0 && speedCms === 0 && resolutionMm === 0)) {
      malformed = true;
      continue;
    }
    // conservamos los datos originales y calculamos distancia y ángulo para mostrarlos
    targets.push({ slot: Number(key), xMm, yMm, speedCms, resolutionMm, distanceM: Math.hypot(xMm, yMm) / 1000, angleDeg: Math.atan2(xMm, yMm) * 180 / Math.PI });
  }

  targets.sort((a, b) => a.slot - b.slot);
  const count = numeric(data.targetCount, 0, 3, true);
  const updatedAt = timestamp(data.updatedAt);
  const sequence = numeric(data.sequence, 0, Number.MAX_SAFE_INTEGER, true);
  // una lectura sin objetivos es válida; una incompleta o simulada no se muestra como real
  const valid = data.model === 'HLK-LD2450' && data.source === 'sensor' && updatedAt !== null && sequence !== null && count !== null && count === targets.length && !malformed;
  return { updatedAt, sequence, targets, valid, issue: valid ? null : 'La lectura está incompleta o no corresponde a datos reales del HLK-LD2450.' };
}

export function isRecent(time: number | null, now: number, timeout: number) {
  return time !== null && time <= now + 2_000 && now - time <= timeout;
}

export function getReadingState(reading: RadarReading | null, status: DeviceStatus, now: number, connected: boolean) {
  const espOnline = connected && isRecent(status.lastSeenAt, now, ESP_TIMEOUT_MS);
  const current = espOnline && reading?.valid === true && isRecent(reading.updatedAt, now, SENSOR_TIMEOUT_MS);
  return { espOnline, current, sensorOnline: current };
}

export function targetInView(target: RadarTarget) {
  return target.yMm >= 0 && target.distanceM <= 6 && Math.abs(target.angleDeg) <= 60;
}

// reflejamos el eje X como en la web; no cambiamos las coordenadas recibidas
export function radarPosition(target: RadarTarget) {
  return { x: 180 - target.xMm / 1000 * 34, y: 240 - target.yMm / 1000 * 34 };
}

export function formatTime(time: number | null) {
  return time === null ? 'Sin reporte' : new Date(time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ageLabel(time: number | null, now: number) {
  if (time === null) return 'Sin reporte';
  if (time > now + 2_000) return 'Fecha fuera de rango';
  const seconds = Math.max(0, Math.floor((now - time) / 1000));
  if (seconds < 1) return 'Ahora';
  if (seconds < 60) return `Hace ${seconds} s`;
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
  return `Hace ${Math.floor(seconds / 86400)} d`;
}
