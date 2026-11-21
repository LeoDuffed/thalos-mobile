# Thalos Mobile

Aplicación móvil de Thalos hecha con React Native, Expo y TypeScript. Conserva la identidad visual de [thalos-web](https://github.com/LeoDuffed/thalos-web).

## Estado actual

Interfaz de inicio y centro de control con navegación. El radar está vacío, las mediciones muestran «—» y las conexiones indican «Sin conectar». No hay datos simulados, Firebase ni comunicación con sensores en esta versión.

## Ejecutar

Requiere Node.js LTS.

```bash
npm install
npx expo start
```

Abre el QR con Expo Go. Si la red impide la conexión local, usa `npx expo start --tunnel`. En iPhone, Expo Go y la terminal deben usar la misma cuenta de Expo (`npx expo login`).

## Archivos principales

- `src/app/index.tsx`: pantalla de inicio.
- `src/app/dashboard.tsx`: centro de control sin mediciones.
- `src/app/_layout.tsx`: navegación y carga de la tipografía Geist.
- `src/components/radar-field.tsx`: campo de referencia del radar, sin objetivos.
- `src/components/screen.tsx`: cabecera, navegación y área segura.
- `src/constants/design.ts`: colores y fuentes compartidos.

La escala de 6 m y ±60° es una referencia del LD2450; no representa mediciones recibidas ni certifica detecciones. La integración del VL6180 y la conexión a la base de datos quedan para una etapa posterior.

## Verificar

```bash
npm run lint
npx tsc --noEmit
```

No guardes contraseñas ni credenciales en el repositorio. Los archivos `.env` están excluidos. Las variables públicas de Expo se incluyen en la app y no sirven para proteger secretos.
