import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRadarReading, parseDeviceStatus, getReadingState, targetInView, radarPosition, ageLabel, ESP_TIMEOUT_MS, SENSOR_TIMEOUT_MS } from '../src/lib/telemetry.ts';
import { readDeviceId, readFirebaseConfig } from '../src/lib/firebase-config.ts';

// estas muestras solo viven en las pruebas, no se cargan a Firebase ni a las pantallas
const now = 1_800_000_000_000;
const target = { active: true, xMm: -782, yMm: 1713, speedCms: -16, resolutionMm: 320 };
const status = parseDeviceStatus({ lastSeenAt: now });
function frame(overrides = {}) {
  return { model: 'HLK-LD2450', source: 'sensor', sequence: 42, updatedAt: now, targetCount: 1, targets: { 1: target }, ...overrides };
}

test('una lectura ausente no es lo mismo que un reporte válido sin objetivos', () => {
  assert.equal(parseRadarReading(null), null);
  const reading = parseRadarReading(frame({ targetCount: 0, targets: null }));
  assert.equal(reading.valid, true);
  assert.equal(reading.targets.length, 0);
  assert.equal(getReadingState(reading, status, now, true).sensorOnline, true);
});

test('las coordenadas y la velocidad conservan el signo recibido del sensor', () => {
  const reading = parseRadarReading(frame());
  assert.equal(reading.valid, true);
  assert.equal(reading.targets[0].xMm, -782);
  assert.equal(reading.targets[0].speedCms, -16);
  assert.equal(reading.targets[0].resolutionMm, 320);
  assert.ok(Math.abs(reading.targets[0].distanceM - 1.883) < 0.002);
  assert.ok(reading.targets[0].angleDeg < 0);
});

test('las ranuras numéricas de Firebase pueden llegar en un arreglo con espacios', () => {
  const reading = parseRadarReading(frame({ targets: [null, target, { active: false }] }));
  assert.equal(reading.valid, true);
  assert.deepEqual(reading.targets.map(item => item.slot), [1]);
});

test('los datos incompletos o incoherentes no se convierten en una lectura de cero', () => {
  const invalid = [
    { targetCount: 0 }, { updatedAt: 1e100 }, { sequence: -1 },
    { targets: { 1: { ...target, xMm: '-782' } } },
    { targets: { 1: { ...target, speedCms: 1.5 } } },
    { targets: { 1: { active: true, xMm: 0, yMm: 0, speedCms: 0, resolutionMm: 0 } } },
    { targets: { 1: { ...target, resolutionMm: -1 } } },
    { targetCount: 4 }, { targets: 'incompleto' }, { model: 'otro' },
    { targets: { '01': target } }, { targets: { 4: target } },
  ];
  for (const patch of invalid) assert.equal(parseRadarReading(frame(patch)).valid, false);
});

test('se aceptan las tres ranuras y se ordenan sin convertirlas en identidades', () => {
  const reading = parseRadarReading(frame({ targetCount: 3, targets: { 3: target, 1: target, 2: target } }));
  assert.equal(reading.valid, true);
  assert.deepEqual(reading.targets.map(item => item.slot), [1, 2, 3]);
});

test('Firebase, la ESP32 y el radar tienen estados de conexión independientes', () => {
  const reading = parseRadarReading(frame());
  assert.equal(getReadingState(reading, status, now, true).current, true);
  assert.equal(getReadingState(reading, status, now + SENSOR_TIMEOUT_MS + 1, true).espOnline, true);
  assert.equal(getReadingState(reading, status, now + SENSOR_TIMEOUT_MS + 1, true).sensorOnline, false);
  assert.equal(getReadingState(reading, status, now + ESP_TIMEOUT_MS + 1, true).espOnline, false);
  assert.equal(getReadingState(reading, status, now, false).current, false);
  assert.equal(getReadingState(reading, parseDeviceStatus(null), now, true).current, false);
});

test('las muestras simuladas y las fechas futuras no se presentan como datos reales en vivo', () => {
  for (const source of ['simulated', 'otro', undefined]) {
    const reading = parseRadarReading(frame({ source }));
    assert.equal(reading.valid, false);
    assert.equal(getReadingState(reading, status, now, true).current, false);
  }
  assert.equal(getReadingState(parseRadarReading(frame({ updatedAt: now + 30_000 })), status, now, true).current, false);
  assert.equal(getReadingState(parseRadarReading(frame()), parseDeviceStatus({ lastSeenAt: now + 30_000 }), now, true).current, false);
});

test('las detecciones fuera del campo se conservan sin pegarlas al borde del radar', () => {
  const reading = parseRadarReading(frame({ targets: { 1: { ...target, xMm: 10000 } } }));
  assert.equal(reading.targets[0].xMm, 10000);
  assert.equal(targetInView(reading.targets[0]), false);
  assert.equal(targetInView(parseRadarReading(frame()).targets[0]), true);
});

test('el radar refleja la vista horizontal sin alterar la medición original', () => {
  const left = parseRadarReading(frame()).targets[0];
  const right = { ...left, xMm: -left.xMm };
  assert.ok(radarPosition(left).x > 180);
  assert.ok(radarPosition(right).x < 180);
  assert.equal(radarPosition(left).y, radarPosition(right).y);
  assert.equal(left.xMm, -782);
});

test('una configuración ausente falla sin usar credenciales de respaldo', () => {
  assert.throws(() => readFirebaseConfig({}), { code: 'app/missing-config' });
  const config = { EXPO_PUBLIC_FIREBASE_API_KEY: 'ejemplo', EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'ejemplo.test', EXPO_PUBLIC_FIREBASE_DATABASE_URL: 'https://ejemplo.test', EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'ejemplo', EXPO_PUBLIC_FIREBASE_APP_ID: 'ejemplo' };
  assert.equal(readFirebaseConfig(config).projectId, 'ejemplo');
  assert.throws(() => readFirebaseConfig({ ...config, EXPO_PUBLIC_FIREBASE_DATABASE_URL: 'http://ejemplo.test' }), { code: 'app/invalid-config' });
});

test('el identificador no permite leer una ruta diferente de la del robot', () => {
  assert.equal(readDeviceId(undefined), 'robot-01');
  for (const value of ['../secret', 'robot/a', 'robot#1', 'a.b']) {
    assert.throws(() => readDeviceId(value), { code: 'app/invalid-device' });
  }
});

test('la antigüedad distingue reportes ausentes, actuales y fechas fuera de rango', () => {
  assert.equal(ageLabel(null, now), 'Sin reporte');
  assert.equal(ageLabel(now, now), 'Ahora');
  assert.equal(ageLabel(now - 12_000, now), 'Hace 12 s');
  assert.equal(ageLabel(now - 2 * 86400_000, now), 'Hace 2 d');
  assert.equal(ageLabel(now + 30_000, now), 'Fecha fuera de rango');
});


test("los objetivos desaparecen al caducar la lectura sin borrar el último reporte", () => {
  const reading = parseRadarReading(frame());
  assert.equal(getReadingState(reading, status, now, true).targets.length, 1);
  for (const state of [
    getReadingState(reading, status, now + SENSOR_TIMEOUT_MS + 1, true),
    getReadingState(reading, status, now + 16 * 86400_000, true),
    getReadingState(reading, status, now, false),
    getReadingState(reading, parseDeviceStatus(null), now, true),
    getReadingState(parseRadarReading(frame({ updatedAt: now + 30_000 })), status, now, true),
  ]) {
    assert.equal(state.current, false);
    assert.deepEqual(state.targets, []);
  }
  assert.equal(reading.updatedAt, now);
  assert.equal(reading.targets.length, 1);
  const empty = getReadingState(parseRadarReading(frame({ targetCount: 0, targets: null })), status, now, true);
  assert.equal(empty.current, true);
  assert.deepEqual(empty.targets, []);
});
