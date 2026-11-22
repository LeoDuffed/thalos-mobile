# Thalos Mobile

Aplicación móvil de Thalos con React Native, Expo y TypeScript. Comparte la identidad visual, el proyecto de Firebase y el formato de telemetría de [thalos-web](https://github.com/LeoDuffed/thalos-web).

## Cómo funciona

La ESP32 publica las lecturas del robot en Firebase Realtime Database. La app inicia una sesión anónima y escucha las actualizaciones de `telemetry/devices/robot-01/status` y `telemetry/devices/robot-01/sensors/ld2450`. No escribe mediciones ni usa la cuenta de la ESP32.

El centro de control muestra el radar en espejo, los objetivos, sus coordenadas, distancia, velocidad, ángulo y resolución. Firebase, la ESP32 y el radar tienen indicadores independientes. Una lectura del radar vence a los 5 segundos y el estado de la ESP32 a los 15. Las mediciones guardadas se conservan como última lectura, con su hora y antigüedad; nunca se presentan como actuales al perder la conexión. La ausencia de datos se muestra con «—» y solo un reporte válido sin objetivos muestra cero.

La portada conserva una ilustración del campo del radar sin objetivos. La escala de 6 m y ±60° es una referencia, no una garantía de detección. T1–T3 son ranuras del radar y no identifican personas. Las detecciones fuera de esa escala permanecen en las tarjetas con sus coordenadas originales.

## Configurar y ejecutar

Requiere Node.js LTS 22.18 o posterior, para ejecutar también las pruebas de TypeScript.

```bash
npm install
cp .env.example .env.local
```

Completa `.env.local` con la configuración pública de la misma aplicación web de Firebase que utiliza `thalos-web`. Los nombres `VITE_` cambian a `EXPO_PUBLIC_`. `EXPO_PUBLIC_TELEMETRY_DEVICE_ID` selecciona el robot y usa `robot-01` por defecto.

El acceso Anónimo de Firebase Authentication debe estar habilitado. Las reglas existentes deben permitir que un usuario autenticado lea `telemetry`; solo la cuenta del dispositivo debe poder escribir las mediciones. No hace falta abrir las reglas ni copiar la contraseña de la ESP32.

```bash
npx expo start
```

Abre el QR con Expo Go. Si la red bloquea la conexión local, usa `npx expo start --tunnel`. En iPhone, la terminal y Expo Go deben iniciar sesión en la misma cuenta de Expo (`npx expo login`). Después de cambiar las variables, recarga completamente la app. Si el servidor estaba abierto antes de crear `.env.local`, reinícialo.

No se crean datos de ejemplo ni se modifica la base de datos al abrir la app. Las muestras que usan las pruebas viven únicamente dentro de `tests/`.

## Archivos principales

- `src/lib/firebase-config.ts`: valida la configuración y el identificador del robot.
- `src/lib/firebase.ts`: prepara Firebase y el acceso anónimo de lectura.
- `src/lib/firebase-auth.native.ts`: conserva la sesión anónima en iPhone y Android.
- `src/lib/firebase-auth.ts`: prepara la sesión al abrir la versión web.
- `src/hooks/use-telemetry.ts`: escucha las lecturas, gestiona errores y pausa la conexión al salir del panel o mandar la app a segundo plano.
- `src/lib/telemetry.ts`: valida las mediciones, calcula distancia y ángulo y distingue datos recientes de antiguos.
- `src/app/dashboard.tsx`: presenta las mediciones y los estados del sistema.
- `src/components/radar-field.tsx`: dibuja el campo y las detecciones en vista espejo.
- `src/app/index.tsx`: pantalla de inicio.
- `src/app/_layout.tsx`: navegación y tipografía Geist.

La conexión usa Firebase JS SDK y funciona con Expo Go. No requiere agregar archivos nativos ni generar otro backend. La integración del VL6180 y de otros sensores queda para una etapa posterior; no se inventan mediciones para ellos.

## Verificar

```bash
npm run lint
npm run typecheck
npm test
```

Las pruebas cubren lecturas vacías, datos malformados o simulados, tiempos de espera, fechas futuras, vista espejo y validación de configuración. No contactan a Firebase.

## Configuración local

`.env.local` está excluido de Git y `.env.example` contiene únicamente campos vacíos. Las variables `EXPO_PUBLIC_` se incluyen en la app compilada; la configuración de Firebase identifica el proyecto y no sustituye las reglas de seguridad. No pongas contraseñas, tokens de la ESP32, cuentas de servicio ni llaves privadas en esas variables.

Referencias: [Firebase en Expo](https://docs.expo.dev/guides/using-firebase/), [variables de entorno](https://docs.expo.dev/guides/environment-variables/) y [lectura en tiempo real](https://firebase.google.com/docs/database/web/read-and-write).
